CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    score FLOAT CHECK (score >= 0 AND score <= 10),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Dữ liệu mẫu
INSERT INTO classes (class_name) VALUES ('CNTT-01'), ('KTPM-02');
INSERT INTO students (full_name, email, class_id) VALUES 
('Nguyen Van A', 'a.nguyen@example.com', 1),
('Tran Thi B', 'b.tran@example.com', 2);
INSERT INTO grades (student_id, subject, score) VALUES 
(1, 'Co so du lieu', 8.5),
(2, 'He dieu hanh', 9.0);
