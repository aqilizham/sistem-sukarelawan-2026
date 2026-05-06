const STORAGE_KEY = "sistem-sukarelawan-2026-state";
const API_ENABLED =
  (window.location.protocol === "http:" || window.location.protocol === "https:") &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
let saveTimer;
let suppressSave = false;

const seed = {
  role: "Admin Induk",
  cluster: "Kuala Lumpur",
  search: "",
  view: "overview",
  activity: [
    { time: "08:10", text: "Saringan 4 permohonan baharu selesai", type: "green" },
    { time: "09:35", text: "MWGateway menghantar mesej ke Unit Protokol", type: "blue" },
    { time: "10:05", text: "Venue KL Sports City capai 92% kekuatan syif", type: "gold" }
  ],
  chat: [
    { from: "bot", text: "AssistAI sedia membantu semakan jadual, latihan, kit, dan pembayaran." }
  ],
  attendanceLog: [
    { id: "V27004", name: "Mei Ling Tan", venue: "Axiata Arena", time: "07:46", method: "QR" },
    { id: "V27009", name: "Nurin Aisyah", venue: "KLCC", time: "08:02", method: "Manual" }
  ],
  complaints: [
    {
      id: "HD-1201",
      volunteer: "Arman Shah",
      issue: "Pertukaran saiz jaket",
      channel: "HelpDesk Pro",
      status: "Dalam tindakan",
      priority: "Sederhana"
    },
    {
      id: "HD-1202",
      volunteer: "Kavitha Nair",
      issue: "Jadual latihan bertembung",
      channel: "Live Chat",
      status: "Baharu",
      priority: "Tinggi"
    }
  ],
  sponsors: [
    { name: "MetroCare", category: "Perubatan", status: "Disahkan", value: 45000 },
    { name: "MoveKL", category: "Pengangkutan", status: "Rundingan", value: 72000 },
    { name: "HydraPlus", category: "Minuman", status: "Draf MoU", value: 28000 }
  ],
  broadcasts: [
    { target: "Semua Ketua Unit", text: "Sahkan senarai syif minggu ini sebelum 5 petang.", sent: "10:20" }
  ],
  shifts: [
    { day: "Isnin", venue: "KL Sports City", unit: "Venue Ops", time: "07:00-15:00", needed: 160, assigned: 148 },
    { day: "Isnin", venue: "KLCC", unit: "Protokol", time: "09:00-17:00", needed: 90, assigned: 88 },
    { day: "Selasa", venue: "Axiata Arena", unit: "Media", time: "08:00-16:00", needed: 70, assigned: 63 },
    { day: "Rabu", venue: "Bukit Jalil Stadium", unit: "Crowd Control", time: "14:00-22:00", needed: 210, assigned: 192 },
    { day: "Khamis", venue: "Merdeka Square", unit: "Transport", time: "06:00-14:00", needed: 120, assigned: 105 },
    { day: "Jumaat", venue: "MITEC", unit: "Accreditation", time: "10:00-18:00", needed: 80, assigned: 80 },
    { day: "Sabtu", venue: "National Aquatic Centre", unit: "Medical Support", time: "07:00-15:00", needed: 55, assigned: 52 }
  ],
  volunteers: [
    {
      id: "V27001",
      name: "Arman Shah",
      age: 24,
      phone: "60123456001",
      email: "arman@example.com",
      cluster: "Kuala Lumpur",
      venue: "KL Sports City",
      unit: "Venue Ops",
      status: "Diluluskan",
      screening: 88,
      training: 75,
      kit: "Belum lengkap",
      accreditation: "Draf",
      attendance: 4,
      rewards: 330,
      payment: "Belum diproses",
      lodging: "Tidak perlu",
      phoneVerified: true,
      gps: "3.054, 101.691"
    },
    {
      id: "V27002",
      name: "Kavitha Nair",
      age: 31,
      phone: "60123456002",
      email: "kavitha@example.com",
      cluster: "Kuala Lumpur",
      venue: "KLCC",
      unit: "Protokol",
      status: "Semakan",
      screening: 72,
      training: 50,
      kit: "Belum agih",
      accreditation: "Belum",
      attendance: 1,
      rewards: 120,
      payment: "Menunggu akaun",
      lodging: "StaySmart",
      phoneVerified: true,
      gps: "3.153, 101.713"
    },
    {
      id: "V27003",
      name: "Hakim Roslan",
      age: 27,
      phone: "60123456003",
      email: "hakim@example.com",
      cluster: "Selangor",
      venue: "Axiata Arena",
      unit: "Media",
      status: "Permohonan",
      screening: 64,
      training: 20,
      kit: "Belum agih",
      accreditation: "Belum",
      attendance: 0,
      rewards: 40,
      payment: "Belum diproses",
      lodging: "Tidak perlu",
      phoneVerified: false,
      gps: "3.054, 101.691"
    },
    {
      id: "V27004",
      name: "Mei Ling Tan",
      age: 22,
      phone: "60123456004",
      email: "meiling@example.com",
      cluster: "Kuala Lumpur",
      venue: "Axiata Arena",
      unit: "Media",
      status: "Diluluskan",
      screening: 91,
      training: 90,
      kit: "Lengkap",
      accreditation: "Aktif",
      attendance: 6,
      rewards: 520,
      payment: "Dibayar",
      lodging: "StaySmart",
      phoneVerified: true,
      gps: "3.054, 101.691"
    },
    {
      id: "V27005",
      name: "Daniel Lim",
      age: 29,
      phone: "60123456005",
      email: "daniel@example.com",
      cluster: "Kuala Lumpur",
      venue: "Bukit Jalil Stadium",
      unit: "Crowd Control",
      status: "Diluluskan",
      screening: 82,
      training: 60,
      kit: "Sebahagian",
      accreditation: "Draf",
      attendance: 3,
      rewards: 260,
      payment: "Diproses",
      lodging: "Tidak perlu",
      phoneVerified: true,
      gps: "3.054, 101.691"
    },
    {
      id: "V27006",
      name: "Farah Izzati",
      age: 26,
      phone: "60123456006",
      email: "farah@example.com",
      cluster: "Kuala Lumpur",
      venue: "MITEC",
      unit: "Accreditation",
      status: "Ditolak",
      screening: 41,
      training: 0,
      kit: "Belum agih",
      accreditation: "Belum",
      attendance: 0,
      rewards: 0,
      payment: "Belum diproses",
      lodging: "Tidak perlu",
      phoneVerified: false,
      gps: "3.179, 101.666"
    },
    {
      id: "V27007",
      name: "Iqbal Danish",
      age: 35,
      phone: "60123456007",
      email: "iqbal@example.com",
      cluster: "Putrajaya",
      venue: "Merdeka Square",
      unit: "Transport",
      status: "Semakan",
      screening: 78,
      training: 40,
      kit: "Belum agih",
      accreditation: "Belum",
      attendance: 1,
      rewards: 90,
      payment: "Menunggu akaun",
      lodging: "StaySmart",
      phoneVerified: true,
      gps: "3.148, 101.694"
    },
    {
      id: "V27008",
      name: "Sofia Rahman",
      age: 21,
      phone: "60123456008",
      email: "sofia@example.com",
      cluster: "Kuala Lumpur",
      venue: "National Aquatic Centre",
      unit: "Medical Support",
      status: "Diluluskan",
      screening: 95,
      training: 100,
      kit: "Lengkap",
      accreditation: "Aktif",
      attendance: 7,
      rewards: 610,
      payment: "Dibayar",
      lodging: "Tidak perlu",
      phoneVerified: true,
      gps: "3.055, 101.690"
    },
    {
      id: "V27009",
      name: "Nurin Aisyah",
      age: 28,
      phone: "60123456009",
      email: "nurin@example.com",
      cluster: "Kuala Lumpur",
      venue: "KLCC",
      unit: "Protokol",
      status: "Diluluskan",
      screening: 84,
      training: 80,
      kit: "Lengkap",
      accreditation: "Aktif",
      attendance: 5,
      rewards: 420,
      payment: "Dibayar",
      lodging: "StaySmart",
      phoneVerified: true,
      gps: "3.153, 101.713"
    },
    {
      id: "V27010",
      name: "Jason Wong",
      age: 33,
      phone: "60123456010",
      email: "jason@example.com",
      cluster: "Kuala Lumpur",
      venue: "Bukit Jalil Stadium",
      unit: "Crowd Control",
      status: "Permohonan",
      screening: 58,
      training: 0,
      kit: "Belum agih",
      accreditation: "Belum",
      attendance: 0,
      rewards: 0,
      payment: "Belum diproses",
      lodging: "Tidak perlu",
      phoneVerified: false,
      gps: "3.054, 101.691"
    }
  ]
};

