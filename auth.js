// auth.js - Sistema de autenticación confiable

class AuthSystem {
    constructor() {
        this.usuarios = [];
        this.currentUser = null;
        this.supabaseUrl = 'https://frvpwkhifdoimnlcngks.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnB3a2hpZmRvaW1pbGNuZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjc0ODcsImV4cCI6MjA3Mjk0MzQ4N30.J0JQlXfMUaKCsc8I_28FmIAoext8n5b-FMhc04MfGQE';
        this.initializeAuth();
    }

    async initializeAuth() {
        console.log('🔄 Iniciando sistema de autenticación...');
        
        // Siempre intentar cargar desde Supabase primero
        const supabaseSuccess = await this.loadUsersFromSupabaseDirect();
        
        if (!supabaseSuccess) {
            console.log('📱 Fallback: Cargando desde localStorage');
            this.loadUsersFromLocal();
        }
        
        // Verificar sesión existente
        this.checkExistingSession();
    }

    // Cargar usuarios directamente desde Supabase usando fetch
    async loadUsersFromSupabaseDirect() {
        try {
            console.log('🔍 Conectando directamente a Supabase...');
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/usuarios`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📊 Datos recibidos de Supabase:', data);

            if (data && Array.isArray(data) && data.length > 0) {
                // Filtrar usuarios activos
                this.usuarios = data.filter(u => u.active === true);
                this.saveUsersToLocal();
                console.log(`✅ ${this.usuarios.length} usuarios activos cargados desde Supabase`);
                console.log('👤 Usuarios:', this.usuarios.map(u => `${u.email} (${u.role})`));
                return true;
            } else {
                console.log('ℹ️ No se encontraron usuarios en Supabase');
                return false;
            }
        } catch (error) {
            console.error('❌ Error al cargar desde Supabase:', error);
            return false;
        }
    }

    // Cargar usuarios desde localStorage
    loadUsersFromLocal() {
        try {
            const savedUsers = localStorage.getItem('ani_usuarios');
            if (savedUsers) {
                this.usuarios = JSON.parse(savedUsers);
                console.log(`📱 ${this.usuarios.length} usuarios cargados desde localStorage`);
            } else {
                console.log('ℹ️ No hay usuarios en localStorage');
                this.usuarios = [];
            }
        } catch (error) {
            console.error('❌ Error al cargar localStorage:', error);
            this.usuarios = [];
        }
    }

    // Guardar usuarios en localStorage
    saveUsersToLocal() {
        try {
            localStorage.setItem('ani_usuarios', JSON.stringify(this.usuarios));
            console.log('💾 Usuarios guardados en localStorage');
        } catch (error) {
            console.error('❌ Error al guardar en localStorage:', error);
        }
    }

    // Verificar sesión existente
    checkExistingSession() {
        const savedSession = localStorage.getItem('ani_session');
        if (savedSession) {
            try {
                this.currentUser = JSON.parse(savedSession);
                window.APP_STATE = window.APP_STATE || {};
                window.APP_STATE.currentUser = this.currentUser;
                window.APP_STATE.currentGit = this.currentUser.git;
                console.log('✅ Sesión existente:', this.currentUser.name);
                return true;
            } catch (error) {
                console.warn('⚠️ Error al cargar sesión existente');
                this.logout();
            }
        }
        return false;
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

            // Establecer sesión
            this.currentUser = { ...user };
            delete this.currentUser.password; // No guardar contraseña en sesión

            // Guardar sesión
            localStorage.setItem('ani_session', JSON.stringify(this.currentUser));
            window.APP_STATE = window.APP_STATE || {};
            window.APP_STATE.currentUser = this.currentUser;
            window.APP_STATE.currentGit = this.currentUser.git;

            // Registrar login
            await this.logUserActivity('login');

            console.log('✅ Login exitoso:', this.currentUser.name);
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, error: error.message };
        }
    }

    // Cerrar sesión
    async logout() {
        if (this.currentUser) {
            await this.logUserActivity('logout');
        }

        this.currentUser = null;
        if (window.APP_STATE) {
            window.APP_STATE.currentUser = null;
            window.APP_STATE.currentGit = null;
        }
        localStorage.removeItem('ani_session');
        
        console.log('✅ Sesión cerrada');
    }

    // Registrar actividad del usuario
    async logUserActivity(action) {
        if (!this.currentUser) return;

        const activity = {
            user_id: this.currentUser.id,
            user_name: this.currentUser.name,
            user_git: this.currentUser.git,
            action: action,
            details: { timestamp: new Date().toISOString() },
            ip: 'unknown',
            user_agent: navigator.userAgent
        };

        // Guardar localmente
        try {
            const activities = JSON.parse(localStorage.getItem('ani_user_activities') || '[]');
            activities.push(activity);
            if (activities.length > 100) {
                activities.splice(0, activities.length - 100);
            }
            localStorage.setItem('ani_user_activities', JSON.stringify(activities));
        } catch (error) {
            console.warn('⚠️ Error al guardar actividad local:', error);
        }

        // Intentar guardar en Supabase
        try {
            await fetch(`${this.supabaseUrl}/rest/v1/user_activities`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activity)
            });
        } catch (error) {
            console.warn('⚠️ Error al registrar actividad en Supabase:', error);
        }
    }

    // Obtener descripción del GIT
    getGitDescription(git) {
        const descriptions = {
            'Social': 'Grupo Interno de Trabajo - Social',
            'Predial': 'Grupo Interno de Trabajo - Predial',
            'Ambiental': 'Grupo Interno de Trabajo - Ambiental',
            'JuridicoPredial': 'Grupo Interno de Trabajo - Jurídico Predial',
            'Riesgos': 'Grupo Interno de Trabajo - Riesgos',
            'Valorizacion': 'Grupo Interno de Trabajo - Valorización',
            'TICs': 'Grupo Interno de Trabajo - TICs',
            'SuperAdmin': 'Super Administrador del Sistema'
        };
        return descriptions[git] || '';
    }

    // Verificar permisos
    hasPermission(permission) {
        if (!this.currentUser) return false;

        const permissions = {
            'superadmin': ['*'], // Acceso total
            'admin': ['create_user', 'edit_user', 'delete_user', 'view_all_reports'],
            'coordinador': ['create_report', 'edit_report', 'view_git_reports'],
            'funcionario': ['create_report', 'edit_own_report']
        };

        // Super admin puede todo
        if (this.currentUser.role === 'superadmin') return true;
        
        return permissions[this.currentUser.role]?.includes(permission) || false;
    }

    // Verificar si es Super Admin
    isSuperAdmin() {
        return this.currentUser && this.currentUser.role === 'superadmin';
    }

    // Obtener usuarios activos
    getActiveUsers() {
        return this.usuarios.filter(u => u.active);
    }

    // Recargar usuarios desde Supabase
    async refreshUsers() {
        const success = await this.loadUsersFromSupabaseDirect();
        return { 
            success: success, 
            count: this.usuarios.length,
            message: success ? 'Usuarios actualizados' : 'Error al actualizar usuarios'
        };
    }

    // Verificar estado del sistema
    getSystemStatus() {
        return {
            hasUsers: this.usuarios.length > 0,
            userCount: this.usuarios.length,
            isLoggedIn: !!this.currentUser,
            currentUser: this.currentUser ? this.currentUser.name : null,
            lastUpdate: new Date().toISOString()
        };
    }

    // Método para debug - mostrar información del sistema
    debug() {
        console.log('🔧 Estado del sistema de autenticación:');
        console.log('- Usuarios cargados:', this.usuarios.length);
        console.log('- Usuario actual:', this.currentUser ? this.currentUser.name : 'None');
        console.log('- Usuarios disponibles:', this.usuarios.map(u => `${u.email} (${u.role})`));
        return this.getSystemStatus();
    }
}

// Inicializar sistema de autenticación
window.authSystem = new AuthSystem();

// Función global para debug
window.debugAuth = () => window.authSystem.debug();
