const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "app.log");

function logEvent(msg) {
  const time = new Date().toISOString();
  fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
}

module.exports = { logEvent };