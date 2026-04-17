function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        window.location.href =
          d.role === "admin" ? "/admin.html" : "/dashboard.html";
      } else {
        msg.innerText = "❌ Login Failed";
      }
    })
    .catch(err => {
      msg.innerText = "❌ Server Error";
      console.error(err);
    });
}

/* ADD LOG */
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
    .then(() => loadLogs())
    .catch(err => console.error(err));
}

/* LOAD LOGS */
function loadLogs() {
  const logs = document.getElementById("logs");

  fetch("/logs")
    .then(r => r.json())
    .then(d => {
      logs.innerText = d.length ? d.join("\n") : "No logs found";
    })
    .catch(err => {
      logs.innerText = "Error loading logs";
      console.error(err);
    });
}

/* ML ANALYSIS */
function analyze() {
  const result = document.getElementById("result");

  fetch("/analyze")
    .then(r => r.json())
    .then(d => {
      result.innerText = JSON.stringify(d, null, 2);
    })
    .catch(err => {
      result.innerText = "Analysis failed";
      console.error(err);
    });
}

/* CLEAR LOGS */
function clearLogs() {
  fetch("/clear", { method: "POST" })
    .then(() => loadLogs())
    .catch(err => console.error(err));
}