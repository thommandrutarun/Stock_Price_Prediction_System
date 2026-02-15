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
  btn.addEventListener("click", closeHandler);
}

/* ---------- MOBILE MENU ---------- */
function toggleMobileMenu() {
  const mobileMenu = document.querySelector(".ds-navbar-mobile");
  if (mobileMenu) {
    mobileMenu.classList.toggle("show");
  }
}

// Initialize Mobile Menu
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".ds-navbar-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleMobileMenu);
  }
});

/* ---------- NAVBAR & AUTH STATE ---------- */
function updateNavbar() {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("user_email") || "User";

  const navGuest = document.getElementById("nav-guest");
  const navUser = document.getElementById("nav-user");
  const navGuestMobile = document.getElementById("nav-guest-mobile");
  const navUserMobile = document.getElementById("nav-user-mobile");

  const nameDisplay = document.getElementById("user-name-display");
  const nameDisplayMobile = document.getElementById("user-name-display-mobile");

  const logoutBtn = document.getElementById("logout-btn-nav");
  const logoutBtnMobile = document.getElementById("logout-btn-nav-mobile");

  if (navGuest && navUser) {
    if (token) {
      navGuest.style.display = "none";
      navUser.style.display = "flex";

      if (navGuestMobile) navGuestMobile.style.display = "none";
      if (navUserMobile) navUserMobile.style.display = "flex";

      if (nameDisplay) nameDisplay.textContent = `login:- ${userEmail}`;
      if (nameDisplayMobile) nameDisplayMobile.textContent = `login:- ${userEmail}`;

      if (logoutBtn) {
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener("click", logout);
      }

      if (logoutBtnMobile) {
        const newBtnMobile = logoutBtnMobile.cloneNode(true);
        logoutBtnMobile.parentNode.replaceChild(newBtnMobile, logoutBtnMobile);
        newBtnMobile.addEventListener("click", logout);
      }

      // Admin Link Logic
      const role = localStorage.getItem("user_role");
      const adminLink = document.getElementById("nav-admin-link");
      const adminLinkMobile = document.getElementById("nav-admin-link-mobile");

      const dashboardLink = document.getElementById("nav-dashboard-link");
      const dashboardLinkMobile = document.getElementById("nav-dashboard-link-mobile");

      const portfolioLink = document.getElementById("nav-portfolio-link");
      const portfolioLinkMobile = document.getElementById("nav-portfolio-link-mobile");

      const tradeLink = document.getElementById("nav-trade-link");
      const tradeLinkMobile = document.getElementById("nav-trade-link-mobile");

      if (adminLink) adminLink.style.display = (role === 'admin') ? 'block' : 'none';
      if (adminLinkMobile) adminLinkMobile.style.display = (role === 'admin') ? 'block' : 'none';

      // Hide User Links for Admin
      const isUser = (role !== 'admin');
      if (dashboardLink) dashboardLink.style.display = isUser ? 'block' : 'none';
      if (dashboardLinkMobile) dashboardLinkMobile.style.display = isUser ? 'block' : 'none';

      if (portfolioLink) portfolioLink.style.display = isUser ? 'block' : 'none';
      if (portfolioLinkMobile) portfolioLinkMobile.style.display = isUser ? 'block' : 'none';

      if (tradeLink) tradeLink.style.display = isUser ? 'block' : 'none';
      if (tradeLinkMobile) tradeLinkMobile.style.display = isUser ? 'block' : 'none';


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

      if (navGuestMobile) navGuestMobile.style.display = "flex";
      if (navUserMobile) navUserMobile.style.display = "none";

      // Home Page Hero Buttons Logic
      const heroGuest = document.getElementById("hero-guest-btns");
      const heroUser = document.getElementById("hero-user-btns");
      if (heroGuest && heroUser) {
        heroGuest.style.display = "block";
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
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          xaxis: {
            labels: { show: false } // Hide labels on small screens if crowded
          }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250
          }
        }
      }
    ],
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
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Network Error</td></tr>';
  }
}

