const API_BASE = "http://localhost:5000/api";
let chart = null;
let currentChartType = 'candlestick';
let chartSeries = []; // Store data for toggling

/* ---------- POPUP UTILS ---------- */
function showPopup(message, onClose) {
  let overlay = document.getElementById("popup-overlay");
  let box = document.getElementById("popup-box");
  let text = document.getElementById("popup-text");
  let btn = document.getElementById("popup-ok");

  if (!overlay || !box || !text || !btn) {
    // If modal elements missing, fallback
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

/* ---------- NAVBAR & AUTH STATE ---------- */
function updateNavbar() {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("user_email") || "User";

  const navGuest = document.getElementById("nav-guest");
  const navUser = document.getElementById("nav-user");
  const nameDisplay = document.getElementById("user-name-display");
  const logoutBtn = document.getElementById("logout-btn-nav");

  if (navGuest && navUser) {
    if (token) {
      navGuest.style.display = "none";
      navUser.style.display = "flex";
      if (nameDisplay) nameDisplay.textContent = `login:- ${userEmail}`;
      if (logoutBtn) {
        // Remove old listeners to avoid duplicates if called multiple times (though mostly once)
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener("click", logout);
      }
    } else {
      navGuest.style.display = "flex";
      navUser.style.display = "none";
    }
  }
}

function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return null;
  }
  return token;
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ---------- LOGIN ---------- */
async function login() {
  const emailVal = document.getElementById("email").value.trim();
  const passVal = document.getElementById("password").value;

  const msg = document.getElementById("msg");
  if (msg) {
    msg.textContent = "";
    msg.className = "message";
  }

  if (!emailVal || !passVal) {
    if (msg) {
      msg.textContent = "Please enter email and password";
      msg.className = "message error";
    }
    return;
  }

  const body = { email: emailVal, password: passVal };

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_email", data.user.email);
      localStorage.setItem("user_name", data.user.name);
      if (data.user.role) {
        localStorage.setItem("user_role", data.user.role);
      }

      const target = data.user.role === "admin" ? "admin.html" : "index.html";

      showPopup("Login successful. Redirecting...", () => {
        window.location.href = target;
      });

      // Backup redirect
      setTimeout(() => { window.location.href = target; }, 1000);

    } else if (msg) {
      msg.textContent = data.message || "Login failed";
      msg.className = "message error";
    }
  } catch (e) {
    console.error(e);
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
  const phone = document.getElementById("reg-phone") ? document.getElementById("reg-phone").value.trim() : "";
  const dob = document.getElementById("reg-dob") ? document.getElementById("reg-dob").value : "";
  const profession = document.getElementById("reg-profession") ? document.getElementById("reg-profession").value : "";
  const password = document.getElementById("reg-password") ? document.getElementById("reg-password").value : "";

  const msg = document.getElementById("reg-msg");
  if (msg) {
    msg.textContent = "";
    msg.className = "message";
  }

  if (!name || !email || !password) {
    if (msg) {
      msg.textContent = "Please fill in required fields.";
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
      showPopup("Registration successful! Please log in.", () => {
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

/* ---------- DASHBOARD ---------- */
async function loadHistory() {
  const symbolInput = document.getElementById("symbol");
  if (!symbolInput) return;

  const symbol = symbolInput.value.trim().toUpperCase();
  if (!symbol) {
    alert("Please enter a stock symbol");
    return;
  }

  const token = requireAuth();
  if (!token) return;

  // Find active period
  const activeBtn = document.querySelector(".period-btn.active");
  const period = activeBtn ? activeBtn.getAttribute("data-period") : "1mo";

  const msg = document.getElementById("dash-msg");
  if (msg) msg.textContent = "Loading chart...";

  try {
    const res = await fetch(`${API_BASE}/stocks/${symbol}/history?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to load history");
    }

    const json = await res.json();
    const data = json.prices; // Extract the array
    chartSeries = data; // Store for toggling
    renderChart(data);

    if (msg) msg.textContent = "";

  } catch (e) {
    console.error(e);
    if (msg) {
      msg.textContent = e.message;
      msg.className = "message error";
    }
  }
}

function renderChart(data) {
  const options = {
    series: [{
      name: 'Price',
      data: data.map(d => ({
        x: new Date(d.date),
        y: currentChartType === 'candlestick'
          ? [d.open, d.high, d.low, d.close]
          : d.close
      }))
    }],
    chart: {
      type: currentChartType,
      height: 400,
      background: 'transparent',
      toolbar: { show: true }
    },
    theme: { mode: 'dark' },
    xaxis: {
      type: 'datetime',
      tooltip: { enabled: true }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { formatter: (val) => val.toFixed(2) }
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#10b981', downward: '#ef4444' }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    }
  };

  const chartEl = document.querySelector("#stockChart");
  if (!chartEl) return;
  chartEl.innerHTML = "";

  chart = new ApexCharts(chartEl, options);
  chart.render();
}

function setChartType(type) {
  currentChartType = type;

  // Update buttons
  document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById(type === 'candlestick' ? 'btn-candle' : 'btn-line');
  if (btn) btn.classList.add("active");

  // Re-render if data exists
  if (chartSeries && chartSeries.length > 0) {
    renderChart(chartSeries);
  }
}

function setupPeriodButtons() {
  const buttons = document.querySelectorAll(".period-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadHistory();
    });
  });
}

async function predict() {
  const symbolInput = document.getElementById("symbol");
  if (!symbolInput) return;
  const symbol = symbolInput.value.trim().toUpperCase();

  if (!symbol) { alert("Enter symbol first"); return; }

  const token = requireAuth();
  if (!token) return;

  const list = document.getElementById("predictions");
  const msg = document.getElementById("dash-msg");
  if (!list) return;

  list.innerHTML = "<li>Loading predictions...</li>";

  try {
    const res = await fetch(`${API_BASE}/stocks/${symbol}/predict`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Prediction API failed");

    const data = await res.json();
    list.innerHTML = "";

    if (data.predictions) {
      data.predictions.forEach((p, idx) => {
        const li = document.createElement("li");

        // Trend logic
        let trendClass = "";
        if (idx > 0) {
          if (data.predictions[idx - 1].predicted_close < p.predicted_close) trendClass = "price-up";
          else if (data.predictions[idx - 1].predicted_close > p.predicted_close) trendClass = "price-down";
        }
        if (trendClass) li.classList.add(trendClass);

        const d = new Date(p.date);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        li.innerHTML = `
               <span class="pred-date">${dateStr}</span>
               <span class="pred-price">${p.predicted_close.toFixed(2)}</span>
             `;
        list.appendChild(li);
      });
    }
  } catch (e) {
    list.innerHTML = "<li>Error loading predictions</li>";
  }
}

/* ---------- REPORT PAGE: PORTFOLIO ---------- */
async function loadUserPortfolio() {
  const tableBody = document.getElementById("positions-table-body");
  if (!tableBody) return; // Not on report page, exit immediately without checking auth

  const token = requireAuth();
  if (!token) return;

  const msg = document.getElementById("prof-msg");
  const totalEl = document.getElementById("pf-total");
  const countEl = document.getElementById("pf-count");

  if (!totalEl) return;


  tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading positions...</td></tr>';
  if (msg) msg.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/reports/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">${data.message || "Failed to load"}</td></tr>`;
      return;
    }

    // Update Summary
    totalEl.textContent = data.total_value.toFixed(2);
    if (countEl) countEl.textContent = data.positions ? data.positions.length : 0;

    // Clear loading
    tableBody.innerHTML = "";

    if (!data.positions || data.positions.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No positions found.</td></tr>';
      return;
    }

    data.positions.forEach((p) => {
      const tr = document.createElement("tr");

      // Calculations
      const currentValue = (p.latest_price * p.quantity).toFixed(2);
      const pl = p.change_abs.toFixed(2);
      const pct = p.change_pct.toFixed(2) + "%";

      const plClass = p.change_abs >= 0 ? "price-up" : "price-down";
      const sign = p.change_abs >= 0 ? "+" : "";

      tr.innerHTML = `
        <td>${p.symbol}</td>
        <td>${p.quantity}</td>
        <td>₹${p.avg_price.toFixed(2)}</td>
        <td>₹${p.latest_price.toFixed(2)}</td>
        <td style="font-weight:600;">₹${currentValue}</td>
        <td class="${plClass}">${sign}₹${pl}</td>
        <td class="${plClass}">${sign}${pct}</td>
      `;

      tableBody.appendChild(tr);
    });

  } catch (e) {
    console.error(e);
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Network Error</td></tr>';
  }
}

/* ---------- WATCHLIST LOGIC ---------- */
const WATCHLIST_KEY = "user_watchlist_symbols";

function initWatchlist() {
  const addBtn = document.getElementById("add-watchlist-btn");
  const input = document.getElementById("watchlist-input");

  if (!addBtn || !input) return;

  renderWatchlist();

  addBtn.addEventListener("click", () => {
    const symbol = input.value.trim().toUpperCase();
    if (!symbol) return;
    addToWatchlist(symbol);
    input.value = "";
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addBtn.click();
  });
}

function getWatchlist() {
  const stored = localStorage.getItem(WATCHLIST_KEY);
  return stored ? JSON.parse(stored) : ["RELIANCE.NS", "TCS.NS", "INFY.NS"];
}

function addToWatchlist(symbol) {
  let list = getWatchlist();
  if (list.includes(symbol)) {
    showPopup(`Symbol ${symbol} is already in the watchlist.`);
    return;
  }
  list.push(symbol);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  renderWatchlist();
}

function removeFromWatchlist(symbol) {
  let list = getWatchlist();
  list = list.filter(s => s !== symbol);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  renderWatchlist();
}

async function renderWatchlist() {
  const listEl = document.getElementById("watchlist-list");
  if (!listEl) return;

  const symbols = getWatchlist();
  listEl.innerHTML = "";

  if (symbols.length === 0) {
    listEl.innerHTML = `<li style="color:var(--text-muted); font-size:0.8rem; text-align:center;">No symbols watched.</li>`;
    return;
  }

  symbols.forEach(sym => {
    const li = document.createElement("li");
    li.id = `wl-item-${sym}`;
    li.style.cssText = "background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:background 0.2s;";
    li.innerHTML = `
      <div class="wl-content" style="flex:1;">
        <div style="font-weight:600; font-size:0.9rem;">${sym}</div>
        <div class="wl-price" style="font-size:0.8rem; color:var(--text-muted);">Loading...</div>
      </div>
      <button class="wl-remove" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:1.1rem;">&times;</button>
    `;

    // Wire events
    li.querySelector(".wl-content").addEventListener("click", () => loadFromWatchlist(sym));
    li.querySelector(".wl-remove").addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromWatchlist(sym);
    });

    // Hover effects
    li.onmouseover = () => li.style.background = "rgba(255,255,255,0.1)";
    li.onmouseout = () => li.style.background = "rgba(255,255,255,0.05)";

    listEl.appendChild(li);

    fetchWatchlistPrice(sym);
  });
}

function loadFromWatchlist(symbol) {
  const input = document.getElementById("symbol");
  if (input) {
    input.value = symbol;
    loadHistory();
  } else {
    // If not on dashboard, redirect
    localStorage.setItem("last_search_symbol", symbol);
    window.location.href = "dashboard.html";
  }
}

async function fetchWatchlistPrice(symbol) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/stocks/${symbol}/history?period=1d`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed");

    const json = await res.json();
    const data = json.prices;
    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      const priceDiv = document.querySelector(`#wl-item-${symbol} .wl-price`);
      if (priceDiv) {
        priceDiv.textContent = `₹${latest.close.toFixed(2)}`;
        priceDiv.style.color = "#fff";
      }
    }
  } catch (e) {
    const priceDiv = document.querySelector(`#wl-item-${symbol} .wl-price`);
    if (priceDiv) priceDiv.textContent = "-";
  }
}

