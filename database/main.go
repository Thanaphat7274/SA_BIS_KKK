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

type EvaluationSubmission struct {
	EmpID    int               `json:"emp_id"`
	Year     int               `json:"year"`
	Scores   map[string]int    `json:"scores"`   // key: "detailID_subdetailID", value: scoreLevel
	Comments map[string]string `json:"comments"` // key: "detailID_subdetailID", value: comment
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
	Score1Desc     string `json:"score_1_desc,omitempty"`
	Score2Desc     string `json:"score_2_desc,omitempty"`
	Score3Desc     string `json:"score_3_desc,omitempty"`
	Score4Desc     string `json:"score_4_desc,omitempty"`
	Score5Desc     string `json:"score_5_desc,omitempty"`
}

type Attendance struct {
	AttendanceID int    `json:"attendance_id"`
	EmpID        int    `json:"emp_id"`
	Date         string `json:"date"`
	Status       string `json:"status"`
	Remark       string `json:"remark,omitempty"`
	CreatedAt    string `json:"created_at,omitempty"`
	FirstName    string `json:"first_name,omitempty"`
	LastName     string `json:"last_name,omitempty"`
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
	EmpID            int     `json:"empId"`
	FullName         string  `json:"fullName"`
	Email            string  `json:"email"`
	Phone            string  `json:"phone"`
	Department       string  `json:"department"`
	Position         string  `json:"position"`
	EmployeeCode     string  `json:"employeeId"`
	JoinDate         string  `json:"joinDate"`
	Supervisor       string  `json:"supervisor"`
	Address          string  `json:"address"`
	EmergencyContact string  `json:"emergencyContact"`
	EmergencyName    string  `json:"emergencyName"`
	LastEvaluation   string  `json:"lastEvaluation"`
	OverallScore     float64 `json:"overallScore"`
	EvaluationsCount int     `json:"evaluationsCount"`
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
	CurrentScore      float64            `json:"currentScore"`
	AvgScore          float64            `json:"avgScore"`
	Improvement       string             `json:"improvement"`
	Rank              string             `json:"rank"`
	CompetencyScores  []CompetencyScore  `json:"competencyScores"`
	RecentEvaluations []RecentEvaluation `json:"recentEvaluations"`
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
	TotalMembers     int                    `json:"totalMembers"`
	Evaluated        int                    `json:"evaluated"`
	Pending          int                    `json:"pending"`
	AvgTeamScore     float64                `json:"avgTeamScore"`
	TeamMembers      []TeamMember           `json:"teamMembers"`
	ScoresByPosition []ScoreByPosition      `json:"scoresByPosition"`
	EvaluationStatus []EvaluationStatusData `json:"evaluationStatus"`
	NeedsAttention   []TeamMember           `json:"needsAttention"`
	TopPerformer     *TeamMember            `json:"topPerformer"`
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
			e.pos_id,
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
		var posID sql.NullInt64
		var username sql.NullString

		err := rows.Scan(&empID, &firstName, &lastName, &hireDate, &posID, &username)
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

		if posID.Valid {
			employee["position_id"] = int(posID.Int64)
		} else {
			employee["position_id"] = nil
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

func getPositions(c *gin.Context) {
	rows, err := db.Query(`
		SELECT 
			position_id,
			position_name
		FROM position
		ORDER BY position_id
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch positions"})
		return
	}
	defer rows.Close()

	var positions []map[string]interface{}
	for rows.Next() {
		var positionID int
		var positionName string

		err := rows.Scan(&positionID, &positionName)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to scan position data"})
			return
		}

		position := map[string]interface{}{
			"position_id":   positionID,
			"position_name": positionName,
		}

		positions = append(positions, position)
	}

	if positions == nil {
		positions = []map[string]interface{}{}
	}

	c.JSON(200, positions)
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

// submitEvaluation - บันทึกการประเมินทั้งหมด
func submitEvaluation(c *gin.Context) {
	var submission EvaluationSubmission
	if err := c.ShouldBindJSON(&submission); err != nil {
		c.JSON(400, gin.H{"error": "Bad request", "details": err.Error()})
		return
	}

	// ตรวจสอบว่ามีคะแนนหรือไม่
	if len(submission.Scores) == 0 {
		c.JSON(400, gin.H{"error": "No scores provided"})
		return
	}

	// เริ่ม transaction
	tx, err := db.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// 1. สร้าง Appraisal
	result, err := tx.Exec(`INSERT INTO appraisal (user_id, year, evaluated_at) 
		VALUES (?, ?, datetime('now'))`,
		submission.EmpID, submission.Year)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create appraisal", "details": err.Error()})
		return
	}

	appraisalID, err := result.LastInsertId()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get appraisal ID"})
		return
	}

	// 2. บันทึกคะแนนทั้งหมดลง Score table
	scoreStmt, err := tx.Prepare(`INSERT INTO Score (appraisal_id, detail_id, subdetail_id, score_value) 
		VALUES (?, ?, ?, ?)`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to prepare score statement"})
		return
	}
	defer scoreStmt.Close()

	for key, scoreLevel := range submission.Scores {
		// Parse key format: "detailID_subdetailID"
		var detailID, subdetailID int
		_, err := fmt.Sscanf(key, "%d_%d", &detailID, &subdetailID)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid score key format", "key": key})
			return
		}

		// คำนวณคะแนนจริงจาก scoreLevel (1-5)
		// ดึง max_score ของ subdetail
		var maxScore float64
		err = tx.QueryRow(`
			SELECT CAST(d.max_score AS REAL) / 
				   (SELECT COUNT(*) FROM SubDetail WHERE detail_id = d.detail_id)
			FROM Detail d
			WHERE d.detail_id = ?
		`, detailID).Scan(&maxScore)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to calculate score", "detail_id": detailID})
			return
		}

		// คำนวณคะแนนจากระดับ (20%, 40%, 60%, 80%, 100%)
		scoreValue := (float64(scoreLevel) * 20.0 / 100.0) * maxScore

		_, err = scoreStmt.Exec(appraisalID, detailID, subdetailID, scoreValue)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to save score", "key": key})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		c.JSON(500, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(201, gin.H{
		"message":      "Evaluation submitted successfully",
		"appraisal_id": appraisalID,
	})
}

// getAllEvaluations - ดึงรายการประเมินทั้งหมด
func getAllEvaluations(c *gin.Context) {
	year := c.Query("year") // optional filter by year

	var query string
	var args []interface{}

	if year != "" {
		query = `
			SELECT 
				a.ap_id,
				a.user_id,
				a.year,
				a.evaluated_at,
				e.first_name,
				e.last_name,
				p.position_name,
				COALESCE(SUM(s.score_value), 0) as total_score
			FROM appraisal a
			JOIN employees e ON a.user_id = e.emp_id
			LEFT JOIN position p ON e.pos_id = p.position_id
			LEFT JOIN Score s ON a.ap_id = s.appraisal_id
			WHERE a.year = ?
			GROUP BY a.ap_id
			ORDER BY a.evaluated_at DESC
		`
		args = append(args, year)
	} else {
		query = `
			SELECT 
				a.ap_id,
				a.user_id,
				a.year,
				a.evaluated_at,
				e.first_name,
				e.last_name,
				p.position_name,
				COALESCE(SUM(s.score_value), 0) as total_score
			FROM appraisal a
			JOIN employees e ON a.user_id = e.emp_id
			LEFT JOIN position p ON e.pos_id = p.position_id
			LEFT JOIN Score s ON a.ap_id = s.appraisal_id
			GROUP BY a.ap_id
			ORDER BY a.evaluated_at DESC
			LIMIT 100
		`
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch evaluations", "details": err.Error()})
		return
	}
	defer rows.Close()

	type EvaluationSummary struct {
		AppraisalID  int     `json:"appraisal_id"`
		EmpID        int     `json:"emp_id"`
		Year         int     `json:"year"`
		EvaluatedAt  string  `json:"evaluated_at"`
		FirstName    string  `json:"first_name"`
		LastName     string  `json:"last_name"`
		PositionName string  `json:"position_name"`
		TotalScore   float64 `json:"total_score"`
	}

	var evaluations []EvaluationSummary
	for rows.Next() {
		var eval EvaluationSummary
		var positionName sql.NullString

		err := rows.Scan(&eval.AppraisalID, &eval.EmpID, &eval.Year, &eval.EvaluatedAt,
			&eval.FirstName, &eval.LastName, &positionName, &eval.TotalScore)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to scan evaluation", "details": err.Error()})
			return
		}

		if positionName.Valid {
			eval.PositionName = positionName.String
		} else {
			eval.PositionName = ""
		}

		evaluations = append(evaluations, eval)
	}

	c.JSON(200, evaluations)
}

// getEvaluationDetail - ดึงรายละเอียดการประเมินพร้อมคะแนน
func getEvaluationDetail(c *gin.Context) {
	appraisalID := c.Param("id")

	// ดึงข้อมูลพื้นฐาน
	type EvalInfo struct {
		EmpID        int    `json:"emp_id"`
		FirstName    string `json:"first_name"`
		LastName     string `json:"last_name"`
		PositionName string `json:"position_name"`
		Year         int    `json:"year"`
		EvaluatedAt  string `json:"evaluated_at"`
	}

	var info EvalInfo
	err := db.QueryRow(`
		SELECT 
			e.emp_id,
			e.first_name,
			e.last_name,
			COALESCE(p.position_name, ''),
			a.year,
			a.evaluated_at
		FROM appraisal a
		JOIN employees e ON a.user_id = e.emp_id
		LEFT JOIN position p ON e.pos_id = p.position_id
		WHERE a.ap_id = ?
	`, appraisalID).Scan(&info.EmpID, &info.FirstName, &info.LastName,
		&info.PositionName, &info.Year, &info.EvaluatedAt)

	if err != nil {
		c.JSON(404, gin.H{"error": "Evaluation not found"})
		return
	}

	// ดึงข้อมูล Details และ Scores
	rows, err := db.Query(`
		SELECT 
			d.detail_id,
			d.topic,
			d.max_score,
			sd.subdetail_id,
			sd.subdetail_topic,
			sd.score_1_desc,
			sd.score_2_desc,
			sd.score_3_desc,
			sd.score_4_desc,
			sd.score_5_desc,
			COALESCE(s.score_value, 0) as score_value
		FROM Detail d
		LEFT JOIN SubDetail sd ON d.detail_id = sd.detail_id
		LEFT JOIN Score s ON s.detail_id = d.detail_id 
			AND s.subdetail_id = sd.subdetail_id 
			AND s.appraisal_id = ?
		ORDER BY d.detail_id, sd.subdetail_id
	`, appraisalID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch details"})
		return
	}
	defer rows.Close()

	// จัดกลุ่มข้อมูล
	detailsMap := make(map[int]*Detail)
	scoresMap := make(map[string]float64) // key: "detailID_subdetailID"

	for rows.Next() {
		var detailID, maxScore, subdetailID int
		var topic, subdetailTopic string
		var score1, score2, score3, score4, score5 sql.NullString
		var scoreValue float64

		err := rows.Scan(&detailID, &topic, &maxScore, &subdetailID, &subdetailTopic,
			&score1, &score2, &score3, &score4, &score5, &scoreValue)
		if err != nil {
			continue
		}

		// สร้าง Detail ถ้ายังไม่มี
		if _, exists := detailsMap[detailID]; !exists {
			detailsMap[detailID] = &Detail{
				DetailID:   detailID,
				Topic:      topic,
				MaxScore:   maxScore,
				SubDetails: []SubDetail{},
			}
		}

		// เพิ่ม SubDetail
		subDetail := SubDetail{
			DetailID:       detailID,
			SubDetailID:    subdetailID,
			SubDetailTopic: subdetailTopic,
			Score1Desc:     score1.String,
			Score2Desc:     score2.String,
			Score3Desc:     score3.String,
			Score4Desc:     score4.String,
			Score5Desc:     score5.String,
		}
		detailsMap[detailID].SubDetails = append(detailsMap[detailID].SubDetails, subDetail)

		// เก็บคะแนน
		if scoreValue > 0 {
			key := fmt.Sprintf("%d_%d", detailID, subdetailID)
			scoresMap[key] = scoreValue
		}
	}

	// แปลง map เป็น array
	var detailsArray []Detail
	for _, detail := range detailsMap {
		detailsArray = append(detailsArray, *detail)
	}

	// คำนวณคะแนนรวม
	var totalScore float64
	for _, score := range scoresMap {
		totalScore += score
	}

	// ดึงข้อมูลการเข้างาน (attendance) ของปีนั้นๆ
	type AttendanceStats struct {
		Absent int `json:"absent"`
		Late   int `json:"late"`
		Leave  int `json:"leave"`
	}

	var attendance AttendanceStats
	db.QueryRow(`
		SELECT 
			COUNT(CASE WHEN status = 'ขาด' THEN 1 END) as absent,
			COUNT(CASE WHEN status = 'สาย' THEN 1 END) as late,
			COUNT(CASE WHEN status = 'ลา' THEN 1 END) as leave
		FROM attendance
		WHERE emp_id = ? AND strftime('%Y', date) = ?
	`, info.EmpID, fmt.Sprintf("%d", info.Year)).Scan(&attendance.Absent, &attendance.Late, &attendance.Leave)

	c.JSON(200, gin.H{
		"employee":    info,
		"details":     detailsArray,
		"scores":      scoresMap,
		"total_score": totalScore,
		"attendance":  attendance,
	})
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
	evaluation.Position = "Developer"  // TODO: ดึงจาก position table
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
	positionID := c.Query("position_id")

	var query string
	var rows *sql.Rows
	var err error

	if positionID != "" {
		// ถ้ามี position_id ให้กรองตาม position
		query = `
			SELECT 
				d.detail_id, 
				d.topic, 
				COALESCE(d.max_score, 0) as max_score, 
				sd.subdetail_id, 
				sd.subdetail_topic,
				sd.score_1_desc,
				sd.score_2_desc,
				sd.score_3_desc,
				sd.score_4_desc,
				sd.score_5_desc
			FROM detail d
			LEFT JOIN SubDetail sd ON d.detail_id = sd.detail_id
			WHERE d.position_id = ?
			ORDER BY d.detail_id, sd.subdetail_id
		`
		rows, err = db.Query(query, positionID)
	} else {
		// ถ้าไม่มี position_id ให้แสดงทั้งหมด
		query = `
			SELECT 
				d.detail_id, 
				d.topic, 
				COALESCE(d.max_score, 0) as max_score, 
				sd.subdetail_id, 
				sd.subdetail_topic,
				sd.score_1_desc,
				sd.score_2_desc,
				sd.score_3_desc,
				sd.score_4_desc,
				sd.score_5_desc
			FROM detail d
			LEFT JOIN SubDetail sd ON d.detail_id = sd.detail_id
			ORDER BY d.detail_id, sd.subdetail_id
		`
		rows, err = db.Query(query)
	}
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
		var score1Desc sql.NullString
		var score2Desc sql.NullString
		var score3Desc sql.NullString
		var score4Desc sql.NullString
		var score5Desc sql.NullString

		err := rows.Scan(&detailID, &topic, &maxScore, &subDetailID, &subDetailTopic,
			&score1Desc, &score2Desc, &score3Desc, &score4Desc, &score5Desc)
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

			// เพิ่ม score descriptions
			if score1Desc.Valid {
				subDetail.Score1Desc = score1Desc.String
			}
			if score2Desc.Valid {
				subDetail.Score2Desc = score2Desc.String
			}
			if score3Desc.Valid {
				subDetail.Score3Desc = score3Desc.String
			}
			if score4Desc.Valid {
				subDetail.Score4Desc = score4Desc.String
			}
			if score5Desc.Valid {
				subDetail.Score5Desc = score5Desc.String
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

	// เพิ่ม subdetail ใหม่ พร้อม score descriptions
	_, err = db.Exec(`INSERT INTO SubDetail 
		(detail_id, subdetail_id, subdetail_topic, score_1_desc, score_2_desc, score_3_desc, score_4_desc, score_5_desc) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		subDetail.DetailID, nextSubDetailID, subDetail.SubDetailTopic,
		subDetail.Score1Desc, subDetail.Score2Desc, subDetail.Score3Desc, subDetail.Score4Desc, subDetail.Score5Desc)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to add subdetail"})
		return
	}

	c.JSON(201, gin.H{"message": "SubDetail added successfully"})
}

// updateSubDetail - แก้ไข SubDetail
func updateSubDetail(c *gin.Context) {
	subdetailID := c.Param("id")

	var subDetail SubDetail
	if err := c.ShouldBindJSON(&subDetail); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	// อัพเดท subdetail
	_, err := db.Exec(`UPDATE SubDetail 
		SET subdetail_topic = ?, 
			score_1_desc = ?, 
			score_2_desc = ?, 
			score_3_desc = ?, 
			score_4_desc = ?, 
			score_5_desc = ?
		WHERE detail_id = ? AND subdetail_id = ?`,
		subDetail.SubDetailTopic,
		subDetail.Score1Desc, subDetail.Score2Desc, subDetail.Score3Desc,
		subDetail.Score4Desc, subDetail.Score5Desc,
		subDetail.DetailID, subdetailID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update subdetail"})
		return
	}

	c.JSON(200, gin.H{"message": "SubDetail updated successfully"})
}

// deleteSubDetail - ลบ SubDetail
func deleteSubDetail(c *gin.Context) {
	subdetailID := c.Param("id")
	detailID := c.Query("detail_id")

	if detailID == "" {
		c.JSON(400, gin.H{"error": "detail_id is required"})
		return
	}

	// ลบ subdetail
	_, err := db.Exec("DELETE FROM SubDetail WHERE detail_id = ? AND subdetail_id = ?",
		detailID, subdetailID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete subdetail"})
		return
	}

	c.JSON(200, gin.H{"message": "SubDetail deleted successfully"})
}

// updateDetail - แก้ไข Detail
func updateDetail(c *gin.Context) {
	detailID := c.Param("id")

	var detail Detail
	if err := c.ShouldBindJSON(&detail); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	// อัพเดท detail
	_, err := db.Exec("UPDATE Detail SET topic = ?, max_score = ? WHERE detail_id = ?",
		detail.Topic, detail.MaxScore, detailID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update detail"})
		return
	}

	c.JSON(200, gin.H{"message": "Detail updated successfully"})
}

// deleteDetail - ลบ Detail (พร้อม SubDetails ทั้งหมด)
func deleteDetail(c *gin.Context) {
	detailID := c.Param("id")

	// ลบ subdetails ก่อน
	_, err := db.Exec("DELETE FROM SubDetail WHERE detail_id = ?", detailID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete subdetails"})
		return
	}

	// ลบ detail
	_, err = db.Exec("DELETE FROM Detail WHERE detail_id = ?", detailID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete detail"})
		return
	}

	c.JSON(200, gin.H{"message": "Detail and all subdetails deleted successfully"})
}

// getAttendance - ดึงข้อมูลการเข้างานของพนักงาน
func getAttendance(c *gin.Context) {
	empID := c.Query("emp_id")
	year := c.Query("year") // format: YYYY

	var query string
	var args []interface{}

	if empID != "" && year != "" {
		// กรองตาม emp_id และปี
		query = `SELECT a.attendance_id, a.emp_id, a.date, a.status, a.remark, a.created_at,
				e.first_name, e.last_name
				FROM attendance a
				LEFT JOIN employees e ON a.emp_id = e.emp_id
				WHERE a.emp_id = ? AND strftime('%Y', a.date) = ?
				ORDER BY a.date DESC`
		args = append(args, empID, year)
	} else if empID != "" {
		// กรองเฉพาะ emp_id
		query = `SELECT a.attendance_id, a.emp_id, a.date, a.status, a.remark, a.created_at,
				e.first_name, e.last_name
				FROM attendance a
				LEFT JOIN employees e ON a.emp_id = e.emp_id
				WHERE a.emp_id = ?
				ORDER BY a.date DESC`
		args = append(args, empID)
	} else if year != "" {
		// กรองเฉพาะปี
		query = `SELECT a.attendance_id, a.emp_id, a.date, a.status, a.remark, a.created_at,
				e.first_name, e.last_name
				FROM attendance a
				LEFT JOIN employees e ON a.emp_id = e.emp_id
				WHERE strftime('%Y', a.date) = ?
				ORDER BY a.date DESC`
		args = append(args, year)
	} else {
		// ดึงทั้งหมด
		query = `SELECT a.attendance_id, a.emp_id, a.date, a.status, a.remark, a.created_at,
				e.first_name, e.last_name
				FROM attendance a
				LEFT JOIN employees e ON a.emp_id = e.emp_id
				ORDER BY a.date DESC
				LIMIT 100`
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch attendance", "details": err.Error()})
		return
	}
	defer rows.Close()

	var attendances []Attendance
	for rows.Next() {
		var att Attendance
		err := rows.Scan(&att.AttendanceID, &att.EmpID, &att.Date, &att.Status,
			&att.Remark, &att.CreatedAt, &att.FirstName, &att.LastName)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to scan attendance"})
			return
		}
		attendances = append(attendances, att)
	}

	c.JSON(200, attendances)
}