async function deletePortfolioPosition(symbol) {
  const token = localStorage.getItem("token");
  if (!token) return;

  if (!confirm(`Are you sure you want to DELETE your position in ${symbol} from the portfolio records? This validation is irreversible.`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/reports/portfolio`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ symbol })
    });

    const data = await res.json();

    if (res.ok) {
      showPopup(`Success! Deleted ${symbol} from portfolio.`);
      loadUserPortfolio(); // Reload table
    } else {
      showPopup(data.message || "Failed to delete position");
    }
  } catch (e) {
    console.error(e);
    showPopup("Network Error");
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
    document.getElementById("add-qty").value = "";
    document.getElementById("add-price").value = "";
    document.getElementById("add-date").value = "";
  });

  /* Delete Position Modal Logic */
  const delBtn = document.getElementById("del-pos-btn");
  const delModal = document.getElementById("del-pos-modal");
  const cancelDelBtn = document.getElementById("cancel-del-btn");
  const submitDelBtn = document.getElementById("submit-del-btn");
  const delSelect = document.getElementById("del-symbol-select");

  if (delBtn && delModal) {
    function closeDelMod() { delModal.style.display = "none"; }

    delBtn.addEventListener("click", async () => {
      // Populate dropdown
      delSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';
      delModal.style.display = "flex";

      const token = requireAuth();
      if (!token) return;

      try {
        // Re-use portfolio endpoint
        const res = await fetch(`${API_BASE}/reports/portfolio`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load");

        const data = await res.json();

        delSelect.innerHTML = '<option value="" disabled selected>Select a symbol</option>';

        if (data.positions && data.positions.length > 0) {
          data.positions.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.symbol;
            opt.textContent = `${p.symbol} (${p.quantity})`;
            delSelect.appendChild(opt);
          });
        } else {
          const opt = document.createElement("option");
          opt.value = "";
          opt.disabled = true;
          opt.textContent = "No positions found";
          delSelect.appendChild(opt);
        }

      } catch (e) {
        console.error(e);
        delSelect.innerHTML = '<option value="" disabled selected>Error loading symbols</option>';
      }
    });

    cancelDelBtn.addEventListener("click", closeDelMod);

    submitDelBtn.addEventListener("click", async () => {
      const sym = delSelect.value;
      if (!sym) {
        alert("Please select a symbol");
        return;
      }

      await deletePortfolioPosition(sym);
      closeDelMod();
      delSelect.value = "";
    });
  }
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
  if (typeof loadUserPortfolio === "function") loadUserPortfolio();
  if (typeof initPortfolioUI === "function") initPortfolioUI();

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

  /* ---------- VIRTUAL TRADING INIT ---------- */
  const tradeBtn = document.getElementById("trade-btn");
  if (tradeBtn) tradeBtn.addEventListener("click", openTradeModal);

  initWalletDisplay();
  initTradePage(); // New

}); // End of Global Initialization

/* ---------- VIRTUAL TRADING LOGIC (TRADE PAGE) ---------- */
let pageTradeMode = 'buy'; // 'buy' or 'sell'
let pageCurrentPrice = 0;

async function initTradePage() {
  const symbolInput = document.getElementById("trade-page-symbol");
  const fetchBtn = document.getElementById("fetch-price-btn");

  // Safety check: if we are not on trade.html, these IDs won't exist.
  if (!symbolInput || !fetchBtn) return;

  // Check URL params for auto-loading
  const urlParams = new URLSearchParams(window.location.search);
  const urlSymbol = urlParams.get('symbol');

  if (urlSymbol) {
    symbolInput.value = urlSymbol;
    await loadTradeSymbol(urlSymbol);
  }

  fetchBtn.addEventListener("click", () => {
    const val = symbolInput.value.trim().toUpperCase();
    if (val) loadTradeSymbol(val);
  });

  // Also allow Enter key
  symbolInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = symbolInput.value.trim().toUpperCase();
      if (val) loadTradeSymbol(val);
    }
  });
}

async function loadTradeSymbol(symbol) {
  const interfaceDiv = document.getElementById("trade-interface");
  const emptyState = document.getElementById("trade-empty-state");
  const priceDisplay = document.getElementById("page-price-display");
  const symbolDisplay = document.getElementById("page-symbol-display");

  if (!interfaceDiv) return;

  if (emptyState) emptyState.style.display = "none"; // Hide empty state
  interfaceDiv.style.display = "block"; // Show interface (was flex or block? using block is fine)

  symbolDisplay.textContent = symbol;
  priceDisplay.textContent = "Fetching...";
  priceDisplay.style.color = "#94a3b8";

  // 1. Get Price
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      priceDisplay.textContent = "Please login";
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Use 1d period to get latest close
    const res = await fetch(`${API_BASE}/stocks/${symbol}/history?period=1d`, { headers });

    if (res.status === 401) {
      priceDisplay.textContent = "Session expired";
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return;
    }

    if (!res.ok) {
      priceDisplay.textContent = "Error";
      return;
    }

    const json = await res.json();

    if (json.prices && json.prices.length > 0) {
      pageCurrentPrice = json.prices[json.prices.length - 1].close;
      priceDisplay.textContent = `Current Price: ${formatCurrency(pageCurrentPrice, symbol)}`;
      priceDisplay.style.color = "#fff"; // Was var(--trade-buy) in CSS but #fff is fine for contrast
    } else {
      priceDisplay.textContent = "Price unavailable";
      pageCurrentPrice = 0;
    }
  } catch (e) {
    console.error(e);
    priceDisplay.textContent = "Network Error";
  }

  // 2. Reset Quantity
  document.getElementById("page-quantity").value = 1;
  updatePageTradeTotal();

  // 3. Fetch Wallet/Holdings
  fetchPageWalletAndHoldings(symbol);
}

// Helper for currency formatting
function formatCurrency(val, symbol) {
  const isIn = symbol.endsWith(".NS") || symbol.endsWith(".BO");
  const sign = isIn ? "₹" : "$";
  return `${sign}${val.toFixed(2)}`;
}

function updatePageTradeTotal() {
  const qty = document.getElementById("page-quantity").value;
  const total = (qty * pageCurrentPrice).toFixed(2);
  // Use generic dollar sign or infer from symbol? Let's use generic for now or match loadTradeSymbol logic if we stored symbol
  document.getElementById("page-total").textContent = `${total}`;
}

function setPageTradeMode(mode) {
  pageTradeMode = mode;
  document.querySelectorAll(".trade-tab").forEach(t => t.classList.remove("active-buy", "active-sell"));

  const btn = document.getElementById("page-submit-btn");

  if (mode === 'buy') {
    document.getElementById("page-tab-buy").classList.add("active-buy");
    btn.textContent = "Place Buy Order";
    btn.className = "submit-order-btn btn-buy";
  } else {
    document.getElementById("page-tab-sell").classList.add("active-sell");
    btn.textContent = "Place Sell Order";
    btn.className = "submit-order-btn btn-sell";
  }
}

async function fetchPageWalletAndHoldings(symbol) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/reports/portfolio`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.wallet_balance !== undefined) {
      const formatted = `$${data.wallet_balance.toFixed(2)}`;
      const pc = document.getElementById("page-cash");
      if (pc) pc.textContent = formatted;

      const wb = document.getElementById("wallet-balance");
      if (wb) wb.textContent = formatted;

      localStorage.setItem("wallet_balance", data.wallet_balance);
    }

    const position = data.positions ? data.positions.find(p => p.symbol === symbol) : null;
    const ow = document.getElementById("page-owned");
    if (ow) ow.textContent = position ? position.quantity : 0;

  } catch (e) {
    console.error("Error fetching trade info", e);
  }
}

