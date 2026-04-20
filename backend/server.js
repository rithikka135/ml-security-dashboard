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
let blockedIPs = [];   // existing

/* =========================
   🔥 THREAT SCORE SYSTEM (NEW)
========================= */
let ipScores = {};

function updateThreatScore(ip, isSuspicious) {
  if (!ip) return null;

  if (!ipScores[ip]) {
    ipScores[ip] = {
      score: 0,
      status: "SAFE"
    };
  }

  if (isSuspicious) {
    ipScores[ip].score += 25;
  } else {
    ipScores[ip].score = Math.max(0, ipScores[ip].score - 5);
  }

  if (ipScores[ip].score >= 80) {
    ipScores[ip].status = "BLOCKED";

    if (!blockedIPs.includes(ip)) {
      blockedIPs.push(ip);
    }

  } else if (ipScores[ip].score >= 50) {
    ipScores[ip].status = "SUSPICIOUS";
  } else {
    ipScores[ip].status = "SAFE";
  }

  return ipScores[ip];
}

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
   ADD LOG API (UPDATED)
========================= */
app.post("/add-log", (req, res) => {
  const { log } = req.body;

  if (!log) {
    return res.status(400).json({ message: "Log is required" });
  }

  const ip = log.split("|")[1]?.trim();

  if (blockedIPs.includes(ip)) {
    return res.json({ message: "❌ BLOCKED IP - log rejected" });
  }

  logs.push(log);

  const isSuspicious = log.includes("failed");

  const threat = updateThreatScore(ip, isSuspicious);

  return res.json({
    message: "added",
    totalLogs: logs.length,
    threat
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
   GRAPH DATA API
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
   BLOCK IP API
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
   GET BLOCKED IPS
========================= */
app.get("/blocked", (req, res) => {
  res.json(blockedIPs);
});

/* =========================
   THREAT SCORE API
========================= */
app.get("/threat-scores", (req, res) => {
  res.json(ipScores);
});

/* =====================================================
   🧠🔥 AI SECURITY CHATBOT (NEW FEATURE ADDED HERE)
===================================================== */
app.post("/chatbot", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({ reply: "Please ask a question." });
  }

  const msg = message.toLowerCase();

  // 🔥 SIMPLE SECURITY INTELLIGENCE
  let reply = "I am not sure. Try asking about logs, IP, or threats.";

  if (msg.includes("blocked")) {
    reply = `Blocked IPs: ${blockedIPs.length > 0 ? blockedIPs.join(", ") : "No blocked IPs yet."}`;
  }

  else if (msg.includes("why") && msg.includes("ip")) {
    reply = "An IP is blocked when it shows repeated failed login attempts or high threat score.";
  }

  else if (msg.includes("logs")) {
    reply = `Total logs stored: ${logs.length}`;
  }

  else if (msg.includes("failed")) {
    const failed = logs.filter(l => l.includes("failed")).length;
    reply = `Failed attempts detected: ${failed}`;
  }

  else if (msg.includes("safe")) {
    reply = "Safe logs are normal activities without suspicious behavior.";
  }

  else if (msg.includes("threat")) {
    reply = "Threat score increases when suspicious activity like failed logins is detected.";
  }

  return res.json({ reply });
});

/* =========================
   ML ANALYSIS
========================= */
app.get("/analyze", (req, res) => {
  const failed = logs.filter(l => l.includes("failed")).length;
  const success = logs.filter(l => l.includes("success")).length;

  let riskLevel = "LOW";
  if (failed >= 5) riskLevel = "HIGH";
  else if (failed >= 3) riskLevel = "MEDIUM";

  let alert = "SAFE";
  if (riskLevel === "HIGH") alert = "🚨 HIGH ATTACK DETECTED";
  else if (riskLevel === "MEDIUM") alert = "⚠️ Suspicious Activity";

  return res.json({
    total: logs.length,
    failed,
    success,
    riskLevel,
    alert
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