/* ---------- GLOBAL INITIALIZATION ---------- */
document.addEventListener("DOMContentLoaded", () => {

  updateNavbar();
  initWatchlist();

  // Wiring Buttons
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", login);

  const registerBtn = document.getElementById("register-btn");
  if (registerBtn) registerBtn.addEventListener("click", registerUser);

  const historyBtn = document.getElementById("history-btn");
  if (historyBtn) historyBtn.addEventListener("click", loadHistory);

  const predictBtn = document.getElementById("predict-btn");
  if (predictBtn) predictBtn.addEventListener("click", predict);

  // Dashboard specific
  setupPeriodButtons();

  // Auto Load Dashboard Search
  if (window.location.pathname.endsWith("dashboard.html")) {
    const stored = localStorage.getItem("last_search_symbol");
    const symbolInput = document.getElementById("symbol");
    if (stored && symbolInput) {
      symbolInput.value = stored;
      localStorage.removeItem("last_search_symbol");
      if (localStorage.getItem("token")) loadHistory();
    }
  }

  // Auto Load Portfolio
  loadUserPortfolio();

  // Global Search Bar
  const globalSearch = document.getElementById("global-search");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = globalSearch.value.trim().toUpperCase();
        if (val) {
          localStorage.setItem("last_search_symbol", val);
          window.location.href = "dashboard.html";
        }
      }
    });
  }
});
/* ---------- ADMIN DASHBOARD ---------- */
async function loadAdminUsers() {
  const tableBody = document.getElementById("users-table-body");
  if (!tableBody) return; // Not on admin page

  const token = requireAuth();
  if (!token) return;

  const msg = document.getElementById("admin-msg");
  if (msg) msg.textContent = "Loading users...";

  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      if (msg) {
        msg.textContent = data.message || "Failed to load users";
        msg.className = "message error";
      }
      return;
    }

    if (msg) msg.textContent = "";

    // Clear loading
    tableBody.innerHTML = "";

    if (!data.users || data.users.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No users found.</td></tr>';
      return;
    }

    data.users.forEach((u) => {
      const tr = document.createElement("tr");

      // Role badge style
      const roleBadge = u.role === 'admin'
        ? '<span style="background:rgba(99,102,241,0.2); color:#818cf8; padding:2px 8px; border-radius:12px; font-size:0.75rem; border:1px solid rgba(99,102,241,0.3);">Admin</span>'
        : '<span style="background:rgba(148,163,184,0.2); color:#94a3b8; padding:2px 8px; border-radius:12px; font-size:0.75rem;">User</span>';

      tr.innerHTML = `
        <td>#${u.id}</td>
        <td style="font-weight:600; color:#fff;">${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td>${u.dob || '-'}</td>
        <td>${u.profession || '-'}</td>
        <td>${roleBadge}</td>
      `;
      tableBody.appendChild(tr);
    });

    // Update stats if elements exist
    const totalBadge = document.getElementById("stat-total-users");
    if (totalBadge) totalBadge.textContent = data.users.length;

  } catch (e) {
    console.error(e);
    if (msg) {
      msg.textContent = "Network Error";
      msg.className = "message error";
    }
  }
}

// Auto-run if on page (backup for onload)
if (window.location.pathname.endsWith("admin.html")) {
  loadAdminUsers();
}
