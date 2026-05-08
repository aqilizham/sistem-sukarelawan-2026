(function () {
  const PRODUCTION_APP_URL = "https://aqilizham.github.io/sistem-sukarelawan-2026/";

  function db() {
    return window.SukarelawanSupabase.getClient();
  }

  function cleanText(value) {
    return String(value || "").trim();
  }

  function cleanPhone(value) {
    return cleanText(value).replace(/[\s-]/g, "");
  }

  function friendlyAuthError(error) {
    const message = String(error?.message || error || "Ralat authentication.");
    if (message.toLowerCase().includes("invalid login")) return "Emel atau kata laluan tidak sah.";
    if (message.toLowerCase().includes("email not confirmed")) return "Sila sahkan emel sebelum login.";
    if (message.toLowerCase().includes("password")) return message;
    return message;
  }

  async function getSession() {
    const { data, error } = await db().auth.getSession();
    if (error) throw new Error(friendlyAuthError(error));
    return data.session || null;
  }

  async function signIn(email, password) {
    const { data, error } = await db().auth.signInWithPassword({
      email: cleanText(email).toLowerCase(),
      password
    });
    if (error) throw new Error(friendlyAuthError(error));
    return data;
  }

  async function signUp({ fullName, email, phone, password }) {
    const { data, error } = await db().auth.signUp({
      email: cleanText(email).toLowerCase(),
      password,
      options: {
        emailRedirectTo: PRODUCTION_APP_URL,
        data: {
          full_name: cleanText(fullName),
          phone: cleanPhone(phone)
        }
      }
    });
    if (error) throw new Error(friendlyAuthError(error));
    return data;
  }

  async function signOut() {
    const { error } = await db().auth.signOut();
    if (error) throw new Error(friendlyAuthError(error));
  }

  async function loadProfile(user) {
    const { data, error } = await db()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return data;

    const fallbackProfile = {
      id: user.id,
      full_name: cleanText(user.user_metadata?.full_name) || user.email,
      email: user.email,
      phone: cleanPhone(user.user_metadata?.phone),
      role: "Sukarelawan",
      status: "Menunggu Kelulusan"
    };

    const { data: created, error: insertError } = await db()
      .from("profiles")
      .insert(fallbackProfile)
      .select("*")
      .single();

    if (insertError) throw new Error(insertError.message);
    return created;
  }

  async function updateOwnProfile(fields) {
    const session = await getSession();
    if (!session) throw new Error("Sesi login tidak ditemui.");

    const payload = {
      full_name: cleanText(fields.full_name),
      phone: cleanPhone(fields.phone),
      email: cleanText(fields.email).toLowerCase()
    };

    const { data, error } = await db()
      .from("profiles")
      .update(payload)
      .eq("id", session.user.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  window.AuthService = {
    redirectUrl: PRODUCTION_APP_URL,
    getSession,
    loadProfile,
    signIn,
    signOut,
    signUp,
    updateOwnProfile
  };
})();
