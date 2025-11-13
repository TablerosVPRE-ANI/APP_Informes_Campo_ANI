// config.js - Configuración de Supabase para ANI Campo

const SUPABASE_CONFIG = {
    url: "https://frvpwkhifdoimnlcngks.supabase.co", // REEMPLAZAR con tu URL real
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnB3a2hpZmRvaW1ubGNuZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjc0ODcsImV4cCI6MjA3Mjk0MzQ4N30.J0JQlXfMUaKCsc8I_28FmIAoext8n5b-FMhc04MfGQE' // REEMPLAZAR con tu clave anónima real
};

// Variable global
let supabase;

// Función para inicializar Supabase
async function initSupabase() {
    try {
        if (typeof window.supabase === "undefined") {
            console.warn("⚠️ Supabase SDK no está cargado correctamente.");
            return false;
        }

        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log("✅ Supabase inicializado correctamente");

        // Verificar conexión
        const connected = await testSupabaseConnection();
        window.APP_STATE.supabaseConnected = connected;

        return connected;
    } catch (error) {
        console.error("❌ Error al inicializar Supabase:", error);
        return false;
    }
}

// Función para verificar conexión
async function testSupabaseConnection() {
    try {
        const { error } = await supabase
            .from("usuarios")
            .select("count", { count: "exact", head: true });
        if (error) throw error;
        console.log("✅ Conexión a Supabase exitosa");
        return true;
    } catch (error) {
        console.warn("⚠️ No se pudo conectar a Supabase. Modo offline activado.");
        return false;
    }
}

// Estado global
window.APP_STATE = {
    isOnline: navigator.onLine,
    supabaseConnected: false,
    currentUser: null,
    currentGit: null,
};

// Detectar conectividad
window.addEventListener("online", () => {
    window.APP_STATE.isOnline = true;
    console.log("📶 Conexión restaurada");
});

window.addEventListener("offline", () => {
    window.APP_STATE.isOnline = false;
    console.log("📵 Sin conexión - Modo offline activado");
});

// ✅ Inicializar automáticamente Supabase al cargar este script
initSupabase();
