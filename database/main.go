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

type ScoreData struct {
	AppraisalID int     `json:"appraisal_id"`
	DetailID    int     `json:"detail_id"`
	SubDetailID int     `json:"subdetail_id"`
	ScoreValue  float64 `json:"score_value"`
}

type Detail struct {
	DetailID   int         `json:"detail_id"`
	Topic      string      `json:"topic"`
	MaxScore   int         `json:"max_score,omitempty"`
	SubDetails []SubDetail `json:"subdetails,omitempty"`
}

type SubDetail struct {
	DetailID       int    `json:"detail_id"`
	SubDetailID    int    `json:"subdetail_id"`
	SubDetailTopic string `json:"subdetail_topic"`
	MaxScore       int    `json:"max_score,omitempty"`
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

func saveScore(c *gin.Context) {
	var scoreData ScoreData
	if err := c.ShouldBindJSON(&scoreData); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	// บันทึกคะแนนลง database
	_, err := db.Exec("INSERT OR REPLACE INTO Score (appraisal_id, detail_id, subdetail_id, score_value) VALUES (?, ?, ?, ?)",
		scoreData.AppraisalID, scoreData.DetailID, scoreData.SubDetailID, scoreData.ScoreValue)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save score"})
		return
	}

	c.JSON(201, gin.H{"message": "Score saved successfully"})
}

func getDetails(c *gin.Context) {
	rows, err := db.Query(`
		SELECT d.detail_id, d.topic, COALESCE(d.max_score, 0) as max_score, sd.subdetail_id, sd.subdetail_topic
		FROM detail d
		LEFT JOIN SubDetail sd ON d.detail_id = sd.detail_id
		ORDER BY d.detail_id, sd.subdetail_id
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch details"})
		return
	}
	defer rows.Close()

	detailsMap := make(map[int]*Detail)

	for rows.Next() {
		var detailID int
		var topic string
		var maxScore int
		var subDetailID sql.NullInt64
		var subDetailTopic sql.NullString

		err := rows.Scan(&detailID, &topic, &maxScore, &subDetailID, &subDetailTopic)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to scan data"})
			return
		}

		// สร้าง detail ถ้ายังไม่มี
		if _, exists := detailsMap[detailID]; !exists {
			detailsMap[detailID] = &Detail{
				DetailID:   detailID,
				Topic:      topic,
				MaxScore:   maxScore,
				SubDetails: []SubDetail{},
			}
		}

		// เพิ่ม subdetail ถ้ามี
		if subDetailID.Valid && subDetailTopic.Valid {
			subDetail := SubDetail{
				DetailID:       detailID,
				SubDetailID:    int(subDetailID.Int64),
				SubDetailTopic: subDetailTopic.String,
			}
			detailsMap[detailID].SubDetails = append(detailsMap[detailID].SubDetails, subDetail)
		}
	}

	// แปลง map เป็น slice
	var details []Detail
	for _, detail := range detailsMap {
		details = append(details, *detail)
	}

	c.JSON(200, details)
}

func addDetail(c *gin.Context) {
	var requestData struct {
		Topic    string `json:"topic"`
		MaxScore int    `json:"max_score"`
	}

	if err := c.ShouldBindJSON(&requestData); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	if requestData.Topic == "" {
		c.JSON(400, gin.H{"error": "Topic is required"})
		return
	}

	if requestData.MaxScore <= 0 {
		c.JSON(400, gin.H{"error": "Max score must be greater than 0"})
		return
	}

	// หา detail_id ถัดไป (เนื่องจากมี constraint BETWEEN 1 AND 2 อาจต้องแก้)
	var nextDetailID int
	err := db.QueryRow("SELECT COALESCE(MAX(detail_id), 0) + 1 FROM detail").Scan(&nextDetailID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get next detail_id"})
		return
	}

	// เพิ่ม detail ใหม่ พร้อม max_score
	_, err = db.Exec("INSERT INTO detail (detail_id, topic, max_score) VALUES (?, ?, ?)",
		nextDetailID, requestData.Topic, requestData.MaxScore)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to add detail"})
		return
	}

	c.JSON(201, gin.H{"message": "Detail added successfully"})
}

func addSubDetail(c *gin.Context) {
	var subDetail SubDetail
	if err := c.ShouldBindJSON(&subDetail); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	if subDetail.DetailID == 0 || subDetail.SubDetailTopic == "" {
		c.JSON(400, gin.H{"error": "detail_id and subdetail_topic are required"})
		return
	}

	// หา subdetail_id ถัดไป
	var nextSubDetailID int
	err := db.QueryRow("SELECT COALESCE(MAX(subdetail_id), 0) + 1 FROM SubDetail WHERE detail_id = ?",
		subDetail.DetailID).Scan(&nextSubDetailID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get next subdetail_id"})
		return
	}

	// เพิ่ม subdetail ใหม่
	_, err = db.Exec("INSERT INTO SubDetail (detail_id, subdetail_id, subdetail_topic) VALUES (?, ?, ?)",
		subDetail.DetailID, nextSubDetailID, subDetail.SubDetailTopic)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to add subdetail"})
		return
	}

	c.JSON(201, gin.H{"message": "SubDetail added successfully"})
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

	// เพิ่ม CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	api := r.Group("/api")
	api.GET("/getAllUser", getAllUser)
	api.POST("/login", loginHandler)
	api.POST("/signup", signupHandler)
	api.POST("/addEmployee", addEmployee)
	api.POST("/saveScore", saveScore)
	api.GET("/getDetails", getDetails)
	api.POST("/addDetail", addDetail)
	api.POST("/addSubDetail", addSubDetail)
	// api.GET("/average-score", getAverageScore)
	// api.GET("/average-score", getMaxScore)
	// api.GET("/average-score", getMinScore)
	r.Run(":8080")
}
