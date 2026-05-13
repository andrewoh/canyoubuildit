const STORAGE_KEY = "amex-platinum-household-benefit-tracker-v2";
const LEGACY_STORAGE_KEY = "amex-platinum-household-benefit-tracker-v1";
const owners = ["Andrew", "Stella", "Shared"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const seed = [
  { id: "uber-cash", name: "$200 Uber Cash", category: "Monthly", cadence: "monthly", owner: "Shared", defaultAmount: 15, enrollment: "Add Platinum Card to Uber account", useBy: "Monthly; extra $20 in December", notes: "Use on U.S. Uber rides or Uber Eats. Make sure the Amex card is selected.", icon: "🚗" },
  { id: "uber-one", name: "$120 Uber One Credit", category: "Annual / Monthly", cadence: "monthly", owner: "Shared", defaultAmount: 10, enrollment: "Pay auto-renewing Uber One membership with Platinum", useBy: "Calendar year; posts monthly", notes: "Track if Uber One is actually worth keeping after the credits.", icon: "🛵" },
  { id: "digital-entertainment", name: "$300 Digital Entertainment Credit", category: "Monthly", cadence: "monthly", owner: "Shared", defaultAmount: 25, enrollment: "Enrollment required", useBy: "Monthly", notes: "Eligible services include Disney+, Hulu, ESPN streaming, NYT, WSJ, Peacock, Paramount+, YouTube Premium, and YouTube TV when purchased directly.", icon: "📺" },
  { id: "walmart-plus", name: "$155 Walmart+ Credit", category: "Monthly", cadence: "monthly", owner: "Shared", defaultAmount: 12.95, enrollment: "Pay monthly Walmart+ membership with Platinum", useBy: "Monthly", notes: "Covers one monthly Walmart+ membership, excluding Plus Ups.", icon: "🛒" },
  { id: "resy", name: "$400 Resy Credit", category: "Quarterly", cadence: "quarterly", owner: "Shared", defaultAmount: 100, enrollment: "Enrollment required", useBy: "$100 per quarter", notes: "Use at U.S. Resy restaurants. Great for date nights or planned family meals.", icon: "🍽️" },
  { id: "lululemon", name: "$300 lululemon Credit", category: "Quarterly", cadence: "quarterly", owner: "Stella", defaultAmount: 75, enrollment: "Enrollment required", useBy: "$75 per quarter", notes: "Eligible U.S. lululemon retail stores and lululemon.com; outlets excluded.", icon: "👟" },
  { id: "hotel-credit", name: "$600 Hotel Credit", category: "Semiannual", cadence: "semiannual", owner: "Shared", defaultAmount: 300, enrollment: "Book prepaid FHR or The Hotel Collection through Amex Travel", useBy: "$300 Jan–Jun and $300 Jul–Dec", notes: "Useful for Seoul if price is competitive. THC requires a 2-night minimum; FHR has richer property benefits.", icon: "🏨" },
  { id: "saks", name: "$100 Saks Fifth Avenue Credit", category: "Semiannual", cadence: "semiannual", owner: "Shared", defaultAmount: 50, enrollment: "Enrollment required", useBy: "$50 Jan–Jun and $50 Jul–Dec", notes: "Best used intentionally; shipping/returns can erode value.", icon: "🛍️" },
  { id: "airline-fee", name: "$200 Airline Fee Credit", category: "Annual", cadence: "annual", owner: "Andrew", defaultAmount: 200, enrollment: "Select one qualifying airline first", useBy: "Calendar year", notes: "For incidental fees such as checked bags or in-flight refreshments. Not designed for airfare.", icon: "✈️" },
  { id: "clear", name: "$209 CLEAR+ Credit", category: "Annual", cadence: "annual", owner: "Andrew", defaultAmount: 209, enrollment: "Pay CLEAR+ with Platinum", useBy: "Calendar year", notes: "Track renewal date so the credit lands inside the intended year.", icon: "🛂" },
  { id: "global-entry", name: "Global Entry / TSA PreCheck Credit", category: "Multi-year", cadence: "multiyear", owner: "Shared", defaultAmount: 120, enrollment: "Pay application fee with Platinum", useBy: "Every 4 years for Global Entry or 4.5 years for TSA PreCheck", notes: "Use for whichever family member needs renewal next.", icon: "🧳" },
  { id: "oura", name: "$200 Oura Ring Credit", category: "Annual", cadence: "annual", owner: "Shared", defaultAmount: 200, enrollment: "Enrollment may be required; buy through Oura", useBy: "Calendar year", notes: "Only valuable if you actually want the ring; do not force-spend.", icon: "💍" },
  { id: "equinox", name: "$300 Equinox Credit", category: "Annual", cadence: "annual", owner: "Shared", defaultAmount: 300, enrollment: "Enrollment required through Equinox/Amex flow", useBy: "Calendar year", notes: "High nominal value, but only count real value if you would otherwise use Equinox.", icon: "🏋️" },
];

let benefits = seed;
let usage = initUsage(seed);
let filter = "All";
let ownerFilter = "All";

const $ = (id) => document.getElementById(id);

function year() { return new Date().getFullYear(); }
function quarter(date = new Date()) { return Math.floor(date.getMonth() / 3) + 1; }
function half(date = new Date()) { return date.getMonth() < 6 ? 1 : 2; }
function money(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: number % 1 ? 2 : 0 }).format(number);
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}
function periods(cadence) {
  if (cadence === "monthly") return months.map((month, index) => ({ id: `m${index + 1}`, label: month }));
  if (cadence === "quarterly") return [1, 2, 3, 4].map((q) => ({ id: `q${q}`, label: `Q${q}` }));
  if (cadence === "semiannual") return [{ id: "h1", label: "Jan–Jun" }, { id: "h2", label: "Jul–Dec" }];
  if (cadence === "annual") return [{ id: "y", label: String(year()) }];
  return [{ id: "cycle", label: "Cycle" }];
}
function initUsage(benefitList) {
  const initial = {};
  benefitList.forEach((benefit) => {
    initial[benefit.id] = {};
    periods(benefit.cadence).forEach((period) => {
      initial[benefit.id][period.id] = { done: false, amount: 0, owner: benefit.owner, note: "", date: "" };
    });
  });
  return initial;
}
function currentPeriod(cadence) {
  const now = new Date();
  if (cadence === "monthly") return `m${now.getMonth() + 1}`;
  if (cadence === "quarterly") return `q${quarter(now)}`;
  if (cadence === "semiannual") return `h${half(now)}`;
  if (cadence === "annual") return "y";
  return "cycle";
}
function defaultAmount(benefit, periodId) {
  return benefit.id === "uber-cash" && periodId === "m12" ? 35 : Number(benefit.defaultAmount || 0);
}
function deadline(benefit) {
  const now = new Date();
  if (benefit.cadence === "monthly") return `Use by ${months[now.getMonth()]} end`;
  if (benefit.cadence === "quarterly") return `Use by Q${quarter(now)} end`;
  if (benefit.cadence === "semiannual") return half(now) === 1 ? "Use by Jun 30" : "Use by Dec 31";
  if (benefit.cadence === "annual") return `Use by Dec 31, ${year()}`;
  return "Track renewal cycle";
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ benefits, usage }));
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    benefits = parsed.benefits || seed;
    usage = parsed.usage || initUsage(benefits);
  } catch {
    benefits = seed;
    usage = initUsage(seed);
  }
}
function renderFilters() {
  const cadenceFilters = ["All", "Monthly", "Quarterly", "Semiannual", "Annual", "Multi-year"];
  $("cadenceFilters").innerHTML = cadenceFilters.map((item) => `<button class="chip ${filter === item ? "active" : ""}" data-filter="${item}">${item}</button>`).join("");
  $("ownerFilters").innerHTML = ["All", ...owners].map((item) => `<button class="chip owner ${ownerFilter === item ? "active" : ""}" data-owner="${item}">${item}</button>`).join("");
  document.querySelectorAll("[data-filter]").forEach((button) => { button.onclick = () => { filter = button.dataset.filter; render(); }; });
  document.querySelectorAll("[data-owner]").forEach((button) => { button.onclick = () => { ownerFilter = button.dataset.owner; render(); }; });
}
function renderStats() {
  let available = 0;
  let captured = 0;
  let open = 0;
  benefits.forEach((benefit) => {
    periods(benefit.cadence).forEach((period) => {
      available += defaultAmount(benefit, period.id);
      const row = usage[benefit.id]?.[period.id];
      if (row?.done) captured += Number(row.amount || defaultAmount(benefit, period.id) || 0);
    });
    if (!usage[benefit.id]?.[currentPeriod(benefit.cadence)]?.done) open += 1;
  });
  $("captured").textContent = money(captured);
  $("remaining").textContent = money(Math.max(available - captured, 0));
  $("available").textContent = money(available);
  $("openNow").textContent = open;
}
function renderBenefits() {
  const list = benefits.filter((benefit) => (filter === "All" || benefit.category === filter || benefit.cadence === filter.toLowerCase()) && (ownerFilter === "All" || benefit.owner === ownerFilter));
  $("benefits").innerHTML = list.map((benefit) => {
    const allPeriods = periods(benefit.cadence);
    const complete = allPeriods.filter((period) => usage[benefit.id]?.[period.id]?.done).length;
    const progress = allPeriods.length ? Math.round((complete / allPeriods.length) * 100) : 0;
    const current = currentPeriod(benefit.cadence);
    return `<article class="benefit"><div class="benefit-head"><div><div class="benefit-title"><div class="icon">${escapeHtml(benefit.icon)}</div><div><h2>${escapeHtml(benefit.name)}</h2><div class="badges"><span class="badge">${escapeHtml(benefit.category)}</span><span class="badge owner">${escapeHtml(benefit.owner)}</span></div><p class="notes">${escapeHtml(benefit.notes)}</p></div></div><div class="meta"><div><b>Enrollment</b>${escapeHtml(benefit.enrollment)}</div><div><b>Cadence</b>${escapeHtml(benefit.useBy)}</div><div class="deadline"><b>Deadline</b>${escapeHtml(deadline(benefit))}</div></div></div><div class="progress"><div class="progress-num">${progress}%</div><div class="progress-sub">${complete}/${allPeriods.length} periods complete</div><button class="btn btn-danger" style="margin-top:18px" data-remove="${benefit.id}">Remove</button><div class="bar"><div style="width:${progress}%"></div></div></div></div><div class="periods">${allPeriods.map((period) => renderPeriod(benefit, period, current)).join("")}</div></article>`;
  }).join("");
  wireBenefitEvents();
}
function renderPeriod(benefit, period, current) {
  const row = usage[benefit.id]?.[period.id] || {};
  const ownerOptions = owners.map((owner) => `<option ${((row.owner || benefit.owner) === owner) ? "selected" : ""}>${owner}</option>`).join("");
  return `<div class="period ${row.done ? "done" : ""} ${period.id === current ? "now" : ""}"><div class="period-top"><button class="check" data-toggle="${benefit.id}|${period.id}"><span class="dot"></span>${escapeHtml(period.label)}</button>${period.id === current ? "<span class=\"nowpill\">Now</span>" : ""}</div><div class="two"><div><label class="field">Amount</label><input type="number" value="${escapeHtml(row.amount ?? 0)}" data-cell="${benefit.id}|${period.id}|amount"></div><div><label class="field">Owner</label><select data-cell="${benefit.id}|${period.id}|owner">${ownerOptions}</select></div></div><label class="field">Date used / posted</label><input type="date" value="${escapeHtml(row.date || "")}" data-cell="${benefit.id}|${period.id}|date"><label class="field">Note</label><input value="${escapeHtml(row.note || "")}" placeholder="e.g., Resy dinner, Uber Eats" data-cell="${benefit.id}|${period.id}|note"></div>`;
}
function wireBenefitEvents() {
  document.querySelectorAll("[data-toggle]").forEach((button) => {
    button.onclick = () => {
      const [benefitId, periodId] = button.dataset.toggle.split("|");
      const benefit = benefits.find((item) => item.id === benefitId);
      const row = usage[benefitId][periodId];
      row.done = !row.done;
      row.amount = row.done ? Number(row.amount || defaultAmount(benefit, periodId)) : 0;
      row.date = row.done ? (row.date || new Date().toISOString().slice(0, 10)) : "";
      save();
      render();
    };
  });
  document.querySelectorAll("[data-cell]").forEach((input) => {
    input.oninput = () => {
      const [benefitId, periodId, field] = input.dataset.cell.split("|");
      usage[benefitId][periodId][field] = input.value;
      save();
      renderStats();
    };
  });
  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.remove;
      benefits = benefits.filter((benefit) => benefit.id !== id);
      delete usage[id];
      save();
      render();
    };
  });
}
function render() {
  renderFilters();
  renderStats();
  renderBenefits();
}

