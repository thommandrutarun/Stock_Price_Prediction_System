const API_BASE = "http://localhost:5000/api";
let chart = null;
let currentChartType = 'candlestick';
let chartSeries = []; // Store data for toggling
let currentSymbol = "";

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

      // Home Page Hero Buttons Logic
      const heroGuest = document.getElementById("hero-guest-btns");
      const heroUser = document.getElementById("hero-user-btns");
      if (heroGuest && heroUser) {
        heroGuest.style.display = "none";
        heroUser.style.display = "block";
      }

    } else {
      navGuest.style.display = "flex";
      navUser.style.display = "none";

      // Home Page Hero Buttons Logic
      const heroGuest = document.getElementById("hero-guest-btns");
      const heroUser = document.getElementById("hero-user-btns");
      if (heroGuest && heroUser) {
        heroGuest.style.display = "block"; // or flex? usually block is fine for div
        heroUser.style.display = "none";
      }
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
  window.location.href = "index.html";
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
    } else {
      showPopup(data.message || "Registration failed");
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
      if (res.status === 401) {
        logout();
        return;
      }
      const err = await res.json();
      throw new Error(err.message || "Failed to load history");
    }

    const json = await res.json();
    const data = json.prices; // Extract the array

    console.log("DEBUG: Loaded history for:", symbol);
    console.log("DEBUG: Data length:", data.length);
    if (data.length > 0) {
      console.log("DEBUG: Last price object:", data[data.length - 1]);
      console.log("DEBUG: Last close:", data[data.length - 1].close);
    }

    chartSeries = data; // Store for toggling
    currentSymbol = symbol;
    renderChart(data, symbol);

    if (msg) msg.textContent = "";

  } catch (e) {
    console.error(e);
    if (msg) {
      msg.textContent = e.message;
      msg.className = "message error";
    }
  }
}

