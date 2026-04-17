const API = "http://localhost:3000";

/* LOGIN */
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(r => r.json())
  .then(data => {
    if (!data.success) {
      document.getElementById("msg").innerText = "Login Failed";
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));

    window.location.href =
      data.role === "admin" ? "admin.html" : "dashboard.html";
  });
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

/* ADD LOG */
function addLog() {
  const log = `${user.value} | ${ip.value} | ${status.value}`;

  fetch(`${API}/add-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ log })
  }).then(() => loadLogs());
}

/* LOAD LOGS */
function loadLogs() {
  fetch(`${API}/logs`)
    .then(r => r.json())
    .then(data => {
      logs.innerText = data.join("\n");
    });
}

/* ML ANALYSIS */
function analyze() {
  fetch(`${API}/analyze`)
    .then(r => r.json())
    .then(data => {
      result.innerText = JSON.stringify(data, null, 2);
    });
}

/* CLEAR */
function clearLogs() {
  fetch(`${API}/clear`, { method: "POST" })
    .then(() => loadLogs());
}