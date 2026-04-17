const express = require("express");
const cors = require("cors");
const { analyze, detectSuspiciousIPs } = require("./analyzer");
const { logEvent } = require("./logger");

const app = express();

app.use(cors());
app.use(express.json());

let logs = [];

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  logEvent(`LOGIN ATTEMPT: ${username}`);

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, role: "admin", username });
  }

  if (username === "user" && password === "user123") {
    return res.json({ success: true, role: "user", username });
  }

  return res.json({ success: false });
});

/* ================= ADD LOG ================= */
app.post("/add-log", (req, res) => {
  const { log } = req.body;

  if (!log) {
    return res.status(400).json({ message: "log required" });
  }

  logs.push(log);
  logEvent(`LOG ADDED: ${log}`);

  return res.json({ message: "added", logs });
});

/* ================= GET LOGS ================= */
app.get("/logs", (req, res) => {
  return res.json(logs);
});

/* ================= CLEAR LOGS ================= */
app.post("/clear", (req, res) => {
  logs = [];
  logEvent("LOGS CLEARED");

  return res.json({ message: "cleared" });
});

/* ================= ML ANALYSIS (FIXED STABLE OUTPUT) ================= */
app.get("/analyze", (req, res) => {
  const result = analyze(logs) || {};
  const suspicious = detectSuspiciousIPs(result) || [];

  logEvent("ML ANALYSIS RUN");

  // 🔥 IMPORTANT: prevent empty crash issues
  return res.json({
    result,
    suspicious,
    count: logs.length
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});