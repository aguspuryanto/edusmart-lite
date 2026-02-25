import express from "express";
import { createServer as createViteServer } from "vite";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- admin, teacher, student
    name TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    class_id INTEGER,
    FOREIGN KEY (class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id INTEGER,
    subject_id INTEGER,
    class_id INTEGER,
    PRIMARY KEY (teacher_id, subject_id, class_id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    subject_id INTEGER,
    class_id INTEGER,
    teacher_id INTEGER,
    is_draft INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    subject_id INTEGER,
    class_id INTEGER,
    teacher_id INTEGER,
    deadline DATETIME,
    is_draft INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS student_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER,
    student_id INTEGER,
    file_url TEXT,
    grade REAL,
    feedback TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject_id INTEGER,
    class_id INTEGER,
    teacher_id INTEGER,
    duration INTEGER, -- in minutes
    is_draft INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL, -- multiple_choice, essay
    options TEXT, -- JSON string for multiple choice
    correct_answer TEXT,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
  );

  CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    student_id INTEGER,
    score REAL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exam_answers (
    result_id INTEGER,
    question_id INTEGER,
    student_answer TEXT,
    PRIMARY KEY (result_id, question_id),
    FOREIGN KEY (result_id) REFERENCES exam_results(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS discussions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subject_id INTEGER,
    class_id INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS discussion_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discussion_id INTEGER,
    content TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES discussions(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run(
    "admin",
    hashedPassword,
    "admin",
    "System Administrator"
  );
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name, class_id: user.class_id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name, class_id: user.class_id } });
  });

  app.post("/api/register", (req, res) => {
    const { username, password, role, name, class_id } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const result = db.prepare("INSERT INTO users (username, password, role, name, class_id) VALUES (?, ?, ?, ?, ?)").run(
        username,
        hashedPassword,
        role,
        name,
        class_id || null
      );
      res.json({ id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // User Routes
  app.get("/api/users/me", authenticate, (req: any, res) => {
    const user = db.prepare("SELECT id, username, role, name, email, avatar, class_id FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.get("/api/users", authenticate, (req, res) => {
    const users = db.prepare("SELECT id, username, role, name, email, avatar, class_id FROM users").all();
    res.json(users);
  });

  // Classes & Subjects
  app.get("/api/classes", authenticate, (req, res) => {
    res.json(db.prepare("SELECT * FROM classes").all());
  });
  app.post("/api/classes", authenticate, (req, res) => {
    const result = db.prepare("INSERT INTO classes (name) VALUES (?)").run(req.body.name);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/subjects", authenticate, (req, res) => {
    res.json(db.prepare("SELECT * FROM subjects").all());
  });
  app.post("/api/subjects", authenticate, (req, res) => {
    const result = db.prepare("INSERT INTO subjects (name) VALUES (?)").run(req.body.name);
    res.json({ id: result.lastInsertRowid });
  });

  // Materials
  app.get("/api/materials", authenticate, (req: any, res) => {
    let query = "SELECT m.*, s.name as subject_name, c.name as class_name, u.name as teacher_name FROM materials m JOIN subjects s ON m.subject_id = s.id JOIN classes c ON m.class_id = c.id JOIN users u ON m.teacher_id = u.id";
    const params = [];
    if (req.user.role === 'student') {
      query += " WHERE m.class_id = ? AND m.is_draft = 0";
      params.push(req.user.class_id);
    } else if (req.user.role === 'teacher') {
      query += " WHERE m.teacher_id = ?";
      params.push(req.user.id);
    }
    res.json(db.prepare(query).all(...params));
  });

  app.post("/api/materials", authenticate, (req: any, res) => {
    const { title, content, file_url, subject_id, class_id, is_draft } = req.body;
    const result = db.prepare("INSERT INTO materials (title, content, file_url, subject_id, class_id, teacher_id, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      title, content, file_url, subject_id, class_id, req.user.id, is_draft ? 1 : 0
    );
    res.json({ id: result.lastInsertRowid });
  });

  // Exams
  app.get("/api/exams", authenticate, (req: any, res) => {
    let query = "SELECT e.*, s.name as subject_name, c.name as class_name FROM exams e JOIN subjects s ON e.subject_id = s.id JOIN classes c ON e.class_id = c.id";
    const params = [];
    if (req.user.role === 'student') {
      query += " WHERE e.class_id = ? AND e.is_draft = 0";
      params.push(req.user.class_id);
    } else if (req.user.role === 'teacher') {
      query += " WHERE e.teacher_id = ?";
      params.push(req.user.id);
    }
    res.json(db.prepare(query).all(...params));
  });

  app.get("/api/exams/:id/questions", authenticate, (req, res) => {
    res.json(db.prepare("SELECT * FROM questions WHERE exam_id = ?").all(req.params.id));
  });

  app.post("/api/exams/:id/submit", authenticate, (req: any, res) => {
    const { answers } = req.body; // { question_id: answer }
    const examId = req.params.id;
    const studentId = req.user.id;

    const questions = db.prepare("SELECT * FROM questions WHERE exam_id = ?").all(examId);
    let score = 0;
    const totalQuestions = questions.length;

    const result = db.prepare("INSERT INTO exam_results (exam_id, student_id, finished_at) VALUES (?, ?, CURRENT_TIMESTAMP)").run(examId, studentId);
    const resultId = result.lastInsertRowid;

    for (const q of questions as any) {
      const studentAnswer = answers[q.id];
      db.prepare("INSERT INTO exam_answers (result_id, question_id, student_answer) VALUES (?, ?, ?)").run(resultId, q.id, studentAnswer);
      
      if (q.type === 'multiple_choice' && studentAnswer === q.correct_answer) {
        score += (100 / totalQuestions);
      }
    }

    db.prepare("UPDATE exam_results SET score = ? WHERE id = ?").run(score, resultId);
    res.json({ score, resultId });
  });

  // Announcements
  app.get("/api/announcements", authenticate, (req, res) => {
    res.json(db.prepare("SELECT a.*, u.name as author_name FROM announcements a JOIN users u ON a.created_by = u.id ORDER BY created_at DESC").all());
  });
  app.post("/api/announcements", authenticate, (req: any, res) => {
    const result = db.prepare("INSERT INTO announcements (title, content, created_by) VALUES (?, ?, ?)").run(req.body.title, req.body.content, req.user.id);
    res.json({ id: result.lastInsertRowid });
  });

  // Chat WebSocket Logic
  const clients = new Map<number, WebSocket>();
  wss.on("connection", (ws, req) => {
    let userId: number | null = null;

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString());
      if (data.type === "auth") {
        try {
          const decoded: any = jwt.verify(data.token, JWT_SECRET);
          userId = decoded.id;
          if (userId) clients.set(userId, ws);
        } catch (e) {}
      } else if (data.type === "chat" && userId) {
        const { receiver_id, message: msg } = data;
        db.prepare("INSERT INTO chats (sender_id, receiver_id, message) VALUES (?, ?, ?)").run(userId, receiver_id, msg);
        
        const receiverWs = clients.get(receiver_id);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify({ type: "chat", sender_id: userId, message: msg, created_at: new Date().toISOString() }));
        }
      }
    });

    ws.on("close", () => {
      if (userId) clients.delete(userId);
    });
  });

  app.get("/api/chats/:otherUserId", authenticate, (req: any, res) => {
    const otherUserId = req.params.otherUserId;
    const userId = req.user.id;
    const chats = db.prepare(`
      SELECT * FROM chats 
      WHERE (sender_id = ? AND receiver_id = ?) 
      OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, otherUserId, otherUserId, userId);
    res.json(chats);
  });

  // Discussions
  app.get("/api/discussions", authenticate, (req, res) => {
    const query = `
      SELECT d.*, s.name as subject_name, c.name as class_name, u.name as author_name 
      FROM discussions d 
      JOIN subjects s ON d.subject_id = s.id 
      JOIN classes c ON d.class_id = c.id 
      JOIN users u ON d.created_by = u.id 
      ORDER BY d.created_at DESC
    `;
    res.json(db.prepare(query).all());
  });

  app.post("/api/discussions", authenticate, (req: any, res) => {
    const { title, content, subject_id, class_id } = req.body;
    const result = db.prepare("INSERT INTO discussions (title, content, subject_id, class_id, created_by) VALUES (?, ?, ?, ?, ?)").run(
      title, content, subject_id, class_id, req.user.id
    );
    res.json({ id: result.lastInsertRowid });
  });

  // Assignments
  app.get("/api/assignments", authenticate, (req: any, res) => {
    let query = "SELECT a.*, s.name as subject_name, c.name as class_name, u.name as teacher_name FROM assignments a JOIN subjects s ON a.subject_id = s.id JOIN classes c ON a.class_id = c.id JOIN users u ON a.teacher_id = u.id";
    const params = [];
    if (req.user.role === 'student') {
      query += " WHERE a.class_id = ? AND a.is_draft = 0";
      params.push(req.user.class_id);
    } else if (req.user.role === 'teacher') {
      query += " WHERE a.teacher_id = ?";
      params.push(req.user.id);
    }
    res.json(db.prepare(query).all(...params));
  });

  app.post("/api/assignments", authenticate, (req: any, res) => {
    const { title, description, file_url, subject_id, class_id, deadline, is_draft } = req.body;
    const result = db.prepare("INSERT INTO assignments (title, description, file_url, subject_id, class_id, teacher_id, deadline, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      title, description, file_url, subject_id, class_id, req.user.id, deadline, is_draft ? 1 : 0
    );
    res.json({ id: result.lastInsertRowid });
  });

  // Export Users to Excel
  app.get("/api/export/users", authenticate, (req, res) => {
    const users = db.prepare("SELECT id, username, role, name, email FROM users").all();
    res.json(users); // In a real app, we'd use xlsx here to generate a buffer
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
