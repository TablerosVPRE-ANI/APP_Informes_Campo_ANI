// ============ CONFIGURACIÓN SUPABASE ============
// IMPORTANTE: Reemplaza estos valores con los tuyos
const SUPABASE_URL = "https://frvpwkhifdoimnlcngks.supabase.co";  // <-- CAMBIA ESTO
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnB3a2hpZmRvaW1ubGNuZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjc0ODcsImV4cCI6MjA3Mjk0MzQ4N30.J0JQlXfMUaKCsc8I_28FmIAoext8n5b-FMhc04MfGQE";  // <-- CAMBIA ESTO

// Inicializar Supabase (solo si está disponible)
let supabase = null;
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase conectado');
} else {
    console.log('⚠️ Supabase no disponible - trabajando offline');
}
// Estado de la aplicación
let informe = {
    id: Date.now(),
    proyecto: 'Canal del Dique',
    lugar: 'Cartagena',
    fechaSalida: '',
    fechaRegreso: '',
    objeto: '',
    participantes: [],
    actividades: [],
    compromisos: [],
    estado: 'borrador',
    fechaCreacion: new Date().toISOString(),
    ultimaModificacion: new Date().toISOString()
};

// Verificar conexión
function checkConnection() {
    const status = document.getElementById('connectionStatus');
    const text = document.getElementById('connectionText');
    
    if (navigator.onLine) {
        status.className = 'status-indicator online';
        text.textContent = 'En línea';
    } else {
        status.className = 'status-indicator offline';
        text.textContent = 'Sin conexión';
    }
}

// Cambiar sección - CORREGIDO
function cambiarSeccion(seccion, elemento) {
    guardarBorrador();
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    
    // Mostrar sección seleccionada
    document.getElementById(seccion).classList.add('active');
    
    // Marcar botón activo (si viene del menú)
    if (elemento) {
        elemento.classList.add('active');
    } else if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Si es la sección guardar, mostrar resumen
    if (seccion === 'guardar') {
        mostrarResumen();
    }
}

// Guardar actividad
function guardarActividad() {
    const titulo = document.getElementById('actividadTitulo').value.trim();
    const fecha = document.getElementById('actividadFecha').value;
    const descripcion = document.getElementById('actividadDescripcion').value.trim();
    
    if (!titulo || !fecha) {
        mostrarNotificacion('⚠️ Por favor complete título y fecha', 'warning');
        return;
    }
    
    const actividad = {
        id: Date.now(),
        titulo: titulo,
        fecha: fecha,
        descripcion: descripcion
    };
    
    informe.actividades.push(actividad);
    guardarBorrador();
    actualizarListaActividades();
    
    // Limpiar formulario
    document.getElementById('actividadTitulo').value = '';
    document.getElementById('actividadFecha').value = '';
    document.getElementById('actividadDescripcion').value = '';
    
    mostrarNotificacion('✅ Actividad agregada', 'success');
}

// Guardar compromiso
function guardarCompromiso() {
    const descripcion = document.getElementById('compromisoDescripcion').value.trim();
    const responsable = document.getElementById('compromisoResponsable').value;
    const fecha = document.getElementById('compromisoFecha').value;
    const prioridad = document.getElementById('compromisoPrioridad').value;
    
    if (!descripcion || !responsable || !fecha) {
        mostrarNotificacion('⚠️ Por favor complete todos los campos', 'warning');
        return;
    }
    
    const compromiso = {
        id: Date.now(),
        descripcion: descripcion,
        responsable: responsable,
        fechaLimite: fecha,
        prioridad: prioridad,
        estado: 'pendiente'
    };
    
    informe.compromisos.push(compromiso);
    guardarBorrador();
    actualizarListaCompromisos();
    
    // Limpiar formulario
    document.getElementById('compromisoDescripcion').value = '';
    document.getElementById('compromisoResponsable').value = '';
    document.getElementById('compromisoFecha').value = '';
    
    mostrarNotificacion('✅ Compromiso agregado', 'success');
}

