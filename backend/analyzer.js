function analyze(logs) {
  const result = {};

  logs.forEach((log) => {
    const [user, ip, status] = log.split("|").map(x => x.trim());

    if (!result[ip]) {
      result[ip] = { success: 0, failed: 0 };
    }

    const cleanStatus = (status || "").toLowerCase();

    if (cleanStatus === "success") {
      result[ip].success++;
    } else if (cleanStatus === "failed") {
      result[ip].failed++;
    }
  });

  return result;
}

function detectSuspiciousIPs(data) {
  const suspicious = [];

  for (let ip in data) {
    if (data[ip].failed >= 3) {
      suspicious.push({
        ip,
        ...data[ip]
      });
    }
  }

  return suspicious;
}

module.exports = { analyze, detectSuspiciousIPs };