let state = structuredClone(seed);

const views = {
  overview: { title: "Dashboard", kicker: "Operasi berpusat" },
  applications: { title: "Permohonan", kicker: "Pendaftaran dan pangkalan data" },
  screening: { title: "Saringan", kicker: "Pemilihan dan kelulusan" },
  placement: { title: "Penempatan", kicker: "Kluster, venue, dan unit" },
  schedule: { title: "Jadual & Latihan", kicker: "Syif dan kompetensi" },
  kit: { title: "Kit & Akreditasi", kicker: "Agihan kit dan pas rasmi" },
  attendance: { title: "Kehadiran", kicker: "QR, manual, dan pemantauan GPS" },
  support: { title: "Aduan & Sokongan", kicker: "HelpDesk Pro dan MWGateway" },
  addons: { title: "Sistem Tambahan", kicker: "StaySmart, AssistAI, SponsorHub, Rewards+, PayGate" },
  reports: { title: "Sijil & Laporan", kicker: "Analitik, eksport, dan sijil digital" }
};

const statusClass = {
  "Diluluskan": "approved",
  "Semakan": "review",
  "Permohonan": "pending",
  "Ditolak": "rejected",
  "Lengkap": "done",
  "Aktif": "done",
  "Draf": "review",
  "Belum": "pending",
  "Belum lengkap": "pending",
  "Belum agih": "pending",
  "Sebahagian": "review",
  "Dibayar": "done",
  "Diproses": "review",
  "Belum diproses": "pending",
  "Menunggu akaun": "risk"
};

const app = document.querySelector("#app");
const navList = document.querySelector("#navList");
const roleSelect = document.querySelector("#roleSelect");
const clusterSelect = document.querySelector("#clusterSelect");
const globalSearch = document.querySelector("#globalSearch");
const viewTitle = document.querySelector("#viewTitle");
const viewKicker = document.querySelector("#viewKicker");
const passModal = document.querySelector("#passModal");
const modalBody = document.querySelector("#modalBody");
const sidebar = document.querySelector(".sidebar");

async function loadState() {
  const localState = loadLocalState();
  if (!API_ENABLED) return localState;

  try {
    const response = await fetch("/api/state", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (response.ok) {
      const payload = await response.json();
      if (payload.state) {
        return { ...structuredClone(seed), ...payload.state };
      }
    }

    await persistState(localState);
    return localState;
  } catch {
    return localState;
  }
}

function loadLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...structuredClone(seed), ...saved } : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  if (suppressSave) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!API_ENABLED) return;

  clearTimeout(saveTimer);
  const snapshot = structuredClone(state);
  saveTimer = setTimeout(() => persistState(snapshot), 150);
}

async function persistState(snapshot) {
  if (!API_ENABLED) return;
  try {
    await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot)
    });
  } catch {
    toast("Server tidak dapat simpan data. Perubahan masih disimpan dalam pelayar.");
  }
}

function setView(view) {
  state.view = view;
  saveState();
  render();
}

function filteredVolunteers(options = {}) {
  const search = (options.search ?? state.search).trim().toLowerCase();
  const cluster = options.cluster ?? state.cluster;
  return state.volunteers.filter((volunteer) => {
    const matchesCluster = cluster === "Semua" || volunteer.cluster === cluster;
    const haystack = [volunteer.id, volunteer.name, volunteer.email, volunteer.venue, volunteer.unit, volunteer.status]
      .join(" ")
      .toLowerCase();
    return matchesCluster && (!search || haystack.includes(search));
  });
}

function countBy(list, key) {
  return list.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function statusBadge(value) {
  return `<span class="status ${statusClass[value] || "info"}">${value}</span>`;
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMoney(value) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function metricCard(label, value, foot, color = "green", values = [40, 58, 52, 65, 74, 81]) {
  const bars = values.map((bar) => `<span style="height:${bar}%"></span>`).join("");
  return `
    <article class="metric-card">
      <div class="metric-top">
        <span>${label}</span>
        <span class="tag ${color}">${foot}</span>
      </div>
      <div class="metric-value">${value}</div>
      <div class="sparkline" aria-hidden="true">${bars}</div>
    </article>
  `;
}

function render() {
  const view = views[state.view] || views.overview;
  viewTitle.textContent = view.title;
  viewKicker.textContent = view.kicker;
  roleSelect.value = state.role;
  clusterSelect.value = state.cluster;
  globalSearch.value = state.search;

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });

  const renderer = {
    overview: renderOverview,
    applications: renderApplications,
    screening: renderScreening,
    placement: renderPlacement,
    schedule: renderSchedule,
    kit: renderKit,
    attendance: renderAttendance,
    support: renderSupport,
    addons: renderAddons,
    reports: renderReports
  }[state.view];

  app.innerHTML = renderer ? renderer() : renderOverview();
  bindViewEvents();
  window.lucide?.createIcons();
}

