(function () {
  const config = window.SUKARELAWAN_SUPABASE_CONFIG || {};
  const demoMode = window.SUKARELAWAN_DEMO_MODE === true;
  let client;

  function isConfigured() {
    return Boolean(config.url && config.anonKey && !config.url.includes("YOUR_PROJECT_REF"));
  }

  function getClient() {
    if (!isConfigured()) {
      throw new Error("Konfigurasi Supabase belum lengkap.");
    }

    if (!window.supabase?.createClient) {
      throw new Error("Supabase JS gagal dimuatkan. Semak sambungan internet atau CDN.");
    }

    if (!client) {
      client = window.supabase.createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true
        }
      });
    }

    return client;
  }

  window.SukarelawanSupabase = {
    DEMO_MODE: demoMode,
    config,
    getClient,
    isConfigured
  };
})();