function renderChart(data, symbol) {
  // Determine currency based on symbol suffix
  const isIndian = symbol.endsWith(".NS") || symbol.endsWith(".BO");
  const currencySymbol = isIndian ? "₹" : "$";
  const currencyCode = isIndian ? "INR" : "USD";

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
      background: '#0f172a', // Solid dark background for professional export (matches Slate-900)
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: true,
        export: {
          csv: {
            filename: `${symbol}_Stock_History`,
            columnDelimiter: ',',
            headerCategory: 'Date',
            headerValue: 'Price',
          },
          svg: {
            filename: `${symbol}_Stock_Chart`,
          },
          png: {
            filename: `${symbol}_Stock_Chart`,
          }
        }
      }
    },
    title: {
      text: `${symbol} Price History`,
      align: 'left',
      margin: 20,
      style: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#f8fafc'
      }
    },
    subtitle: {
      text: 'Source: Stock Prediction System',
      align: 'left',
      margin: 10,
      style: {
        fontSize: '12px',
        color: '#94a3b8'
      }
    },
    theme: { mode: 'dark' },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      type: 'datetime',
      tooltip: { enabled: true },
      axisBorder: { show: true, color: '#475569' },
      axisTicks: { show: true, color: '#475569' },
      labels: {
        style: { colors: '#cbd5e1', fontSize: '11px' },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      },
      title: {
        text: 'Date',
        style: { color: '#94a3b8', fontSize: '13px', fontWeight: 600 }
      }
    },
    yaxis: {
      tooltip: { enabled: true },
      axisBorder: { show: true, color: '#475569' },
      axisTicks: { show: true, color: '#475569' },
      labels: {
        style: { colors: '#cbd5e1', fontSize: '11px' },
        formatter: (val) => currencySymbol + val.toFixed(2)
      },
      title: {
        text: `Price (${currencyCode})`,
        style: { color: '#94a3b8', fontSize: '13px', fontWeight: 600 }
      }
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#10b981', downward: '#ef4444' },
        wick: { useFillColor: true }
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
    renderChart(chartSeries, currentSymbol);
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

    if (!res.ok) {
      if (res.status === 401) { logout(); return; }
      throw new Error("Prediction API failed");
    }

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

        // Determine currency based on symbol suffix
        const isIndian = symbol.endsWith(".NS") || symbol.endsWith(".BO");
        const currencySymbol = isIndian ? "₹" : "$";

        li.innerHTML = `
               <span class="pred-date">${dateStr}</span>
               <span class="pred-price">${currencySymbol}${p.predicted_close.toFixed(2)}</span>
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
      if (res.status === 401) { logout(); return; }
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">${data.message || "Failed to load"}</td></tr>`;
      return;
    }

    // Update Summary
    if (totalEl) totalEl.textContent = data.total_value.toFixed(2);

    // Update Total Invested
    const investedEl = document.getElementById("pf-invested");
    if (investedEl && data.total_invested !== undefined) {
      investedEl.textContent = data.total_invested.toFixed(2);
    }

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
      const qty = Number(p.quantity);
      const avg = Number(p.avg_price);
      const latest = Number(p.latest_price);

      // New fields from backend
      const plValue = Number(p.profit_loss);
      const chgPct = Number(p.change_pct);

      const currentValue = (latest * qty).toFixed(2);
      const pl = plValue.toFixed(2);
      const pct = chgPct.toFixed(2) + "%";

      const plClass = plValue >= 0 ? "price-up" : "price-down";
      const sign = plValue >= 0 ? "+" : "";

      // Determine currency based on symbol suffix
      const isIndian = p.symbol.endsWith(".NS") || p.symbol.endsWith(".BO");
      const currencySymbol = isIndian ? "₹" : "$";

      tr.innerHTML = `
        <td>
          <a href="dashboard.html?symbol=${p.symbol}" 
             style="color:var(--primary); text-decoration:none; font-weight:700; transition:color 0.2s;"
             onmouseover="this.style.color='#fff'" 
             onmouseout="this.style.color='var(--primary)'">
            ${p.symbol}
          </a>
        </td>
        <td>${qty}</td>
        <td>${currencySymbol}${avg.toFixed(2)}</td>
        <td>${currencySymbol}${latest.toFixed(2)}</td>
        <td style="color:#aaa;">${p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : '-'}</td>
        <td style="font-weight:600;">${currencySymbol}${currentValue}</td>
        <td class="${plClass}">${sign}${currencySymbol}${pl}</td>
        <td class="${plClass}">${sign}${pct}</td>
      `;

      tableBody.appendChild(tr);
    });

  } catch (e) {
    console.error(e);
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Network Error</td></tr>';
  }
}

function initPortfolioUI() {
  const addBtn = document.getElementById("add-pos-btn");
  const modal = document.getElementById("add-pos-modal");
  const cancelBtn = document.getElementById("cancel-pos-btn");
  const submitBtn = document.getElementById("submit-pos-btn");

  if (!addBtn || !modal) return;

  function closeMod() { modal.style.display = "none"; }

  addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", closeMod);

  submitBtn.addEventListener("click", async () => {
    const sym = document.getElementById("add-symbol").value.trim();
    const qty = document.getElementById("add-qty").value;
    const price = document.getElementById("add-price").value;
    const pDate = document.getElementById("add-date").value; // YYYY-MM-DD

    if (!sym || !qty || !price || !pDate) {
      alert("Please fill all fields (Symbol, Qty, Price, Date)");
      return;
    }

    await addPortfolioPosition(sym, qty, price, pDate);
    closeMod();
    // Clear inputs
    document.getElementById("add-symbol").value = "";
    document.getElementById("add-qty").value = "";
    document.getElementById("add-price").value = "";
    document.getElementById("add-date").value = "";
  });
}

