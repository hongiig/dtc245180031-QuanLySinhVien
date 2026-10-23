const express = require('express');
const mysql = require('mysql2/promise');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prometheus Metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Cấu hình Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'student_user',
    password: process.env.DB_PASSWORD || 'StudentSecurePass@2026!',
    database: process.env.DB_NAME || 'student_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Endpoint giám sát cho Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Giao diện chính: Hiển thị danh sách Lớp, Sinh viên, Điểm
app.get('/', async (req, res) => {
    try {
        const [classes] = await pool.query('SELECT * FROM classes');
        const [students] = await pool.query(`
            SELECT s.id, s.full_name, s.email, c.class_name 
            FROM students s LEFT JOIN classes c ON s.class_id = c.id
        `);
        const [grades] = await pool.query(`
            SELECT g.id, s.full_name, g.subject, g.score 
            FROM grades g JOIN students s ON g.student_id = s.id
        `);

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>He Thong Quan Ly Sinh Vien</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #2c3e50; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    h2 { color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px; }
                </style>
            </head>
            <body>
                <h1>He Thong Quan Ly Sinh Vien - Nhom De Tai 2</h1>
                
                <h2>Danh sach Lop hoc</h2>
                <table>
                    <tr><th>ID</th><th>Ten Lop</th></tr>
                    ${classes.map(c => `<tr><td>${c.id}</td><td>${c.class_name}</td></tr>`).join('')}
                </table>

                <h2>Danh sach Sinh vien</h2>
                <table>
                    <tr><th>ID</th><th>Ho va Ten</th><th>Email</th><th>Lop</th></tr>
                    ${students.map(s => `<tr><td>${s.id}</td><td>${s.full_name}</td><td>${s.email}</td><td>${s.class_name || 'Chua xep lop'}</td></tr>`).join('')}
                </table>

                <h2>Bang Diem Sinh vien</h2>
                <table>
                    <tr><th>ID</th><th>Sinh vien</th><th>Mon hoc</th><th>Diem</th></tr>
                    ${grades.map(g => `<tr><td>${g.id}</td><td>${g.full_name}</td><td>${g.subject}</td><td>${g.score}</td></tr>`).join('')}
                </table>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Loi ket noi Database: " + err.message);
    }
});

// API Thêm Sinh viên mới (CRUD)
app.post('/api/students', async (req, res) => {
    const { full_name, email, class_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO students (full_name, email, class_id) VALUES (?, ?, ?)',
            [full_name, email, class_id]
        );
        res.status(201).json({ message: 'Them thanh cong', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Web app running on port ${port}`);
});
