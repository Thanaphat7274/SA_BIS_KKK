package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
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

type EvaluationSection struct {
	Score         float64 `json:"score"`
	MaxScore      int     `json:"maxScore"`
	Weight        int     `json:"weight"`
	WeightedScore float64 `json:"weightedScore"`
	Details       string  `json:"details"`
}

type EvaluationResponse struct {
	EmployeeName     string            `json:"employeeName"`
	EmployeeCode     string            `json:"employeeCode"`
	Position         string            `json:"position"`
	Evaluator        string            `json:"evaluator"`
	EvaluationDate   string            `json:"evaluationDate"`
	Attendance       EvaluationSection `json:"attendance"`
	Performance      EvaluationSection `json:"performance"`
	Behavior         EvaluationSection `json:"behavior"`
	EvaluatorComment string            `json:"evaluatorComment"`
	EmployeeComment  string            `json:"employeeComment"`
}

type ProfileData struct {
	EmpID                 int    `json:"empId"`
	FullName              string `json:"fullName"`
	Email                 string `json:"email"`
	Phone                 string `json:"phone"`
	Department            string `json:"department"`
	Position              string `json:"position"`
	EmployeeCode          string `json:"employeeId"`
	JoinDate              string `json:"joinDate"`
	Supervisor            string `json:"supervisor"`
	Address               string `json:"address"`
	EmergencyContact      string `json:"emergencyContact"`
	EmergencyName         string `json:"emergencyName"`
	LastEvaluation        string `json:"lastEvaluation"`
	OverallScore          float64 `json:"overallScore"`
	EvaluationsCount      int    `json:"evaluationsCount"`
}

type CompetencyScore struct {
	Competency string  `json:"competency"`
	Score      float64 `json:"score"`
	FullMark   int     `json:"fullMark"`
}

type RecentEvaluation struct {
	Date             string  `json:"date"`
	Evaluator        string  `json:"evaluator"`
	Score            float64 `json:"score"`
	EvaluatorComment string  `json:"evaluatorComment"`
	EmployeeComment  string  `json:"employeeComment"`
}

type EmployeeDashboardData struct {
	CurrentScore         float64            `json:"currentScore"`
	AvgScore             float64            `json:"avgScore"`
	Improvement          string             `json:"improvement"`
	Rank                 string             `json:"rank"`
	CompetencyScores     []CompetencyScore  `json:"competencyScores"`
	RecentEvaluations    []RecentEvaluation `json:"recentEvaluations"`
}

type TeamMember struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Position  string  `json:"position"`
	LastScore float64 `json:"lastScore"`
	Status    string  `json:"status"`
	Trend     string  `json:"trend"`
}

type ScoreByPosition struct {
	Position string  `json:"position"`
	AvgScore float64 `json:"avgScore"`
	Count    int     `json:"count"`
}

type EvaluationStatusData struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type SupervisorDashboardData struct {
	TotalMembers       int                    `json:"totalMembers"`
	Evaluated          int                    `json:"evaluated"`
	Pending            int                    `json:"pending"`
	AvgTeamScore       float64                `json:"avgTeamScore"`
	TeamMembers        []TeamMember           `json:"teamMembers"`
	ScoresByPosition   []ScoreByPosition      `json:"scoresByPosition"`
	EvaluationStatus   []EvaluationStatusData `json:"evaluationStatus"`
	NeedsAttention     []TeamMember           `json:"needsAttention"`
	TopPerformer       *TeamMember            `json:"topPerformer"`
}

type DepartmentScore struct {
	Department string  `json:"department"`
	Score      float64 `json:"score"`
}