function renderOverview() {
  const list = filteredVolunteers({ search: "" });
  const approved = list.filter((v) => v.status === "Diluluskan").length;
  const review = list.filter((v) => v.status === "Semakan" || v.status === "Permohonan").length;
  const activePass = list.filter((v) => v.accreditation === "Aktif").length;
  const present = state.attendanceLog.length;
  const kitComplete = list.filter((v) => v.kit === "Lengkap").length;
  const trainingAvg = Math.round(list.reduce((sum, v) => sum + v.training, 0) / Math.max(list.length, 1));
  const venueCounts = countBy(list, "venue");
  const maxVenue = Math.max(...Object.values(venueCounts), 1);

  return `
    <section class="grid metrics">
      ${metricCard("Sukarelawan berdaftar", list.length.toLocaleString("ms-MY"), `Kluster ${state.cluster}`, "blue", [35, 46, 61, 72, 80, 92])}
      ${metricCard("Diluluskan", approved.toLocaleString("ms-MY"), `${percentage(approved, list.length)}%`, "green", [42, 49, 55, 63, 76, 84])}
      ${metricCard("Dalam semakan", review.toLocaleString("ms-MY"), "Saringan", "gold", [25, 30, 44, 39, 47, 52])}
      ${metricCard("Hadir hari ini", present.toLocaleString("ms-MY"), "QR + manual", "violet", [18, 35, 45, 56, 68, 73])}
    </section>

    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Kekuatan Venue</h2>
            <p>Taburan sukarelawan aktif mengikut lokasi tugasan.</p>
          </div>
          <span class="pill">Multi-kluster</span>
        </div>
        <div class="bar-list">
          ${Object.entries(venueCounts)
            .map(([venue, total]) => `
              <div class="bar-row">
                <span>${venue}</span>
                <div class="progress"><span style="width:${percentage(total, maxVenue)}%"></span></div>
                <strong>${total}</strong>
              </div>
            `)
            .join("")}
        </div>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Kesediaan Operasi</h2>
            <p>Status latihan, kit, dan akreditasi untuk hari operasi.</p>
          </div>
          <span class="pill">${state.role}</span>
        </div>
        <div class="bar-list">
          <div class="bar-row">
            <span>Latihan</span>
            <div class="progress"><span style="width:${trainingAvg}%"></span></div>
            <strong>${trainingAvg}%</strong>
          </div>
          <div class="bar-row">
            <span>Kit lengkap</span>
            <div class="progress"><span style="width:${percentage(kitComplete, list.length)}%"></span></div>
            <strong>${percentage(kitComplete, list.length)}%</strong>
          </div>
          <div class="bar-row">
            <span>Pas aktif</span>
            <div class="progress"><span style="width:${percentage(activePass, list.length)}%"></span></div>
            <strong>${percentage(activePass, list.length)}%</strong>
          </div>
          <div class="bar-row">
            <span>Verifikasi telefon</span>
            <div class="progress"><span style="width:${percentage(list.filter((v) => v.phoneVerified).length, list.length)}%"></span></div>
            <strong>${percentage(list.filter((v) => v.phoneVerified).length, list.length)}%</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Peta Venue Kuala Lumpur</h2>
            <p>Pemantauan venue utama dan unit kritikal.</p>
          </div>
          <button class="ghost-button" data-action="go" data-view="placement"><i data-lucide="map"></i>Penempatan</button>
        </div>
        <div class="venue-map">
          ${Object.entries(venueCounts)
            .slice(0, 6)
            .map(([venue, total], index) => `
              <div class="map-zone">
                <div>
                  <strong>${venue}</strong>
                  <span class="muted">${total} sukarelawan</span>
                </div>
                <div class="progress"><span style="width:${Math.max(28, percentage(total, maxVenue))}%"></span></div>
                <span class="tag ${index % 2 ? "gold" : "green"}">${index % 2 ? "Pantau" : "Stabil"}</span>
              </div>
            `)
            .join("")}
        </div>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Aktiviti Masa Nyata</h2>
            <p>Ringkasan kemas kini daripada modul operasi.</p>
          </div>
          <button class="ghost-button" data-action="addActivity"><i data-lucide="refresh-cw"></i>Segar</button>
        </div>
        <div class="grid">
          ${state.activity
            .map((item) => `
              <article class="timeline-item">
                <div class="toolbar">
                  <strong>${item.time}</strong>
                  <span class="tag ${item.type}">${item.type === "green" ? "Selesai" : item.type === "gold" ? "Pantau" : "Info"}</span>
                </div>
                <p>${item.text}</p>
              </article>
            `)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderApplications() {
  const list = filteredVolunteers();
  return `
    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Daftar Sukarelawan</h2>
          <p>Data asas, pilihan venue, dan unit tugasan.</p>
        </div>
        <span class="pill">${list.length} rekod dipapar</span>
      </div>
      <form class="field-grid" id="volunteerForm">
        <div class="field"><label>Nama<input name="name" required placeholder="Nama penuh"></label></div>
        <div class="field"><label>Emel<input name="email" type="email" required placeholder="nama@email.com"></label></div>
        <div class="field"><label>No telefon<input name="phone" required placeholder="60123456789"></label></div>
        <div class="field"><label>Umur<input name="age" type="number" min="18" value="21"></label></div>
        <div class="field"><label>Kluster${clusterSelectHtml("cluster", state.cluster)}</label></div>
        <div class="field"><label>Venue${venueSelectHtml("venue")}</label></div>
        <div class="field"><label>Unit${unitSelectHtml("unit")}</label></div>
        <div class="field"><label>Status${statusSelectHtml("status", "Permohonan")}</label></div>
        <div class="field wide">
          <button class="button" type="submit"><i data-lucide="user-plus"></i>Tambah permohonan</button>
        </div>
      </form>
    </section>

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Pangkalan Data Sukarelawan</h2>
          <p>Carian global di atas menapis semua rekod aktif.</p>
        </div>
        <div class="row-actions">
          <button class="ghost-button" data-action="exportCsv"><i data-lucide="download"></i>CSV</button>
          <button class="ghost-button" data-action="resetDemo"><i data-lucide="rotate-ccw"></i>Reset demo</button>
        </div>
      </div>
      ${volunteerTable(list)}
    </section>
  `;
}

function renderScreening() {
  const list = filteredVolunteers().filter((v) => v.status !== "Ditolak");
  return `
    <section class="toolbar">
      <div>
        <h2>Senarai Saringan</h2>
        <p class="muted">Skor mengambil kira umur, pengalaman, verifikasi telefon, latihan, dan kesesuaian unit.</p>
      </div>
      <div class="actions">
        <button class="button" data-action="autoScore"><i data-lucide="wand-2"></i>Kira skor</button>
        <button class="ghost-button" data-action="approveHigh"><i data-lucide="check-check"></i>Lulus skor tinggi</button>
      </div>
    </section>

    <section class="grid three">
      ${list
        .map((v) => `
          <article class="work-card screen-card">
            <div class="score-ring" style="--score:${v.screening}">${v.screening}</div>
            <div>
              <div class="toolbar">
                <strong>${v.name}</strong>
                ${statusBadge(v.status)}
              </div>
              <p class="muted">${v.id} - ${v.unit} - ${v.venue}</p>
              <div class="bar-list">
                <div class="bar-row">
                  <span>Latihan</span>
                  <div class="progress"><span style="width:${v.training}%"></span></div>
                  <strong>${v.training}%</strong>
                </div>
                <div class="bar-row">
                  <span>Telefon</span>
                  <div class="progress"><span style="width:${v.phoneVerified ? 100 : 0}%"></span></div>
                  <strong>${v.phoneVerified ? "OK" : "Belum"}</strong>
                </div>
              </div>
              <div class="card-actions">
                <button class="ghost-button" data-action="screenDecision" data-id="${v.id}" data-status="Diluluskan"><i data-lucide="check"></i>Lulus</button>
                <button class="danger-button" data-action="screenDecision" data-id="${v.id}" data-status="Ditolak"><i data-lucide="x"></i>Tolak</button>
              </div>
            </div>
          </article>
        `)
        .join("") || `<div class="empty">Tiada rekod saringan.</div>`}
    </section>
  `;
}

function renderPlacement() {
  const list = filteredVolunteers();
  const approved = list.filter((v) => v.status === "Diluluskan");
  const byUnit = countBy(approved, "unit");
  const pending = list.filter((v) => v.status === "Semakan" || v.status === "Permohonan");

  return `
    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Penempatan Manual</h2>
            <p>Kemaskini venue dan unit berdasarkan keperluan operasi.</p>
          </div>
          <span class="pill">${approved.length} diluluskan</span>
        </div>
        <form class="field-grid compact" id="placementForm">
          <div class="field"><label>Sukarelawan${volunteerSelectHtml("volunteerId", list)}</label></div>
          <div class="field"><label>Venue${venueSelectHtml("venue")}</label></div>
          <div class="field"><label>Unit${unitSelectHtml("unit")}</label></div>
          <div class="field wide">
            <button class="button" type="submit"><i data-lucide="send"></i>Kemaskini penempatan</button>
          </div>
        </form>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Keperluan Unit</h2>
            <p>Ringkasan kekuatan unit untuk tindakan Admin Kluster.</p>
          </div>
          <button class="ghost-button" data-action="balancePlacement"><i data-lucide="shuffle"></i>Imbang</button>
        </div>
        <div class="bar-list">
          ${["Venue Ops", "Protokol", "Media", "Crowd Control", "Transport", "Accreditation", "Medical Support"]
            .map((unit) => {
              const total = byUnit[unit] || 0;
              const target = unit === "Crowd Control" ? 4 : 2;
              return `
                <div class="bar-row">
                  <span>${unit}</span>
                  <div class="progress"><span style="width:${Math.min(100, percentage(total, target))}%"></span></div>
                  <strong>${total}/${target}</strong>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>

    <section class="kanban">
      <div class="kanban-column">
        <h2>Menunggu</h2>
        ${pending.map(compactVolunteerCard).join("") || `<p class="muted">Tiada rekod.</p>`}
      </div>
      <div class="kanban-column">
        <h2>Ditempatkan</h2>
        ${approved.filter((v) => v.accreditation !== "Aktif").map(compactVolunteerCard).join("") || `<p class="muted">Tiada rekod.</p>`}
      </div>
      <div class="kanban-column">
        <h2>Sedia Operasi</h2>
        ${approved.filter((v) => v.accreditation === "Aktif").map(compactVolunteerCard).join("") || `<p class="muted">Tiada rekod.</p>`}
      </div>
    </section>
  `;
}

function renderSchedule() {
  const days = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
  const list = filteredVolunteers();
  return `
    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Jadual Tugasan Mingguan</h2>
          <p>Syif venue, kekuatan semasa, dan jurang penempatan.</p>
        </div>
        <button class="ghost-button" data-action="addShift"><i data-lucide="calendar-plus"></i>Tambah syif demo</button>
      </div>
      <div class="calendar-grid">
        ${days
          .map((day) => {
            const dayShifts = state.shifts.filter((shift) => shift.day === day);
            return `
              <div class="day-cell">
                <strong>${day}</strong>
                ${dayShifts
                  .map((shift) => `
                    <span class="shift-chip ${shift.assigned < shift.needed ? "warn" : ""}">
                      <b>${shift.time}</b>
                      ${shift.venue}
                      <small>${shift.unit}: ${shift.assigned}/${shift.needed}</small>
                    </span>
                  `)
                  .join("") || `<span class="muted">Tiada syif</span>`}
              </div>
            `;
          })
          .join("")}
      </div>
    </section>

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Matriks Latihan</h2>
          <p>Modul orientasi, keselamatan, venue, dan tugas khusus.</p>
        </div>
        <button class="button" data-action="completeTraining"><i data-lucide="graduation-cap"></i>Tandakan selesai</button>
      </div>
      ${volunteerTable(list, "training")}
    </section>
  `;
}

function renderKit() {
  const list = filteredVolunteers();
  return `
    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Agihan Kit</h2>
            <p>Jaket, lanyard, tag nama, kupon makanan, dan bahan taklimat.</p>
          </div>
          <button class="button" data-action="completeKit"><i data-lucide="package-check"></i>Lengkapkan dipilih</button>
        </div>
        <form class="field-grid compact" id="kitForm">
          <div class="field"><label>Sukarelawan${volunteerSelectHtml("volunteerId", list)}</label></div>
          <div class="field"><label>Status kit${simpleSelectHtml("kit", ["Belum agih", "Sebahagian", "Belum lengkap", "Lengkap"])}</label></div>
          <div class="field"><label>Akreditasi${simpleSelectHtml("accreditation", ["Belum", "Draf", "Aktif"])}</label></div>
          <div class="field wide"><button class="button" type="submit"><i data-lucide="save"></i>Simpan status</button></div>
        </form>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Pas Akreditasi</h2>
            <p>Pratonton pas digital untuk sukarelawan yang telah diluluskan.</p>
          </div>
          <span class="pill">${list.filter((v) => v.accreditation === "Aktif").length} aktif</span>
        </div>
        <div class="grid">
          ${list
            .filter((v) => v.status === "Diluluskan")
            .slice(0, 4)
            .map((v) => `
              <article class="identity-pass">
                <div class="pass-photo">${initials(v.name)}</div>
                <div class="pass-meta">
                  <strong>${v.name}</strong>
                  <span>${v.id} - ${v.unit}</span>
                  <span class="muted">${v.venue}</span>
                  ${statusBadge(v.accreditation)}
                  <button class="ghost-button" data-action="showPass" data-id="${v.id}"><i data-lucide="badge"></i>Lihat pas</button>
                </div>
              </article>
            `)
            .join("")}
        </div>
      </div>
    </section>

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Status Kit & Akreditasi</h2>
          <p>Semakan silang antara agihan kit dan pas rasmi.</p>
        </div>
      </div>
      ${volunteerTable(list, "kit")}
    </section>
  `;
}

function renderAttendance() {
  const list = filteredVolunteers();
  return `
    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Daftar Kehadiran</h2>
            <p>Input ID sukarelawan atau token QR demo.</p>
          </div>
          <span class="pill">${state.attendanceLog.length} daftar hari ini</span>
        </div>
        <form class="field-grid compact" id="attendanceForm">
          <div class="field"><label>ID / QR<input name="volunteerId" required placeholder="Contoh: V27004"></label></div>
          <div class="field"><label>Kaedah${simpleSelectHtml("method", ["QR", "Manual", "GPS"])}</label></div>
          <div class="field"><label>Venue${venueSelectHtml("venue")}</label></div>
          <div class="field wide"><button class="button" type="submit"><i data-lucide="scan-line"></i>Check-in</button></div>
        </form>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Pemantauan GPS</h2>
            <p>Koordinat terakhir sukarelawan di venue aktif.</p>
          </div>
          <button class="ghost-button" data-action="syncGps"><i data-lucide="satellite"></i>Sinkron</button>
        </div>
        <div class="grid">
          ${list
            .filter((v) => v.status === "Diluluskan")
            .slice(0, 5)
            .map((v) => `
              <article class="timeline-item">
                <div class="toolbar">
                  <strong>${v.name}</strong>
                  <span class="tag blue">${v.gps}</span>
                </div>
                <p class="muted">${v.venue} - ${v.unit}</p>
              </article>
            `)
            .join("")}
        </div>
      </div>
    </section>

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Log Kehadiran</h2>
          <p>Rekod daftar masuk hari operasi.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Masa</th><th>ID</th><th>Nama</th><th>Venue</th><th>Kaedah</th></tr></thead>
          <tbody>
            ${state.attendanceLog
              .map((row) => `
                <tr>
                  <td>${row.time}</td>
                  <td>${row.id}</td>
                  <td>${row.name}</td>
                  <td>${row.venue}</td>
                  <td>${row.method}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSupport() {
  return `
    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>HelpDesk Pro</h2>
            <p>Tiket aduan dan pertanyaan sukarelawan.</p>
          </div>
          <span class="pill">${state.complaints.length} tiket</span>
        </div>
        <form class="field-grid compact" id="ticketForm">
          <div class="field"><label>Nama<input name="volunteer" required placeholder="Nama sukarelawan"></label></div>
          <div class="field"><label>Prioriti${simpleSelectHtml("priority", ["Rendah", "Sederhana", "Tinggi"])}</label></div>
          <div class="field"><label>Saluran${simpleSelectHtml("channel", ["HelpDesk Pro", "Live Chat", "AssistAI"])}</label></div>
          <div class="field wide"><label>Isu<textarea name="issue" required placeholder="Ringkasan isu"></textarea></label></div>
          <div class="field wide"><button class="button" type="submit"><i data-lucide="ticket-plus"></i>Buka tiket</button></div>
        </form>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>MWGateway</h2>
            <p>Blast mesej WhatsApp mengikut bidang tugas.</p>
          </div>
          <span class="pill">${state.broadcasts.length} mesej</span>
        </div>
        <form class="field-grid compact" id="broadcastForm">
          <div class="field"><label>Sasaran${simpleSelectHtml("target", ["Semua Sukarelawan", "Semua Ketua Unit", "Unit Protokol", "Unit Media", "Unit Crowd Control"])}</label></div>
          <div class="field wide"><label>Mesej<textarea name="text" required placeholder="Tulis mesej operasi"></textarea></label></div>
          <div class="field wide"><button class="button" type="submit"><i data-lucide="send"></i>Hantar mesej</button></div>
        </form>
      </div>
    </section>

    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Senarai Tiket</h2>
            <p>Status tindakan pasukan sokongan.</p>
          </div>
        </div>
        <div class="grid">
          ${state.complaints
            .map((ticket) => `
              <article class="ticket">
                <div class="toolbar">
                  <strong>${ticket.id} - ${ticket.volunteer}</strong>
                  <span class="tag ${ticket.priority === "Tinggi" ? "red" : ticket.priority === "Sederhana" ? "gold" : "green"}">${ticket.priority}</span>
                </div>
                <p>${ticket.issue}</p>
                <p class="muted">${ticket.channel} - ${ticket.status}</p>
                <button class="ghost-button" data-action="closeTicket" data-id="${ticket.id}"><i data-lucide="check-circle"></i>Tutup tiket</button>
              </article>
            `)
            .join("")}
        </div>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>AssistAI Chat</h2>
            <p>Sokongan pantas 24/7 untuk soalan operasi.</p>
          </div>
        </div>
        <div class="chat-log" id="chatLog">
          ${state.chat.map((msg) => `<div class="chat-bubble ${msg.from}">${msg.text}</div>`).join("")}
        </div>
        <form class="field-grid compact" id="chatForm">
          <div class="field wide"><label>Soalan<input name="message" required placeholder="Contoh: bila latihan venue saya?"></label></div>
          <div class="field wide"><button class="button" type="submit"><i data-lucide="bot"></i>Tanya AssistAI</button></div>
        </form>
      </div>
    </section>
  `;
}

function renderAddons() {
  const list = filteredVolunteers({ search: "" });
  const lodging = list.filter((v) => v.lodging === "StaySmart").length;
  const verified = list.filter((v) => v.phoneVerified).length;
  const paid = list.filter((v) => v.payment === "Dibayar").length;
  const totalSponsor = state.sponsors.reduce((sum, sponsor) => sum + sponsor.value, 0);

  const addons = [
    ["StaySmart", "Tempahan penginapan", `${lodging} sukarelawan`, "hotel"],
    ["SponsorHub", "Vendor dan tajaan", formatMoney(totalSponsor), "handshake"],
    ["Rewards+", "Mata ganjaran", `${list.reduce((sum, v) => sum + v.rewards, 0)} mata`, "gift"],
    ["PayGate", "Pembayaran sukarelawan", `${paid}/${list.length} selesai`, "credit-card"],
    ["AdaSMS", "Verifikasi telefon", `${verified}/${list.length} sah`, "message-circle"],
    ["AssistAI", "Chatbot operasi", "24/7", "bot"],
    ["HelpDesk Pro", "Tiket dan live chat", `${state.complaints.length} tiket`, "headphones"],
    ["MWGateway", "Blast WhatsApp", `${state.broadcasts.length} kempen`, "send"]
  ];

  return `
    <section class="grid metrics">
      ${metricCard("Penginapan StaySmart", lodging, "bilik", "blue", [25, 35, 48, 57, 62, 70])}
      ${metricCard("Tajaan SponsorHub", formatMoney(totalSponsor), "nilai", "gold", [18, 28, 43, 55, 71, 86])}
      ${metricCard("Pembayaran PayGate", `${percentage(paid, list.length)}%`, "selesai", "green", [22, 34, 50, 66, 77, 84])}
      ${metricCard("AdaSMS disahkan", `${percentage(verified, list.length)}%`, "telefon", "violet", [35, 44, 59, 63, 70, 82])}
    </section>

    <section class="grid four-addon">
      ${addons
        .map((addon) => `
          <article class="addon">
            <div class="toolbar">
              <strong>${addon[0]}</strong>
              <i data-lucide="${addon[3]}"></i>
            </div>
            <p>${addon[1]}</p>
            <span class="tag ${addon[0] === "PayGate" || addon[0] === "AdaSMS" ? "green" : addon[0] === "SponsorHub" ? "gold" : "blue"}">${addon[2]}</span>
          </article>
        `)
        .join("")}
    </section>

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Vendor & Tajaan</h2>
          <p>Status pipeline SponsorHub.</p>
        </div>
        <button class="ghost-button" data-action="addSponsor"><i data-lucide="plus"></i>Tambah demo</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Vendor</th><th>Kategori</th><th>Status</th><th>Nilai</th></tr></thead>
          <tbody>
            ${state.sponsors
              .map((sponsor) => `
                <tr>
                  <td>${sponsor.name}</td>
                  <td>${sponsor.category}</td>
                  <td>${statusBadge(sponsor.status === "Disahkan" ? "Diluluskan" : "Semakan")}</td>
                  <td>${formatMoney(sponsor.value)}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderReports() {
  const list = filteredVolunteers();
  const approved = list.filter((v) => v.status === "Diluluskan");
  return `
    <section class="grid two">
      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Laporan Analitik</h2>
            <p>Eksport data untuk Jawatankuasa Induk, kluster, venue, dan unit.</p>
          </div>
          <div class="row-actions">
            <button class="button" data-action="exportCsv"><i data-lucide="download"></i>Eksport CSV</button>
            <button class="ghost-button" data-action="printReport"><i data-lucide="printer"></i>Cetak</button>
          </div>
        </div>
        <div class="bar-list">
          <div class="bar-row">
            <span>Diluluskan</span>
            <div class="progress"><span style="width:${percentage(approved.length, list.length)}%"></span></div>
            <strong>${approved.length}</strong>
          </div>
          <div class="bar-row">
            <span>Latihan lengkap</span>
            <div class="progress"><span style="width:${percentage(list.filter((v) => v.training >= 80).length, list.length)}%"></span></div>
            <strong>${list.filter((v) => v.training >= 80).length}</strong>
          </div>
          <div class="bar-row">
            <span>Kit lengkap</span>
            <div class="progress"><span style="width:${percentage(list.filter((v) => v.kit === "Lengkap").length, list.length)}%"></span></div>
            <strong>${list.filter((v) => v.kit === "Lengkap").length}</strong>
          </div>
          <div class="bar-row">
            <span>Sijil layak</span>
            <div class="progress"><span style="width:${percentage(list.filter((v) => v.attendance >= 3 && v.training >= 60).length, list.length)}%"></span></div>
            <strong>${list.filter((v) => v.attendance >= 3 && v.training >= 60).length}</strong>
          </div>
        </div>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Sijil Digital</h2>
            <p>Janakan sijil penyertaan berdasarkan kehadiran dan latihan.</p>
          </div>
        </div>
        <form class="field-grid compact" id="certificateForm">
          <div class="field wide"><label>Sukarelawan${volunteerSelectHtml("volunteerId", list)}</label></div>
          <div class="field wide"><button class="button" type="submit"><i data-lucide="award"></i>Jana sijil</button></div>
        </form>
        <div id="certificatePreview"></div>
      </div>
    </section>

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Ringkasan Jawatankuasa</h2>
          <p>Data ringkas untuk semakan harian.</p>
        </div>
      </div>
      ${volunteerTable(list, "reports")}
    </section>
  `;
}

function volunteerTable(list, mode = "default") {
  if (!list.length) return `<div class="empty">Tiada rekod untuk carian semasa.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Kluster</th>
            <th>Venue</th>
            <th>Unit</th>
            <th>Status</th>
            <th>${mode === "training" ? "Latihan" : mode === "kit" ? "Kit / Pas" : "Skor"}</th>
            <th>Tindakan</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map((v) => `
              <tr>
                <td>${v.id}</td>
                <td><strong>${v.name}</strong><br><span class="muted">${v.email}</span></td>
                <td>${v.cluster}</td>
                <td>${v.venue}</td>
                <td>${v.unit}</td>
                <td>${statusBadge(v.status)}</td>
                <td>
                  ${
                    mode === "training"
                      ? `<div class="progress"><span style="width:${v.training}%"></span></div><span class="muted">${v.training}% selesai</span>`
                      : mode === "kit"
                        ? `${statusBadge(v.kit)} ${statusBadge(v.accreditation)}`
                        : `<span class="tag ${v.screening >= 80 ? "green" : v.screening >= 60 ? "gold" : "red"}">${v.screening}</span>`
                  }
                </td>
                <td>
                  <div class="row-actions">
                    <button class="ghost-button" data-action="showPass" data-id="${v.id}"><i data-lucide="badge"></i>Pas</button>
                    <button class="ghost-button" data-action="quickApprove" data-id="${v.id}"><i data-lucide="check"></i>Lulus</button>
                  </div>
                </td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function compactVolunteerCard(v) {
  return `
    <article class="ticket">
      <div class="toolbar">
        <strong>${v.name}</strong>
        ${statusBadge(v.status)}
      </div>
      <p class="muted">${v.id} - ${v.venue}</p>
      <span class="tag blue">${v.unit}</span>
    </article>
  `;
}

function clusterSelectHtml(name, selected = "Kuala Lumpur") {
  return simpleSelectHtml(name, ["Kuala Lumpur", "Selangor", "Putrajaya", "Johor"], selected);
}

function venueSelectHtml(name, selected = "KL Sports City") {
  return simpleSelectHtml(
    name,
    ["KL Sports City", "KLCC", "Axiata Arena", "Bukit Jalil Stadium", "Merdeka Square", "MITEC", "National Aquatic Centre"],
    selected
  );
}

function unitSelectHtml(name, selected = "Venue Ops") {
  return simpleSelectHtml(
    name,
    ["Venue Ops", "Protokol", "Media", "Crowd Control", "Transport", "Accreditation", "Medical Support"],
    selected
  );
}

function statusSelectHtml(name, selected = "Permohonan") {
  return simpleSelectHtml(name, ["Permohonan", "Semakan", "Diluluskan", "Ditolak"], selected);
}

function simpleSelectHtml(name, values, selected = values[0]) {
  return `<select name="${name}">${values.map((value) => `<option ${value === selected ? "selected" : ""}>${value}</option>`).join("")}</select>`;
}

function volunteerSelectHtml(name, list) {
  return `<select name="${name}">${list.map((v) => `<option value="${v.id}">${v.id} - ${v.name}</option>`).join("")}</select>`;
}

function bindViewEvents() {
  app.querySelector("#volunteerForm")?.addEventListener("submit", addVolunteer);
  app.querySelector("#placementForm")?.addEventListener("submit", updatePlacement);
  app.querySelector("#kitForm")?.addEventListener("submit", updateKit);
  app.querySelector("#attendanceForm")?.addEventListener("submit", addAttendance);
  app.querySelector("#ticketForm")?.addEventListener("submit", addTicket);
  app.querySelector("#broadcastForm")?.addEventListener("submit", addBroadcast);
  app.querySelector("#chatForm")?.addEventListener("submit", sendChat);
  app.querySelector("#certificateForm")?.addEventListener("submit", generateCertificate);

  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", handleAction);
  });
}

function addVolunteer(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const nextNumber = Math.max(...state.volunteers.map((v) => Number(v.id.replace("V", ""))), 27000) + 1;
  const volunteer = {
    id: `V${nextNumber}`,
    name: form.get("name").trim(),
    email: form.get("email").trim(),
    phone: form.get("phone").trim(),
    age: Number(form.get("age")) || 18,
    cluster: form.get("cluster"),
    venue: form.get("venue"),
    unit: form.get("unit"),
    status: form.get("status"),
    screening: 50,
    training: 0,
    kit: "Belum agih",
    accreditation: "Belum",
    attendance: 0,
    rewards: 0,
    payment: "Belum diproses",
    lodging: "Tidak perlu",
    phoneVerified: false,
    gps: "3.139, 101.686"
  };
  state.volunteers.unshift(volunteer);
  pushActivity(`${volunteer.name} didaftarkan sebagai ${volunteer.unit}`, "blue");
  saveState();
  toast("Permohonan baharu telah ditambah.");
  render();
}

function updatePlacement(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteer(form.get("volunteerId"));
  if (!volunteer) return;
  volunteer.venue = form.get("venue");
  volunteer.unit = form.get("unit");
  volunteer.status = volunteer.status === "Permohonan" ? "Semakan" : volunteer.status;
  pushActivity(`${volunteer.name} ditempatkan di ${volunteer.venue}`, "green");
  saveState();
  toast("Penempatan dikemaskini.");
  render();
}

function updateKit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteer(form.get("volunteerId"));
  if (!volunteer) return;
  volunteer.kit = form.get("kit");
  volunteer.accreditation = form.get("accreditation");
  pushActivity(`Kit dan akreditasi ${volunteer.name} dikemaskini`, "green");
  saveState();
  toast("Status kit dan pas disimpan.");
  render();
}

function addAttendance(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteer(String(form.get("volunteerId")).trim().toUpperCase());
  if (!volunteer) {
    toast("ID sukarelawan tidak ditemui.");
    return;
  }
  volunteer.attendance += 1;
  volunteer.rewards += 50;
  state.attendanceLog.unshift({
    id: volunteer.id,
    name: volunteer.name,
    venue: form.get("venue") || volunteer.venue,
    time: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }),
    method: form.get("method")
  });
  pushActivity(`${volunteer.name} check-in di ${form.get("venue")}`, "green");
  saveState();
  toast("Kehadiran direkodkan.");
  render();
}

function addTicket(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const ticket = {
    id: `HD-${1200 + state.complaints.length + 1}`,
    volunteer: form.get("volunteer").trim(),
    issue: form.get("issue").trim(),
    channel: form.get("channel"),
    status: "Baharu",
    priority: form.get("priority")
  };
  state.complaints.unshift(ticket);
  pushActivity(`${ticket.id} dibuka melalui ${ticket.channel}`, "gold");
  saveState();
  toast("Tiket sokongan dibuka.");
  render();
}

function addBroadcast(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.broadcasts.unshift({
    target: form.get("target"),
    text: form.get("text").trim(),
    sent: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })
  });
  pushActivity(`MWGateway menghantar mesej ke ${form.get("target")}`, "blue");
  saveState();
  toast("Mesej blast direkodkan.");
  render();
}

