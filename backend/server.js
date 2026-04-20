const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   FRONTEND PATH
========================= */
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

/* =========================
   HOME ROUTE
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

/* =========================
   MEMORY STORAGE
========================= */
let logs = [];
let blockedIPs = [];   // 🔥 NEW

/* =========================
   LOGIN API
========================= */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, role: "admin" });
  }

  if (username === "user" && password === "user123") {
    return res.json({ success: true, role: "user" });
  }

  return res.json({ success: false });
});

/* =========================
   ADD LOG API
========================= */
app.post("/add-log", (req, res) => {
  const { log } = req.body;

  if (!log) {
    return res.status(400).json({ message: "Log is required" });
  }

  // 🔥 BLOCK CHECK
  const ip = log.split("|")[1]?.trim();
  if (blockedIPs.includes(ip)) {
    return res.json({ message: "❌ BLOCKED IP - log rejected" });
  }

  logs.push(log);

  return res.json({
    message: "added",
    totalLogs: logs.length
  });
});

/* =========================
   GET LOGS API
========================= */
app.get("/logs", (req, res) => {
  res.json(logs);
});

/* =========================
   CLEAR LOGS API
========================= */
app.post("/clear", (req, res) => {
  logs = [];
  res.json({ message: "cleared" });
});

/* =========================
   🔥 GRAPH DATA API (NEW)
========================= */
app.get("/stats", (req, res) => {
  const failed = logs.filter(l => l.includes("failed")).length;
  const success = logs.filter(l => l.includes("success")).length;

  res.json({
    success,
    failed
  });
});

/* =========================
   🔥 BLOCK IP API (NEW)
========================= */
app.post("/block-ip", (req, res) => {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ message: "IP required" });
  }

  if (!blockedIPs.includes(ip)) {
    blockedIPs.push(ip);
  }

  res.json({
    message: "IP BLOCKED",
    blockedIPs
  });
});

/* =========================
   🔥 GET BLOCKED IPS (NEW)
========================= */
app.get("/blocked", (req, res) => {
  res.json(blockedIPs);
});

/* =========================
   ML ANALYSIS (UPDATED)
========================= */
app.get("/analyze", (req, res) => {
  const failed = logs.filter(l => l.includes("failed")).length;
  const success = logs.filter(l => l.includes("success")).length;

  const suspicious = failed >= 3;

  let riskLevel = "LOW";
  if (failed >= 5) riskLevel = "HIGH";
  else if (failed >= 3) riskLevel = "MEDIUM";

  // 🔥 REAL-TIME ALERT
  let alert = "SAFE";
  if (riskLevel === "HIGH") alert = "🚨 HIGH ATTACK DETECTED";
  else if (riskLevel === "MEDIUM") alert = "⚠️ Suspicious Activity";

  return res.json({
    total: logs.length,
    failed,
    success,
    suspicious,
    riskLevel,
    alert   // 🔥 NEW
  });
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/test", (req, res) => {
  res.json({
    status: "RUNNING",
    time: new Date().toISOString()
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});