type HRDashboardData struct {
	AvgScore          float64           `json:"avgScore"`
	BestDept          string            `json:"bestDept"`
	BestScore         float64           `json:"bestScore"`
	WorstDept         string            `json:"worstDept"`
	WorstScore        float64           `json:"worstScore"`
	DepartmentScores  []DepartmentScore `json:"departmentScores"`
	EvaluatedCount    int               `json:"evaluatedCount"`
	NotEvaluatedCount int               `json:"notEvaluatedCount"`
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

// ดึงรายชื่อพนักงานทั้งหมด
func getEmployees(c *gin.Context) {
	rows, err := db.Query(`
		SELECT 
			e.emp_id,
			e.first_name,
			e.last_name,
			e.hire_date,
			u.username
		FROM employees e
		LEFT JOIN users u ON e.emp_id = u.emp_id
		ORDER BY e.emp_id DESC
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch employees"})
		return
	}
	defer rows.Close()

	var employees []map[string]interface{}
	for rows.Next() {
		var empID int
		var firstName, lastName string
		var hireDate sql.NullString
		var username sql.NullString

		err := rows.Scan(&empID, &firstName, &lastName, &hireDate, &username)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to scan employee data"})
			return
		}

		employee := map[string]interface{}{
			"emp_id":     empID,
			"first_name": firstName,
			"last_name":  lastName,
		}

		if hireDate.Valid {
			employee["hire_date"] = hireDate.String
		} else {
			employee["hire_date"] = nil
		}

		if username.Valid {
			employee["username"] = username.String
		} else {
			employee["username"] = nil
		}

		employees = append(employees, employee)
	}

	if employees == nil {
		employees = []map[string]interface{}{}
	}

	c.JSON(200, employees)
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

func getEvaluationByID(c *gin.Context) {
	appraisalID := c.Param("id")
	
	var evaluation EvaluationResponse
	var userID int
	var year int
	var evaluatedAt string
	
	// ดึงข้อมูลการประเมินและพนักงาน
	err := db.QueryRow(`
		SELECT 
			a.user_id, 
			a.year, 
			a.evaluated_at,
			e.first_name || ' ' || e.last_name as employee_name,
			'EMP-' || printf('%03d', e.emp_id) as employee_code
		FROM appraisal a
		JOIN employees e ON a.user_id = e.emp_id
		WHERE a.ap_id = ?
	`, appraisalID).Scan(&userID, &year, &evaluatedAt, &evaluation.EmployeeName, 
		&evaluation.EmployeeCode)
	
	if err != nil {
		c.JSON(404, gin.H{"error": "Evaluation not found"})
		return
	}
	
	evaluation.EvaluationDate = evaluatedAt
	evaluation.Position = "Developer" // TODO: ดึงจาก position table
	evaluation.Evaluator = "ผู้จัดการ" // TODO: ดึงข้อมูลผู้ประเมินจริง
	
	// ดึงคะแนนแต่ละส่วน
	sections := map[int]*EvaluationSection{
		1: &evaluation.Attendance,
		2: &evaluation.Performance,
		3: &evaluation.Behavior,
	}
	
	for detailID, section := range sections {
		// ดึง max_score และ details
		var maxScore int
		var topic string
		db.QueryRow("SELECT max_score, topic FROM detail WHERE detail_id = ?", detailID).Scan(&maxScore, &topic)
		
		section.MaxScore = maxScore
		section.Weight = maxScore
		section.Details = topic
		
		// คำนวณคะแนนรวมจาก Score table
		var totalScore sql.NullFloat64
		db.QueryRow(`
			SELECT SUM(score_value) 
			FROM Score 
			WHERE appraisal_id = ? AND detail_id = ?
		`, appraisalID, detailID).Scan(&totalScore)
		
		if totalScore.Valid {
			section.Score = totalScore.Float64
			section.WeightedScore = totalScore.Float64
		}
	}
	
	// ดึงความคิดเห็น (ถ้ามี table comment)
	evaluation.EvaluatorComment = "พนักงานทำงานได้ดี"
	evaluation.EmployeeComment = "ขอบคุณครับ"
	
	c.JSON(200, evaluation)
}

func getLatestEvaluation(c *gin.Context) {
	var latestAppraisalID int
	err := db.QueryRow("SELECT ap_id FROM appraisal ORDER BY evaluated_at DESC LIMIT 1").Scan(&latestAppraisalID)
	
	if err != nil {
		c.JSON(404, gin.H{"error": "No evaluation found"})
		return
	}
	
	// เรียกใช้ฟังก์ชัน getEvaluationByID โดยตั้งค่า param
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", latestAppraisalID)}}
	getEvaluationByID(c)
}

func getEvaluationByUsername(c *gin.Context) {
	username := c.Param("username")
	
	// หา user_id จาก username
	var userID int
	err := db.QueryRow("SELECT emp_id FROM users WHERE username = ?", username).Scan(&userID)
	
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	
	// หา appraisal_id ล่าสุดของ user นี้
	var latestAppraisalID int
	err = db.QueryRow(`
		SELECT ap_id 
		FROM appraisal 
		WHERE user_id = ? 
		ORDER BY evaluated_at DESC 
		LIMIT 1
	`, userID).Scan(&latestAppraisalID)
	
	if err != nil {
		c.JSON(404, gin.H{"error": "No evaluation found for this user"})
		return
	}
	
	// เรียกใช้ฟังก์ชัน getEvaluationByID
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", latestAppraisalID)}}
	getEvaluationByID(c)
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

// getProfile - ดึงข้อมูล Profile ของพนักงานตาม username
func getProfile(c *gin.Context) {
	username := c.Param("username")
	
	var profile ProfileData
	var empID int
	var firstName, lastName sql.NullString
	var email, phone, address, emergencyName, emergencyPhone, department sql.NullString
	var hireDate sql.NullString
	var managerID sql.NullInt64
	
	// ดึงข้อมูลพนักงาน
	err := db.QueryRow(`
		SELECT 
			e.emp_id,
			e.first_name,
			e.last_name,
			e.email,
			e.phone,
			e.address,
			e.emergency_contact_name,
			e.emergency_contact_phone,
			e.department,
			e.hire_date,
			e.manager_id
		FROM employees e
		JOIN users u ON e.emp_id = u.emp_id
		WHERE u.username = ?
	`, username).Scan(&empID, &firstName, &lastName, &email, &phone, &address,
		&emergencyName, &emergencyPhone, &department, &hireDate, &managerID)
	
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	
	// กรอกข้อมูล Profile
	profile.EmpID = empID
	profile.FullName = firstName.String + " " + lastName.String
	profile.Email = email.String
	profile.Phone = phone.String
	profile.Department = department.String
	profile.Position = "พนักงาน" // TODO: ดึงจาก position table
	profile.EmployeeCode = fmt.Sprintf("EMP-%03d", empID)
	profile.JoinDate = hireDate.String
	profile.Address = address.String
	profile.EmergencyContact = emergencyPhone.String
	profile.EmergencyName = emergencyName.String
	
	// ดึงชื่อ Supervisor
	if managerID.Valid {
		var supervisorName string
		db.QueryRow(`
			SELECT first_name || ' ' || last_name 
			FROM employees 
			WHERE emp_id = ?
		`, managerID.Int64).Scan(&supervisorName)
		profile.Supervisor = supervisorName
	}
	
	// ดึงข้อมูลการประเมิน
	var lastEval sql.NullString
	var evalCount int
	db.QueryRow(`
		SELECT 
			MAX(evaluated_at),
			COUNT(*)
		FROM appraisal
		WHERE user_id = ?
	`, empID).Scan(&lastEval, &evalCount)
	
	if lastEval.Valid {
		profile.LastEvaluation = lastEval.String
	}
	profile.EvaluationsCount = evalCount
	
	// คำนวณคะแนนเฉลี่ย
	var avgScore sql.NullFloat64
	db.QueryRow(`
		SELECT AVG(total_score) FROM (
			SELECT SUM(score_value) as total_score
			FROM Score s
			JOIN appraisal a ON s.appraisal_id = a.ap_id
			WHERE a.user_id = ?
			GROUP BY s.appraisal_id
		)
	`, empID).Scan(&avgScore)
	
	if avgScore.Valid {
		profile.OverallScore = avgScore.Float64 / 20.0 // แปลงเป็นคะแนน 5
	}
	
	c.JSON(200, profile)
}

// updateProfile - อัปเดตข้อมูล Profile
func updateProfile(c *gin.Context) {
	username := c.Param("username")
	
	var updateData struct {
		Email                 string `json:"email"`
		Phone                 string `json:"phone"`
		Address               string `json:"address"`
		EmergencyName         string `json:"emergencyName"`
		EmergencyContact      string `json:"emergencyContact"`
	}
	
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}
	
	// หา emp_id จาก username
	var empID int
	err := db.QueryRow("SELECT emp_id FROM users WHERE username = ?", username).Scan(&empID)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	
	// อัปเดตข้อมูล
	_, err = db.Exec(`
		UPDATE employees 
		SET email = ?, 
		    phone = ?, 
		    address = ?,
		    emergency_contact_name = ?,
		    emergency_contact_phone = ?
		WHERE emp_id = ?
	`, updateData.Email, updateData.Phone, updateData.Address,
		updateData.EmergencyName, updateData.EmergencyContact, empID)
	
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update profile"})
		return
	}
	
		c.JSON(200, gin.H{"message": "Profile updated successfully"})
}

// getEmployeeDashboard - ดึงข้อมูล Dashboard สำหรับพนักงาน
func getEmployeeDashboard(c *gin.Context) {
	username := c.Param("username")
	
	// หา emp_id จาก username
	var empID int
	err := db.QueryRow("SELECT emp_id FROM users WHERE username = ?", username).Scan(&empID)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	
	dashboard := EmployeeDashboardData{}
	
	// คำนวณคะแนนปัจจุบัน (latest evaluation)
	var currentScore sql.NullFloat64
	db.QueryRow(`
		SELECT SUM(s.score_value)
		FROM Score s
		JOIN appraisal a ON s.appraisal_id = a.ap_id
		WHERE a.user_id = ?
		ORDER BY a.evaluated_at DESC
		LIMIT 1
	`, empID).Scan(&currentScore)
	
	if currentScore.Valid {
		dashboard.CurrentScore = currentScore.Float64 / 20.0 // แปลงเป็นคะแนน 5
	}
	
	// คำนวณคะแนนเฉลี่ย
	var avgScore sql.NullFloat64
	db.QueryRow(`
		SELECT AVG(total_score) FROM (
			SELECT SUM(score_value) as total_score
			FROM Score s
			JOIN appraisal a ON s.appraisal_id = a.ap_id
			WHERE a.user_id = ?
			GROUP BY s.appraisal_id
		)
	`, empID).Scan(&avgScore)
	
	if avgScore.Valid {
		dashboard.AvgScore = avgScore.Float64 / 20.0
	}
	
	// คำนวณการพัฒนา
	if dashboard.CurrentScore > dashboard.AvgScore {
		diff := dashboard.CurrentScore - dashboard.AvgScore
		dashboard.Improvement = fmt.Sprintf("+%.2f", diff)
	} else {
		diff := dashboard.AvgScore - dashboard.CurrentScore
		dashboard.Improvement = fmt.Sprintf("-%.2f", diff)
	}
	
	// TODO: คำนวณ Rank (ต้องเปรียบเทียบกับคนอื่น)
	dashboard.Rank = "Top 15%"
	
	// ดึงคะแนนตาม Detail (Competency)
	rows, err := db.Query(`
		SELECT d.topic, SUM(s.score_value), d.max_score
		FROM Score s
		JOIN appraisal a ON s.appraisal_id = a.ap_id
		JOIN detail d ON s.detail_id = d.detail_id
		WHERE a.user_id = ? AND a.ap_id = (
			SELECT ap_id FROM appraisal WHERE user_id = ? ORDER BY evaluated_at DESC LIMIT 1
		)
		GROUP BY d.detail_id, d.topic, d.max_score
	`, empID, empID)
	
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var comp CompetencyScore
			rows.Scan(&comp.Competency, &comp.Score, &comp.FullMark)
			comp.Score = comp.Score / float64(comp.FullMark) * 5.0 // แปลงเป็นสเกล 5
			comp.FullMark = 5
			dashboard.CompetencyScores = append(dashboard.CompetencyScores, comp)
		}
	}
	
	// ดึงประวัติการประเมินล่าสุด
	evalRows, err := db.Query(`
		SELECT 
			a.evaluated_at,
			'ผู้ประเมิน' as evaluator,
			SUM(s.score_value) as total,
			'' as evaluator_comment,
			'' as employee_comment
		FROM appraisal a
		LEFT JOIN Score s ON a.ap_id = s.appraisal_id
		WHERE a.user_id = ?
		GROUP BY a.ap_id
		ORDER BY a.evaluated_at DESC
		LIMIT 5
	`, empID)
	
	if err == nil {
		defer evalRows.Close()
		for evalRows.Next() {
			var eval RecentEvaluation
			var total float64
			var evaluatorComment, employeeComment sql.NullString
			evalRows.Scan(&eval.Date, &eval.Evaluator, &total, &evaluatorComment, &employeeComment)
			eval.Score = total / 20.0 // แปลงเป็นคะแนน 5
			if evaluatorComment.Valid {
				eval.EvaluatorComment = evaluatorComment.String
			}
			if employeeComment.Valid {
				eval.EmployeeComment = employeeComment.String
			}
			dashboard.RecentEvaluations = append(dashboard.RecentEvaluations, eval)
		}
	}
	
	c.JSON(200, dashboard)
}

// getSupervisorDashboard - ดึงข้อมูล Dashboard สำหรับ Supervisor
func getSupervisorDashboard(c *gin.Context) {
	username := c.Param("username")
	
	// หา emp_id จาก username
	var empID int
	err := db.QueryRow(`
		SELECT emp_id FROM employees e
		JOIN users u ON e.emp_id = u.emp_id
		WHERE u.username = ?
	`, username).Scan(&empID)
	
	if err != nil {
		c.JSON(404, gin.H{"error": "Supervisor not found"})
		return
	}
	
	dashboard := SupervisorDashboardData{}
	
	// นับจำนวนสมาชิกในทีม
	db.QueryRow("SELECT COUNT(*) FROM employees WHERE manager_id = ?", empID).Scan(&dashboard.TotalMembers)
	
	// นับการประเมินที่เสร็จแล้ว
	db.QueryRow(`
		SELECT COUNT(DISTINCT a.user_id)
		FROM appraisal a
		JOIN employees e ON a.user_id = e.emp_id
		WHERE e.manager_id = ? AND a.evaluated_at IS NOT NULL
	`, empID).Scan(&dashboard.Evaluated)
	
	dashboard.Pending = dashboard.TotalMembers - dashboard.Evaluated
	
	// คำนวณคะแนนเฉลี่ยของทีม
	var avgScore sql.NullFloat64
	db.QueryRow(`
		SELECT AVG(total_score) FROM (
			SELECT SUM(s.score_value) as total_score
			FROM Score s
			JOIN appraisal a ON s.appraisal_id = a.ap_id
			JOIN employees e ON a.user_id = e.emp_id
			WHERE e.manager_id = ?
			GROUP BY s.appraisal_id
		)
	`, empID).Scan(&avgScore)
	
	if avgScore.Valid {
		dashboard.AvgTeamScore = avgScore.Float64 / 20.0
	}
	
	// ดึงรายชื่อสมาชิกในทีม
	memberRows, err := db.Query(`
		SELECT 
			e.emp_id,
			e.first_name || ' ' || e.last_name as name,
			'พนักงาน' as position,
			COALESCE(MAX(total.score), 0) as last_score,
			CASE WHEN MAX(a.evaluated_at) IS NOT NULL THEN 'ประเมินแล้ว' ELSE 'รอการประเมิน' END as status
		FROM employees e
		LEFT JOIN appraisal a ON e.emp_id = a.user_id
		LEFT JOIN (
			SELECT appraisal_id, SUM(score_value)/20.0 as score
			FROM Score
			GROUP BY appraisal_id
		) total ON a.ap_id = total.appraisal_id
		WHERE e.manager_id = ?
		GROUP BY e.emp_id, e.first_name, e.last_name
	`, empID)
	
	if err == nil {
		defer memberRows.Close()
		for memberRows.Next() {
			var member TeamMember
			memberRows.Scan(&member.ID, &member.Name, &member.Position, &member.LastScore, &member.Status)
			
			// TODO: คำนวณ Trend จากประวัติคะแนน
			if member.LastScore >= 4.0 {
				member.Trend = "up"
			} else if member.LastScore < 3.5 {
				member.Trend = "down"
			} else {
				member.Trend = "stable"
			}
			
			dashboard.TeamMembers = append(dashboard.TeamMembers, member)
			
			// เพิ่มใน NeedsAttention ถ้าคะแนนต่ำหรือ trend ลง
			if member.LastScore < 4.0 || member.Trend == "down" {
				dashboard.NeedsAttention = append(dashboard.NeedsAttention, member)
			}
		}
	}
	
	// หา Top Performer
	if len(dashboard.TeamMembers) > 0 {
		topPerformer := dashboard.TeamMembers[0]
		for _, member := range dashboard.TeamMembers {
			if member.LastScore > topPerformer.LastScore {
				topPerformer = member
			}
		}
		dashboard.TopPerformer = &topPerformer
	}
	
	// คะแนนเฉลี่ยตามตำแหน่ง (TODO: ใช้ข้อมูลจริงจาก position table)
	dashboard.ScoresByPosition = []ScoreByPosition{
		{Position: "พนักงาน", AvgScore: dashboard.AvgTeamScore, Count: dashboard.TotalMembers},
	}
	
	// สถานะการประเมิน
	dashboard.EvaluationStatus = []EvaluationStatusData{
		{Name: "ประเมินแล้ว", Value: dashboard.Evaluated},
		{Name: "รอการประเมิน", Value: dashboard.Pending},
	}
	
	c.JSON(200, dashboard)
}

// getHRDashboard - ดึงข้อมูล Dashboard สำหรับ HR
func getHRDashboard(c *gin.Context) {
	dashboard := HRDashboardData{}
	
	// คำนวณคะแนนเฉลี่ยทั้งบริษัท
	var avgScore sql.NullFloat64
	db.QueryRow(`
		SELECT AVG(total_score) FROM (
			SELECT SUM(s.score_value) as total_score
			FROM Score s
			JOIN appraisal a ON s.appraisal_id = a.ap_id
			GROUP BY s.appraisal_id
		)
	`).Scan(&avgScore)
	
	if avgScore.Valid {
		dashboard.AvgScore = avgScore.Float64 / 20.0
	}
	
	// คะแนนตามแผนก
	deptRows, err := db.Query(`
		SELECT 
			COALESCE(e.department, 'ไม่ระบุ') as department,
			AVG(total.score) as avg_score
		FROM employees e
		JOIN appraisal a ON e.emp_id = a.user_id
		JOIN (
			SELECT appraisal_id, SUM(score_value)/20.0 as score
			FROM Score
			GROUP BY appraisal_id
		) total ON a.ap_id = total.appraisal_id
		GROUP BY e.department
	`)
	
	if err == nil {
		defer deptRows.Close()
		var bestScore, worstScore float64 = 0, 999
		for deptRows.Next() {
			var dept DepartmentScore
			deptRows.Scan(&dept.Department, &dept.Score)
			dashboard.DepartmentScores = append(dashboard.DepartmentScores, dept)
			
			if dept.Score > bestScore {
				bestScore = dept.Score
				dashboard.BestDept = dept.Department
				dashboard.BestScore = dept.Score
			}
			if dept.Score < worstScore {
				worstScore = dept.Score
				dashboard.WorstDept = dept.Department
				dashboard.WorstScore = dept.Score
			}
		}
	}
	
	// นับจำนวนการประเมิน
	db.QueryRow("SELECT COUNT(DISTINCT user_id) FROM appraisal").Scan(&dashboard.EvaluatedCount)
	
	var totalEmployees int
	db.QueryRow("SELECT COUNT(*) FROM employees").Scan(&totalEmployees)
	dashboard.NotEvaluatedCount = totalEmployees - dashboard.EvaluatedCount
	
	c.JSON(200, dashboard)
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

	
	r.Use(cors.Default())

	api := r.Group("/api")
	api.GET("/getAllUser", getAllUser)
	api.POST("/login", loginHandler)
	api.POST("/signup", signupHandler)
	api.POST("/addEmployee", addEmployee)
	api.GET("/employees", getEmployees)
	api.POST("/saveScore", saveScore)
	api.GET("/getDetails", getDetails)
	api.POST("/addDetail", addDetail)
	api.POST("/addSubDetail", addSubDetail)
	api.GET("/evaluation/latest", getLatestEvaluation)
	api.GET("/evaluation/user/:username", getEvaluationByUsername)
	api.GET("/profile/:username", getProfile)
	api.PUT("/profile/:username", updateProfile)
	api.GET("/dashboard/employee/:username", getEmployeeDashboard)
	api.GET("/dashboard/supervisor/:username", getSupervisorDashboard)
	api.GET("/dashboard/hr", getHRDashboard)
	// api.GET("/average-score", getAverageScore)
	// api.GET("/average-score", getMaxScore)
	// api.GET("/average-score", getMinScore)
	r.Run(":8080")
}