function sendChat(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = form.get("message").trim();
  state.chat.push({ from: "user", text: message });
  state.chat.push({ from: "bot", text: assistReply(message) });
  saveState();
  render();
}

function generateCertificate(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteer(form.get("volunteerId"));
  const eligible = volunteer.attendance >= 3 && volunteer.training >= 60;
  const preview = app.querySelector("#certificatePreview");
  preview.innerHTML = `
    <article class="identity-pass" style="margin-top:14px; width:100%;">
      <div class="pass-photo"><i data-lucide="award"></i></div>
      <div class="pass-meta">
        <strong>Sijil Digital Sukarelawan</strong>
        <span>${volunteer.name}</span>
        <span class="muted">${volunteer.id} - ${volunteer.unit} - ${volunteer.venue}</span>
        <span class="tag ${eligible ? "green" : "gold"}">${eligible ? "Layak dijana" : "Belum cukup syarat"}</span>
      </div>
    </article>
  `;
  window.lucide?.createIcons();
}

function handleAction(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const id = button.dataset.id;
  const volunteer = id ? findVolunteer(id) : null;

  if (action === "go") setView(button.dataset.view);
  if (action === "screenDecision" && volunteer) updateVolunteerStatus(volunteer, button.dataset.status);
  if (action === "quickApprove" && volunteer) updateVolunteerStatus(volunteer, "Diluluskan");
  if (action === "showPass" && volunteer) showPass(volunteer);
  if (action === "autoScore") autoScore();
  if (action === "approveHigh") approveHigh();
  if (action === "balancePlacement") balancePlacement();
  if (action === "completeTraining") completeTraining();
  if (action === "completeKit") completeKit();
  if (action === "syncGps") syncGps();
  if (action === "closeTicket") closeTicket(id);
  if (action === "exportCsv") exportCsv();
  if (action === "resetDemo") resetDemo();
  if (action === "addActivity") {
    pushActivity("Dashboard disegarkan oleh " + state.role, "blue");
    saveState();
    render();
  }
  if (action === "addShift") {
    state.shifts.push({ day: "Ahad", venue: "KL Sports City", unit: "Venue Ops", time: "08:00-16:00", needed: 100, assigned: 76 });
    pushActivity("Syif Ahad ditambah untuk KL Sports City", "gold");
    saveState();
    render();
  }
  if (action === "addSponsor") {
    state.sponsors.unshift({ name: "TechOps MY", category: "Peralatan ICT", status: "Rundingan", value: 36000 });
    saveState();
    toast("Sponsor demo ditambah.");
    render();
  }
  if (action === "printReport") window.print();
}