async function executePageTrade() {
  const qtyInput = document.getElementById("page-quantity");
  const qty = qtyInput ? qtyInput.value : 0;
  const symbol = document.getElementById("page-symbol-display").textContent;
  const token = localStorage.getItem("token");
  const msg = document.getElementById("page-trade-msg");
  const btn = document.getElementById("page-submit-btn");

  if (qty <= 0) { alert("Invalid quantity"); return; }
  if (!token) { alert("Please login"); return; }

  // New Client-Side Validation
  if (pageTradeMode === 'sell') {
    const ownedText = document.getElementById("page-owned").textContent;
    // content is like "5 Shares" or just "0" initially?
    // fetchPageWalletAndHoldings sets it as `${holdings} Shares`
    const owned = parseInt(ownedText) || 0;

    if (qty > owned) {
      msg.textContent = `Insufficient shares. You own ${owned}.`;
      msg.style.color = "#ef4444";
      return;
    }
  }

  const endpoint = pageTradeMode === 'buy' ? '/trade/buy' : '/trade/sell';

  btn.disabled = true;
  msg.textContent = "Processing...";
  msg.style.color = "#ccc";

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ symbol, quantity: qty })
    });

    const data = await res.json();

    if (res.ok) {
      msg.textContent = `Success! ${pageTradeMode.toUpperCase()} executed.`;
      msg.style.color = "#10b981";

      if (data.new_balance !== undefined) {
        const formatted = `$${data.new_balance.toFixed(2)}`;
        document.getElementById("page-cash").textContent = formatted;
        document.getElementById("wallet-balance").textContent = formatted;
      }

      // Refresh holdings
      fetchPageWalletAndHoldings(symbol);

      setTimeout(() => {
        msg.textContent = "";
        btn.disabled = false;
      }, 2000);
    } else {
      msg.textContent = data.message || "Failed";
      msg.style.color = "#ef4444";
      btn.disabled = false;
    }
  } catch (e) {
    msg.textContent = "Network Error";
    msg.style.color = "#ef4444";
    btn.disabled = false;
  }
}