async function addPortfolioPosition(symbol, quantity, avg_price, purchase_date) {
  const token = requireAuth();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/reports/portfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ symbol, quantity, avg_price, purchase_date })
    });

    const data = await res.json();
    if (res.ok) {
      showPopup("Added successfully!");
      loadUserPortfolio(); // Refresh table
    } else {
      showPopup(data.message || "Failed to add position");
    }
  } catch (e) {
    console.error(e);
    showPopup("Network Error");
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
        // Determine currency based on symbol suffix
        const isIndian = symbol.endsWith(".NS") || symbol.endsWith(".BO");
        const currencySymbol = isIndian ? "₹" : "$";
        priceDiv.textContent = `${currencySymbol}${latest.close.toFixed(2)}`;
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
    const urlParams = new URLSearchParams(window.location.search);
    const urlSymbol = urlParams.get('symbol');
    const stored = localStorage.getItem("last_search_symbol");
    const symbolInput = document.getElementById("symbol");

    if (symbolInput) {
      if (urlSymbol) {
        symbolInput.value = urlSymbol;
        if (localStorage.getItem("token")) loadHistory();
      } else if (stored) {
        symbolInput.value = stored;
        localStorage.removeItem("last_search_symbol");
        if (localStorage.getItem("token")) loadHistory();
      }
    }
  }

  // Auto Load Portfolio
  loadUserPortfolio();
  initPortfolioUI();

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

      let actionHtml = '';
      if (u.role === 'admin' || u.email === '40tarun02@gmail.com') {
        actionHtml = '<span style="color:#64748b; font-size:0.8rem;">Locked / Admin</span>';
      } else {
        actionHtml = `
           <button onclick="promoteUser(${u.id}, '${u.email}')" style="background:transparent; border:none; cursor:pointer; margin-right:8px;" title="Promote to Admin">⬆️</button>
           <button onclick="confirmDeleteUser(${u.id}, '${u.email}')" style="background:transparent; border:none; cursor:pointer; color:#ef4444;" title="Remove User">🗑️</button>
         `;
      }

      tr.innerHTML = `
        <td>#${u.id}</td>
        <td style="font-weight:600; color:#fff;">${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td>${u.dob || '-'}</td>
        <td>${u.profession || '-'}</td>
        <td>${roleBadge}</td>
        <td>${actionHtml}</td>
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
// Auto-run if on page (backup for onload)
if (window.location.pathname.endsWith("admin.html")) {
  loadAdminUsers();
}

/* ---------- CONTACT FORM ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type='submit']");
    const originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        showPopup("Message sent successfully!", () => {
          form.reset();
        });
      } else {
        showPopup(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      showPopup("Network error. Please try again.");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// Initialize on load
if (document.getElementById("contact-form")) {
  initContactForm();
}


/* ---------- ADMIN MESSAGES ---------- */
async function loadAdminMessages() {
  const tableBody = document.getElementById("messages-table-body");
  const statusMsg = document.getElementById("admin-msgs-status");
  if (!tableBody) return;

  const token = requireAuth();
  if (!token) return;

  if (statusMsg) statusMsg.textContent = "Loading messages...";
  tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      if (statusMsg) {
        statusMsg.textContent = data.message || "Failed to load messages";
        statusMsg.className = "message error";
      }
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Error loading messages</td></tr>';
      return;
    }

    if (statusMsg) statusMsg.textContent = "";
    tableBody.innerHTML = "";

    if (!data.messages || data.messages.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No messages found.</td></tr>';
      return;
    }

    data.messages.forEach(msg => {
      const tr = document.createElement("tr");
      const dateStr = new Date(msg.timestamp).toLocaleString();

      // Truncate message for table view
      const shortMsg = msg.message.length > 50 ? msg.message.substring(0, 50) + "..." : msg.message;

      // Encode message data for safe passing (or just pass ID and look up, but ID lookup needs full list stored.
      // Easiest is to attach data to the row or just pass ID and fetch/find.
      // Let's store messages in a global variable for easy access or just pass strings carefully.
      // Improve: Just pass ID and find in `allMessages` array?
      // Let's attach to window or just encoded strings.
      // Better: store in a map.
      // For simplicity in this script, let's just make `viewMessage` take all params or index.

      tr.innerHTML = `
                <td>#${msg.id}</td>
                <td style="font-size:0.85rem; color:#aaa;">${dateStr}</td>
                <td style="font-weight:600; color:#fff;">${msg.name}</td>
                <td>${msg.email}</td>
                <td>${msg.subject || '-'}</td>
                <td style="color:#ccc;">${shortMsg}</td>
                <td>
                    <button onclick="viewMessage('${msg.id}', '${escapeHtml(msg.name)}', '${escapeHtml(msg.email)}', '${escapeHtml(msg.subject || "")}', '${escapeHtml(msg.message)}', '${dateStr}')" 
                            class="action-btn view-btn" title="View Details">
                        👁️
                    </button>
                </td>
            `;
      tableBody.appendChild(tr);
    });

  } catch (e) {
    console.error("Error loading messages:", e);
    if (statusMsg) {
      statusMsg.textContent = "Error: " + e.message;
      statusMsg.className = "message error";
    }
  }
}


// Helper to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---------- MESSAGE MODAL ---------- */
function viewMessage(id, name, email, subject, message, date) {
  document.getElementById("msg-modal-from").textContent = name;
  document.getElementById("msg-modal-email").textContent = email;
  document.getElementById("msg-modal-date").textContent = date;
  document.getElementById("msg-modal-subject").textContent = subject || "(No Subject)";
  document.getElementById("msg-modal-body").textContent = message;

  // Setup Reply Button
  const replyBtn = document.getElementById("msg-modal-reply-btn");
  if (replyBtn) {
    replyBtn.href = `mailto:${email}?subject=Re: ${escapeHtml(subject || 'Inquiry')}`;
  }

  const modal = document.getElementById("message-modal");
  if (modal) {
    modal.style.display = "flex";
    // Trigger reflow
    void modal.offsetWidth;
    modal.classList.add("show");
  }
}

function closeMessageModal() {
  const modal = document.getElementById("message-modal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }
}

// Close modal on outside click
window.onclick = function (event) {
  const modal = document.getElementById("message-modal");
  if (event.target == modal) {
    closeMessageModal();
  }
}

// Global exports
window.viewMessage = viewMessage;
window.closeMessageModal = closeMessageModal;
window.escapeHtml = escapeHtml;

/* ---------- MULTI-ADMIN & LOGS ---------- */
async function loadAdmins() {
  const tableBody = document.getElementById("admins-table-body");
  if (!tableBody) return;

  const token = requireAuth();
  if (!token) return;

  tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to load users");
    const data = await res.json();

    // Filter for admins
    const admins = data.users.filter(u => u.role === 'admin');

    tableBody.innerHTML = "";
    if (admins.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No admins found.</td></tr>';
      return;
    }

    admins.forEach(u => {
      const tr = document.createElement("tr");
      // Super Admin check
      const isSuper = u.email === '40tarun02@gmail.com';

      let actionBtn = "";
      if (isSuper) {
        actionBtn = '<span style="color:#64748b; font-size:0.8rem;">Super Admin</span>';
      } else {
        // Add Revoke button
        actionBtn = `<button onclick="revokeAdmin(${u.id}, '${u.email}')" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;" title="Revoke Admin">Revoke</button>`;
      }

      tr.innerHTML = `
        <td>#${u.id}</td>
        <td style="font-weight:600; color:#fff;">${u.name}</td>
        <td>${u.email}</td>
        <td><span style="background:rgba(99,102,241,0.2); color:#818cf8; padding:2px 8px; border-radius:12px; font-size:0.75rem; border:1px solid rgba(99,102,241,0.3);">Admin</span></td>
        <td>${actionBtn}</td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading admins</td></tr>';
  }
}

async function loadAdminLogs() {
  const tableBody = document.getElementById("logs-table-body");
  if (!tableBody) return;

  const token = requireAuth();
  if (!token) return;

  tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading logs...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/admin/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 403) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Access Denied: Super Admin only.</td></tr>';
      return;
    }

    if (!res.ok) throw new Error("Failed to load logs");

    const data = await res.json();
    const logs = data.logs;

    tableBody.innerHTML = "";
    if (!logs || logs.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No logs found.</td></tr>';
      return;
    }

    logs.forEach(l => {
      const tr = document.createElement("tr");
      const dateStr = new Date(l.timestamp).toLocaleString();
      tr.innerHTML = `
        <td>${l.id}</td>
        <td style="color:#aaa; font-size:0.85rem;">${dateStr}</td>
        <td style="font-weight:600;">${l.admin_email}</td>
        <td style="color:#10b981;">${l.action}</td>
        <td>${l.target || '-'}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (e) {
    console.error(e);
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading logs</td></tr>';
  }
}

