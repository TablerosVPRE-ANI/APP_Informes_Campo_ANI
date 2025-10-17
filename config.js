// config.js - Configuración de Supabase para ANI Campo
const SUPABASE_CONFIG = {
    url: "https://frvpwkhifdoimnlcngks.supabase.co", // REEMPLAZAR con tu URL real
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnB3a2hpZmRvaW1ubGNuZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjc0ODcsImV4cCI6MjA3Mjk0MzQ4N30.J0JQlXfMUaKCsc8I_28FmIAoext8n5b-FMhc04MfGQE' // REEMPLAZAR con tu clave anónima real
};

// Inicializar cliente de Supabase
let supabase;

    document.addEventListener('DOMContentLoaded', async function() {
        currentUser = JSON.parse(localStorage.getItem('ani_current_user') || '{}');
        if (!currentUser.email) {
            alert('Debe iniciar sesión');
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('userInfo').textContent = `${currentUser.name} - ${currentUser.git}`;
        cargarMisSolicitudes();
    });

// Función para inicializar Supabase
function initSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase no está cargado');
            return false;
        }
        
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return false;
    }
}

// Función para verificar conexión
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log('✅ Conexión a Supabase exitosa');
        return true;
    } catch (error) {
        console.warn('⚠️ No se pudo conectar a Supabase, usando modo offline');
        return false;
    }
}

// Variables globales para manejo de estado
window.APP_STATE = {
    isOnline: navigator.onLine,
    supabaseConnected: false,
    currentUser: null,
    currentGit: null
};

// Detectar cambios de conectividad
window.addEventListener('online', () => {
    window.APP_STATE.isOnline = true;
    console.log('📶 Conexión restaurada');
});

window.addEventListener('offline', () => {
    window.APP_STATE.isOnline = false;
    console.log('📵 Sin conexión - Modo offline activado');
});

// INSTRUCCIONES:
// 1. Ve a tu proyecto Supabase
// 2. Settings → API
// 3. Copia la URL del proyecto
// 4. Copia la clave "anon public"

// 5. Reemplaza los valores arriba
