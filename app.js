const appShell = document.querySelector("#appShell");
const authRoot = document.querySelector("#authRoot");
const app = document.querySelector("#app");
const navList = document.querySelector("#navList");
const roleDisplay = document.querySelector("#roleDisplay");
const clusterSelect = document.querySelector("#clusterSelect");
const globalSearch = document.querySelector("#globalSearch");
const viewTitle = document.querySelector("#viewTitle");
const viewKicker = document.querySelector("#viewKicker");
const passModal = document.querySelector("#passModal");
const modalBody = document.querySelector("#modalBody");
const sidebar = document.querySelector(".sidebar");
const logoutButton = document.querySelector("#logoutButton");

const DEMO_MODE = window.SukarelawanSupabase?.DEMO_MODE === true;

const state = {
  user: null,
  profile: null,
  role: "-",
  cluster: "Semua",
  search: "",
  view: "overview",
  loading: false,
  error: "",
  volunteers: [],
  users: [],
  attendanceLog: [],
  complaints: [],
  broadcasts: [],
  userFilters: {
    search: "",
    role: "Semua",
    status: "Semua",
    cluster: "Semua",
    venue: "Semua",
    unit: "Semua"
  },
  activity: [
    { time: "08:10", text: "Sistem production-ready dimuatkan dengan Supabase", type: "green" },
    { time: "09:35", text: "Role pengguna dibaca daripada profiles.role", type: "blue" },
    { time: "10:05", text: "RLS mengawal akses data di database", type: "gold" }
  ],
  chat: [{ from: "bot", text: "AssistAI sedia membantu semakan jadual, latihan, kit, dan sokongan." }],
  sponsors: [
    { name: "MetroCare", category: "Perubatan", status: "Disahkan", value: 45000 },
    { name: "MoveKL", category: "Pengangkutan", status: "Rundingan", value: 72000 },
    { name: "HydraPlus", category: "Minuman", status: "Draf MoU", value: 28000 }
  ],
  shifts: [
    { day: "Isnin", venue: "KL Sports City", unit: "Venue Ops", time: "07:00-15:00", needed: 160, assigned: 148 },
    { day: "Isnin", venue: "KLCC", unit: "Protokol", time: "09:00-17:00", needed: 90, assigned: 88 },
    { day: "Selasa", venue: "Axiata Arena", unit: "Media", time: "08:00-16:00", needed: 70, assigned: 63 },
    { day: "Rabu", venue: "Bukit Jalil Stadium", unit: "Crowd Control", time: "14:00-22:00", needed: 210, assigned: 192 },
    { day: "Khamis", venue: "Merdeka Square", unit: "Transport", time: "06:00-14:00", needed: 120, assigned: 105 },
    { day: "Jumaat", venue: "MITEC", unit: "Accreditation", time: "10:00-18:00", needed: 80, assigned: 80 },
    { day: "Sabtu", venue: "National Aquatic Centre", unit: "Medical Support", time: "07:00-15:00", needed: 55, assigned: 52 }
  ]
};

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
  reports: { title: "Sijil & Laporan", kicker: "Analitik, eksport, dan sijil digital" },
  users: { title: "Pengurusan Pengguna", kicker: "Kelulusan akses dan skop pengguna" }
};

const statusClass = {
  Diluluskan: "approved",
  Semakan: "review",
  Permohonan: "pending",
  Ditolak: "rejected",
  "Menunggu Kelulusan": "pending",
  Pending: "pending",
  Lengkap: "done",
  Aktif: "done",
  Digantung: "risk",
  Draf: "review",
  Belum: "pending",
  "Belum lengkap": "pending",
  "Belum agih": "pending",
  Sebahagian: "review",
  Dibayar: "done",
  Diproses: "review",
  "Belum diproses": "pending",
  "Menunggu akaun": "risk",
  Selesai: "done",
  Baharu: "pending",
  "Dalam tindakan": "review"
};

const rolePermissions = {
  "Admin Induk": new Set(["createVolunteer", "approve", "screening", "placement", "training", "kit", "attendance", "support", "broadcast", "export", "manageUsers"]),
  "Admin Kluster": new Set(["createVolunteer", "approve", "screening", "placement", "training", "kit", "attendance", "support", "broadcast", "export"]),
  "Admin Venue": new Set(["placement", "training", "kit", "attendance", "support", "broadcast", "export"]),
  "Ketua Unit": new Set(["training", "attendance", "support", "export"]),
  Sukarelawan: new Set(["createVolunteer", "support"])
};

function can(action) {
  return rolePermissions[state.role]?.has(action) || false;
}

function setView(view) {
  state.view = view;
  render();
}

function scopeCluster() {
  if (state.role === "Admin Induk") return state.cluster || "Semua";
  return state.profile?.cluster || "Semua";
}

function filteredVolunteers(options = {}, source = state.volunteers) {
  const search = (options.search ?? state.search).trim().toLowerCase();
  const cluster = options.cluster ?? scopeCluster();
  return source.filter((volunteer) => {
    const matchesCluster = cluster === "Semua" || volunteer.cluster === cluster;
    const haystack = [volunteer.id, volunteer.name, volunteer.email, volunteer.phone, volunteer.venue, volunteer.unit, volunteer.status]
      .join(" ")
      .toLowerCase();
    return matchesCluster && (!search || haystack.includes(search));
  });
}