// addAttendance - เพิ่มบันทึกการเข้างาน
func addAttendance(c *gin.Context) {
	var attendance Attendance
	if err := c.ShouldBindJSON(&attendance); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	result, err := db.Exec(`INSERT INTO attendance (emp_id, date, status, remark) 
		VALUES (?, ?, ?, ?)`,
		attendance.EmpID, attendance.Date, attendance.Status, attendance.Remark)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to add attendance"})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(201, gin.H{"message": "Attendance added successfully", "attendance_id": id})
}

// updateAttendance - แก้ไขบันทึกการเข้างาน
func updateAttendance(c *gin.Context) {
	attendanceID := c.Param("id")

	var attendance Attendance
	if err := c.ShouldBindJSON(&attendance); err != nil {
		c.JSON(400, gin.H{"error": "Bad request"})
		return
	}

	_, err := db.Exec(`UPDATE attendance 
		SET date = ?, status = ?, remark = ?
		WHERE attendance_id = ?`,
		attendance.Date, attendance.Status, attendance.Remark, attendanceID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update attendance"})
		return
	}

	c.JSON(200, gin.H{"message": "Attendance updated successfully"})
}

// deleteAttendance - ลบบันทึกการเข้างาน
func deleteAttendance(c *gin.Context) {
	attendanceID := c.Param("id")

	_, err := db.Exec("DELETE FROM attendance WHERE attendance_id = ?", attendanceID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete attendance"})
		return
	}

	c.JSON(200, gin.H{"message": "Attendance deleted successfully"})
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
		Email            string `json:"email"`
		Phone            string `json:"phone"`
		Address          string `json:"address"`
		EmergencyName    string `json:"emergencyName"`
		EmergencyContact string `json:"emergencyContact"`
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
	api.GET("/positions", getPositions)
	api.POST("/saveScore", saveScore)
	api.POST("/submitEvaluation", submitEvaluation)
	api.GET("/evaluations", getAllEvaluations)
	api.GET("/evaluations/:id", getEvaluationDetail)
	api.GET("/getDetails", getDetails)
	api.POST("/addDetail", addDetail)
	api.PUT("/updateDetail/:id", updateDetail)
	api.DELETE("/deleteDetail/:id", deleteDetail)
	api.POST("/addSubDetail", addSubDetail)
	api.PUT("/updateSubDetail/:id", updateSubDetail)
	api.DELETE("/deleteSubDetail/:id", deleteSubDetail)

	// Attendance routes
	api.GET("/attendance", getAttendance)
	api.POST("/attendance", addAttendance)
	api.PUT("/attendance/:id", updateAttendance)
	api.DELETE("/attendance/:id", deleteAttendance)

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