// Eliminar actividad
function eliminarActividad(id) {
    if (confirm('¿Desea eliminar esta actividad?')) {
        informe.actividades = informe.actividades.filter(a => a.id !== id);
        guardarBorrador();
        actualizarListaActividades();
        mostrarNotificacion('Actividad eliminada', 'info');
    }
}

// Eliminar compromiso
function eliminarCompromiso(id) {
    if (confirm('¿Desea eliminar este compromiso?')) {
        informe.compromisos = informe.compromisos.filter(c => c.id !== id);
        guardarBorrador();
        actualizarListaCompromisos();
        mostrarNotificacion('Compromiso eliminado', 'info');
    }
}

// Actualizar lista de actividades
function actualizarListaActividades() {
    const lista = document.getElementById('listaActividades');
    
    if (informe.actividades.length === 0) {
        lista.innerHTML = '<div class="form-section"><p style="color: #666; text-align: center;">No hay actividades registradas</p></div>';
        return;
    }
    
    let html = '<div class="form-section"><div class="form-title">Actividades Registradas (' + 
               informe.actividades.length + ')</div>';
    
    informe.actividades.forEach(act => {
        const fechaFormateada = act.fecha ? new Date(act.fecha).toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Sin fecha';
        
        html += `
            <div class="actividad-item" style="position: relative;">
                <button onclick="eliminarActividad(${act.id})" 
                        style="position: absolute; right: 5px; top: 5px; 
                               background: #ff4444; color: white; border: none; 
                               border-radius: 50%; width: 25px; height: 25px; 
                               cursor: pointer; font-size: 16px;">×</button>
                <strong>${act.titulo}</strong><br>
                <small>📅 ${fechaFormateada}</small><br>
                <p style="margin-top: 5px;">${act.descripcion || 'Sin descripción'}</p>
            </div>
        `;
    });
    
    html += '</div>';
    lista.innerHTML = html;
}

// Actualizar lista de compromisos
function actualizarListaCompromisos() {
    const lista = document.getElementById('listaCompromisos');
    
    if (informe.compromisos.length === 0) {
        lista.innerHTML = '<div class="form-section"><p style="color: #666; text-align: center;">No hay compromisos registrados</p></div>';
        return;
    }
    
    let html = '<div class="form-section"><div class="form-title">Compromisos Registrados (' + 
               informe.compromisos.length + ')</div>';
    
    informe.compromisos.forEach(comp => {
        const prioridadColor = comp.prioridad === 'alta' ? '🔴' : 
                               comp.prioridad === 'media' ? '🟡' : '🟢';
        
        const fechaLimite = new Date(comp.fechaLimite);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
        const estadoFecha = diasRestantes < 0 ? '⚠️ Vencido' : 
                           diasRestantes === 0 ? '📅 Vence hoy' : 
                           diasRestantes <= 3 ? `⏰ ${diasRestantes} días` : 
                           `📅 ${diasRestantes} días`;
        
        html += `
            <div class="compromiso-item" style="position: relative;">
                <button onclick="eliminarCompromiso(${comp.id})" 
                        style="position: absolute; right: 5px; top: 5px; 
                               background: #ff4444; color: white; border: none; 
                               border-radius: 50%; width: 25px; height: 25px; 
                               cursor: pointer; font-size: 16px;">×</button>
                <strong>${comp.descripcion}</strong><br>
                <span style="color: #666;">👤 ${comp.responsable}</span><br>
                <span>${estadoFecha} | ${prioridadColor} Prioridad ${comp.prioridad}</span>
            </div>
        `;
    });
    
    html += '</div>';
    lista.innerHTML = html;
}

