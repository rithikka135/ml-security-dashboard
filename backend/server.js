const express = require("express");
const cors = require("cors");
const path = require("path");

const { analyze, detectSuspiciousIPs } = require("./analyzer");
const { logEvent } = require("./logger");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

let logs = [];

/* LOGIN */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  logEvent(`LOGIN ATTEMPT: ${username}`);

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, role: "admin", username });
  }

  if (username === "user" && password === "user123") {
    return res.json({ success: true, role: "user", username });
  }

  res.json({ success: false });
});

/* ADD LOG */
app.post("/add-log", (req, res) => {
  const { log } = req.body;

  if (!log) return res.status(400).json({ message: "log required" });

  logs.push(log);
  logEvent(`LOG ADDED: ${log}`);

  res.json({ message: "added", logs });
});

/* GET LOGS */
app.get("/logs", (req, res) => {
  res.json(logs);
});

/* CLEAR LOGS */
app.post("/clear", (req, res) => {
  logs = [];
  logEvent("LOGS CLEARED");
  res.json({ message: "cleared" });
});

/* ML ANALYSIS */
app.get("/analyze", (req, res) => {
  const result = analyze(logs);
  const suspicious = detectSuspiciousIPs(result);

  res.json({
    result,
    suspicious,
    count: logs.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});