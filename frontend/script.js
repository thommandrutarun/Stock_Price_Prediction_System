const API_BASE = "http://localhost:5000/api";
let chart = null;

/* ---------- POPUP UTILS ---------- */
function showPopup(message, onClose) {
  let overlay = document.getElementById("popup-overlay");
  let box = document.getElementById("popup-box");
  let text = document.getElementById("popup-text");
  let btn = document.getElementById("popup-ok");

  if (!overlay || !box || !text || !btn) {
    alert(message);
    if (onClose) onClose();
    return;
  }

  text.textContent = message;
  overlay.style.display = "flex";

  function closeHandler() {
    overlay.style.display = "none";
    btn.removeEventListener("click", closeHandler);
    if (onClose) onClose();
  }

  btn.addEventListener("click", closeHandler);
}

/* ---------- LOGIN ---------- */
async function login() {
  const body = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
  };

  const msg = document.getElementById("msg");
  if (msg) {
    msg.textContent = "";
    msg.className = "message";
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      // save auth info
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_email", data.user.email);
      if (data.user.role) {
        localStorage.setItem("user_role", data.user.role);
      }

       // decide next page
const target = data.user.role === "admin" ? "admin.html" : "index.html";

// show success popup (optional)
showPopup("Login successful. Redirecting to home...", () => {
  window.location.href = target;
});

// automatic redirect after 1 second (no button click needed)
setTimeout(() => {
  window.location.href = target;
}, 1000);

    } else if (msg) {
      msg.textContent = data.message || "Login failed";
      msg.className = "message error";
    }
  } catch (e) {
    if (msg) {
      msg.textContent = "Network error";
      msg.className = "message error";
    }
  }
}

/* ---------- REGISTER ---------- */
async function registerUser() {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone")
    ? document.getElementById("reg-phone").value.trim()
    : "";
  const dob = document.getElementById("reg-dob")
    ? document.getElementById("reg-dob").value
    : "";
  const profession = document.getElementById("reg-profession")
    ? document.getElementById("reg-profession").value
    : "";
  const password = document.getElementById("reg-password").value;

  const msg = document.getElementById("reg-msg");
  if (msg) {
    msg.textContent = "";
    msg.className = "message";
  }

  // Make DOB & profession required; remove from condition if optional
  if (!name || !email || !password || !dob || !profession) {
    if (msg) {
      msg.textContent = "Please fill in all required fields.";
      msg.className = "message error";
    }
    return;
  }

  const body = { name, email, phone, dob, profession, password };

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      showPopup("Registration completed successfully.", () => {
        window.location.href = "login.html";
      });
    } else if (msg) {
      msg.textContent = data.message || "Registration failed";
      msg.className = "message error";
    }
  } catch (e) {
    if (msg) {
      msg.textContent = "Network error";
      msg.className = "message error";
    }
  }
}

/* ---------- AUTH HELPERS ---------- */
function requireAuth() {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("user_email");

  if (!token) {
    window.location.href = "login.html";
    return null;
  }

  const el = document.getElementById("user-email");
  if (el && email) el.textContent = email;

  return token;
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

function requireAdmin() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("user_role");

  if (!token || role !== "admin") {
    window.location.href = "login.html";
    return null;
  }
  return token;
}

/* ---------- DASHBOARD: HISTORY ---------- */
async function loadHistory() {
  const token = requireAuth();
  if (!token) return;

  const symbol = document.getElementById("symbol").value.trim();
  const period = document.getElementById("period").value;
  const dashMsg = document.getElementById("dash-msg");
  const canvas = document.getElementById("stockChart");

  if (dashMsg) {
    dashMsg.textContent = "";
    dashMsg.className = "message";
  }

  if (!symbol) {
    if (dashMsg) {
      dashMsg.textContent = "Please enter a stock symbol.";
      dashMsg.className = "message error";
    }
    return;
  }

  if (!canvas) {
    if (dashMsg) {
      dashMsg.textContent = "Chart element not found.";
      dashMsg.className = "message error";
    }
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/stocks/${encodeURIComponent(
        symbol
      )}/history?period=${encodeURIComponent(period)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      if (dashMsg) {
        dashMsg.textContent = data.message || "Failed to load history.";
        dashMsg.className = "message error";
      }
      return;
    }

    if (!data.prices || data.prices.length === 0) {
  if (dashMsg) {
    dashMsg.textContent =
      data.message ||
      "No price data returned by data provider for this symbol and period.";
    dashMsg.className = "message error";
  }
  return;
}

    const ctx = canvas.getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.prices.map((p) => p.date),
        datasets: [
          {
            label: "Close Price",
            data: data.prices.map((p) => p.close),
            borderColor: "#4ea1ff",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: { color: "#e5e7eb" },
          },
          y: {
            ticks: { color: "#e5e7eb" },
          },
        },
      },
    });

    if (dashMsg) {
      dashMsg.textContent = "History loaded successfully.";
      dashMsg.className = "message success";
    }
  } catch (e) {
    if (dashMsg) {
      dashMsg.textContent = "Network error while loading history.";
      dashMsg.className = "message error";
    }
  }
}