// Guardar borrador
function guardarBorrador() {
    const lugar = document.getElementById('lugar');
    const fechaSalida = document.getElementById('fechaSalida');
    const fechaRegreso = document.getElementById('fechaRegreso');
    const objeto = document.getElementById('objeto');
    const participantes = document.getElementById('participantes');
    
    if (lugar) informe.lugar = lugar.value || 'Cartagena';
    if (fechaSalida) informe.fechaSalida = fechaSalida.value;
    if (fechaRegreso) informe.fechaRegreso = fechaRegreso.value;
    if (objeto) informe.objeto = objeto.value;
    if (participantes) {
        informe.participantes = participantes.value
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
    }
    
    informe.ultimaModificacion = new Date().toISOString();
    
    try {
        localStorage.setItem('informe_borrador', JSON.stringify(informe));
        console.log('Borrador guardado:', informe);
    } catch (e) {
        console.error('Error guardando borrador:', e);
        mostrarNotificacion('Error al guardar borrador', 'error');
    }
}

// Guardar informe completo
function guardarInforme() {
    if (!informe.objeto || !informe.fechaSalida) {
        mostrarNotificacion('⚠️ Complete la información básica antes de guardar', 'warning');
        return;
    }
    
    guardarBorrador();
    informe.estado = 'guardado_local';
    
    try {
        const key = `informe_${informe.id}`;
        localStorage.setItem(key, JSON.stringify(informe));
        
        // Agregar a lista de informes guardados
        let listaInformes = JSON.parse(localStorage.getItem('lista_informes') || '[]');
        const existeIndex = listaInformes.findIndex(i => i.id === informe.id);
        
        const resumenInforme = {
            id: informe.id,
            proyecto: informe.proyecto,
            lugar: informe.lugar,
            fecha: informe.fechaSalida,
            actividades: informe.actividades.length,
            compromisos: informe.compromisos.length,
            ultimaModificacion: informe.ultimaModificacion
        };
        
        if (existeIndex >= 0) {
            listaInformes[existeIndex] = resumenInforme;
        } else {
            listaInformes.push(resumenInforme);
        }
        
        localStorage.setItem('lista_informes', JSON.stringify(listaInformes));
        mostrarNotificacion('✅ Informe guardado localmente', 'success');
    } catch (e) {
        console.error('Error guardando informe:', e);
        mostrarNotificacion('Error al guardar el informe', 'error');
    }
}

// Sincronizar con Supabase
async function sincronizar() {
    // Verificar conexión
    if (!navigator.onLine) {
        mostrarNotificacion('⚠️ Sin conexión. Se sincronizará automáticamente cuando se recupere.', 'warning');
        agregarAColaDeSincronizacion();
        return;
    }
    
    // Verificar que Supabase esté disponible
    if (!supabase) {
        mostrarNotificacion('⚠️ Base de datos no configurada', 'warning');
        return;
    }
    
    mostrarNotificacion('☁️ Sincronizando con base de datos...', 'info');
    
    try {
        // Preparar datos del informe
        const datosInforme = {
            informe_id: String(informe.id),
            proyecto: informe.proyecto,
            lugar: informe.lugar,
            fecha_salida: informe.fechaSalida || null,
            fecha_regreso: informe.fechaRegreso || null,
            objeto: informe.objeto,
            participantes: informe.participantes,
            estado: 'sincronizado',
            usuario: localStorage.getItem('usuario_ani') || 'funcionario_campo',
            ultima_modificacion: new Date().toISOString(),
            datos_completos: informe
        };
        
        // Insertar o actualizar en tabla informes
        const { data: informeGuardado, error: errorInforme } = await supabase
            .from('informes')
            .upsert(datosInforme, { 
                onConflict: 'informe_id',
                returning: 'minimal' 
            });
        
        if (errorInforme) {
            console.error('Error guardando informe:', errorInforme);
            throw errorInforme;
        }
        
        // Guardar actividades si hay
        if (informe.actividades && informe.actividades.length > 0) {
            // Primero eliminar actividades anteriores de este informe
            await supabase
                .from('actividades')
                .delete()
                .eq('informe_id', String(informe.id));
            
            // Insertar nuevas actividades
            const actividadesParaGuardar = informe.actividades.map(act => ({
                informe_id: String(informe.id),
                titulo: act.titulo,
                fecha: act.fecha || null,
                descripcion: act.descripcion || ''
            }));
            
            const { error: errorActividades } = await supabase
                .from('actividades')
                .insert(actividadesParaGuardar);
            
            if (errorActividades) {
                console.error('Error guardando actividades:', errorActividades);
            }
        }
        
        // Guardar compromisos si hay
        if (informe.compromisos && informe.compromisos.length > 0) {
            // Primero eliminar compromisos anteriores
            await supabase
                .from('compromisos')
                .delete()
                .eq('informe_id', String(informe.id));
            
            // Insertar nuevos compromisos
            const compromisosParaGuardar = informe.compromisos.map(comp => ({
                informe_id: String(informe.id),
                descripcion: comp.descripcion,
                responsable: comp.responsable,
                fecha_limite: comp.fechaLimite || null,
                prioridad: comp.prioridad,
                estado: comp.estado || 'pendiente'
            }));
            
            const { error: errorCompromisos } = await supabase
                .from('compromisos')
                .insert(compromisosParaGuardar);
            
            if (errorCompromisos) {
                console.error('Error guardando compromisos:', errorCompromisos);
            }
        }
        
        // Actualizar estado local
        informe.estado = 'sincronizado';
        informe.fechaSincronizacion = new Date().toISOString();
        guardarBorrador();
        
        // Limpiar cola de sincronización
        removerDeColaDeSincronizacion(informe.id);
        
        mostrarNotificacion('✅ Sincronizado exitosamente con la base de datos central', 'success');
        
        // Actualizar resumen si está visible
        if (document.getElementById('guardar').classList.contains('active')) {
            mostrarResumen();
        }
        
    } catch (error) {
        console.error('Error en sincronización:', error);
        mostrarNotificacion('❌ Error al sincronizar. Se guardó localmente y se reintentará.', 'error');
        agregarAColaDeSincronizacion();
    }
}