function initWalletDisplay() {
  const balance = localStorage.getItem("wallet_balance");
  if (balance) {
    const el = document.getElementById("wallet-balance");
    if (el) {
      el.textContent = `$${parseFloat(balance).toFixed(2)}`;
      document.getElementById("wallet-display").style.display = "flex";
    }
  }
}

/* ---------- ADMIN DASHBOARD ---------- */
/* ---------- ADMIN DASHBOARD (PAGINATION & FILTERING) ---------- */
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 10;

async function loadAdminUsers() {
  const tableBody = document.getElementById("users-table-body");
  if (!tableBody) return;

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

    // Store data globally
    allUsers = data.users || [];

    // Initial Filter & Render
    applyFilterAndRender();

  } catch (e) {
    console.error(e);
    if (msg) {
      msg.textContent = "Network Error";
      msg.className = "message error";
    }
  }
}

// Global Filter Function
window.filterUsers = function () {
  applyFilterAndRender();
}

function applyFilterAndRender() {
  const searchInput = document.getElementById("user-search");
  const roleSelect = document.getElementById("role-filter");

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const roleValue = roleSelect ? roleSelect.value : "all";

  filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
    const matchesRole = roleValue === "all" ? true : user.role === roleValue;
    return matchesSearch && matchesRole;
  });

  currentPage = 1;
  renderUsersTable();
}

function renderUsersTable() {
  const tableBody = document.getElementById("users-table-body");
  const selectAllCb = document.getElementById("select-all-users");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  if (selectAllCb) selectAllCb.checked = false;

  if (filteredUsers.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding: 2rem;">No users found matching your criteria.</td></tr>';
    updatePaginationControls();
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const pageUsers = filteredUsers.slice(startIndex, endIndex);

  pageUsers.forEach(u => {
    const tr = document.createElement("tr");

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

  updatePaginationControls();
}

function updatePaginationControls() {
  const prevBtn = document.getElementById("prev-page-btn");
  const nextBtn = document.getElementById("next-page-btn");
  const pageInfo = document.getElementById("page-info");

  if (!prevBtn || !nextBtn || !pageInfo) return;

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderUsersTable(); } };
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderUsersTable(); } };
}