/* ---------- DASHBOARD: PREDICT ---------- */
async function predict() {
  const token = requireAuth();
  if (!token) return;

  const symbol = document.getElementById("symbol").value.trim();
  const dashMsg = document.getElementById("dash-msg");
  const list = document.getElementById("predictions");

  if (dashMsg) {
    dashMsg.textContent = "";
    dashMsg.className = "message";
  }
  if (list) list.innerHTML = "";

  if (!symbol) {
    if (dashMsg) {
      dashMsg.textContent = "Please enter a stock symbol before predicting.";
      dashMsg.className = "message error";
    }
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/stocks/${encodeURIComponent(
        symbol
      )}/predict?days=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      if (dashMsg) {
        dashMsg.textContent = data.message || "Failed to fetch predictions.";
        dashMsg.className = "message error";
      }
      return;
    }

    if (!data.predictions || data.predictions.length === 0) {
      if (dashMsg) {
        dashMsg.textContent = "No predictions returned.";
        dashMsg.className = "message error";
      }
      return;
    }

    data.predictions.forEach((p, idx) => {
      const li = document.createElement("li");
      li.textContent = `${p.date}: ${p.predicted_close.toFixed(2)}`;

      if (
        idx > 0 &&
        data.predictions[idx - 1].predicted_close < p.predicted_close
      ) {
        li.classList.add("price-up");
      } else if (
        idx > 0 &&
        data.predictions[idx - 1].predicted_close > p.predicted_close
      ) {
        li.classList.add("price-down");
      }

      list.appendChild(li);
    });

    if (dashMsg) {
      dashMsg.textContent = "Predictions loaded.";
      dashMsg.className = "message success";
    }
  } catch (e) {
    if (dashMsg) {
      dashMsg.textContent = "Network error while fetching predictions.";
      dashMsg.className = "message error";
    }
  }
}

