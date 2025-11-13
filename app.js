// Estado de la aplicación - ACTUALIZAR
let informe = {
    id: Date.now(),
    proyecto: '',
    perfilGIT: '',  // <-- NUEVO
    nombreFuncionario: '',  // <-- NUEVO
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
}

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

// Guardar actividad con manejo de imágenes
function guardarActividad() {
    const titulo = document.getElementById('actividadTitulo').value.trim();
    const fecha = document.getElementById('actividadFecha').value;
    const descripcion = document.getElementById('actividadDescripcion').value.trim();
    const fotosInput = document.getElementById('actividadFoto');
    
    if (!titulo || !fecha) {
        mostrarNotificacion('⚠️ Por favor complete título y fecha', 'warning');
        return;
    }
    
    const actividad = {
        id: Date.now(),
        titulo: titulo,
        fecha: fecha,
        descripcion: descripcion,
        fotos: []
    };
    
    // Procesar imágenes si hay
    if (fotosInput.files && fotosInput.files.length > 0) {
        const cantidadFotos = fotosInput.files.length;
        
        // Procesar cada imagen
        Array.from(fotosInput.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Guardar imagen como base64 (para modo offline)
                actividad.fotos.push({
                    nombre: file.name,
                    tipo: file.type,
                    tamano: file.size,
                    datos: e.target.result // base64
                });
                
                // Si es la última imagen, guardar la actividad
                if (actividad.fotos.length === cantidadFotos) {
                    informe.actividades.push(actividad);
                    guardarBorrador();
                    actualizarListaActividades();
                    mostrarNotificacion(`✅ Actividad agregada con ${cantidadFotos} foto(s)`, 'success');
                    
                    // Limpiar formulario
                    document.getElementById('actividadTitulo').value = '';
                    document.getElementById('actividadFecha').value = '';
                    document.getElementById('actividadDescripcion').value = '';
                    document.getElementById('actividadFoto').value = '';
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        // Sin fotos, guardar directamente
        informe.actividades.push(actividad);
        guardarBorrador();
        actualizarListaActividades();
        mostrarNotificacion('✅ Actividad agregada', 'success');
        
        // Limpiar formulario
        document.getElementById('actividadTitulo').value = '';
        document.getElementById('actividadFecha').value = '';
        document.getElementById('actividadDescripcion').value = '';
    }
}

function abrirModalEdicion(id) {
    const actividad = informe.actividades.find(a => a.id === id);
    if (!actividad) return;

    // Limpiar el input de archivos por si se quedó algo de antes
    document.getElementById('editActividadNuevasFotos').value = '';

    // Llenar los campos de texto
    document.getElementById('editActividadId').value = actividad.id;
    document.getElementById('editActividadTitulo').value = actividad.titulo;
    document.getElementById('editActividadFecha').value = actividad.fecha;
    document.getElementById('editActividadDescripcion').value = actividad.descripcion;

    // Llenar la galería de fotos existentes
    const galeria = document.getElementById('editGaleriaFotos');
    galeria.innerHTML = ''; // Limpiar galería anterior

    if (actividad.fotos && actividad.fotos.length > 0) {
        actividad.fotos.forEach((foto, index) => {
            const fotoDiv = document.createElement('div');
            fotoDiv.style.position = 'relative';
            fotoDiv.innerHTML = `
                <img src="${foto.datos}" alt="${foto.nombre}" style="max-width: 80px; height: auto; border-radius: 5px;">
                <button onclick="eliminarFotoDeActividad(${actividad.id}, ${index})" 
                        style="position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
            `;
            galeria.appendChild(fotoDiv);
        });
    } else {
        galeria.innerHTML = '<p style="color: #999; font-size: 12px; margin: auto;">No hay fotos en esta actividad.</p>';
    }

    document.getElementById('modalEdicion').style.display = 'flex';
}

// NUEVA FUNCIÓN para cerrar el modal
function cerrarModalEdicion() {
    document.getElementById('modalEdicion').style.display = 'none';
}

function eliminarFotoDeActividad(actividadId, fotoIndex) {
    const actividadIndex = informe.actividades.findIndex(a => a.id === actividadId);
    if (actividadIndex === -1) return;

    // Eliminar la foto del array
    informe.actividades[actividadIndex].fotos.splice(fotoIndex, 1);

    // Volver a renderizar el modal para que se actualice la vista
    abrirModalEdicion(actividadId);
    mostrarNotificacion('Foto eliminada. Guarda los cambios para confirmar.', 'info');
}

async function guardarCambiosActividad() {
    const id = parseInt(document.getElementById('editActividadId').value);
    const actividadIndex = informe.actividades.findIndex(a => a.id === id);

    if (actividadIndex === -1) return;

    // Actualizar datos de texto
    informe.actividades[actividadIndex].titulo = document.getElementById('editActividadTitulo').value;
    informe.actividades[actividadIndex].fecha = document.getElementById('editActividadFecha').value;
    informe.actividades[actividadIndex].descripcion = document.getElementById('editActividadDescripcion').value;

    // Procesar nuevas fotos para añadir
    const inputNuevasFotos = document.getElementById('editActividadNuevasFotos');
    if (inputNuevasFotos.files.length > 0) {
        mostrarNotificacion('Procesando nuevas imágenes...', 'info');

        // Usamos una promesa para esperar a que todas las imágenes se lean
        await new Promise(resolve => {
            const totalFiles = inputNuevasFotos.files.length;
            let filesProcessed = 0;

            Array.from(inputNuevasFotos.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    informe.actividades[actividadIndex].fotos.push({
                        nombre: file.name,
                        tipo: file.type,
                        tamano: file.size,
                        datos: e.target.result // base64
                    });
                    filesProcessed++;
                    if (filesProcessed === totalFiles) {
                        resolve(); // Resolvemos la promesa cuando la última imagen se ha procesado
                    }
                };
                reader.readAsDataURL(file);
            });
        });
    }

    guardarBorrador();
    actualizarListaActividades();
    cerrarModalEdicion();
    mostrarNotificacion('✅ Actividad actualizada exitosamente', 'success');
}