function updateVolunteerStatus(volunteer, status) {
  volunteer.status = status;
  if (status === "Diluluskan" && volunteer.accreditation === "Belum") volunteer.accreditation = "Draf";
  pushActivity(`${volunteer.name} ditanda ${status}`, status === "Ditolak" ? "gold" : "green");
  saveState();
  toast(`Status ${volunteer.name} dikemaskini.`);
  render();
}

function autoScore() {
  state.volunteers.forEach((v) => {
    const ageScore = v.age >= 21 && v.age <= 35 ? 18 : 10;
    const phoneScore = v.phoneVerified ? 18 : 4;
    const trainingScore = Math.round(v.training * 0.32);
    const attendanceScore = Math.min(12, v.attendance * 2);
    const unitScore = ["Medical Support", "Accreditation", "Protokol"].includes(v.unit) ? 12 : 9;
    v.screening = Math.min(98, ageScore + phoneScore + trainingScore + attendanceScore + unitScore + 22);
  });
  pushActivity("Skor saringan dikira semula", "blue");
  saveState();
  toast("Skor saringan telah dikemaskini.");
  render();
}

function approveHigh() {
  let total = 0;
  state.volunteers.forEach((v) => {
    if (v.screening >= 80 && v.status !== "Ditolak") {
      v.status = "Diluluskan";
      if (v.accreditation === "Belum") v.accreditation = "Draf";
      total += 1;
    }
  });
  pushActivity(`${total} sukarelawan skor tinggi diluluskan`, "green");
  saveState();
  toast(`${total} rekod diluluskan.`);
  render();
}