/* ---------- ADMIN PANEL ---------- */
async function loadAdminUsers() {
  const token = requireAdmin();
  if (!token) return;

  const msg = document.getElementById("admin-msg");
  const tbody =
    document.querySelector("#users-table tbody") ||
    document.getElementById("users-table-body");

  if (msg) {
    msg.textContent = "";
    msg.className = "message";
  }
  if (tbody) tbody.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      if (msg) {
        msg.textContent = data.message || "Failed to load users.";
        msg.className = "message error";
      }
      return;
    }

    if (!Array.isArray(data.users) || data.users.length === 0) {
      if (msg) {
        msg.textContent = "No users found.";
        msg.className = "message";
      }
      return;
    }

    data.users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id ?? ""}</td>
        <td>${u.name ?? ""}</td>
        <td>${u.email ?? ""}</td>
        <td>${u.phone ?? ""}</td>
        <td>${u.dob ?? ""}</td>
        <td>${u.profession ?? ""}</td>
        <td>${u.role ?? ""}</td>
      `;
      tbody.appendChild(tr);
    });

    if (msg) {
      msg.textContent = "Users loaded successfully.";
      msg.className = "message success";
    }
  } catch (e) {
    if (msg) {
      msg.textContent = "Network error while loading users.";
      msg.className = "message error";
    }
  }
}


// ===== USER PORTFOLIO REPORT (REPORT PAGE) =====

async function loadUserPortfolio() {
  const token = requireAuth();
  if (!token) return;

  const msg = document.getElementById("prof-msg");
  const listEl = document.getElementById("positions-list");
  const totalEl = document.getElementById("pf-total");

  if (!listEl || !totalEl) return;

  if (msg) {
    msg.textContent = "";
    msg.className = "message";
  }

  listEl.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/reports/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      if (msg) {
        msg.textContent = data.message || "Failed to load portfolio.";
        msg.className = "message error";
      }
      return;
    }

    totalEl.textContent = data.total_value.toFixed(2);

    data.positions.forEach((p) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "6px 0";
      row.style.borderBottom = "1px solid rgba(31,41,55,0.6)";

      const left = document.createElement("div");
      left.innerHTML = `<div style="font-weight:600;">${p.symbol}</div>
                        <div class="text-small">Qty: ${p.quantity}</div>`;

      const right = document.createElement("div");
      const changeSign = p.change_abs >= 0 ? "+" : "";
      const pct = p.change_pct.toFixed(2) + "%";
      right.innerHTML = `
        <div>₹${p.latest_price.toFixed(2)}</div>
        <div class="${p.change_abs >= 0 ? "price-up" : "price-down"}">
          ${changeSign}₹${p.change_abs.toFixed(2)} (${changeSign}${pct})
        </div>
      `;

      row.appendChild(left);
      row.appendChild(right);
      listEl.appendChild(row);
    });

    if (msg) {
      msg.textContent = "Portfolio loaded.";
      msg.className = "message success";
    }
  } catch (e) {
    if (msg) {
      msg.textContent = "Network error while loading portfolio.";
      msg.className = "message error";
    }
  }
}

// auto‑run only on report page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("positions-list")) {
    loadUserPortfolio();
  }
});

/* ---------- AUTO-WIRE BUTTONS ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", login);

  const registerBtn = document.getElementById("register-btn");
  if (registerBtn) registerBtn.addEventListener("click", registerUser);

  const historyBtn = document.getElementById("history-btn");
  if (historyBtn) historyBtn.addEventListener("click", loadHistory);

  const predictBtn = document.getElementById("predict-btn");
  if (predictBtn) predictBtn.addEventListener("click", predict);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});

// ===== USER PORTFOLIO REPORT (REPORT PAGE) =====

async function loadUserPortfolio() {
  const token = requireAuth();
  if (!token) return;

  const msg = document.getElementById("prof-msg");
  const listEl = document.getElementById("positions-list");
  const totalEl = document.getElementById("pf-total");

  if (!listEl || !totalEl) return;

  if (msg) {
    msg.textContent = "";
    msg.className = "message";
  }

  listEl.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/reports/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      if (msg) {
        msg.textContent = data.message || "Failed to load portfolio.";
        msg.className = "message error";
      }
      return;
    }

    totalEl.textContent = data.total_value.toFixed(2);

    data.positions.forEach((p) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "6px 0";
      row.style.borderBottom = "1px solid rgba(31,41,55,0.6)";

      const left = document.createElement("div");
      left.innerHTML = `<div style="font-weight:600;">${p.symbol}</div>
                        <div class="text-small">Qty: ${p.quantity}</div>`;

      const right = document.createElement("div");
      const changeSign = p.change_abs >= 0 ? "+" : "";
      const pct = p.change_pct.toFixed(2) + "%";
      right.innerHTML = `
        <div>₹${p.latest_price.toFixed(2)}</div>
        <div class="${p.change_abs >= 0 ? "price-up" : "price-down"}">
          ${changeSign}₹${p.change_abs.toFixed(2)} (${changeSign}${pct})
        </div>
      `;

      row.appendChild(left);
      row.appendChild(right);
      listEl.appendChild(row);
    });

    if (msg) {
      msg.textContent = "Portfolio loaded.";
      msg.className = "message success";
    }
  } catch (e) {
    if (msg) {
      msg.textContent = "Network error while loading portfolio.";
      msg.className = "message error";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("positions-list")) {
    loadUserPortfolio();
  }
});

// ===== GLOBAL NAVBAR SEARCH =====
// When user presses Enter in the nav search, go to dashboard
// and pre-fill the symbol field, then load history.
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("global-search");
  if (!searchInput) return;

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = searchInput.value.trim();
      if (!value) return;

      // remember search term
      localStorage.setItem("last_search_symbol", value);

      // go to dashboard where charts live
      window.location.href = "dashboard.html";
    }
  });

  // If we land on dashboard, auto-use last search
  if (window.location.pathname.endsWith("dashboard.html")) {
    const stored = localStorage.getItem("last_search_symbol");
    if (stored) {
      const symbolInput = document.getElementById("symbol");
      if (symbolInput) {
        symbolInput.value = stored;
        // optionally auto-load history
        loadHistory();
      }
      localStorage.removeItem("last_search_symbol");
    }
  }
});