async function promoteUser(userId, email) {
  if (!confirm(`Promote ${email} to Admin?`)) return;

  const token = requireAuth();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/admin/promote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) {
      loadAdminUsers();
      loadAdmins(); // in case open
    }
  } catch (e) {
    console.error(e);
    alert("Network Error");
  }
}

async function revokeAdmin(userId, email) {
  if (!confirm(`Revoke Admin privileges from ${email}?`)) return;

  const token = requireAuth();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/admin/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) {
      loadAdmins();
    }
  } catch (e) {
    console.error(e);
    alert("Network Error");
  }
}

// Global Exports
window.revokeAdmin = revokeAdmin;
window.promoteUser = promoteUser;

/* ---------- ADMIN BUTTONS LOGIC ---------- */
async function confirmDeleteUser(userId, userEmail) {
  if (!confirm(`Are you sure you want to remove user ${userEmail}? This action cannot be undone.`)) {
    return;
  }

  // Fix: Use correct auth function
  const token = requireAuth();
  if (!token) return;

  try {
    // API endpoint call
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      alert("User removed successfully.");
      loadAdminUsers(); // Refresh table
    } else {
      alert(data.message || "Failed to remove user");
    }
  } catch (e) {
    console.error(e);
    alert("Network error");
  }
}
window.confirmDeleteUser = confirmDeleteUser;

