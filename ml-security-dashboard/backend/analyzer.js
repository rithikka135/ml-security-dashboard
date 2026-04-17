function analyze(logs) {
  const result = {};

  if (!Array.isArray(logs)) return result;

  logs.forEach(l => {
    if (!l) return;

    const parts = l.split("|").map(x => x.trim());

    if (parts.length < 3) return;

    const [user, ip, status] = parts;

    if (!result[ip]) {
      result[ip] = { success: 0, failed: 0 };
    }

    if (status === "success") result[ip].success++;
    if (status === "failed") result[ip].failed++;
  });

  return result;
}

function detectSuspiciousIPs(data) {
  const suspicious = [];

  if (!data) return suspicious;

  for (let ip in data) {
    if (data[ip].failed >= 3) {
      suspicious.push({ ip, ...data[ip] });
    }
  }

  return suspicious;
}

module.exports = { analyze, detectSuspiciousIPs };