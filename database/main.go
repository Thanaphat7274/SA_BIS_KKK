package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Employee struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	HireDate  string `json:"hiredate"`
}

var db *sql.DB

func getAllUser(c *gin.Context) {
	var rows *sql.Rows
	var err error

	rows, err = db.Query("SELECT id, title, author, isbn, year, price, created_at, updated_at FROM Users")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close() // ต้องปิด rows เสมอ เพื่อคืน Connection กลับ pool

	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(&user.Username, &user.Password)
		if err != nil {
			// handle error
		}
		users = append(users, user)
	}
	if users == nil {
		users = []User{}
	}

	c.JSON(http.StatusOK, users)
}

func loginHandler(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	var hash string
	var role string
	var firstName string
	var lastName string

	// JOIN กับ table employees เพื่อดึง firstname และ lastname
	err := db.QueryRow(`
		SELECT u.password, u.role, e.first_name, e.last_name 
		FROM users u 
		LEFT JOIN employees e ON u.emp_id = e.emp_id 
		WHERE u.username = ?
	`, user.Username).Scan(&hash, &role, &firstName, &lastName)

	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid username or password"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(user.Password)) != nil {
		c.JSON(401, gin.H{"error": "Invalid username or password"})
		return
	}

	// รวม firstname + lastname เป็น name
	fullName := firstName + " " + lastName

	c.JSON(200, gin.H{
		"message":  "Login successful",
		"username": user.Username,
		"role":     role,
		"name":     fullName,
	})
}

func addEmployee(c *gin.Context) {
	var employee Employee
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	// Insert employee into database และรับ emp_id กลับมา
	result, err := db.Exec("INSERT INTO employees (first_name, last_name, hire_date) VALUES (?, ?, ?)",
		employee.FirstName, employee.LastName, employee.HireDate)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to add employees"})
		return
	}

	// ดึง ID ของ employee ที่เพิ่งสร้าง
	empID, err := result.LastInsertId()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get employee ID"})
		return
	}

	// สร้าง username และ password
	username := "emp_" + fmt.Sprintf("%d", empID)
	password := "emp_" + fmt.Sprintf("%d", empID)
	role := "emp"

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	// เพิ่มข้อมูล login ลงตาราง users
	_, err = db.Exec("INSERT INTO users (username, password, role, emp_id) VALUES (?, ?, ?, ?)",
		username, string(hash), role, empID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user account"})
		return
	}

	c.JSON(201, gin.H{
		"message":  "Employee added successfully",
		"emp_id":   empID,
		"username": username,
		"password": password,
	})
}

// func getAverageScore(c *gin.Context){
// 	var rows *sql.Rows

// 	defer rows.Close()
// 	for rows.Next(){
// 		var user User
// 	}

// }

func signupHandler(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}
	// hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}
	// insert user
	_, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", user.Username, string(hash))
	if err != nil {
		c.JSON(400, gin.H{"error": "Username already exists"})
		return
	}
	c.JSON(201, gin.H{"message": "Signup successful"})
}

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./users.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE,
		password TEXT
	)`) // จะสร้างใหม่ถ้าไม่มี
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()
	api := r.Group("/api")
	api.GET("/getAllUser", getAllUser)
	api.POST("/login", loginHandler)
	api.POST("/signup", signupHandler)
	api.POST("/addEmployee", addEmployee)
	// api.GET("/average-score", getAverageScore)
	// api.GET("/average-score", getMaxScore)
	// api.GET("/average-score", getMinScore)
	r.Run(":8080")
}