$("addToggle").onclick = () => $("addPanel").classList.toggle("show");
$("saveNew").onclick = () => {
  const name = $("newName").value.trim();
  if (!name) return;
  const cadence = $("newCadence").value;
  const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
  const value = Number($("newValue").value || 0);
  const benefit = { id, name, category: cadence[0].toUpperCase() + cadence.slice(1), cadence, owner: $("newOwner").value, defaultAmount: value, enrollment: "Custom benefit", useBy: "Custom", notes: $("newNotes").value, icon: "✦" };
  benefits.push(benefit);
  usage[id] = initUsage([benefit])[id];
  $("newName").value = "";
  $("newValue").value = "0";
  $("newNotes").value = "";
  save();
  render();
};
$("resetBtn").onclick = () => {
  if (confirm("Reset all usage? This keeps the benefit template but clears completion, notes, dates, and amounts.")) {
    usage = initUsage(benefits);
    save();
    render();
  }
};
$("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify({ benefits, usage }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `amex-platinum-tracker-${year()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};
$("importFile").onchange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (parsed.benefits && parsed.usage) {
        benefits = parsed.benefits;
        usage = parsed.usage;
        save();
        render();
      }
    } catch {
      window.alert("Could not import that file.");
    }
  };
  reader.readAsText(file);
};

load();
render();
