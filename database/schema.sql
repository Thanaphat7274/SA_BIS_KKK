-- Example schema.sql for HR/Employee Management System

CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY autoincrement,
    manager_id INTEGER,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    hire_date TEXT NOT NULL, pos_id INTEGER REFERENCES position(position_id),
    FOREIGN KEY (manager_id) REFERENCES "employees"(emp_id)
);

CREATE TABLE appraisal (
  ap_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  year INTEGER,
  evaluated_at DATETIME, m_comment TEXT, e_comment TEXT,foreign key (user_id) references employees(emp_id)
);

CREATE TABLE users (
    emp_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'emp',
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

CREATE TABLE SubDetail (
    detail_id INTEGER NOT NULL,
    subdetail_id INTEGER NOT NULL,
    subdetail_topic TEXT NOT NULL, score_1_desc TEXT, score_2_desc TEXT, score_3_desc TEXT, score_4_desc TEXT, score_5_desc TEXT,
    PRIMARY KEY (detail_id, subdetail_id),
    FOREIGN KEY (detail_id) REFERENCES detail(detail_id)
);

CREATE TABLE Score (
  appraisal_id INTEGER NOT NULL,
  detail_id INTEGER NOT NULL,subdetail_id INTEGER NOT NULL,
  score_value REAL NOT NULL, comment TEXT,
  PRIMARY KEY (appraisal_id, subdetail_id, detail_id),
  FOREIGN KEY (appraisal_id) REFERENCES Appraisal(ap_id),
  FOREIGN KEY (subdetail_id,detail_id) REFERENCES SubDetail(subdetail_id,detail_id)
);

CREATE TABLE detail (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    max_score INTEGER DEFAULT 0
, position_id INTEGER REFERENCES position(position_id));
CREATE TABLE position (position_id INTEGER PRIMARY KEY AUTOINCREMENT, position_name TEXT);

CREATE TABLE attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT CHECK(status IN ('ขาด', 'ลา', 'สาย', 'มาทำงาน')) NOT NULL,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);