// REEMPLAZAR la función existente con esta
function actualizarListaActividades() {
    const lista = document.getElementById('listaActividades');

    if (!informe.actividades || informe.actividades.length === 0) {
        lista.innerHTML = '<div class="form-section"><p style="color: #666; text-align: center;">No hay actividades registradas</p></div>';
        return;
    }

    const actividadesOrdenadas = informe.actividades.sort((a, b) => b.id - a.id);

    let html = '<div class="form-section"><div class="form-title">Actividades Registradas (' +
               actividadesOrdenadas.length + ')</div>';

    actividadesOrdenadas.forEach(act => {
        const fechaFormateada = act.fecha ? new Date(act.fecha).toLocaleString('es-CO', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Sin fecha';

        let galeriaHTML = '';
        if (act.fotos && act.fotos.length > 0) {
            galeriaHTML = '<div class="galeria-fotos" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">';
            act.fotos.forEach(foto => {
                galeriaHTML += `<img src="${foto.datos}" alt="${foto.nombre}" style="max-width: 80px; height: auto; border-radius: 5px; border: 1px solid #ccc;">`;
            });
            galeriaHTML += '</div>';
        }

        html += `
            <div class="actividad-item" style="position: relative;">
                <div style="position: absolute; right: 5px; top: 5px; display: flex; gap: 5px;">
                    <button onclick="abrirModalEdicion(${act.id})" title="Editar"
                            style="background: #007bff; color: white; border: none; 
                                   border-radius: 50%; width: 25px; height: 25px; 
                                   cursor: pointer; font-size: 14px; line-height: 25px;">✏️</button>
                    <button onclick="eliminarActividad(${act.id})" title="Eliminar"
                            style="background: #ff4444; color: white; border: none; 
                                   border-radius: 50%; width: 25px; height: 25px; 
                                   cursor: pointer; font-size: 16px; line-height: 25px;">×</button>
                </div>
                <strong>${act.titulo}</strong><br>
                <small>📅 ${fechaFormateada}</small><br>
                <p style="margin-top: 5px; margin-bottom: 5px; padding-right: 60px;">${act.descripcion || 'Sin descripción'}</p>
                ${galeriaHTML}
            </div>
        `;
    });

    html += '</div>';
    lista.innerHTML = html;
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

// Actualizar función guardarBorrador
function guardarBorrador() {
    const perfilGIT = document.getElementById('perfilGIT');
    const nombreFuncionario = document.getElementById('nombreFuncionario');
    const nombreProyecto = document.getElementById('nombreProyecto');
    const lugar = document.getElementById('lugar');
    const fechaSalida = document.getElementById('fechaSalida');
    const fechaRegreso = document.getElementById('fechaRegreso');
    const objeto = document.getElementById('objeto');
    const participantes = document.getElementById('participantes');
    
    if (nombreProyecto) informe.proyecto = nombreProyecto.value;
    if (perfilGIT) informe.perfilGIT = perfilGIT.value;
    if (nombreFuncionario) informe.nombreFuncionario = nombreFuncionario.value;
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

/**
 * Reinicia el estado del informe a sus valores por defecto,
 * limpia el borrador de localStorage y recarga la página para
 * mostrar un formulario limpio.
 */
function reiniciarInforme() {
    // 1. Restablecer el objeto 'informe' a su estado inicial con un nuevo ID
    informe = {
        id: Date.now(),
        proyecto: '',
        perfilGIT: '',
        nombreFuncionario: '',
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

    // 2. Eliminar el borrador guardado en el dispositivo
    localStorage.removeItem('informe_borrador');
    
    // 3. Recargar la página. Es la forma más sencilla de asegurar que todos los
    // componentes visuales se limpien y se reinicien.
    console.log('Informe reiniciado. Recargando la aplicación...');
    location.reload();
}

// Nueva función para mostrar el perfil seleccionado
function mostrarPerfilSeleccionado() {
    const perfilGIT = informe.perfilGIT;
    const nombreFuncionario = informe.nombreFuncionario;
    
    if (perfilGIT) {
        const perfiles = {
            'social': 'GIT Social',
            'predial': 'GIT Predial',
            'juridico_predial': 'GIT Jurídico Predial',
            'ambiental': 'GIT Ambiental',
            'riesgos': 'GIT Riesgos'
        };
        
        const nombrePerfil = perfiles[perfilGIT] || 'Sin definir';
        
        // Actualizar el header si existe
        const headerElement = document.querySelector('.header p');
        if (headerElement) {
            headerElement.textContent = `Canal del Dique - ${nombrePerfil}`;
        }
    }
}
// Guardar informe completo
function guardarInforme() {
    // NUEVA VALIDACIÓN - Agregar estas líneas al inicio
    if (!informe.perfilGIT || !informe.nombreFuncionario || !informe.objeto || !informe.fechaSalida) {
        mostrarNotificacion('⚠️ Complete GIT, nombre, objeto y fecha antes de guardar', 'warning');
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

async function sincronizar() {
    // Verificar conexión
    if (!navigator.onLine || !supabase) {
        mostrarNotificacion('⚠️ Sin conexión. No se puede sincronizar.', 'warning');
        return;
    }
    
    mostrarNotificacion('☁️ Sincronizando con base de datos...', 'info');
    
    try {
        // --- (Toda la lógica de subida de datos que ya tenías) ---
// Preparar datos del informe para enviar a Supabase
        const datosInforme = {
            informe_id: String(informe.id), // Clave Primaria
            proyecto: informe.proyecto,
            lugar: informe.lugar,
            fecha_salida: informe.fechaSalida || null,
            fecha_regreso: informe.fechaRegreso || null,
            objeto: informe.objeto,
            participantes: informe.participantes,
            estado: 'sincronizado',
            usuario: informe.nombreFuncionario || 'funcionario_campo',
            git: informe.perfilGIT || '',
            ultima_modificacion: new Date().toISOString(),
            datos_completos: informe // Opcional: Guarda todo el informe en formato JSON por si acaso
        };
        const { error: errorInforme } = await supabase
            .from('informes')
            .upsert(datosInforme, { onConflict: 'informe_id' });

if (errorInforme) throw errorInforme;

        // =================================================================
        // INICIO: LÓGICA PARA SUBIR ACTIVIDADES Y COMPROMISOS
        // =================================================================

        // 1. Sincronizar Actividades
        if (informe.actividades && informe.actividades.length > 0) {
            // Para evitar duplicados, primero borramos las actividades que ya existían para este informe.
            // Esto asegura que si eliminaste una actividad en la app, también se elimina en la base de datos.
            await supabase
                .from('actividades')
                .delete()
                .eq('informe_id', String(informe.id));

            // Ahora, preparamos las nuevas actividades para insertarlas.
            // Mapeamos los datos de la app a los nombres de las columnas de tu tabla.
            const actividadesParaGuardar = informe.actividades.map(act => ({
                informe_id: String(informe.id),
                titulo: act.titulo,
                fecha: act.fecha || null,
                descripcion: act.descripcion
                // NOTA: Las fotos en Base64 se guardan dentro de 'datos_completos' en la tabla principal.
                // La subida a Supabase Storage es un paso que podemos implementar después.
            }));

            // Insertamos todas las nuevas actividades en la base de datos.
            const { error: errorActividades } = await supabase
                .from('actividades')
                .insert(actividadesParaGuardar);
            
            if (errorActividades) throw errorActividades;
        }

        // 2. Sincronizar Compromisos (sigue la misma lógica que las actividades)
        if (informe.compromisos && informe.compromisos.length > 0) {
            // Borramos los compromisos viejos
            await supabase
                .from('compromisos')
                .delete()
                .eq('informe_id', String(informe.id));
            
            // Preparamos los nuevos compromisos
            const compromisosParaGuardar = informe.compromisos.map(comp => ({
                informe_id: String(informe.id),
                descripcion: comp.descripcion,
                responsable: comp.responsable,
                fecha_limite: comp.fechaLimite || null,
                prioridad: comp.prioridad,
                estado: comp.estado || 'pendiente'
            }));

            // Insertamos los nuevos compromisos
            const { error: errorCompromisos } = await supabase
                .from('compromisos')
                .insert(compromisosParaGuardar);
            
            if (errorCompromisos) throw errorCompromisos;
        }

        // =================================================================
        // FIN: LÓGICA PARA SUBIR ACTIVIDADES Y COMPROMISOS
        // =================================================================

        // Actualizar estado local
        informe.estado = 'sincronizado';
        informe.fechaSincronizacion = new Date().toISOString();
        guardarBorrador();
        
        removerDeColaDeSincronizacion(informe.id);
        
        // --> INICIO DE LA NUEVA LÓGICA <--

        // 1. Notificar al usuario del éxito
        mostrarNotificacion('✅ Sincronizado exitosamente con la base de datos central', 'success');
        
        // 2. Preguntar al usuario si desea limpiar y salir
        setTimeout(() => {
            if (confirm('El informe se ha sincronizado correctamente.\n\n¿Desea limpiar el formulario y cerrar la sesión para comenzar un nuevo informe?')) {
                // 3. Si confirma, reiniciar el informe
                reiniciarInforme();

                // 4. Y después de un momento, cerrar la sesión
                // (El reinicio es tan rápido que esto no se ejecutará, 
                // pero lo dejamos por si se comenta el location.reload())
                setTimeout(() => {
                    logout();
                }, 1000);

            }
        }, 500); // Pequeña espera para que el usuario pueda leer la notificación de éxito

        // --> FIN DE LA NUEVA LÓGICA <--
        
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

// Actualizar función mostrarResumen
function mostrarResumen() {
    const resumen = document.getElementById('resumen');
    
    const perfiles = {
        'social': 'GIT Social',
        'predial': 'GIT Predial',
        'juridico_predial': 'GIT Jurídico Predial',
        'ambiental': 'GIT Ambiental',
        'riesgos': 'GIT Riesgos'
    };
    
    const nombrePerfil = perfiles[informe.perfilGIT] || 'No especificado';
    
    const totalElementos = informe.actividades.length + informe.compromisos.length;
    const porcentajeCompletado = informe.objeto && informe.fechaSalida && informe.fechaRegreso && informe.perfilGIT ? 
                                 Math.min(100, 40 + (totalElementos * 10)) : 20;
    
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
            
            <p><strong>👤 Funcionario:</strong> ${informe.nombreFuncionario || 'No especificado'}</p>
            <p><strong>🏢 GIT:</strong> <span style="background: #004884; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${nombrePerfil}</span></p>
            <p><strong>📍 Lugar:</strong> ${informe.lugar || 'No especificado'}</p>
            <p><strong>📅 Período:</strong> ${informe.fechaSalida || 'Sin definir'} al ${informe.fechaRegreso || 'Sin definir'}</p>
            <p><strong>👥 Otros participantes:</strong> ${informe.participantes.length > 0 ? informe.participantes.join(', ') : 'No especificados'}</p>
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
// Nueva función para mostrar el perfil seleccionado
function mostrarPerfilSeleccionado() {
    const perfilGIT = informe.perfilGIT;
    const nombreFuncionario = informe.nombreFuncionario;
    
    if (perfilGIT) {
        const perfiles = {
            'social': 'GIT Social',
            'predial': 'GIT Predial',
            'juridico_predial': 'GIT Jurídico Predial',
            'ambiental': 'GIT Ambiental',
            'riesgos': 'GIT Riesgos'
        };
        
        const nombrePerfil = perfiles[perfilGIT] || 'Sin definir';
        
        // Actualizar el header si quieres mostrar el perfil
        const headerInfo = document.querySelector('.header-info');
        if (headerInfo && nombreFuncionario) {
            headerInfo.innerHTML = `
                <h1>ANI Campo</h1>
                <p>Canal del Dique - ${nombrePerfil}</p>
                <p style="font-size: 11px; opacity: 0.8;">${nombreFuncionario}</p>
            `;
        }
    }
}

// Actualizar función cargarBorrador
function cargarBorrador() {
    try {
        const borrador = localStorage.getItem('informe_borrador');
        if (borrador) {
            informe = JSON.parse(borrador);
            
            // Restaurar valores en formulario
            const nombreProyecto = document.getElementById('nombreProyecto');
            const perfilGIT = document.getElementById('perfilGIT');
            const nombreFuncionario = document.getElementById('nombreFuncionario');
            const lugar = document.getElementById('lugar');
            const fechaSalida = document.getElementById('fechaSalida');
            const fechaRegreso = document.getElementById('fechaRegreso');
            const objeto = document.getElementById('objeto');
            const participantes = document.getElementById('participantes');
            
            if (nombreProyecto) nombreProyecto.value = informe.proyecto || '';
            if (perfilGIT) perfilGIT.value = informe.perfilGIT || '';
            if (nombreFuncionario) nombreFuncionario.value = informe.nombreFuncionario || '';
            if (lugar) lugar.value = informe.lugar || 'Cartagena';
            if (fechaSalida) fechaSalida.value = informe.fechaSalida || '';
            if (fechaRegreso) fechaRegreso.value = informe.fechaRegreso || '';
            if (objeto) objeto.value = informe.objeto || '';
            if (participantes) participantes.value = informe.participantes.join(', ') || '';
            
            actualizarListaActividades();
            actualizarListaCompromisos();
            
            // Mostrar el perfil GIT si está seleccionado
            if (informe.perfilGIT) {
                mostrarPerfilSeleccionado();
            }
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
    
    // NUEVO - Agregar listeners para GIT y nombre
    const perfilGIT = document.getElementById('perfilGIT');
    if (perfilGIT) {
        perfilGIT.addEventListener('change', () => {
            guardarBorrador();
            mostrarPerfilSeleccionado();
        });
    }
    
    const nombreFuncionario = document.getElementById('nombreFuncionario');
    if (nombreFuncionario) {
        nombreFuncionario.addEventListener('change', () => {
            guardarBorrador();
            mostrarPerfilSeleccionado();
        });
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