window.toggleSelectAll = function (source) { }

// Auto-run logic
if (window.location.pathname.endsWith("admin.html")) {
  // We don't call loadAdminUsers immediately here because body onload might call it via showAdminSection
  // But showAdminSection calls loadAdminUsers only when section is 'users'.
  // We can leave it to the UI to trigger.
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


/* ---------- ADMIN MESSAGES (PAGINATION) ---------- */
let allMessages = [];
let currentMsgPage = 1;

async function loadAdminMessages() {
  const tableBody = document.getElementById("messages-table-body");
  const statusMsg = document.getElementById("admin-msgs-status");
  if (!tableBody) return;

  const token = requireAuth();
  if (!token) return;

  if (statusMsg) {
    statusMsg.textContent = "Loading messages...";
    statusMsg.className = "message";
  }
  tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading...</td></tr>';

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
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Error loading messages</td></tr>';
      return;
    }

    if (statusMsg) statusMsg.textContent = "";
    allMessages = data.messages || [];
    currentMsgPage = 1;
    renderMessagesTable();

  } catch (e) {
    console.error("Error loading messages:", e);
    if (statusMsg) {
      statusMsg.textContent = "Error: " + e.message;
      statusMsg.className = "message error";
    }
  }
}

let currentRenderedMessages = [];

function renderMessagesTable(dataList = null) {
  const tableBody = document.getElementById("messages-table-body");
  const selectAllCb = document.getElementById("select-all-msgs");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  if (selectAllCb) selectAllCb.checked = false;

  // Update the currently rendered list reference
  currentRenderedMessages = dataList || allMessages;

  if (currentRenderedMessages.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding: 2rem;">No messages found.</td></tr>';
    updateMsgPagination();
    return;
  }

  const startIndex = (currentMsgPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, currentRenderedMessages.length);
  const pageMsgs = currentRenderedMessages.slice(startIndex, endIndex);

  pageMsgs.forEach(msg => {
    const tr = document.createElement("tr");
    const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A';
    const shortMsg = msg.message.length > 50 ? msg.message.substring(0, 50) + "..." : msg.message;

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

  updateMsgPagination();
}

function updateMsgPagination() {
  const prevBtn = document.getElementById("msg-prev-page-btn");
  const nextBtn = document.getElementById("msg-next-page-btn");
  const pageInfo = document.getElementById("msg-page-info");

  if (!prevBtn || !nextBtn || !pageInfo) return;

  const totalPages = Math.ceil(currentRenderedMessages.length / itemsPerPage) || 1;
  pageInfo.textContent = `Page ${currentMsgPage} of ${totalPages}`;

  prevBtn.disabled = currentMsgPage === 1;
  nextBtn.disabled = currentMsgPage === totalPages;

  prevBtn.onclick = () => { if (currentMsgPage > 1) { currentMsgPage--; renderMessagesTable(currentRenderedMessages); } };
  nextBtn.onclick = () => { if (currentMsgPage < totalPages) { currentMsgPage++; renderMessagesTable(currentRenderedMessages); } };
}

window.toggleSelectAllMsgs = function (source) { }


// Global exports
window.loadAdminMessages = loadAdminMessages;
window.renderMessagesTable = renderMessagesTable;
window.loadAdminUsers = loadAdminUsers;

/* ---------- MESSAGE FILTERING ---------- */
let filteredMessages = [];

window.filterMessages = function () {
  const searchInput = document.getElementById("msg-search");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  filteredMessages = allMessages.filter(msg => {
    return (
      msg.name.toLowerCase().includes(searchTerm) ||
      msg.email.toLowerCase().includes(searchTerm) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchTerm)) ||
      msg.message.toLowerCase().includes(searchTerm)
    );
  });

  currentMsgPage = 1;
  renderFilteredMessages();
}