// Función auxiliar: agregar a cola de sincronización
function agregarAColaDeSincronizacion() {
    let cola = JSON.parse(localStorage.getItem('cola_sincronizacion') || '[]');
    if (!cola.find(item => item.id === informe.id)) {
        cola.push({
            id: informe.id,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('cola_sincronizacion', JSON.stringify(cola));
        console.log('Agregado a cola de sincronización');
    }
}

// Función auxiliar: remover de cola
function removerDeColaDeSincronizacion(id) {
    let cola = JSON.parse(localStorage.getItem('cola_sincronizacion') || '[]');
    cola = cola.filter(item => item.id !== id);
    localStorage.setItem('cola_sincronizacion', JSON.stringify(cola));
}

// Exportar JSON
function exportarJSON() {
    try {
        const dataStr = JSON.stringify(informe, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const fecha = new Date().toISOString().split('T')[0];
        const exportFileDefaultName = `informe_canal_dique_${fecha}_${informe.id}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        mostrarNotificacion('📥 Archivo JSON descargado', 'success');
    } catch (e) {
        console.error('Error exportando JSON:', e);
        mostrarNotificacion('Error al exportar archivo', 'error');
    }
}

// Mostrar resumen
function mostrarResumen() {
    const resumen = document.getElementById('resumen');
    
    const totalElementos = informe.actividades.length + informe.compromisos.length;
    const porcentajeCompletado = informe.objeto && informe.fechaSalida && informe.fechaRegreso ? 
                                 Math.min(100, 30 + (totalElementos * 10)) : 10;
    
    resumen.innerHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #004884;">
            <h4 style="margin-bottom: 10px; color: #004884;">Resumen del Informe</h4>
            
            <div style="margin-bottom: 10px;">
                <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #004884, #0066b3); 
                               height: 100%; width: ${porcentajeCompletado}%; 
                               transition: width 0.3s; display: flex; align-items: center; 
                               justify-content: center; color: white; font-size: 12px;">
                        ${porcentajeCompletado}%
                    </div>
                </div>
            </div>
            
            <p><strong>📍 Lugar:</strong> ${informe.lugar || 'No especificado'}</p>
            <p><strong>📅 Período:</strong> ${informe.fechaSalida || 'Sin definir'} al ${informe.fechaRegreso || 'Sin definir'}</p>
            <p><strong>👥 Participantes:</strong> ${informe.participantes.length > 0 ? informe.participantes.join(', ') : 'No especificados'}</p>
            <p><strong>📝 Actividades:</strong> ${informe.actividades.length} registradas</p>
            <p><strong>🎯 Compromisos:</strong> ${informe.compromisos.length} registrados</p>
            <p><strong>📊 Estado:</strong> <span style="background: ${informe.estado === 'sincronizado' ? '#28a745' : '#ffc107'}; 
                                                        color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                ${informe.estado.toUpperCase()}</span></p>
            <p><strong>🕐 Última modificación:</strong> ${new Date(informe.ultimaModificacion).toLocaleString('es-CO')}</p>
        </div>
    `;
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    const syncStatus = document.getElementById('syncStatus');
    
    const colores = {
        'success': '#d4edda',
        'error': '#f8d7da',
        'warning': '#fff3cd',
        'info': '#d1ecf1'
    };
    
    syncStatus.textContent = mensaje;
    syncStatus.style.display = 'block';
    syncStatus.style.background = colores[tipo] || colores['info'];
    syncStatus.style.color = tipo === 'error' ? '#721c24' : 
                            tipo === 'warning' ? '#856404' : 
                            tipo === 'success' ? '#155724' : '#004085';
    
    // Limpiar timeout anterior si existe
    if (syncStatus.timeoutId) {
        clearTimeout(syncStatus.timeoutId);
    }
    
    // Establecer nuevo timeout
    syncStatus.timeoutId = setTimeout(() => {
        syncStatus.style.display = 'none';
    }, 3000);
}

// Cargar borrador si existe
function cargarBorrador() {
    try {
        const borrador = localStorage.getItem('informe_borrador');
        if (borrador) {
            informe = JSON.parse(borrador);
            console.log('Borrador cargado:', informe);
            
            // Restaurar valores en formulario
            const lugar = document.getElementById('lugar');
            const fechaSalida = document.getElementById('fechaSalida');
            const fechaRegreso = document.getElementById('fechaRegreso');
            const objeto = document.getElementById('objeto');
            const participantes = document.getElementById('participantes');
            
            if (lugar) lugar.value = informe.lugar || 'Cartagena';
            if (fechaSalida) fechaSalida.value = informe.fechaSalida || '';
            if (fechaRegreso) fechaRegreso.value = informe.fechaRegreso || '';
            if (objeto) objeto.value = informe.objeto || '';
            if (participantes) participantes.value = informe.participantes.join(', ') || '';
            
            actualizarListaActividades();
            actualizarListaCompromisos();
            
            mostrarNotificacion('📂 Borrador anterior cargado', 'info');
        }
    } catch (e) {
        console.error('Error cargando borrador:', e);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicación iniciada');
    
    checkConnection();
    cargarBorrador();
    
    // Establecer fecha de hoy como predeterminada si no hay borrador
    if (!informe.fechaSalida) {
        const hoy = new Date().toISOString().split('T')[0];
        const fechaSalida = document.getElementById('fechaSalida');
        const fechaRegreso = document.getElementById('fechaRegreso');
        
        if (fechaSalida) fechaSalida.value = hoy;
        if (fechaRegreso) fechaRegreso.value = hoy;
    }
    
    // Verificar conexión periódicamente
    setInterval(checkConnection, 5000);
    
    // Auto-guardar borrador
    setInterval(() => {
        guardarBorrador();
        console.log('Auto-guardado ejecutado');
    }, 30000);
    
    // Eventos de conexión
    window.addEventListener('online', () => {
        checkConnection();
        mostrarNotificacion('✅ Conexión restaurada', 'success');
    });
    
    window.addEventListener('offline', () => {
        checkConnection();
        mostrarNotificacion('⚠️ Trabajando sin conexión', 'warning');
    });
});

// Prevenir pérdida de datos al cerrar
window.addEventListener('beforeunload', (e) => {
    guardarBorrador();
});