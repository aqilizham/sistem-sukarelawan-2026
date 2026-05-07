(function () {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;
  const APPLICATION_STATUSES = ["Permohonan", "Semakan", "Diluluskan", "Ditolak"];
  const KIT_STATUSES = ["Belum agih", "Sebahagian", "Belum lengkap", "Lengkap"];
  const ACCREDITATION_STATUSES = ["Belum", "Draf", "Aktif"];

  function db() {
    return window.SukarelawanSupabase.getClient();
  }

  function cleanText(value) {
    return String(value || "").trim();
  }

  function normalizeEmail(value) {
    return cleanText(value).toLowerCase();
  }

  function normalizePhone(value) {
    return cleanText(value).replace(/[\s-]/g, "");
  }

  async function currentUserId() {
    const { data, error } = await db().auth.getUser();
    if (error) throw new Error(error.message);
    return data.user?.id || null;
  }

  function raiseIfError(result, context) {
    if (!result.error) return result.data;
    if (result.error.code === "23505") {
      throw new Error("Emel atau nombor telefon sudah wujud dalam database.");
    }
    if (result.error.code === "42501") {
      throw new Error("Akses ditolak oleh polisi keselamatan Supabase.");
    }
    throw new Error(`${context}: ${result.error.message}`);
  }

  async function run(query, context) {
    const result = await query;
    return raiseIfError(result, context);
  }

  function validateVolunteer(input) {
    const payload = {
      profile_id: input.profile_id || null,
      name: cleanText(input.name),
      email: normalizeEmail(input.email),
      phone: normalizePhone(input.phone),
      age: Number(input.age),
      cluster: cleanText(input.cluster),
      venue: cleanText(input.venue),
      unit: cleanText(input.unit),
      application_status: cleanText(input.application_status || "Permohonan"),
      screening_status: cleanText(input.screening_status || "Belum"),
      placement_status: cleanText(input.placement_status || "Belum ditempatkan"),
      kit_status: cleanText(input.kit_status || "Belum agih"),
      accreditation_status: cleanText(input.accreditation_status || "Belum")
    };

    if (payload.name.length < 2) throw new Error("Nama penuh diperlukan.");
    if (!EMAIL_PATTERN.test(payload.email)) throw new Error("Format emel tidak sah.");
    if (!PHONE_PATTERN.test(payload.phone)) throw new Error("Nombor telefon perlu 9 hingga 15 digit.");
    if (!Number.isInteger(payload.age) || payload.age < 18 || payload.age > 80) {
      throw new Error("Umur perlu antara 18 hingga 80 tahun.");
    }
    if (!payload.cluster || !payload.venue || !payload.unit) {
      throw new Error("Kluster, venue, dan unit diperlukan.");
    }
    if (!APPLICATION_STATUSES.includes(payload.application_status)) {
      throw new Error("Status permohonan tidak sah.");
    }
    if (!KIT_STATUSES.includes(payload.kit_status)) throw new Error("Status kit tidak sah.");
    if (!ACCREDITATION_STATUSES.includes(payload.accreditation_status)) throw new Error("Status akreditasi tidak sah.");

    return payload;
  }

  function groupByVolunteer(rows) {
    return (rows || []).reduce((acc, row) => {
      if (!row.volunteer_id) return acc;
      acc[row.volunteer_id] ||= [];
      acc[row.volunteer_id].push(row);
      return acc;
    }, {});
  }

  function latest(rows, dateKey) {
    return [...(rows || [])].sort((a, b) => new Date(b[dateKey] || 0) - new Date(a[dateKey] || 0))[0] || null;
  }

  function trainingPercent(records) {
    if (!records?.length) return 0;
    const completed = records.filter((record) => record.completion_status === "Selesai").length;
    return Math.round((completed / records.length) * 100);
  }

  function mapVolunteer(row, related) {
    const screening = latest(related.screenings[row.id], "screened_at");
    const kit = latest(related.kits[row.id], "issued_at");
    const attendance = related.attendance[row.id] || [];
    const training = related.training[row.id] || [];
    const score = Number(screening?.score ?? 0);

    return {
      id: row.id,
      profile_id: row.profile_id,
      name: row.name,
      age: row.age,
      phone: row.phone || "",
      email: row.email || "",
      cluster: row.cluster || "-",
      venue: row.venue || "-",
      unit: row.unit || "-",
      status: row.application_status || "Permohonan",
      screening: Number.isFinite(score) ? Math.round(score) : 0,
      screeningResult: screening?.result || row.screening_status || "Belum",
      training: trainingPercent(training),
      kit: kit?.kit_status || row.kit_status || "Belum agih",
      accreditation: kit?.accreditation_status || row.accreditation_status || "Belum",
      attendance: attendance.length,
      rewards: attendance.length * 50,
      payment: "-",
      lodging: "-",
      phoneVerified: Boolean(row.phone),
      gps: "-",
      created_at: row.created_at,
      raw: row
    };
  }

  async function selectRelated(table, select, ids, orderColumn) {
    if (!ids.length) return [];
    let query = db().from(table).select(select).in("volunteer_id", ids);
    if (orderColumn) query = query.order(orderColumn, { ascending: false });
    return run(query, `Gagal baca ${table}`);
  }

  async function listVolunteers() {
    const volunteers = await run(
      db().from("volunteers").select("*").order("created_at", { ascending: false }),
      "Gagal baca sukarelawan"
    );
    const ids = volunteers.map((volunteer) => volunteer.id);
    const [screenings, training, attendance, kits] = await Promise.all([
      selectRelated("screening_results", "*", ids, "screened_at"),
      selectRelated("training_records", "*", ids, "created_at"),
      selectRelated("attendance_logs", "*", ids, "check_in_time"),
      selectRelated("kit_accreditation", "*", ids, "issued_at")
    ]);

    const related = {
      screenings: groupByVolunteer(screenings),
      training: groupByVolunteer(training),
      attendance: groupByVolunteer(attendance),
      kits: groupByVolunteer(kits)
    };

    return volunteers.map((volunteer) => mapVolunteer(volunteer, related));
  }

  async function listAttendanceLogs() {
    const rows = await run(
      db()
        .from("attendance_logs")
        .select("id, volunteer_id, event_name, venue, check_in_time, method, volunteers(name)")
        .order("check_in_time", { ascending: false })
        .limit(100),
      "Gagal baca log kehadiran"
    );

    return rows.map((row) => ({
      rowId: row.id,
      id: row.volunteer_id,
      name: row.volunteers?.name || "-",
      venue: row.venue || "-",
      time: row.check_in_time
        ? new Date(row.check_in_time).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })
        : "-",
      method: row.method || "-"
    }));
  }

  async function listComplaints() {
    const rows = await run(
      db()
        .from("complaints")
        .select("id, category, subject, message, status, created_at, volunteers(name)")
        .order("created_at", { ascending: false })
        .limit(100),
      "Gagal baca tiket aduan"
    );

    return rows.map((row) => ({
      id: row.id,
      volunteer: row.volunteers?.name || row.subject || "Pengguna",
      issue: row.message || row.subject || "-",
      channel: row.category || "HelpDesk Pro",
      status: row.status || "Baharu",
      priority: row.category === "Tinggi" ? "Tinggi" : row.category === "Sederhana" ? "Sederhana" : "Rendah"
    }));
  }

  async function listBroadcasts() {
    const rows = await run(
      db().from("broadcasts").select("*").order("created_at", { ascending: false }).limit(50),
      "Gagal baca broadcast"
    );

    return rows.map((row) => ({
      id: row.id,
      target: row.target_role || row.target_cluster || row.target_venue || "Semua Sukarelawan",
      text: row.message,
      sent: row.created_at
        ? new Date(row.created_at).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })
        : "-"
    }));
  }

  async function loadOperationalData() {
    const [volunteers, attendanceLog, complaints, broadcasts] = await Promise.all([
      listVolunteers(),
      listAttendanceLogs(),
      listComplaints(),
      listBroadcasts()
    ]);
    return { volunteers, attendanceLog, complaints, broadcasts };
  }

  async function recordAudit(action, tableName, recordId, oldData, newData) {
    const actorId = await currentUserId();
    const payload = {
      actor_id: actorId,
      action,
      table_name: tableName,
      record_id: recordId || null,
      old_data: oldData || null,
      new_data: newData || null
    };
    await run(db().from("audit_logs").insert(payload), "Gagal tulis audit log");
  }

  async function createVolunteer(input) {
    const actorId = await currentUserId();
    const payload = validateVolunteer(input);
    payload.created_by = actorId;

    const created = await run(db().from("volunteers").insert(payload).select("*").single(), "Gagal tambah sukarelawan");
    await run(
      db().from("applications").insert({
        volunteer_id: created.id,
        status: created.application_status,
        submitted_at: new Date().toISOString()
      }),
      "Gagal tambah permohonan"
    );
    await recordAudit("create_volunteer", "volunteers", created.id, null, created);
    return created;
  }

  async function updateVolunteer(id, fields, action = "update_volunteer") {
    const oldRow = await run(db().from("volunteers").select("*").eq("id", id).single(), "Gagal baca rekod lama");
    const payload = validateVolunteer({
      ...oldRow,
      ...fields,
      application_status: fields.application_status || oldRow.application_status
    });

    const updated = await run(
      db().from("volunteers").update(payload).eq("id", id).select("*").single(),
      "Gagal kemaskini sukarelawan"
    );
    await recordAudit(action, "volunteers", id, oldRow, updated);
    return updated;
  }

  async function updateVolunteerStatus(id, status, remarks = "") {
    if (!APPLICATION_STATUSES.includes(status)) throw new Error("Status permohonan tidak sah.");
    const actorId = await currentUserId();
    const oldRow = await run(db().from("volunteers").select("*").eq("id", id).single(), "Gagal baca rekod lama");
    const updated = await run(
      db()
        .from("volunteers")
        .update({
          application_status: status,
          accreditation_status: status === "Diluluskan" && oldRow.accreditation_status === "Belum" ? "Draf" : oldRow.accreditation_status
        })
        .eq("id", id)
        .select("*")
        .single(),
      "Gagal kemaskini status"
    );

    const existingApplication = await run(
      db()
        .from("applications")
        .select("id")
        .eq("volunteer_id", id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      "Gagal baca permohonan"
    );

    const applicationPayload = {
      volunteer_id: id,
      status,
      reviewed_by: actorId,
      reviewed_at: new Date().toISOString(),
      remarks
    };

    if (existingApplication?.id) {
      await run(
        db().from("applications").update(applicationPayload).eq("id", existingApplication.id),
        "Gagal kemaskini permohonan"
      );
    } else {
      await run(
        db().from("applications").insert({ ...applicationPayload, submitted_at: new Date().toISOString() }),
        "Gagal tambah permohonan"
      );
    }

    await recordAudit(status === "Diluluskan" ? "approve_application" : "reject_application", "volunteers", id, oldRow, updated);
    return updated;
  }

  async function updateScreeningScore(id, score, result, notes = "") {
    const actorId = await currentUserId();
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      throw new Error("Skor saringan perlu antara 0 hingga 100.");
    }

    const created = await run(
      db()
        .from("screening_results")
        .insert({
          volunteer_id: id,
          score: numericScore,
          result,
          notes,
          screened_by: actorId,
          screened_at: new Date().toISOString()
        })
        .select("*")
        .single(),
      "Gagal simpan saringan"
    );

    await run(
      db().from("volunteers").update({ screening_status: result }).eq("id", id),
      "Gagal kemaskini status saringan"
    );
    await recordAudit("update_screening", "screening_results", created.id, null, created);
    return created;
  }

  async function assignPlacement(id, venue, unit, cluster, shift = "") {
    const actorId = await currentUserId();
    const oldRow = await run(db().from("volunteers").select("*").eq("id", id).single(), "Gagal baca rekod lama");
    const updated = await run(
      db()
        .from("volunteers")
        .update({
          cluster: cleanText(cluster || oldRow.cluster),
          venue: cleanText(venue),
          unit: cleanText(unit),
          placement_status: "Ditempatkan"
        })
        .eq("id", id)
        .select("*")
        .single(),
      "Gagal kemaskini penempatan"
    );

    const placement = await run(
      db()
        .from("placements")
        .insert({
          volunteer_id: id,
          cluster: updated.cluster,
          venue: updated.venue,
          unit: updated.unit,
          shift,
          assigned_by: actorId,
          assigned_at: new Date().toISOString()
        })
        .select("*")
        .single(),
      "Gagal simpan rekod penempatan"
    );

    await recordAudit("assign_placement", "placements", placement.id, oldRow, updated);
    return updated;
  }

  async function completeTrainingFor(volunteerIds, trainingName = "Orientasi Operasi 2026") {
    const actorId = await currentUserId();
    const today = new Date().toISOString().slice(0, 10);
    const rows = volunteerIds.map((id) => ({
      volunteer_id: id,
      training_name: trainingName,
      training_date: today,
      attendance_status: "Hadir",
      completion_status: "Selesai",
      recorded_by: actorId
    }));

    if (!rows.length) return [];
    const created = await run(db().from("training_records").insert(rows).select("*"), "Gagal simpan latihan");
    await recordAudit("update_training", "training_records", null, null, { total: created.length, volunteer_ids: volunteerIds });
    return created;
  }

  async function updateKitAccreditation(id, kitStatus, accreditationStatus) {
    if (!KIT_STATUSES.includes(kitStatus)) throw new Error("Status kit tidak sah.");
    if (!ACCREDITATION_STATUSES.includes(accreditationStatus)) throw new Error("Status akreditasi tidak sah.");

    const actorId = await currentUserId();
    const oldRow = await run(db().from("volunteers").select("*").eq("id", id).single(), "Gagal baca rekod lama");
    const updated = await run(
      db()
        .from("volunteers")
        .update({ kit_status: kitStatus, accreditation_status: accreditationStatus })
        .eq("id", id)
        .select("*")
        .single(),
      "Gagal kemaskini kit"
    );

    const kit = await run(
      db()
        .from("kit_accreditation")
        .insert({
          volunteer_id: id,
          kit_status: kitStatus,
          pass_status: accreditationStatus === "Aktif" ? "Aktif" : "Draf",
          accreditation_status: accreditationStatus,
          issued_by: actorId,
          issued_at: new Date().toISOString()
        })
        .select("*")
        .single(),
      "Gagal simpan rekod kit"
    );

    await recordAudit("issue_kit_pass", "kit_accreditation", kit.id, oldRow, updated);
    return updated;
  }

  async function recordAttendance(id, eventName, venue, method) {
    const actorId = await currentUserId();
    const created = await run(
      db()
        .from("attendance_logs")
        .insert({
          volunteer_id: id,
          event_name: cleanText(eventName || "Operasi Sukarelawan 2026"),
          venue: cleanText(venue),
          check_in_time: new Date().toISOString(),
          method: cleanText(method),
          recorded_by: actorId
        })
        .select("*")
        .single(),
      "Gagal rekod kehadiran"
    );

    await recordAudit("mark_attendance", "attendance_logs", created.id, null, created);
    return created;
  }

  async function createComplaint({ volunteerId, volunteerName, category, subject, message }) {
    const actorId = await currentUserId();
    const payload = {
      submitted_by: actorId,
      volunteer_id: volunteerId || null,
      category: cleanText(category || "HelpDesk Pro"),
      subject: cleanText(subject || volunteerName || "Aduan sukarelawan"),
      message: cleanText(message),
      status: "Baharu"
    };

    if (!payload.message) throw new Error("Ringkasan isu diperlukan.");
    const created = await run(db().from("complaints").insert(payload).select("*").single(), "Gagal buka tiket");
    await recordAudit("create_complaint", "complaints", created.id, null, created);
    return created;
  }

  async function updateComplaintStatus(id, status) {
    const oldRow = await run(db().from("complaints").select("*").eq("id", id).single(), "Gagal baca tiket");
    const updated = await run(
      db().from("complaints").update({ status }).eq("id", id).select("*").single(),
      "Gagal kemaskini tiket"
    );
    await recordAudit("update_complaint_status", "complaints", id, oldRow, updated);
    return updated;
  }

  async function createBroadcast({ title, message, target, profile }) {
    const actorId = await currentUserId();
    const targetRole = target?.includes("Ketua Unit")
      ? "Ketua Unit"
      : target?.includes("Sukarelawan")
        ? "Sukarelawan"
        : null;
    const payload = {
      title: cleanText(title || target || "Hebahan operasi"),
      message: cleanText(message),
      target_role: targetRole,
      target_cluster: profile?.role === "Admin Induk" ? null : profile?.cluster || null,
      target_venue: profile?.role === "Admin Venue" ? profile?.venue || null : null,
      created_by: actorId
    };

    if (!payload.message) throw new Error("Mesej broadcast diperlukan.");
    const created = await run(db().from("broadcasts").insert(payload).select("*").single(), "Gagal simpan broadcast");
    await recordAudit("create_broadcast", "broadcasts", created.id, null, created);
    return created;
  }

  async function auditReportExport(scope, totalRows) {
    await recordAudit("export_report", "volunteers", null, null, { scope, total_rows: totalRows });
  }

  window.VolunteerService = {
    assignPlacement,
    completeTrainingFor,
    createVolunteer,
    listVolunteers,
    loadOperationalData,
    updateKitAccreditation,
    updateScreeningScore,
    updateVolunteer,
    updateVolunteerStatus,
    validateVolunteer
  };

  window.ApplicationService = {
    updateVolunteerStatus
  };

  window.AttendanceService = {
    listAttendanceLogs,
    recordAttendance
  };

  window.ReportService = {
    auditReportExport,
    listVolunteers
  };

  window.AuditService = {
    record: recordAudit
  };

  window.SupportService = {
    createBroadcast,
    createComplaint,
    listBroadcasts,
    listComplaints,
    updateComplaintStatus
  };
})();