// Separate render for filtered state (logic reused)
function renderFilteredMessages() {
  // Temporarily swap allMessages for filtered rendering, then swap back 
  // or just pass a list to renderMessagesTable.
  // Let's refactor renderMessagesTable to take an optional list.
  renderMessagesTable(filteredMessages);
}

// REFACTOR renderMessagesTable to accept list
// Actually update it in place since it's cleaner.


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
// window.closePosition = closePosition; // Function not defined

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


/* ---------- SYSTEM REPORT ---------- */
var userGrowthChartCtx = null;
var activityChartCtx = null;

async function loadSystemReport() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/admin/system-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();

    console.log("System Stats Data:", data);

    // Update Metrics
    const usersEl = document.getElementById("rep-total-users");
    const msgsEl = document.getElementById("rep-total-msgs");
    if (usersEl) usersEl.textContent = data.total_users;
    if (msgsEl) msgsEl.textContent = data.total_messages;

    // Render Charts
    setTimeout(() => renderSystemCharts(data), 100);

  } catch (error) {
    console.error("Error loading system report:", error);
  }
}

function renderSystemCharts(data) {
  if (typeof Chart === 'undefined') {
    console.error("Chart.js not loaded");
    return;
  }

  const canvas1 = document.getElementById('userGrowthChart');
  const canvas2 = document.getElementById('activityChart');

  if (!canvas1 || !canvas2) {
    console.error("Chart canvas elements not found");
    return;
  }

  // Ensure fresh start
  if (userGrowthChartCtx instanceof Chart) {
    userGrowthChartCtx.destroy();
  }
  if (activityChartCtx instanceof Chart) {
    activityChartCtx.destroy();
  }

  // 1. User Growth (Line)
  const users = Number(data.total_users) || 0;

  userGrowthChartCtx = new Chart(canvas1, {
    type: 'line',
    data: {
      labels: getLast6Months(),
      datasets: [{
        label: 'Total Users',
        data: generateMockGrowthData(users),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#94a3b8', precision: 0 }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });

  // 2. Platform Activity (Doughnut)
  const tracked = Number(data.total_stocks_tracked) || 0;
  const msgs = Number(data.total_messages) || 0;

  activityChartCtx = new Chart(canvas2, {
    type: 'doughnut',
    data: {
      labels: ['Users', 'Stocks', 'Messages'],
      datasets: [{
        data: [users, tracked, msgs],
        backgroundColor: ['#6366f1', '#10b981', '#ec4899'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', padding: 20 }
        }
      },
      layout: {
        padding: 10
      }
    }
  });

  function getLast6Months() {
    const months = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }
    return months;
  }

  function generateMockGrowthData(finalTotal) {
    if (finalTotal === 0) return [0, 0, 0, 0, 0, 0];
    const mockData = [];
    for (let i = 0; i < 5; i++) {
      const ratio = (i + 1) / 7;
      mockData.push(Math.floor(finalTotal * ratio));
    }
    mockData.push(finalTotal);
    return mockData;
  }
}

function initAdminButtons() {
  /* ---------- EXISTING INIT CODE ---------- */
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

async function resetBalance() {
  if (!confirm("Are you sure you want to reset your wallet balance to $100,000.00? This cannot be undone.")) return;

  const token = localStorage.getItem("token");
  if (!token) { alert("Please login"); return; }

  try {
    const res = await fetch(`${API_BASE}/wallet/reset`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (res.ok) {
      alert("Balance reset successfully!");
      // Update local storage and UI
      localStorage.setItem("wallet_balance", data.new_balance);

      const els = document.querySelectorAll("#wallet-balance, #page-cash");
      els.forEach(el => el.textContent = `$${data.new_balance.toFixed(2)}`);

      // Reload if on trade page to refresh validation logic
      if (window.location.pathname.endsWith("trade.html")) {
        location.reload();
      }
    } else {
      alert(data.message || "Failed to reset");
    }
  } catch (e) {
    console.error(e);
    alert("Network Error");
  }
}


