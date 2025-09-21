// auth.js - Sistema de autenticación con Super Admin

class AuthSystem {
    constructor() {
        this.usuarios = [];
        this.currentUser = null;
        this.initializeAuth();
    }

    async initializeAuth() {
        // Intentar cargar desde Supabase si está disponible
        if (window.APP_STATE?.supabaseConnected) {
            await this.loadUsersFromSupabase();
        } else {
            this.loadUsersFromLocal();
        }
        
        // Verificar sesión existente
        this.checkExistingSession();
    }

    // Cargar usuarios desde Supabase
    async loadUsersFromSupabase() {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('active', true);

            if (error) throw error;

            if (data && data.length > 0) {
                this.usuarios = data;
                this.saveUsersToLocal();
                console.log('✅ Usuarios cargados desde Supabase:', data.length);
            } else {
                console.log('ℹ️ No hay usuarios en la base de datos.');
                this.usuarios = [];
            }
        } catch (error) {
            console.warn('⚠️ Error al cargar usuarios desde Supabase:', error);
            this.loadUsersFromLocal();
        }
    }

    // Cargar usuarios desde localStorage
    loadUsersFromLocal() {
        const savedUsers = localStorage.getItem('ani_usuarios');
        this.usuarios = savedUsers ? JSON.parse(savedUsers) : [];
        
        if (this.usuarios.length === 0) {
            console.log('ℹ️ No hay usuarios guardados localmente.');
        }
    }

    // Guardar usuarios en localStorage
    saveUsersToLocal() {
        localStorage.setItem('ani_usuarios', JSON.stringify(this.usuarios));
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
                console.log('✅ Sesión existente encontrada:', this.currentUser.name);
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
            // Verificar que hay usuarios
            if (this.usuarios.length === 0) {
                throw new Error('No hay usuarios configurados. Contacte al administrador.');
            }

            // Buscar usuario
            const user = this.usuarios.find(u => 
                u.email === email && 
                u.password === password && 
                u.active
            );

            if (!user) {
                throw new Error('Credenciales incorrectas o usuario inactivo.');
            }

            // Establecer sesión
            this.currentUser = { ...user };
            delete this.currentUser.password;

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

    // Crear nuevo usuario
    async createUser(userData) {
        try {
            // Validar permisos
            if (!this.hasPermission('create_user')) {
                throw new Error('No tiene permisos para crear usuarios');
            }

            // Validaciones
            if (this.usuarios.find(u => u.email === userData.email)) {
                throw new Error('Ya existe un usuario con ese email');
            }

            if (this.usuarios.find(u => 
                u.name.toLowerCase() === userData.name.toLowerCase() && 
                u.git === userData.git
            )) {
                throw new Error('Ya existe un usuario con ese nombre en el mismo GIT');
            }

            // Crear usuario
            const newUser = {
                id: Date.now(),
                ...userData,
                git_description: this.getGitDescription(userData.git),
                active: true,
                created_at: new Date().toISOString()
            };

            // Guardar en Supabase primero
            if (window.APP_STATE?.supabaseConnected) {
                const savedUser = await this.saveUserToSupabase(newUser);
                if (savedUser && savedUser[0]) {
                    newUser.id = savedUser[0].id;
                }
            }

            // Guardar localmente
            this.usuarios.push(newUser);
            this.saveUsersToLocal();

            console.log('✅ Usuario creado:', newUser.name);
            return { success: true, user: newUser };

        } catch (error) {
            console.error('❌ Error al crear usuario:', error);
            return { success: false, error: error.message };
        }
    }

    // Guardar usuario en Supabase
    async saveUserToSupabase(user) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .insert([user])
                .select();

            if (error) throw error;
            console.log('✅ Usuario guardado en Supabase');
            return data;
        } catch (error) {
            console.warn('⚠️ Error al guardar usuario en Supabase:', error);
            throw error;
        }
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
        const activities = JSON.parse(localStorage.getItem('ani_user_activities') || '[]');
        activities.push(activity);
        if (activities.length > 100) {
            activities.splice(0, activities.length - 100);
        }
        localStorage.setItem('ani_user_activities', JSON.stringify(activities));

        // Guardar en Supabase si está disponible
        if (window.APP_STATE?.supabaseConnected) {
            try {
                await supabase.from('user_activities').insert([activity]);
            } catch (error) {
                console.warn('⚠️ Error al registrar actividad en Supabase:', error);
            }
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
        if (window.APP_STATE?.supabaseConnected) {
            await this.loadUsersFromSupabase();
            return { success: true, count: this.usuarios.length };
        } else {
            return { success: false, error: 'No hay conexión a Supabase' };
        }
    }
}

// Inicializar sistema de autenticación
window.authSystem = new AuthSystem();