function balancePlacement() {
  const candidates = state.volunteers.filter((v) => v.status === "Diluluskan");
  const units = ["Venue Ops", "Protokol", "Media", "Crowd Control", "Transport", "Accreditation", "Medical Support"];
  candidates.forEach((v, index) => {
    if (v.unit === "Venue Ops" && index % 3 === 0) v.unit = units[index % units.length];
  });
  pushActivity("Cadangan imbangan unit dijana", "blue");
  saveState();
  toast("Penempatan diseimbangkan secara demo.");
  render();
}

function completeTraining() {
  filteredVolunteers().forEach((v) => {
    if (v.status === "Diluluskan") v.training = Math.max(v.training, 80);
  });
  pushActivity("Latihan sukarelawan diluluskan dikemaskini", "green");
  saveState();
  toast("Latihan ditandakan selesai untuk sukarelawan diluluskan.");
  render();
}

function completeKit() {
  filteredVolunteers().forEach((v) => {
    if (v.status === "Diluluskan") {
      v.kit = "Lengkap";
      v.accreditation = "Aktif";
    }
  });
  pushActivity("Kit dan akreditasi sukarelawan diluluskan dilengkapkan", "green");
  saveState();
  toast("Kit dan pas dilengkapkan untuk sukarelawan diluluskan.");
  render();
}

