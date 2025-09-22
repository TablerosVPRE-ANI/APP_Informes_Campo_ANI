// auth.js - Sistema de autenticación confiable con correcciones

class AuthSystem {
    constructor() {
        this.usuarios = [];
        this.currentUser = null;
        this.supabaseUrl = 'https://frvpwkhifdoimlcngks.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnB3a2hpZmRvaW1ubGNuZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjc0ODcsImV4cCI6MjA3Mjk0MzQ4N30.J0JQlXfMUaKCsc8I_28FmIAoext8n5b-FMhc04MfGQE';
        this.initializeAuth();
    }

    async initializeAuth() {
        console.log('🔄 Iniciando sistema de autenticación...');
        
        try {
            // Intentar cargar usuarios desde Supabase
            const loaded = await this.loadUsersFromSupabaseDirect();
            
            if (!loaded || this.usuarios.length === 0) {
                console.log('📱 Fallback: Cargando desde localStorage');
                this.loadUsersFromLocal();
            }
        } catch (error) {
            console.error('Error en inicialización:', error);
            this.loadUsersFromLocal();
        }
    }

    // Cargar usuarios directamente desde Supabase
    async loadUsersFromSupabaseDirect() {
        try {
            console.log('🔍 Conectando directamente a Supabase...');
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/usuarios`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`📊 Datos recibidos de Supabase:`, data);

            if (data && Array.isArray(data) && data.length > 0) {
                // Filtrar solo usuarios activos
                this.usuarios = data.filter(u => u.active === true);
                this.saveUsersToLocal();
                console.log(`✅ ${this.usuarios.length} usuarios activos cargados desde Supabase`);
                console.log('👤 Usuarios disponibles:', this.usuarios.map(u => `${u.email} (${u.role})`));
                return true;
            } else {
                console.log('ℹ️ No hay usuarios en Supabase');
                return false;
            }
        } catch (error) {
            console.error('❌ Error al cargar desde Supabase:', error);
            return false;
        }
    }

    // Guardar usuarios en localStorage
    saveUsersToLocal() {
        try {
            localStorage.setItem('ani_usuarios', JSON.stringify(this.usuarios));
            console.log('💾 Usuarios guardados en localStorage');
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }
    }

    // Cargar usuarios desde localStorage
    loadUsersFromLocal() {
        try {
            const stored = localStorage.getItem('ani_usuarios');
            if (stored) {
                this.usuarios = JSON.parse(stored);
                console.log(`📱 ${this.usuarios.length} usuarios cargados desde localStorage`);
            } else {
                console.log('ℹ️ No hay usuarios en localStorage');
            }
        } catch (error) {
            console.error('Error cargando desde localStorage:', error);
        }
    }

    // Verificar sesión existente
    checkExistingSession() {
        try {
            // Verificar ani_current_user primero (compatibilidad con admin)
            const currentUser = localStorage.getItem('ani_current_user');
            if (currentUser) {
                const user = JSON.parse(currentUser);
                if (user && user.email && user.role) {
                    this.currentUser = user;
                    window.APP_STATE = window.APP_STATE || {};
                    window.APP_STATE.currentUser = user;
                    window.APP_STATE.currentGit = user.git;
                    console.log('✅ Sesión existente encontrada:', user.name, `(${user.role})`);
                    return true;
                }
            }

            // Si no existe, verificar ani_session (formato anterior)
            const session = localStorage.getItem('ani_session');
            if (session) {
                const data = JSON.parse(session);
                const user = data.user || data; // Compatibilidad con ambos formatos
                
                if (user && user.email) {
                    this.currentUser = user;
                    window.APP_STATE = window.APP_STATE || {};
                    window.APP_STATE.currentUser = user;
                    window.APP_STATE.currentGit = user.git;
                    
                    // Sincronizar a ani_current_user para compatibilidad
                    localStorage.setItem('ani_current_user', JSON.stringify(user));
                    
                    console.log('✅ Sesión recuperada:', user.name, `(${user.role})`);
                    return true;
                }
            }

            console.log('ℹ️ No hay sesión activa');
            return false;
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return false;
        }
    }

    // Iniciar sesión
    async login(email, password) {
        try {
            console.log(`🔐 Intentando login para: ${email}`);
            
            // Si no hay usuarios, intentar cargar nuevamente desde Supabase
            if (this.usuarios.length === 0) {
                console.log('🔄 No hay usuarios, reintentando carga desde Supabase...');
                const reloaded = await this.loadUsersFromSupabaseDirect();
                if (!reloaded) {
                    throw new Error('No se pudieron cargar los usuarios. Verifique su conexión.');
                }
            }

            // Buscar usuario
            const user = this.usuarios.find(u => 
                u.email === email && 
                u.password === password && 
                u.active === true
            );

            if (!user) {
                console.log('❌ Usuario no encontrado o credenciales incorrectas');
                console.log('📋 Usuarios disponibles:', this.usuarios.map(u => u.email));
                throw new Error('Credenciales incorrectas o usuario inactivo.');
            }

            // Establecer sesión (sin contraseña)
            this.currentUser = { ...user };
            delete this.currentUser.password;

            // IMPORTANTE: Guardar en AMBAS claves para compatibilidad total
            // 1. Guardar en ani_session (formato con timestamp)
            localStorage.setItem('ani_session', JSON.stringify({
                user: this.currentUser,
                timestamp: Date.now()
            }));
            
            // 2. Guardar en ani_current_user (necesario para el módulo admin)
            localStorage.setItem('ani_current_user', JSON.stringify(this.currentUser));
            
            // 3. Actualizar estado global
            window.APP_STATE = window.APP_STATE || {};
            window.APP_STATE.currentUser = this.currentUser;
            window.APP_STATE.currentGit = this.currentUser.git;

            // Registrar login
            await this.logUserActivity('login');
            
            console.log('✅ Login exitoso:', this.currentUser.name, `(${this.currentUser.role})`);
            console.log('📋 Rol del usuario:', this.currentUser.role);
            console.log('🏢 GIT asignado:', this.currentUser.git);
            
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, error: error.message };
        }
    }

    // Cerrar sesión
    logout() {
        try {
            // Limpiar todas las claves de sesión
            localStorage.removeItem('ani_session');
            localStorage.removeItem('ani_current_user');
            
            // Limpiar estado
            this.currentUser = null;
            if (window.APP_STATE) {
                window.APP_STATE.currentUser = null;
                window.APP_STATE.currentGit = null;
            }
            
            console.log('👋 Sesión cerrada');
            return { success: true };
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return { success: false, error: error.message };
        }
    }

    // Registrar actividad del usuario
    async logUserActivity(action) {
        try {
            if (!this.currentUser) return;

            const activity = {
                user_id: this.currentUser.id,
                user_email: this.currentUser.email,
                action: action,
                timestamp: new Date().toISOString(),
                git: this.currentUser.git
            };

            // Guardar en localStorage
            const activities = JSON.parse(localStorage.getItem('ani_activities') || '[]');
            activities.push(activity);
            
            // Mantener solo las últimas 100 actividades
            if (activities.length > 100) {
                activities.shift();
            }
            
            localStorage.setItem('ani_activities', JSON.stringify(activities));
            console.log(`📝 Actividad registrada: ${action}`);
        } catch (error) {
            console.error('Error registrando actividad:', error);
        }
    }

    // Función de debug para verificar estado
    debugAuth() {
        console.log('=== DEBUG AUTH SYSTEM ===');
        console.log('Usuarios cargados:', this.usuarios.length);
        console.log('Usuario actual:', this.currentUser);
        console.log('localStorage ani_session:', localStorage.getItem('ani_session'));
        console.log('localStorage ani_current_user:', localStorage.getItem('ani_current_user'));
        console.log('localStorage ani_usuarios:', localStorage.getItem('ani_usuarios'));
        console.log('APP_STATE:', window.APP_STATE);
        console.log('========================');
    }

    // Recargar usuarios manualmente
    async reloadUsers() {
        console.log('🔄 Recargando usuarios...');
        const loaded = await this.loadUsersFromSupabaseDirect();
        if (loaded) {
            console.log('✅ Usuarios recargados exitosamente');
        } else {
            console.log('❌ No se pudieron recargar los usuarios');
        }
        return loaded;
    }
}

// Crear instancia global
window.authSystem = new AuthSystem();

// Función de ayuda para debug
window.debugAuth = () => window.authSystem.debugAuth();

// Función de ayuda para recargar usuarios
window.reloadUsers = () => window.authSystem.reloadUsers();

console.log('🔐 Sistema de autenticación cargado');
console.log('ℹ️ Use debugAuth() en la consola para ver el estado');
console.log('ℹ️ Use reloadUsers() para recargar usuarios desde Supabase');