function filteredUsers(source = state.users) {
  const filters = state.userFilters;
  const search = String(filters.search || "").trim().toLowerCase();

  return source.filter((user) => {
    const haystack = [user.full_name, user.email, user.phone].join(" ").toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesRole = filters.role === "Semua" || user.role === filters.role;
    const matchesStatus = filters.status === "Semua" || user.status === filters.status;
    const matchesCluster = filters.cluster === "Semua" || (user.cluster || "") === filters.cluster;
    const matchesVenue = filters.venue === "Semua" || (user.venue || "") === filters.venue;
    const matchesUnit = filters.unit === "Semua" || (user.unit || "") === filters.unit;
    return matchesSearch && matchesRole && matchesStatus && matchesCluster && matchesVenue && matchesUnit;
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
  return `<span class="status ${statusClass[value] || "info"}">${escapeHtml(value || "-")}</span>`;
}

function initials(name) {
  return String(name || "-")
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
  return String(value ?? "")
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
        <span>${escapeHtml(label)}</span>
        <span class="tag ${color}">${escapeHtml(foot)}</span>
      </div>
      <div class="metric-value">${escapeHtml(value)}</div>
      <div class="sparkline" aria-hidden="true">${bars}</div>
    </article>
  `;
}

function renderAuth(mode = "login", message = "") {
  appShell.hidden = true;
  authRoot.hidden = false;

  if (!window.SukarelawanSupabase?.isConfigured()) {
    authRoot.innerHTML = `
      <section class="auth-card">
        <div class="brand auth-brand">
          <div class="brand-mark">S</div>
          <div>
            <strong>Sistem Sukarelawan</strong>
            <span>2026</span>
          </div>
        </div>
        <div class="alert">
          <strong>Konfigurasi Supabase diperlukan</strong>
          <p>Isi <code>supabase-config.js</code> dengan Project URL dan anon public key Supabase. Production default menggunakan database pusat.</p>
        </div>
        <pre class="code-block">window.SUKARELAWAN_SUPABASE_CONFIG = {
  url: "https://PROJECT_REF.supabase.co",
  anonKey: "SUPABASE_ANON_PUBLIC_KEY"
};</pre>
      </section>
    `;
    window.lucide?.createIcons();
    return;
  }

  const isRegister = mode === "register";
  authRoot.innerHTML = `
    <section class="auth-card">
      <div class="brand auth-brand">
        <div class="brand-mark">S</div>
        <div>
          <strong>Sistem Sukarelawan</strong>
          <span>2026</span>
        </div>
      </div>
      <div class="auth-tabs">
        <button class="${!isRegister ? "active" : ""}" data-auth-mode="login">Login</button>
        <button class="${isRegister ? "active" : ""}" data-auth-mode="register">Register</button>
      </div>
      ${message ? `<div class="alert ${message.includes("berjaya") ? "success" : ""}">${escapeHtml(message)}</div>` : ""}
      <form class="auth-form" id="${isRegister ? "registerForm" : "loginForm"}">
        ${
          isRegister
            ? `
              <label>Nama penuh<input name="fullName" required autocomplete="name"></label>
              <label>No telefon<input name="phone" required inputmode="tel" autocomplete="tel"></label>
            `
            : ""
        }
        <label>Emel<input name="email" type="email" required autocomplete="email"></label>
        <label>Kata laluan<input name="password" type="password" required minlength="8" autocomplete="${isRegister ? "new-password" : "current-password"}"></label>
        ${isRegister ? `<p class="muted">Akaun baharu akan didaftarkan sebagai Sukarelawan dan menunggu kelulusan Admin Induk.</p>` : ""}
        <button class="button" type="submit"><i data-lucide="${isRegister ? "user-plus" : "log-in"}"></i>${isRegister ? "Register" : "Login"}</button>
      </form>
    </section>
  `;
  bindAuthEvents();
  window.lucide?.createIcons();
}

function accountStatusMessage(status) {
  if (status === "Menunggu Kelulusan") return "Akaun anda sedang menunggu kelulusan admin.";
  if (status === "Digantung") return "Akaun anda telah digantung. Sila hubungi urusetia.";
  if (status === "Ditolak") return "Pendaftaran anda tidak diluluskan.";
  return "Akses ke sistem tidak dibenarkan buat masa ini.";
}

function renderBlockedAccount(profile) {
  appShell.hidden = true;
  authRoot.hidden = false;
  state.volunteers = [];
  state.users = [];
  state.attendanceLog = [];
  state.complaints = [];
  state.broadcasts = [];

  authRoot.innerHTML = `
    <section class="auth-card">
      <div class="brand auth-brand">
        <div class="brand-mark">S</div>
        <div>
          <strong>Sistem Sukarelawan</strong>
          <span>2026</span>
        </div>
      </div>
      <div class="alert">
        <strong>Status akaun: ${escapeHtml(profile.status || "-")}</strong>
        <p>${escapeHtml(accountStatusMessage(profile.status))}</p>
      </div>
      <div class="surface blocked-account">
        <div>
          <span class="muted">Nama</span>
          <strong>${escapeHtml(profile.full_name || "-")}</strong>
        </div>
        <div>
          <span class="muted">Emel</span>
          <strong>${escapeHtml(profile.email || state.user?.email || "-")}</strong>
        </div>
        <div>
          <span class="muted">Status semasa</span>
          <div>${statusBadge(profile.status || "-")}</div>
        </div>
      </div>
      <button class="button" type="button" id="blockedLogoutButton"><i data-lucide="log-out"></i>Logout</button>
    </section>
  `;

  authRoot.querySelector("#blockedLogoutButton")?.addEventListener("click", async () => {
    try {
      await window.AuthService.signOut();
    } finally {
      state.user = null;
      state.profile = null;
      renderAuth("login", "Logout berjaya.");
    }
  });

  window.lucide?.createIcons();
}

function bindAuthEvents() {
  authRoot.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => renderAuth(button.dataset.authMode));
  });

  authRoot.querySelector("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAuthAction(async () => {
      await window.AuthService.signIn(form.get("email"), form.get("password"));
      await loadAuthenticatedApp();
    });
  });

  authRoot.querySelector("#registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAuthAction(async () => {
      const result = await window.AuthService.signUp({
        fullName: form.get("fullName"),
        phone: form.get("phone"),
        email: form.get("email"),
        password: form.get("password")
      });
      if (result.session) {
        await loadAuthenticatedApp();
      } else {
        renderAuth("login", "Pendaftaran berjaya. Akaun anda didaftarkan sebagai Sukarelawan dan menunggu kelulusan admin.");
      }
    });
  });
}

async function runAuthAction(action) {
  try {
    await action();
  } catch (error) {
    renderAuth(authRoot.querySelector("#registerForm") ? "register" : "login", error.message);
  }
}

function getAuthRedirectParams() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const keys = ["access_token", "refresh_token", "type", "error", "error_description"];
  const hasAuthParams = keys.some((key) => hash.has(key) || query.has(key));
  if (!hasAuthParams) return null;

  return {
    accessToken: hash.get("access_token") || query.get("access_token") || "",
    refreshToken: hash.get("refresh_token") || query.get("refresh_token") || "",
    error: hash.get("error") || query.get("error") || "",
    errorDescription: hash.get("error_description") || query.get("error_description") || "",
    type: hash.get("type") || query.get("type") || ""
  };
}

function cleanAuthRedirectUrl() {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

async function handleAuthRedirect() {
  const redirect = getAuthRedirectParams();
  if (!redirect) return false;

  if (redirect.error) {
    cleanAuthRedirectUrl();
    renderAuth("login", redirect.errorDescription || redirect.error);
    return true;
  }

  if (!redirect.accessToken || !redirect.refreshToken) {
    cleanAuthRedirectUrl();
    renderAuth("login", "Emel berjaya disahkan. Sila login.");
    return true;
  }

  try {
    const session = await window.AuthService.getSession();
    cleanAuthRedirectUrl();
    if (session) {
      await loadAuthenticatedApp();
      return true;
    }
  } catch (error) {
    cleanAuthRedirectUrl();
    renderAuth("login", error.message);
    return true;
  }

  cleanAuthRedirectUrl();
  renderAuth("login", "Emel berjaya disahkan. Sila login.");
  return true;
}

async function loadAuthenticatedApp() {
  if (!window.SukarelawanSupabase?.isConfigured()) {
    renderAuth("login");
    return;
  }

  const session = await window.AuthService.getSession();
  if (!session) {
    renderAuth("login");
    return;
  }

  state.user = session.user;
  state.profile = await window.AuthService.loadProfile(session.user);
  state.role = state.profile.role || "Sukarelawan";
  state.cluster = state.role === "Admin Induk" ? "Semua" : state.profile.cluster || "Semua";
  if (state.profile.status !== "Aktif") {
    renderBlockedAccount(state.profile);
    return;
  }
  if (state.view === "users" && !can("manageUsers")) {
    state.view = "overview";
  }
  authRoot.hidden = true;
  appShell.hidden = false;
  await refreshData({ renderAfter: false });
  pushActivity(`${state.profile.full_name || state.user.email} login sebagai ${state.role}`, "blue");
  render();
}

async function refreshData({ renderAfter = true } = {}) {
  state.loading = true;
  state.error = "";
  if (renderAfter) render();

  try {
    const data = await window.VolunteerService.loadOperationalData();
    state.volunteers = data.volunteers;
    state.attendanceLog = data.attendanceLog;
    state.complaints = data.complaints;
    state.broadcasts = data.broadcasts;
    state.users = can("manageUsers") ? await window.ProfileService.listProfiles() : [];
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    if (renderAfter) render();
  }
}

function render() {
  if (appShell.hidden) return;

  const view = views[state.view] || views.overview;
  viewTitle.textContent = view.title;
  viewKicker.textContent = view.kicker;
  roleDisplay.value = state.role;
  document.querySelector("#usersNavItem")?.toggleAttribute("hidden", !can("manageUsers"));
  clusterSelect.value = state.role === "Admin Induk" ? state.cluster : state.profile?.cluster || "Semua";
  clusterSelect.disabled = state.role !== "Admin Induk";
  globalSearch.value = state.view === "users" ? state.userFilters.search : state.search;

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
    reports: renderReports,
    users: renderUsers
  }[state.view];

  app.innerHTML = `${renderSystemState()}${renderer ? renderer() : renderOverview()}`;
  bindViewEvents();
  window.lucide?.createIcons();
}

function renderSystemState() {
  if (state.loading) return `<div class="loading-banner"><i data-lucide="loader"></i>Memuat data Supabase...</div>`;
  if (state.error) return `<div class="alert">${escapeHtml(state.error)}</div>`;
  return "";
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
      ${metricCard("Sukarelawan berdaftar", list.length.toLocaleString("ms-MY"), scopeCluster() === "Semua" ? "Semua skop" : scopeCluster(), "blue", [35, 46, 61, 72, 80, 92])}
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
          <span class="pill">RLS aktif</span>
        </div>
        <div class="bar-list">
          ${
            Object.entries(venueCounts)
              .map(([venue, total]) => `
                <div class="bar-row">
                  <span>${escapeHtml(venue)}</span>
                  <div class="progress"><span style="width:${percentage(total, maxVenue)}%"></span></div>
                  <strong>${total}</strong>
                </div>
              `)
              .join("") || `<div class="empty">Tiada rekod dalam skop ini.</div>`
          }
        </div>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Kesediaan Operasi</h2>
            <p>Status latihan, kit, dan akreditasi untuk hari operasi.</p>
          </div>
          <span class="pill">${escapeHtml(state.role)}</span>
        </div>
        <div class="bar-list">
          <div class="bar-row"><span>Latihan</span><div class="progress"><span style="width:${trainingAvg}%"></span></div><strong>${trainingAvg}%</strong></div>
          <div class="bar-row"><span>Kit lengkap</span><div class="progress"><span style="width:${percentage(kitComplete, list.length)}%"></span></div><strong>${percentage(kitComplete, list.length)}%</strong></div>
          <div class="bar-row"><span>Pas aktif</span><div class="progress"><span style="width:${percentage(activePass, list.length)}%"></span></div><strong>${percentage(activePass, list.length)}%</strong></div>
          <div class="bar-row"><span>Telefon</span><div class="progress"><span style="width:${percentage(list.filter((v) => v.phoneVerified).length, list.length)}%"></span></div><strong>${percentage(list.filter((v) => v.phoneVerified).length, list.length)}%</strong></div>
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
          ${
            Object.entries(venueCounts)
              .slice(0, 6)
              .map(([venue, total], index) => `
                <div class="map-zone">
                  <div>
                    <strong>${escapeHtml(venue)}</strong>
                    <span class="muted">${total} sukarelawan</span>
                  </div>
                  <div class="progress"><span style="width:${Math.max(28, percentage(total, maxVenue))}%"></span></div>
                  <span class="tag ${index % 2 ? "gold" : "green"}">${index % 2 ? "Pantau" : "Stabil"}</span>
                </div>
              `)
              .join("") || `<div class="empty">Tiada venue dipaparkan.</div>`
          }
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
                  <strong>${escapeHtml(item.time)}</strong>
                  <span class="tag ${item.type}">${item.type === "green" ? "Selesai" : item.type === "gold" ? "Pantau" : "Info"}</span>
                </div>
                <p>${escapeHtml(item.text)}</p>
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
  const canEdit = can("createVolunteer");
  const ownVolunteer = state.volunteers.find((volunteer) => volunteer.profile_id === state.user?.id);
  const selectedCluster = state.role === "Admin Induk" ? state.cluster === "Semua" ? "Kuala Lumpur" : state.cluster : state.profile?.cluster || ownVolunteer?.cluster || "Kuala Lumpur";

  return `
    ${
      canEdit
        ? `
          <section class="surface">
            <div class="surface-head">
              <div>
                <h2>${state.role === "Sukarelawan" ? "Profil / Permohonan Saya" : "Daftar Sukarelawan"}</h2>
                <p>Data asas, pilihan venue, dan unit tugasan.</p>
              </div>
              <span class="pill">${ownVolunteer && state.role === "Sukarelawan" ? "Kemas kini" : "Rekod baharu"}</span>
            </div>
            <form class="field-grid" id="volunteerForm">
              <div class="field"><label>Nama<input name="name" required placeholder="Nama penuh" value="${escapeHtml(ownVolunteer?.name || state.profile?.full_name || "")}"></label></div>
              <div class="field"><label>Emel<input name="email" type="email" required placeholder="nama@email.com" value="${escapeHtml(ownVolunteer?.email || state.profile?.email || state.user?.email || "")}"></label></div>
              <div class="field"><label>No telefon<input name="phone" required placeholder="60123456789" value="${escapeHtml(ownVolunteer?.phone || state.profile?.phone || "")}"></label></div>
              <div class="field"><label>Umur<input name="age" type="number" min="18" max="80" value="${escapeHtml(ownVolunteer?.age || 21)}"></label></div>
              <div class="field"><label>Kluster${clusterSelectHtml("cluster", ownVolunteer?.cluster || selectedCluster)}</label></div>
              <div class="field"><label>Venue${venueSelectHtml("venue", ownVolunteer?.venue || "KL Sports City")}</label></div>
              <div class="field"><label>Unit${unitSelectHtml("unit", ownVolunteer?.unit || "Venue Ops")}</label></div>
              ${
                can("approve")
                  ? `<div class="field"><label>Status${statusSelectHtml("status", ownVolunteer?.status || "Permohonan")}</label></div>`
                  : `<input type="hidden" name="status" value="${escapeHtml(ownVolunteer?.status || "Permohonan")}">`
              }
              <div class="field wide">
                <button class="button" type="submit"><i data-lucide="user-plus"></i>${ownVolunteer && state.role === "Sukarelawan" ? "Kemas kini profil" : "Tambah permohonan"}</button>
              </div>
            </form>
          </section>
        `
        : ""
    }

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Pangkalan Data Sukarelawan</h2>
          <p>Carian global di atas menapis rekod dalam skop role semasa.</p>
        </div>
        <div class="row-actions">
          <span class="pill">${list.length} rekod dipapar</span>
          ${can("export") ? `<button class="ghost-button" data-action="exportCsv"><i data-lucide="download"></i>CSV</button>` : ""}
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
        <p class="muted">Skor mengambil kira umur, verifikasi telefon, latihan, dan kesesuaian unit.</p>
      </div>
      ${
        can("screening")
          ? `<div class="actions">
              <button class="button" data-action="autoScore"><i data-lucide="wand-2"></i>Kira skor</button>
              ${can("approve") ? `<button class="ghost-button" data-action="approveHigh"><i data-lucide="check-check"></i>Lulus skor tinggi</button>` : ""}
            </div>`
          : ""
      }
    </section>

    <section class="grid three">
      ${list
        .map((v) => `
          <article class="work-card screen-card">
            <div class="score-ring" style="--score:${v.screening}">${v.screening}</div>
            <div>
              <div class="toolbar">
                <strong>${escapeHtml(v.name)}</strong>
                ${statusBadge(v.status)}
              </div>
              <p class="muted">${escapeHtml(v.id)} - ${escapeHtml(v.unit)} - ${escapeHtml(v.venue)}</p>
              <div class="bar-list">
                <div class="bar-row"><span>Latihan</span><div class="progress"><span style="width:${v.training}%"></span></div><strong>${v.training}%</strong></div>
                <div class="bar-row"><span>Telefon</span><div class="progress"><span style="width:${v.phoneVerified ? 100 : 0}%"></span></div><strong>${v.phoneVerified ? "OK" : "Belum"}</strong></div>
              </div>
              ${
                can("approve")
                  ? `<div class="card-actions">
                      <button class="ghost-button" data-action="screenDecision" data-id="${v.id}" data-status="Diluluskan"><i data-lucide="check"></i>Lulus</button>
                      <button class="danger-button" data-action="screenDecision" data-id="${v.id}" data-status="Ditolak"><i data-lucide="x"></i>Tolak</button>
                    </div>`
                  : ""
              }
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
      ${
        can("placement")
          ? `<div class="surface">
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
            </div>`
          : `<div class="surface"><div class="empty">Penempatan dikawal oleh admin yang dibenarkan.</div></div>`
      }

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Keperluan Unit</h2>
            <p>Ringkasan kekuatan unit untuk tindakan operasi.</p>
          </div>
          ${DEMO_MODE ? `<button class="ghost-button" data-action="balancePlacement"><i data-lucide="shuffle"></i>Imbang</button>` : ""}
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
      <div class="kanban-column"><h2>Menunggu</h2>${pending.map(compactVolunteerCard).join("") || `<p class="muted">Tiada rekod.</p>`}</div>
      <div class="kanban-column"><h2>Ditempatkan</h2>${approved.filter((v) => v.accreditation !== "Aktif").map(compactVolunteerCard).join("") || `<p class="muted">Tiada rekod.</p>`}</div>
      <div class="kanban-column"><h2>Sedia Operasi</h2>${approved.filter((v) => v.accreditation === "Aktif").map(compactVolunteerCard).join("") || `<p class="muted">Tiada rekod.</p>`}</div>
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
                      ${escapeHtml(shift.venue)}
                      <small>${escapeHtml(shift.unit)}: ${shift.assigned}/${shift.needed}</small>
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
        ${can("training") ? `<button class="button" data-action="completeTraining"><i data-lucide="graduation-cap"></i>Tandakan selesai</button>` : ""}
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
          ${can("kit") ? `<button class="button" data-action="completeKit"><i data-lucide="package-check"></i>Lengkapkan dipilih</button>` : ""}
        </div>
        ${
          can("kit")
            ? `<form class="field-grid compact" id="kitForm">
                <div class="field"><label>Sukarelawan${volunteerSelectHtml("volunteerId", list)}</label></div>
                <div class="field"><label>Status kit${simpleSelectHtml("kit", ["Belum agih", "Sebahagian", "Belum lengkap", "Lengkap"])}</label></div>
                <div class="field"><label>Akreditasi${simpleSelectHtml("accreditation", ["Belum", "Draf", "Aktif"])}</label></div>
                <div class="field wide"><button class="button" type="submit"><i data-lucide="save"></i>Simpan status</button></div>
              </form>`
            : `<div class="empty">Status kit dipaparkan mengikut akses role.</div>`
        }
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
                  <strong>${escapeHtml(v.name)}</strong>
                  <span>${escapeHtml(v.id)} - ${escapeHtml(v.unit)}</span>
                  <span class="muted">${escapeHtml(v.venue)}</span>
                  ${statusBadge(v.accreditation)}
                  <button class="ghost-button" data-action="showPass" data-id="${v.id}"><i data-lucide="badge"></i>Lihat pas</button>
                </div>
              </article>
            `)
            .join("") || `<div class="empty">Tiada pas untuk dipaparkan.</div>`}
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
            <p>Input ID, emel, atau nombor telefon sukarelawan.</p>
          </div>
          <span class="pill">${state.attendanceLog.length} daftar hari ini</span>
        </div>
        ${
          can("attendance")
            ? `<form class="field-grid compact" id="attendanceForm">
                <div class="field"><label>ID / QR<input name="volunteerId" required placeholder="UUID / emel / telefon"></label></div>
                <div class="field"><label>Kaedah${simpleSelectHtml("method", ["QR", "Manual", "GPS"])}</label></div>
                <div class="field"><label>Venue${venueSelectHtml("venue")}</label></div>
                <div class="field wide"><button class="button" type="submit"><i data-lucide="scan-line"></i>Check-in</button></div>
              </form>`
            : `<div class="empty">Rekod kehadiran boleh dilihat mengikut akses role.</div>`
        }
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>Pemantauan GPS</h2>
            <p>Koordinat terakhir sukarelawan di venue aktif.</p>
          </div>
        </div>
        <div class="grid">
          ${list
            .filter((v) => v.status === "Diluluskan")
            .slice(0, 5)
            .map((v) => `
              <article class="timeline-item">
                <div class="toolbar">
                  <strong>${escapeHtml(v.name)}</strong>
                  <span class="tag blue">${escapeHtml(v.gps)}</span>
                </div>
                <p class="muted">${escapeHtml(v.venue)} - ${escapeHtml(v.unit)}</p>
              </article>
            `)
            .join("") || `<div class="empty">Tiada rekod GPS.</div>`}
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
                  <td>${escapeHtml(row.time)}</td>
                  <td>${escapeHtml(row.id)}</td>
                  <td>${escapeHtml(row.name)}</td>
                  <td>${escapeHtml(row.venue)}</td>
                  <td>${escapeHtml(row.method)}</td>
                </tr>
              `)
              .join("") || `<tr><td colspan="5">Tiada log kehadiran.</td></tr>`}
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
          <div class="field"><label>Nama<input name="volunteer" required placeholder="Nama sukarelawan" value="${escapeHtml(state.profile?.full_name || "")}"></label></div>
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
        ${
          can("broadcast")
            ? `<form class="field-grid compact" id="broadcastForm">
                <div class="field"><label>Sasaran${simpleSelectHtml("target", ["Semua Sukarelawan", "Semua Ketua Unit", "Unit Protokol", "Unit Media", "Unit Crowd Control"])}</label></div>
                <div class="field wide"><label>Mesej<textarea name="text" required placeholder="Tulis mesej operasi"></textarea></label></div>
                <div class="field wide"><button class="button" type="submit"><i data-lucide="send"></i>Hantar mesej</button></div>
              </form>`
            : `<div class="empty">Broadcast dikawal oleh role operasi.</div>`
        }
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
                  <strong>${escapeHtml(shortId(ticket.id))} - ${escapeHtml(ticket.volunteer)}</strong>
                  <span class="tag ${ticket.priority === "Tinggi" ? "red" : ticket.priority === "Sederhana" ? "gold" : "green"}">${escapeHtml(ticket.priority)}</span>
                </div>
                <p>${escapeHtml(ticket.issue)}</p>
                <p class="muted">${escapeHtml(ticket.channel)} - ${escapeHtml(ticket.status)}</p>
                ${can("support") ? `<button class="ghost-button" data-action="closeTicket" data-id="${ticket.id}"><i data-lucide="check-circle"></i>Tutup tiket</button>` : ""}
              </article>
            `)
            .join("") || `<div class="empty">Tiada tiket.</div>`}
        </div>
      </div>

      <div class="surface">
        <div class="surface-head">
          <div>
            <h2>AssistAI Chat</h2>
            <p>Sokongan pantas untuk soalan operasi.</p>
          </div>
        </div>
        <div class="chat-log" id="chatLog">
          ${state.chat.map((msg) => `<div class="chat-bubble ${msg.from}">${escapeHtml(msg.text)}</div>`).join("")}
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
              <strong>${escapeHtml(addon[0])}</strong>
              <i data-lucide="${addon[3]}"></i>
            </div>
            <p>${escapeHtml(addon[1])}</p>
            <span class="tag ${addon[0] === "PayGate" || addon[0] === "AdaSMS" ? "green" : addon[0] === "SponsorHub" ? "gold" : "blue"}">${escapeHtml(addon[2])}</span>
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
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Vendor</th><th>Kategori</th><th>Status</th><th>Nilai</th></tr></thead>
          <tbody>
            ${state.sponsors
              .map((sponsor) => `
                <tr>
                  <td>${escapeHtml(sponsor.name)}</td>
                  <td>${escapeHtml(sponsor.category)}</td>
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
            ${can("export") ? `<button class="button" data-action="exportCsv"><i data-lucide="download"></i>Eksport CSV</button>` : ""}
            <button class="ghost-button" data-action="printReport"><i data-lucide="printer"></i>Cetak</button>
          </div>
        </div>
        <div class="bar-list">
          <div class="bar-row"><span>Diluluskan</span><div class="progress"><span style="width:${percentage(approved.length, list.length)}%"></span></div><strong>${approved.length}</strong></div>
          <div class="bar-row"><span>Latihan lengkap</span><div class="progress"><span style="width:${percentage(list.filter((v) => v.training >= 80).length, list.length)}%"></span></div><strong>${list.filter((v) => v.training >= 80).length}</strong></div>
          <div class="bar-row"><span>Kit lengkap</span><div class="progress"><span style="width:${percentage(list.filter((v) => v.kit === "Lengkap").length, list.length)}%"></span></div><strong>${list.filter((v) => v.kit === "Lengkap").length}</strong></div>
          <div class="bar-row"><span>Sijil layak</span><div class="progress"><span style="width:${percentage(list.filter((v) => v.attendance >= 3 && v.training >= 60).length, list.length)}%"></span></div><strong>${list.filter((v) => v.attendance >= 3 && v.training >= 60).length}</strong></div>
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

function renderUsers() {
  if (!can("manageUsers")) {
    return `<section class="surface"><div class="empty">Modul ini hanya boleh diakses oleh Admin Induk.</div></section>`;
  }

  const list = filteredUsers();
  const roles = window.ProfileService?.roles || ["Admin Induk", "Admin Kluster", "Admin Venue", "Ketua Unit", "Sukarelawan"];
  const statuses = window.ProfileService?.statuses || ["Aktif", "Menunggu Kelulusan", "Digantung", "Ditolak"];
  const pending = state.users.filter((user) => user.status === "Menunggu Kelulusan" || user.status === "Pending").length;
  const active = state.users.filter((user) => user.status === "Aktif").length;
  const suspended = state.users.filter((user) => user.status === "Digantung" || user.status === "Ditolak").length;

  return `
    <section class="grid metrics">
      ${metricCard("Jumlah pengguna", state.users.length.toLocaleString("ms-MY"), "public.profiles", "blue", [28, 39, 48, 61, 73, 88])}
      ${metricCard("Menunggu kelulusan", pending.toLocaleString("ms-MY"), "perlu tindakan", "gold", [12, 18, 27, 31, 43, 54])}
      ${metricCard("Pengguna aktif", active.toLocaleString("ms-MY"), "boleh login", "green", [36, 44, 58, 64, 73, 82])}
      ${metricCard("Digantung / ditolak", suspended.toLocaleString("ms-MY"), "sekatan akses", "violet", [8, 12, 15, 20, 24, 29])}
    </section>

    <section class="surface">
      <div class="surface-head">
        <div>
          <h2>Pengurusan Pengguna</h2>
          <p>Admin Induk boleh meluluskan pengguna baharu, menukar role, dan menetapkan skop kluster, venue, serta unit.</p>
        </div>
        <div class="row-actions">
          <span class="pill">${list.length} dipapar</span>
          <button class="ghost-button" data-action="resetUserFilters"><i data-lucide="rotate-ccw"></i>Reset filter</button>
        </div>
      </div>

      <form class="field-grid user-filter-grid" id="userFiltersForm">
        <div class="field"><label>Carian<input name="search" placeholder="Nama, emel, telefon" value="${escapeHtml(state.userFilters.search)}"></label></div>
        <div class="field"><label>Role${simpleSelectHtml("role", ["Semua", ...roles], state.userFilters.role)}</label></div>
        <div class="field"><label>Status${simpleSelectHtml("status", ["Semua", ...statuses], state.userFilters.status)}</label></div>
        <div class="field"><label>Kluster${simpleSelectHtml("cluster", ["Semua", ...uniqueValues(state.users, "cluster")], state.userFilters.cluster)}</label></div>
        <div class="field"><label>Venue${simpleSelectHtml("venue", ["Semua", ...uniqueValues(state.users, "venue")], state.userFilters.venue)}</label></div>
        <div class="field"><label>Unit${simpleSelectHtml("unit", ["Semua", ...uniqueValues(state.users, "unit")], state.userFilters.unit)}</label></div>
        <div class="field wide"><button class="ghost-button" type="submit"><i data-lucide="filter"></i>Tapis senarai</button></div>
      </form>

      ${userManagementTable(list, roles, statuses)}
    </section>
  `;
}

function userManagementTable(list, roles, statuses) {
  if (!list.length) return `<div class="empty">Tiada pengguna ditemui untuk penapis semasa.</div>`;

  return `
    <div class="table-wrap">
      <table class="user-table">
        <thead>
          <tr>
            <th>Pengguna</th>
            <th>Role</th>
            <th>Status</th>
            <th>Kluster</th>
            <th>Venue</th>
            <th>Unit</th>
            <th>Tindakan</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map((user) => `
              <tr data-user-row="${user.id}">
                <td>
                  <strong>${escapeHtml(user.full_name || "-")}</strong><br>
                  <span class="muted">${escapeHtml(user.email || "-")}</span><br>
                  <span class="muted">${escapeHtml(user.phone || "-")}</span>
                </td>
                <td>${simpleSelectHtml("role", roles, user.role, `data-user-field="role"`)}</td>
                <td>${simpleSelectHtml("status", statuses, user.status || "Menunggu Kelulusan", `data-user-field="status"`)}</td>
                <td><input data-user-field="cluster" value="${escapeHtml(user.cluster || "")}" placeholder="Contoh: Kuala Lumpur"></td>
                <td><input data-user-field="venue" value="${escapeHtml(user.venue || "")}" placeholder="Contoh: KL Sports City"></td>
                <td><input data-user-field="unit" value="${escapeHtml(user.unit || "")}" placeholder="Contoh: Venue Ops"></td>
                <td>
                  <div class="row-actions">
                    <button class="button" data-action="saveUserProfile" data-id="${user.id}"><i data-lucide="save"></i>Simpan</button>
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
                <td>${escapeHtml(shortId(v.id))}</td>
                <td><strong>${escapeHtml(v.name)}</strong><br><span class="muted">${escapeHtml(v.email)}</span></td>
                <td>${escapeHtml(v.cluster)}</td>
                <td>${escapeHtml(v.venue)}</td>
                <td>${escapeHtml(v.unit)}</td>
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
                    ${can("approve") ? `<button class="ghost-button" data-action="quickApprove" data-id="${v.id}"><i data-lucide="check"></i>Lulus</button>` : ""}
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
        <strong>${escapeHtml(v.name)}</strong>
        ${statusBadge(v.status)}
      </div>
      <p class="muted">${escapeHtml(shortId(v.id))} - ${escapeHtml(v.venue)}</p>
      <span class="tag blue">${escapeHtml(v.unit)}</span>
    </article>
  `;
}

function clusterSelectHtml(name, selected = "Kuala Lumpur") {
  const values = state.role === "Admin Induk" ? ["Kuala Lumpur", "Selangor", "Putrajaya", "Johor"] : [state.profile?.cluster || selected];
  return simpleSelectHtml(name, values, selected);
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

function uniqueValues(list, key) {
  return [...new Set(list.map((item) => cleanScopeValue(item[key])).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ms"));
}

function cleanScopeValue(value) {
  return String(value || "").trim();
}

function simpleSelectHtml(name, values, selected = values[0], extraAttrs = "") {
  return `<select name="${name}" ${extraAttrs}>${values.map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select>`;
}

function volunteerSelectHtml(name, list) {
  if (!list.length) return `<select name="${name}" disabled><option value="">Tiada rekod</option></select>`;
  return `<select name="${name}">${list.map((v) => `<option value="${v.id}">${escapeHtml(shortId(v.id))} - ${escapeHtml(v.name)}</option>`).join("")}</select>`;
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
  app.querySelector("#userFiltersForm")?.addEventListener("submit", syncUserFilters);

  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", handleAction);
  });
}

async function mutate(successMessage, operation) {
  try {
    state.loading = true;
    render();
    await operation();
    await refreshData({ renderAfter: false });
    toast(successMessage);
  } catch (error) {
    toast(error.message);
  } finally {
    state.loading = false;
    render();
  }
}

async function addVolunteer(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const ownVolunteer = state.volunteers.find((volunteer) => volunteer.profile_id === state.user?.id);
  const payload = {
    profile_id: state.role === "Sukarelawan" ? state.user.id : null,
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    age: Number(form.get("age")) || 18,
    cluster: form.get("cluster"),
    venue: form.get("venue"),
    unit: form.get("unit"),
    application_status: can("approve") ? form.get("status") : ownVolunteer?.status || "Permohonan",
    screening_status: ownVolunteer?.screeningResult || "Belum",
    placement_status: ownVolunteer?.raw?.placement_status || "Belum ditempatkan",
    kit_status: ownVolunteer?.kit || "Belum agih",
    accreditation_status: ownVolunteer?.accreditation || "Belum"
  };

  if (ownVolunteer && state.role === "Sukarelawan") {
    payload.cluster = ownVolunteer.cluster;
    payload.venue = ownVolunteer.venue;
    payload.unit = ownVolunteer.unit;
  }

  await mutate(ownVolunteer && state.role === "Sukarelawan" ? "Profil dikemaskini." : "Permohonan baharu telah ditambah.", async () => {
    const duplicate = state.volunteers.find((volunteer) => {
      if (ownVolunteer?.id === volunteer.id) return false;
      return volunteer.email.toLowerCase() === String(payload.email).trim().toLowerCase() || volunteer.phone === String(payload.phone).replace(/[\s-]/g, "");
    });
    if (duplicate) throw new Error("Emel atau nombor telefon sudah wujud dalam skop data anda.");

    if (state.role === "Sukarelawan") {
      await window.AuthService.updateOwnProfile({
        full_name: payload.name,
        email: payload.email,
        phone: payload.phone
      });
      if (ownVolunteer) {
        await window.VolunteerService.updateVolunteer(ownVolunteer.id, payload, "update_own_volunteer");
      } else {
        await window.VolunteerService.createVolunteer(payload);
      }
    } else {
      await window.VolunteerService.createVolunteer(payload);
    }
    pushActivity(`${payload.name} dikemaskini dalam database`, "blue");
  });
}

async function updatePlacement(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteer(form.get("volunteerId"));
  if (!volunteer) return;
  await mutate("Penempatan dikemaskini.", async () => {
    await window.VolunteerService.assignPlacement(volunteer.id, form.get("venue"), form.get("unit"), volunteer.cluster);
    pushActivity(`${volunteer.name} ditempatkan di ${form.get("venue")}`, "green");
  });
}

async function updateKit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteer(form.get("volunteerId"));
  if (!volunteer) return;
  await mutate("Status kit dan pas disimpan.", async () => {
    await window.VolunteerService.updateKitAccreditation(volunteer.id, form.get("kit"), form.get("accreditation"));
    pushActivity(`Kit dan akreditasi ${volunteer.name} dikemaskini`, "green");
  });
}

async function addAttendance(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteerLoose(form.get("volunteerId"));
  if (!volunteer) {
    toast("Sukarelawan tidak ditemui dalam skop akses anda.");
    return;
  }
  await mutate("Kehadiran direkodkan.", async () => {
    await window.AttendanceService.recordAttendance(volunteer.id, "Operasi Sukarelawan 2026", form.get("venue") || volunteer.venue, form.get("method"));
    pushActivity(`${volunteer.name} check-in di ${form.get("venue")}`, "green");
  });
}

async function addTicket(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteerLoose(form.get("volunteer"));
  await mutate("Tiket sokongan dibuka.", async () => {
    await window.SupportService.createComplaint({
      volunteerId: volunteer?.id || null,
      volunteerName: form.get("volunteer"),
      category: form.get("priority"),
      subject: form.get("channel"),
      message: form.get("issue")
    });
    pushActivity(`Tiket dibuka melalui ${form.get("channel")}`, "gold");
  });
}

async function addBroadcast(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await mutate("Mesej blast direkodkan.", async () => {
    await window.SupportService.createBroadcast({
      title: form.get("target"),
      target: form.get("target"),
      message: form.get("text"),
      profile: state.profile
    });
    pushActivity(`MWGateway menghantar mesej ke ${form.get("target")}`, "blue");
  });
}

function sendChat(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = String(form.get("message")).trim();
  state.chat.push({ from: "user", text: message });
  state.chat.push({ from: "bot", text: assistReply(message) });
  render();
}

function generateCertificate(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const volunteer = findVolunteer(form.get("volunteerId"));
  if (!volunteer) return;
  const eligible = volunteer.attendance >= 3 && volunteer.training >= 60;
  const preview = app.querySelector("#certificatePreview");
  preview.innerHTML = `
    <article class="identity-pass" style="margin-top:14px; width:100%;">
      <div class="pass-photo"><i data-lucide="award"></i></div>
      <div class="pass-meta">
        <strong>Sijil Digital Sukarelawan</strong>
        <span>${escapeHtml(volunteer.name)}</span>
        <span class="muted">${escapeHtml(shortId(volunteer.id))} - ${escapeHtml(volunteer.unit)} - ${escapeHtml(volunteer.venue)}</span>
        <span class="tag ${eligible ? "green" : "gold"}">${eligible ? "Layak dijana" : "Belum cukup syarat"}</span>
      </div>
    </article>
  `;
  window.lucide?.createIcons();
}

function syncUserFilters(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.userFilters = {
    search: String(form.get("search") || ""),
    role: String(form.get("role") || "Semua"),
    status: String(form.get("status") || "Semua"),
    cluster: String(form.get("cluster") || "Semua"),
    venue: String(form.get("venue") || "Semua"),
    unit: String(form.get("unit") || "Semua")
  };
  render();
}

async function saveManagedProfile(id) {
  if (!can("manageUsers")) {
    toast("Hanya Admin Induk boleh mengurus pengguna.");
    return;
  }

  const row = app.querySelector(`[data-user-row="${id}"]`);
  if (!row) {
    toast("Baris pengguna tidak ditemui.");
    return;
  }

  const payload = {
    role: row.querySelector('[data-user-field="role"]')?.value,
    status: row.querySelector('[data-user-field="status"]')?.value,
    cluster: row.querySelector('[data-user-field="cluster"]')?.value,
    venue: row.querySelector('[data-user-field="venue"]')?.value,
    unit: row.querySelector('[data-user-field="unit"]')?.value
  };

  const profile = state.users.find((user) => user.id === id);
  await mutate(`Profil ${profile?.full_name || "pengguna"} disimpan.`, async () => {
    await window.ProfileService.updateManagedProfile(id, payload);
    pushActivity(`Profil pengguna ${profile?.full_name || shortId(id)} dikemaskini`, "blue");
  });
}

async function handleAction(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const id = button.dataset.id;
  const volunteer = id ? findVolunteer(id) : null;

  if (action === "go") setView(button.dataset.view);
  if (action === "screenDecision" && volunteer) await updateVolunteerStatus(volunteer, button.dataset.status);
  if (action === "quickApprove" && volunteer) await updateVolunteerStatus(volunteer, "Diluluskan");
  if (action === "showPass" && volunteer) showPass(volunteer);
  if (action === "autoScore") await autoScore();
  if (action === "approveHigh") await approveHigh();
  if (action === "balancePlacement") toast("Imbangan automatik hanya aktif apabila DEMO_MODE=true.");
  if (action === "completeTraining") await completeTraining();
  if (action === "completeKit") await completeKit();
  if (action === "closeTicket") await closeTicket(id);
  if (action === "exportCsv") await exportCsv();
  if (action === "saveUserProfile") await saveManagedProfile(id);
  if (action === "resetUserFilters") {
    state.userFilters = { search: "", role: "Semua", status: "Semua", cluster: "Semua", venue: "Semua", unit: "Semua" };
    render();
  }
  if (action === "addActivity") {
    pushActivity("Dashboard disegarkan oleh " + state.role, "blue");
    render();
  }
  if (action === "printReport") window.print();
}

async function updateVolunteerStatus(volunteer, status) {
  if (!can("approve")) {
    toast("Role anda tidak dibenarkan meluluskan permohonan.");
    return;
  }
  await mutate(`Status ${volunteer.name} dikemaskini.`, async () => {
    await window.ApplicationService.updateVolunteerStatus(volunteer.id, status, `Dikemaskini melalui UI oleh ${state.role}`);
    pushActivity(`${volunteer.name} ditanda ${status}`, status === "Ditolak" ? "gold" : "green");
  });
}

function calculateScore(v) {
  const ageScore = v.age >= 21 && v.age <= 35 ? 18 : 10;
  const phoneScore = v.phoneVerified ? 18 : 4;
  const trainingScore = Math.round(v.training * 0.32);
  const attendanceScore = Math.min(12, v.attendance * 2);
  const unitScore = ["Medical Support", "Accreditation", "Protokol"].includes(v.unit) ? 12 : 9;
  return Math.min(98, ageScore + phoneScore + trainingScore + attendanceScore + unitScore + 22);
}

async function autoScore() {
  if (!can("screening")) return;
  const list = filteredVolunteers().filter((v) => v.status !== "Ditolak");
  await mutate("Skor saringan telah dikemaskini.", async () => {
    await Promise.all(
      list.map((v) => {
        const score = calculateScore(v);
        const result = score >= 80 ? "Lulus" : score >= 55 ? "Semakan" : "Gagal";
        return window.VolunteerService.updateScreeningScore(v.id, score, result, "Kiraan automatik UI");
      })
    );
    pushActivity("Skor saringan dikira semula", "blue");
  });
}

async function approveHigh() {
  if (!can("approve")) return;
  const list = filteredVolunteers().filter((v) => v.screening >= 80 && v.status !== "Ditolak");
  await mutate(`${list.length} rekod diluluskan.`, async () => {
    await Promise.all(list.map((v) => window.ApplicationService.updateVolunteerStatus(v.id, "Diluluskan", "Kelulusan skor tinggi")));
    pushActivity(`${list.length} sukarelawan skor tinggi diluluskan`, "green");
  });
}

async function completeTraining() {
  if (!can("training")) return;
  const volunteers = filteredVolunteers().filter((v) => v.status === "Diluluskan");
  await mutate("Latihan ditandakan selesai untuk sukarelawan diluluskan.", async () => {
    await window.VolunteerService.completeTrainingFor(volunteers.map((v) => v.id));
    pushActivity("Latihan sukarelawan diluluskan dikemaskini", "green");
  });
}

async function completeKit() {
  if (!can("kit")) return;
  const volunteers = filteredVolunteers().filter((v) => v.status === "Diluluskan");
  await mutate("Kit dan pas dilengkapkan untuk sukarelawan diluluskan.", async () => {
    await Promise.all(volunteers.map((v) => window.VolunteerService.updateKitAccreditation(v.id, "Lengkap", "Aktif")));
    pushActivity("Kit dan akreditasi sukarelawan diluluskan dilengkapkan", "green");
  });
}

async function closeTicket(id) {
  await mutate("Tiket ditutup.", async () => {
    await window.SupportService.updateComplaintStatus(id, "Selesai");
    pushActivity(`${shortId(id)} ditutup oleh HelpDesk Pro`, "green");
  });
}

async function exportCsv() {
  if (!can("export")) {
    toast("Role anda tidak dibenarkan eksport laporan.");
    return;
  }

  try {
    state.loading = true;
    render();
    const fresh = await window.ReportService.listVolunteers();
    const list = filteredVolunteers({ search: "" }, fresh);
    await window.ReportService.auditReportExport({ role: state.role, cluster: scopeCluster() }, list.length);
    const headers = ["id", "name", "email", "phone", "age", "cluster", "venue", "unit", "status", "screening", "training", "kit", "accreditation", "attendance"];
    const rows = [headers.join(",")].concat(
      list.map((v) => headers.map((key) => `"${String(v[key] ?? "").replaceAll('"', '""')}"`).join(","))
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sistem-sukarelawan-2026-${state.role.replaceAll(" ", "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast("CSV dieksport daripada Supabase.");
  } catch (error) {
    toast(error.message);
  } finally {
    state.loading = false;
    render();
  }
}

function showPass(volunteer) {
  modalBody.innerHTML = `
    <article class="identity-pass">
      <div class="pass-photo">${initials(volunteer.name)}</div>
      <div class="pass-meta">
        <strong>${escapeHtml(volunteer.name)}</strong>
        <span>${escapeHtml(shortId(volunteer.id))}</span>
        <span>${escapeHtml(volunteer.cluster)}</span>
        <span>${escapeHtml(volunteer.venue)}</span>
        <span>${escapeHtml(volunteer.unit)}</span>
        ${statusBadge(volunteer.accreditation)}
      </div>
    </article>
    <div style="display:flex; gap:16px; align-items:center; margin-top:16px;">
      <div class="qr-box" aria-label="QR">${Array.from({ length: 25 }, () => "<span></span>").join("")}</div>
      <div>
        <strong>Token QR</strong>
        <p class="muted">${escapeHtml(shortId(volunteer.id))}-${escapeHtml(volunteer.phone.slice(-4))}-${escapeHtml(volunteer.unit.replaceAll(" ", "").toUpperCase())}</p>
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
  return state.volunteers.find((v) => v.id.toLowerCase() === String(id).toLowerCase());
}

function findVolunteerLoose(value) {
  const needle = String(value || "").trim().toLowerCase();
  return state.volunteers.find((v) =>
    [v.id, shortId(v.id), v.email, v.phone, v.name].some((field) => String(field || "").toLowerCase() === needle)
  );
}

function shortId(id) {
  return String(id || "").slice(0, 8).toUpperCase();
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
  setTimeout(() => element.remove(), 3200);
}

navList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  sidebar.classList.remove("open");
  setView(button.dataset.view);
});

clusterSelect.addEventListener("change", (event) => {
  if (state.role !== "Admin Induk") {
    event.target.value = state.profile?.cluster || "Semua";
    return;
  }
  state.cluster = event.target.value;
  render();
});

globalSearch.addEventListener("input", (event) => {
  if (state.view === "users") {
    state.userFilters.search = event.target.value;
  } else {
    state.search = event.target.value;
  }
  render();
});

logoutButton.addEventListener("click", async () => {
  try {
    await window.AuthService.signOut();
  } finally {
    state.user = null;
    state.profile = null;
    state.volunteers = [];
    state.users = [];
    state.userFilters = { search: "", role: "Semua", status: "Semua", cluster: "Semua", venue: "Semua", unit: "Semua" };
    renderAuth("login", "Logout berjaya.");
  }
});

document.querySelector("#menuToggle").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.querySelector("#closeModal").addEventListener("click", () => {
  passModal.close();
});

async function initApp() {
  if (new URLSearchParams(window.location.search).get("smoke") === "1") {
    renderAuth("login");
    runSmokeTest();
    return;
  }

  try {
    if (await handleAuthRedirect()) return;
    await loadAuthenticatedApp();
  } catch (error) {
    renderAuth("login", error.message);
  }

  if (window.SukarelawanSupabase?.isConfigured()) {
    window.SukarelawanSupabase.getClient().auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) renderAuth("login");
    });
  }
}

function runSmokeTest() {
  const results = [
    ["auth-root", Boolean(authRoot)],
    ["app-shell", Boolean(appShell)],
    ["supabase-gate", Boolean(window.SukarelawanSupabase)],
    ["no-reset-action", !document.body.textContent.toLowerCase().includes("pulihkan demo")]
  ];
  const ok = results.every(([, passed]) => passed);
  document.body.dataset.smoke = ok ? "ok" : "fail";
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="smoke-result">${ok ? "SMOKE_OK" : "SMOKE_FAIL"} ${results.map(([name, passed]) => `${name}:${passed ? "ok" : "fail"}`).join(" ")}</div>`
  );
}

initApp();
