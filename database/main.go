package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role string `json:"role"`
}

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

var db *sql.DB

func loginHandler(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	var hash string
	err := db.QueryRow("SELECT password FROM users WHERE username = ?", user.Username).Scan(&hash)
	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid username or password"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(user.Password)) != nil {
		c.JSON(401, gin.H{"error": "Invalid username or password"})
		return
	}

	c.JSON(200, gin.H{"message": "Login successful"})
}

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
	api.GET("/getAllUser",getAllUser)
	api.POST("/login", loginHandler)
	api.POST("/signup", signupHandler)
	r.Run(":8080")
}
