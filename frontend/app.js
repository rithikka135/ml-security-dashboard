const API = "";

/* ================= LOGIN ================= */
function login() {
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {

      // 🔥 SAVE USER SESSION
      localStorage.setItem("user", JSON.stringify(d));

      window.location.href =
        d.role === "admin" ? "/admin.html" : "/dashboard.html";
    } else {
      msg.innerText = "❌ Login Failed";
    }
  });
}

/* ================= ADD LOG ================= */
function addLog() {
  const user = document.getElementById("user").value;
  const ip = document.getElementById("ip").value;
  const status = document.getElementById("status").value;

  fetch("/add-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      log: `${user} | ${ip} | ${status}`
    })
  })
  .then(r => r.json())
  .then(data => {
    alert(data.message || "Log Added");
    loadLogs();
    loadStats(); // 🔥 update graph
  });
}

/* ================= LOAD LOGS ================= */
function loadLogs() {
  fetch("/logs")
    .then(r => r.json())
    .then(d => {
      document.getElementById("logs").innerText =
        d.length ? d.join("\n") : "No logs available";
    });
}

/* ================= ANALYZE ================= */
function analyze() {
  fetch("/analyze")
    .then(r => r.json())
    .then(d => {
      document.getElementById("result").innerText =
        JSON.stringify(d, null, 2);

      showAlert(d); // 🔥 REAL-TIME ALERT
    });
}

/* ================= CLEAR ================= */
function clearLogs() {
  fetch("/clear", { method: "POST" })
    .then(() => {
      loadLogs();
      loadStats();
    });
}

/* ================= 🔥 GRAPH DATA ================= */
function loadStats() {
  fetch("/stats")
    .then(r => r.json())
    .then(data => {
      if (window.updateChart) {
        updateChart(data.success, data.failed); // hook for chart
      }
    });
}

/* ================= 🔥 BLOCK IP ================= */
function blockIP() {
  const ip = document.getElementById("blockIP").value;

  fetch("/block-ip", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ ip })
  })
  .then(r => r.json())
  .then(data => {
    alert(data.message);
    loadBlocked();
  });
}

/* ================= 🔥 LOAD BLOCKED ================= */
function loadBlocked() {
  fetch("/blocked")
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById("blockedList");
      if (el) el.innerText = data.join("\n") || "No blocked IPs";
    });
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

/* ================= 🔥 ALERT ================= */
function showAlert(data) {
  const box = document.getElementById("alertBox");
  if (!box) return;

  if (data.alert.includes("HIGH")) {
    box.style.color = "red";
  } else if (data.alert.includes("Suspicious")) {
    box.style.color = "orange";
  } else {
    box.style.color = "lightgreen";
  }

  box.innerText = data.alert;
}

/* ================= AUTO LOAD ================= */
window.onload = () => {
  loadLogs();
  loadStats();
  loadBlocked();
};