function syncGps() {
  state.volunteers.forEach((v, index) => {
    const lat = (3.05 + index * 0.011).toFixed(3);
    const lng = (101.68 + index * 0.004).toFixed(3);
    v.gps = `${lat}, ${lng}`;
  });
  pushActivity("Koordinat GPS sukarelawan disinkronkan", "blue");
  saveState();
  toast("Data GPS disinkronkan.");
  render();
}

function closeTicket(id) {
  const ticket = state.complaints.find((item) => item.id === id);
  if (!ticket) return;
  ticket.status = "Selesai";
  pushActivity(`${ticket.id} ditutup oleh HelpDesk Pro`, "green");
  saveState();
  toast("Tiket ditutup.");
  render();
}

function exportCsv() {
  if (API_ENABLED) {
    window.location.href = "/api/export.csv";
    return;
  }

  const headers = ["id", "name", "email", "cluster", "venue", "unit", "status", "screening", "training", "kit", "accreditation", "attendance", "rewards", "payment"];
  const rows = [headers.join(",")].concat(
    filteredVolunteers({ search: "" }).map((v) => headers.map((key) => `"${String(v[key]).replaceAll('"', '""')}"`).join(","))
  );
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sistem-sukarelawan-2026.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function resetDemo() {
  state = structuredClone(seed);
  saveState();
  toast("Data demo dipulihkan.");
  render();
}

function showPass(volunteer) {
  modalBody.innerHTML = `
    <article class="identity-pass">
      <div class="pass-photo">${initials(volunteer.name)}</div>
      <div class="pass-meta">
        <strong>${volunteer.name}</strong>
        <span>${volunteer.id}</span>
        <span>${volunteer.cluster}</span>
        <span>${volunteer.venue}</span>
        <span>${volunteer.unit}</span>
        ${statusBadge(volunteer.accreditation)}
      </div>
    </article>
    <div style="display:flex; gap:16px; align-items:center; margin-top:16px;">
      <div class="qr-box" aria-label="QR demo">${Array.from({ length: 25 }, () => "<span></span>").join("")}</div>
      <div>
        <strong>Token QR</strong>
        <p class="muted">${volunteer.id}-${volunteer.phone.slice(-4)}-${volunteer.unit.replaceAll(" ", "").toUpperCase()}</p>
      </div>
    </div>
  `;
  passModal.showModal();
  window.lucide?.createIcons();
}

function assistReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("jadual") || lower.includes("syif")) {
    return "Jadual syif boleh disemak di modul Jadual & Latihan. Ketua Unit boleh kemaskini kekuatan syif mengikut venue.";
  }
  if (lower.includes("kit") || lower.includes("akreditasi")) {
    return "Status kit dan pas boleh disemak di modul Kit & Akreditasi. Pas aktif memerlukan status Diluluskan.";
  }
  if (lower.includes("bayar") || lower.includes("pay")) {
    return "PayGate menyimpan status pembayaran. Rekod menunggu akaun perlu dilengkapkan sebelum proses bayaran.";
  }
  return "Permintaan direkodkan. Untuk isu operasi, HelpDesk Pro boleh membuka tiket dan mengagihkan tindakan kepada admin berkaitan.";
}