function initAdminButtons() {
  // Show Logs tab if Super Admin
  const userEmail = localStorage.getItem("user_email");
  if (userEmail === '40tarun02@gmail.com') {
    const logsBtn = document.getElementById("nav-logs-btn");
    if (logsBtn) logsBtn.style.display = "inline-block";
  }

  const removeUserBtn = document.getElementById("remove-user-btn");
  if (removeUserBtn) {
    removeUserBtn.addEventListener("click", () => {
      const id = prompt("Enter User ID to remove (or use the trash icons in the table):");
      if (id) {
        confirmDeleteUser(id, "ID: " + id);
      }
    });
  }

  const exportBtn = document.querySelector(".toolbar-actions button:nth-child(3)");
  if (exportBtn && exportBtn.textContent.includes("Export")) {
    exportBtn.addEventListener("click", exportUsersToCSV);
  }

  const allBtn = document.querySelector(".toolbar-actions button:nth-child(1)");
  const adminBtn = document.querySelector(".toolbar-actions button:nth-child(2)");

  if (allBtn && adminBtn) {
    allBtn.addEventListener("click", () => {
      filterByRole('all');
      allBtn.classList.add("filter-active");
      adminBtn.classList.remove("filter-active");
    });

    adminBtn.addEventListener("click", () => {
      filterByRole('admin');
      adminBtn.classList.add("filter-active");
      allBtn.classList.remove("filter-active");
    });
  }
}

function filterByRole(role) {
  const tbody = document.getElementById("users-table-body");
  if (!tbody) return;
  const rows = tbody.querySelectorAll("tr");

  rows.forEach(row => {
    // Role is in last column (index 6)
    const roleCell = row.cells[6];
    if (!roleCell) return;
    const roleText = roleCell.textContent.toLowerCase();

    if (role === 'all') {
      row.style.display = "";
    } else if (role === 'admin') {
      row.style.display = roleText.includes("admin") ? "" : "none";
    }
  });
}

function exportUsersToCSV() {
  const tbody = document.getElementById("users-table-body");
  if (!tbody) return;

  let csv = [];
  // Header
  csv.push(["ID", "Name", "Email", "Phone", "DOB", "Profession", "Role"].join(","));

  const rows = tbody.querySelectorAll("tr");
  rows.forEach(row => {
    if (row.style.display === "none") return; // Export only visible? Or all? Usually visible feels more intuitive if filtered. Let's do visible.

    const cols = row.querySelectorAll("td");
    let rowData = [];
    cols.forEach(col => rowData.push('"' + col.innerText + '"'));
    csv.push(rowData.join(","));
  });

  const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
  const downloadLink = document.createElement("a");
  downloadLink.download = "users_export.csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Call initButtons when on admin page
if (window.location.pathname.endsWith("admin.html")) {
  // We already have loadAdminUsers running.
  // We can init buttons immediately as they are static in HTML
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminButtons);
  } else {
    initAdminButtons();
  }
}