function findVolunteer(id) {
  return state.volunteers.find((v) => v.id.toUpperCase() === String(id).toUpperCase());
}

function pushActivity(text, type = "blue") {
  state.activity.unshift({
    time: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }),
    text,
    type
  });
  state.activity = state.activity.slice(0, 6);
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 2600);
}

navList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  sidebar.classList.remove("open");
  setView(button.dataset.view);
});

roleSelect.addEventListener("change", (event) => {
  state.role = event.target.value;
  saveState();
  render();
});

clusterSelect.addEventListener("change", (event) => {
  state.cluster = event.target.value;
  saveState();
  render();
});

globalSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  saveState();
  render();
});

document.querySelector("#menuToggle").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.querySelector("#closeModal").addEventListener("click", () => {
  passModal.close();
});

async function initApp() {
  state = loadLocalState();
  render();

  if (new URLSearchParams(window.location.search).get("smoke") === "1") {
    runSmokeTest();
    return;
  }

  if (API_ENABLED) {
    state = await loadState();
    render();
  }
}

initApp();

function runSmokeTest() {
  const original = structuredClone(state);
  const results = [];
  suppressSave = true;

  try {
    setView("applications");
    const volunteerForm = app.querySelector("#volunteerForm");
    volunteerForm.elements.name.value = "Smoke Test Volunteer";
    volunteerForm.elements.email.value = "smoke@example.com";
    volunteerForm.elements.phone.value = "60129990000";
    volunteerForm.elements.age.value = "25";
    volunteerForm.elements.cluster.value = "Kuala Lumpur";
    volunteerForm.elements.venue.value = "KL Sports City";
    volunteerForm.elements.unit.value = "Venue Ops";
    volunteerForm.elements.status.value = "Permohonan";
    volunteerForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    const created = state.volunteers.find((volunteer) => volunteer.email === "smoke@example.com");
    results.push(["add-volunteer", Boolean(created)]);

    setView("attendance");
    const attendanceForm = app.querySelector("#attendanceForm");
    attendanceForm.elements.volunteerId.value = created?.id || "V27001";
    attendanceForm.elements.method.value = "QR";
    attendanceForm.elements.venue.value = "KL Sports City";
    attendanceForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    results.push(["attendance", Boolean(created && created.attendance >= 1)]);

    setView("screening");
    const approveButton = app.querySelector('[data-action="approveHigh"]');
    approveButton.click();
    results.push(["screening-action", state.activity.some((item) => item.text.includes("skor tinggi"))]);

    const ok = results.every(([, passed]) => passed);
    state = original;
    state.view = "overview";
    render();
    document.body.dataset.smoke = ok ? "ok" : "fail";
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div id="smoke-result">${ok ? "SMOKE_OK" : "SMOKE_FAIL"} ${results.map(([name, passed]) => `${name}:${passed ? "ok" : "fail"}`).join(" ")}</div>`
    );
  } catch (error) {
    state = original;
    state.view = "overview";
    render();
    document.body.dataset.smoke = "fail";
    document.body.insertAdjacentHTML("beforeend", `<div id="smoke-result">SMOKE_FAIL ${escapeHtml(error.message)}</div>`);
  } finally {
    suppressSave = false;
  }
}
