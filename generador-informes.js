// Configuración Supabase
const SUPABASE_URL = "https://frvpwkhifdoimnlcngks.supabase.co"; // Tu URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnB3a2hpZmRvaW1ubGNuZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjc0ODcsImV4cCI6MjA3Mjk0MzQ4N30.J0JQlXfMUaKCsc8I_28FmIAoext8n5b-FMhc04MfGQE"; // Tu key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let informeActual = null;

// Agregar después de las configuraciones de Supabase

// Generador de texto contextualizado basado en el GIT
function generarTextoObjetivo(informe) {
    const git = informe.perfilGIT;
    const lugar = informe.lugar;
    const proyecto = informe.proyecto;
    
    const objetivosPorGIT = {
        'social': [
            `Realizar el acompañamiento social y verificación de los procesos de participación comunitaria en ${lugar}, evaluando el cumplimiento de los compromisos sociales establecidos con las comunidades del área de influencia del proyecto ${proyecto}.`,
            `Liderar el proceso de socialización y relacionamiento con las comunidades afectadas por el proyecto ${proyecto} en ${lugar}, identificando necesidades, expectativas y posibles conflictos sociales que requieran intervención.`,
            `Supervisar la implementación del Plan de Gestión Social del proyecto ${proyecto}, verificando el cumplimiento de los indicadores sociales y la efectividad de las estrategias de comunicación con las comunidades.`
        ],
        'predial': [
            `Verificar el estado actual del proceso de adquisición predial en ${lugar} para el proyecto ${proyecto}, evaluando el avance en las negociaciones, avalúos comerciales y disponibilidad predial requerida.`,
            `Realizar seguimiento técnico a los procesos de gestión predial, revisando expedientes, fichas prediales y documentación soporte de los predios requeridos para el proyecto ${proyecto}.`,
            `Supervisar el cumplimiento del Plan de Adquisición Predial, verificando la aplicación correcta de los factores de compensación socioeconómica y el estado de los procesos de enajenación voluntaria.`
        ],
        'juridico_predial': [
            `Realizar el acompañamiento jurídico a los procesos de adquisición predial en ${lugar}, verificando la legalidad de los procedimientos y el cumplimiento normativo en el proyecto ${proyecto}.`,
            `Revisar y validar la documentación jurídica de los predios en proceso de adquisición, identificando posibles riesgos legales y proponiendo estrategias de mitigación para el proyecto.`,
            `Supervisar los procesos de expropiación administrativa y judicial en curso, garantizando el debido proceso y la protección de los derechos de los propietarios afectados.`
        ],
        'ambiental': [
            `Verificar el cumplimiento de las obligaciones ambientales establecidas en la licencia ambiental del proyecto ${proyecto} en ${lugar}, evaluando la implementación de las medidas de manejo ambiental.`,
            `Realizar seguimiento a la ejecución del Plan de Manejo Ambiental, verificando la efectividad de las medidas de prevención, mitigación y compensación implementadas en el área del proyecto.`,
            `Supervisar el cumplimiento de los requerimientos de las autoridades ambientales y evaluar el estado de los permisos ambientales necesarios para la operación del proyecto.`
        ],
        'riesgos': [
            `Identificar y evaluar los riesgos técnicos, operativos y financieros asociados al proyecto ${proyecto} en ${lugar}, proponiendo medidas de mitigación y planes de contingencia.`,
            `Realizar el seguimiento a la matriz de riesgos del proyecto, verificando la implementación de controles y la efectividad de las medidas preventivas establecidas.`,
            `Evaluar los riesgos emergentes y su potencial impacto en el cronograma, presupuesto y alcance del proyecto, generando alertas tempranas para la toma de decisiones.`
        ]
    };
    
    // Si hay un objeto personalizado, combínalo con el generado
    if (informe.objeto && informe.objeto.length > 50) {
        return informe.objeto;
    }
    
    // Seleccionar un objetivo aleatorio del GIT correspondiente
    const objetivos = objetivosPorGIT[git] || objetivosPorGIT['social'];
    return objetivos[Math.floor(Math.random() * objetivos.length)];
}

// Generador de conclusiones contextualizadas
function generarConclusionesInteligentes(informe) {
    const numActividades = informe.actividades?.length || 0;
    const numCompromisos = informe.compromisos?.length || 0;
    const compromisosPendientes = informe.compromisos?.filter(c => c.estado !== 'completado').length || 0;
    const porcentajeCumplimiento = numCompromisos > 0 ? 
        Math.round(((numCompromisos - compromisosPendientes) / numCompromisos) * 100) : 100;
    
    const gitNombres = {
        'social': 'Social',
        'predial': 'Predial',
        'juridico_predial': 'Jurídico Predial',
        'ambiental': 'Ambiental',
        'riesgos': 'Riesgos'
    };
    
    const conclusionesEspecificas = generarConclusionesGIT(informe);
    
    return `
        <ol>
            <li style="margin-bottom: 15px;">
                <strong>Cumplimiento de objetivos:</strong> 
                ${generarTextoCumplimiento(informe, porcentajeCumplimiento)}
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Gestión del GIT ${gitNombres[informe.perfilGIT]}:</strong> 
                ${conclusionesEspecificas.gestion}
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Actividades ejecutadas:</strong> 
                ${generarResumenActividades(informe.actividades)}
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Compromisos y seguimiento:</strong> 
                ${generarAnalisisCompromisos(informe.compromisos)}
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Hallazgos principales:</strong> 
                ${conclusionesEspecificas.hallazgos}
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Recomendaciones:</strong> 
                ${generarRecomendaciones(informe)}
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Próximos pasos:</strong> 
                ${generarProximosPasos(informe)}
            </li>
        </ol>
    `;
}

// Generar conclusiones específicas por GIT
function generarConclusionesGIT(informe) {
    const conclusionesPorGIT = {
        'social': {
            gestion: `El equipo del GIT Social realizó un acompañamiento efectivo a las comunidades del área de influencia, logrando establecer canales de comunicación directos y generando espacios de participación que fortalecen la legitimidad social del proyecto.`,
            hallazgos: `Se identificaron ${informe.compromisos?.length || 0} puntos críticos de atención social que requieren seguimiento continuo. Las comunidades manifestaron disposición al diálogo y colaboración con el proyecto, condicionada al cumplimiento de los compromisos establecidos.`
        },
        'predial': {
            gestion: `El GIT Predial avanzó en la verificación del estado de ${informe.actividades?.length || 0} predios prioritarios, evaluando la documentación técnica y legal necesaria para continuar con el proceso de adquisición predial del proyecto.`,
            hallazgos: `Se identificaron oportunidades de optimización en el proceso de avalúos y negociación, así como la necesidad de fortalecer la comunicación con propietarios para agilizar los procesos de enajenación voluntaria.`
        },
        'juridico_predial': {
            gestion: `El equipo jurídico realizó la revisión exhaustiva de los expedientes prediales, garantizando el cumplimiento de los requisitos legales y la protección de los derechos tanto del Estado como de los propietarios afectados.`,
            hallazgos: `Se detectaron ${informe.compromisos?.filter(c => c.prioridad === 'alta').length || 0} casos que requieren atención jurídica prioritaria para prevenir posibles litigios o retrasos en el proceso de adquisición predial.`
        },
        'ambiental': {
            gestion: `El GIT Ambiental verificó el cumplimiento de ${informe.actividades?.length || 0} obligaciones ambientales críticas, evaluando la efectividad de las medidas de manejo implementadas y su alineación con los requerimientos de la autoridad ambiental.`,
            hallazgos: `Se evidenció un nivel de cumplimiento ambiental adecuado, con oportunidades de mejora en los procesos de monitoreo y reporte. Se requiere fortalecer las medidas de compensación en ${informe.compromisos?.filter(c => c.responsable?.includes('Ambiental')).length || 0} puntos específicos.`
        },
        'riesgos': {
            gestion: `El equipo de Gestión de Riesgos evaluó integralmente los factores de riesgo del proyecto, actualizando la matriz de riesgos y proponiendo medidas de mitigación para ${informe.compromisos?.length || 0} riesgos identificados.`,
            hallazgos: `Se identificaron ${informe.compromisos?.filter(c => c.prioridad === 'alta').length || 0} riesgos de nivel alto que requieren monitoreo continuo y activación de planes de contingencia. El perfil de riesgo del proyecto se mantiene dentro de los parámetros aceptables.`
        }
    };
    
    return conclusionesPorGIT[informe.perfilGIT] || conclusionesPorGIT['social'];
}

// Generar texto de cumplimiento
function generarTextoCumplimiento(informe, porcentaje) {
    if (porcentaje >= 90) {
        return `La comisión cumplió exitosamente con todos los objetivos planteados, logrando un nivel de ejecución del ${porcentaje}% en las actividades programadas. El desarrollo de la visita permitió obtener información valiosa para la toma de decisiones estratégicas del proyecto ${informe.proyecto}.`;
    } else if (porcentaje >= 70) {
        return `Se logró un cumplimiento satisfactorio del ${porcentaje}% de los objetivos establecidos para la comisión. Aunque quedaron algunos aspectos pendientes, se obtuvieron los insumos necesarios para continuar con la gestión del proyecto ${informe.proyecto}.`;
    } else {
        return `La comisión alcanzó un cumplimiento parcial del ${porcentaje}% de los objetivos. Se requiere programar visitas de seguimiento para completar las actividades pendientes y garantizar el adecuado desarrollo del proyecto ${informe.proyecto}.`;
    }
}

// Generar resumen de actividades
function generarResumenActividades(actividades) {
    if (!actividades || actividades.length === 0) {
        return `No se registraron actividades formales durante esta comisión, lo cual requiere revisión del proceso de documentación para futuras visitas.`;
    }
    
    const tiposActividades = {
        'reunion': 0,
        'inspeccion': 0,
        'verificacion': 0,
        'socializacion': 0,
        'otros': 0
    };
    
    actividades.forEach(act => {
        const titulo = (act.titulo || '').toLowerCase();
        if (titulo.includes('reuni') || titulo.includes('mesa')) tiposActividades.reunion++;
        else if (titulo.includes('inspec') || titulo.includes('visita')) tiposActividades.inspeccion++;
        else if (titulo.includes('verifi') || titulo.includes('revis')) tiposActividades.verificacion++;
        else if (titulo.includes('social') || titulo.includes('comuni')) tiposActividades.socializacion++;
        else tiposActividades.otros++;
    });
    
    const resumen = [];
    if (tiposActividades.reunion > 0) resumen.push(`${tiposActividades.reunion} reunión(es)`);
    if (tiposActividades.inspeccion > 0) resumen.push(`${tiposActividades.inspeccion} inspección(es)`);
    if (tiposActividades.verificacion > 0) resumen.push(`${tiposActividades.verificacion} verificación(es)`);
    if (tiposActividades.socializacion > 0) resumen.push(`${tiposActividades.socializacion} socialización(es)`);
    if (tiposActividades.otros > 0) resumen.push(`${tiposActividades.otros} otra(s) actividad(es)`);
    
    return `Se ejecutaron ${actividades.length} actividades durante la comisión, incluyendo ${resumen.join(', ')}. Todas las actividades se desarrollaron conforme al cronograma establecido y contribuyeron significativamente al avance del proyecto.`;
}

// Generar análisis de compromisos
function generarAnalisisCompromisos(compromisos) {
    if (!compromisos || compromisos.length === 0) {
        return `No se establecieron compromisos formales en esta visita. Se recomienda fortalecer el proceso de documentación de acuerdos para facilitar el seguimiento posterior.`;
    }
    
    const porResponsable = {};
    const porPrioridad = { alta: 0, media: 0, baja: 0 };
    
    compromisos.forEach(comp => {
        const resp = comp.responsable || 'Sin asignar';
        porResponsable[resp] = (porResponsable[resp] || 0) + 1;
        porPrioridad[comp.prioridad || 'media']++;
    });
    
    const responsablesTexto = Object.entries(porResponsable)
        .map(([resp, cant]) => `${resp} (${cant})`)
        .join(', ');
    
    return `Se establecieron ${compromisos.length} compromisos estratégicos, distribuidos entre: ${responsablesTexto}. De estos, ${porPrioridad.alta} son de prioridad alta y requieren atención inmediata, ${porPrioridad.media} de prioridad media con seguimiento regular, y ${porPrioridad.baja} de prioridad baja para monitoreo periódico.`;
}

// Generar recomendaciones
function generarRecomendaciones(informe) {
    const recomendacionesPorGIT = {
        'social': `Mantener comunicación permanente con las comunidades identificadas, implementar un sistema de seguimiento a los compromisos sociales establecidos, y fortalecer los mecanismos de participación ciudadana en el proyecto.`,
        'predial': `Agilizar los procesos de avalúo pendientes, fortalecer el equipo de gestión predial en campo, y establecer un cronograma detallado de adquisiciones para los próximos 3 meses.`,
        'juridico_predial': `Priorizar la resolución de los casos jurídicos complejos identificados, actualizar la base de datos de expedientes prediales, y coordinar con la Oficina Jurídica la estrategia de defensa judicial preventiva.`,
        'ambiental': `Intensificar el monitoreo de los indicadores ambientales críticos, actualizar el Plan de Manejo Ambiental según los hallazgos de campo, y fortalecer la coordinación con la autoridad ambiental regional.`,
        'riesgos': `Actualizar la matriz de riesgos con los hallazgos de esta visita, implementar los planes de mitigación propuestos, y establecer un sistema de alertas tempranas para los riesgos identificados como críticos.`
    };
    
    const recomendacionBase = recomendacionesPorGIT[informe.perfilGIT] || recomendacionesPorGIT['social'];
    
    const recomendacionesAdicionales = [];
    if (informe.compromisos?.filter(c => c.prioridad === 'alta').length > 3) {
        recomendacionesAdicionales.push(`Dado el alto número de compromisos prioritarios, se sugiere establecer un comité de seguimiento semanal`);
    }
    if (informe.actividades?.length < 2) {
        recomendacionesAdicionales.push(`Fortalecer la documentación de actividades en campo para mejorar la trazabilidad`);
    }
    
    return `${recomendacionBase} ${recomendacionesAdicionales.join('. ')}`;
}

// Generar próximos pasos
function generarProximosPasos(informe) {
    const compromisosPendientes = informe.compromisos?.filter(c => c.estado !== 'completado') || [];
    const proximosVencimientos = compromisosPendientes
        .filter(c => c.fecha_limite)
        .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
        .slice(0, 3);
    
    let texto = `Realizar seguimiento a los ${compromisosPendientes.length} compromisos pendientes establecidos en esta comisión. `;
    
    if (proximosVencimientos.length > 0) {
        texto += `Priorizar los compromisos con vencimiento próximo: `;
        texto += proximosVencimientos.map(c => 
            `"${c.descripcion?.substring(0, 50)}..." (${formatearFecha(c.fecha_limite)})`
        ).join('; ');
        texto += '. ';
    }
    
    texto += `Programar visita de seguimiento en un plazo máximo de 30 días para verificar avances. `;
    texto += `Socializar los resultados de esta comisión con el equipo técnico de la Vicepresidencia.`;
    
    return texto;
}

// Actualizar la función principal generarHTMLInforme para usar los generadores inteligentes
function generarHTMLInforme() {
    const fechaHoy = new Date().toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const gitNombres = {
        'social': 'Social',
        'predial': 'Predial',
        'juridico_predial': 'Jurídico Predial',
        'ambiental': 'Ambiental',
        'riesgos': 'Riesgos'
    };
    
    const gitNombre = gitNombres[informeActual.perfilGIT] || 'No especificado';
    
    // Usar el generador inteligente de objetivos
    const objetivoInteligente = generarTextoObjetivo(informeActual);
    
    return `
        <div class="informe-header">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMwMDQ4ODQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BTkk8L3RleHQ+PC9zdmc+" 
                 alt="ANI" style="height: 60px;">
            <h1 style="margin: 20px 0; font-size: 24px;">INFORME DE COMISIÓN</h1>
            <p style="font-size: 14px; color: #666;">
                AGENCIA NACIONAL DE INFRAESTRUCTURA<br>
                Vicepresidencia de Planeación, Riesgos y Entorno<br>
                Grupo Interno de Trabajo: ${gitNombre}
            </p>
        </div>

        <table class="informe-table">
            <tr>
                <td><strong>Fecha de elaboración del informe:</strong></td>
                <td>${fechaHoy}</td>
            </tr>
            <tr>
                <td><strong>Lugar de la comisión o desplazamiento:</strong></td>
                <td>${informeActual.lugar || 'No especificado'}</td>
            </tr>
            <tr>
                <td><strong>Proyecto:</strong></td>
                <td>${informeActual.proyecto || 'No especificado'}</td>
            </tr>
            <tr>
                <td><strong>Modo:</strong></td>
                <td>Carretero</td>
            </tr>
            <tr>
                <td><strong>Fecha salida:</strong></td>
                <td>${formatearFecha(informeActual.fecha_salida)}</td>
            </tr>
            <tr>
                <td><strong>Fecha regreso:</strong></td>
                <td>${formatearFecha(informeActual.fecha_regreso)}</td>
            </tr>
            <tr>
                <td><strong>Funcionario responsable:</strong></td>
                <td>${informeActual.nombreFuncionario || informeActual.usuario || 'No especificado'}</td>
            </tr>
            <tr>
                <td><strong>Partes interesadas con las que se reúne:</strong></td>
                <td>${Array.isArray(informeActual.participantes) ? informeActual.participantes.join(', ') : 'No especificado'}</td>
            </tr>
        </table>

        <h2>Objeto del desplazamiento</h2>
        <p style="text-align: justify;">
            ${objetivoInteligente}
        </p>

        <h2>Actividades Desarrolladas</h2>
        <p style="text-align: justify; margin-bottom: 20px;">
            En el marco del cumplimiento de los objetivos del GIT ${gitNombre} y atendiendo las necesidades del proyecto ${informeActual.proyecto}, 
            se desarrolló una agenda de trabajo que incluyó ${informeActual.actividades?.length || 0} actividades estratégicas, 
            orientadas a ${informeActual.perfilGIT === 'social' ? 'fortalecer el relacionamiento con las comunidades' : 
                         informeActual.perfilGIT === 'predial' ? 'avanzar en la gestión de adquisición predial' :
                         informeActual.perfilGIT === 'ambiental' ? 'verificar el cumplimiento ambiental' :
                         informeActual.perfilGIT === 'riesgos' ? 'evaluar y mitigar los riesgos del proyecto' :
                         'garantizar el cumplimiento jurídico de los procesos'}.
        </p>
        ${generarSeccionActividades()}

        <h2>Compromisos Estratégicos Asumidos</h2>
        <p style="text-align: justify; margin-bottom: 20px;">
            En el desarrollo de la comisión se establecieron compromisos orientados a garantizar la continuidad operacional del proyecto,
            generar confianza con las partes interesadas y establecer un sistema de trazabilidad verificable.
        </p>
        ${generarSeccionCompromisos()}

        <h2>Conclusiones</h2>
        ${generarConclusionesInteligentes(informeActual)}

        <div class="firma">
            <p><strong>${informeActual.nombreFuncionario || 'FUNCIONARIO RESPONSABLE'}</strong></p>
            <p>GIT ${gitNombre}</p>
            <p>Vicepresidencia de Planeación, Riesgos y Entorno</p>
            <p>Agencia Nacional de Infraestructura</p>
        </div>
    `;
}

// Cargar lista de informes al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarListaInformes();
});

async function cargarListaInformes() {
    document.getElementById('loading').style.display = 'block';
    
    try {
        const { data, error } = await supabase
            .from('informes')
            .select('*')
            .order('fecha_creacion', { ascending: false });
        
        if (error) throw error;
        
        const select = document.getElementById('informeSelect');
        select.innerHTML = '<option value="">-- Seleccionar Informe --</option>';
        
        data.forEach(informe => {
            const option = document.createElement('option');
            option.value = informe.informe_id;
            option.textContent = `${informe.lugar} - ${informe.fecha_salida || 'Sin fecha'} - ${informe.objeto?.substring(0, 50) || 'Sin objeto'}...`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando informes:', error);
        alert('Error al cargar la lista de informes');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function cargarInforme() {
    const informeId = document.getElementById('informeSelect').value;
    if (!informeId) {
        alert('Por favor seleccione un informe');
        return;
    }
    
    document.getElementById('loading').style.display = 'block';
    
    try {
        // Cargar informe principal
        const { data: informe, error: errorInforme } = await supabase
            .from('informes')
            .select('*')
            .eq('informe_id', informeId)
            .single();
        
        if (errorInforme) throw errorInforme;
        
        // Cargar actividades
        const { data: actividades, error: errorActividades } = await supabase
            .from('actividades')
            .select('*')
            .eq('informe_id', informeId)
            .order('fecha', { ascending: true });
        
        // Cargar compromisos
        const { data: compromisos, error: errorCompromisos } = await supabase
            .from('compromisos')
            .select('*')
            .eq('informe_id', informeId)
            .order('fecha_limite', { ascending: true });
        
        // Combinar datos
        informeActual = {
            ...informe,
            actividades: actividades || [],
            compromisos: compromisos || []
        };
        
        // Si datos_completos tiene información adicional, úsala
        if (informe.datos_completos) {
            informeActual = {
                ...informeActual,
                ...informe.datos_completos
            };
        }
        
        mostrarVistaPrevia();
        
    } catch (error) {
        console.error('Error cargando informe:', error);
        alert('Error al cargar el informe seleccionado');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function mostrarVistaPrevia() {
    if (!informeActual) return;
    
    const content = document.getElementById('informeContent');
    content.innerHTML = generarHTMLInforme();
}

function generarHTMLInforme() {
    const fechaHoy = new Date().toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Obtener el nombre del GIT
    const gitNombres = {
        'social': 'Social',
        'predial': 'Predial',
        'juridico_predial': 'Jurídico Predial',
        'ambiental': 'Ambiental',
        'riesgos': 'Riesgos'
    };
    
    const gitNombre = gitNombres[informeActual.perfilGIT] || 'No especificado';
    
    return `
        <div class="informe-header">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMwMDQ4ODQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BTkk8L3RleHQ+PC9zdmc+" 
                 alt="ANI" style="height: 60px;">
            <h1 style="margin: 20px 0; font-size: 24px;">INFORME DE COMISIÓN</h1>
            <p style="font-size: 14px; color: #666;">
                AGENCIA NACIONAL DE INFRAESTRUCTURA<br>
                Vicepresidencia de Planeación, Riesgos y Entorno<br>
                Grupo Interno de Trabajo: ${gitNombre}
            </p>
        </div>

        <table class="informe-table">
            <tr>
                <td><strong>Fecha de elaboración del informe:</strong></td>
                <td>${fechaHoy}</td>
            </tr>
            <tr>
                <td><strong>Lugar de la comisión o desplazamiento:</strong></td>
                <td>${informeActual.lugar || 'No especificado'}</td>
            </tr>
            <tr>
                <td><strong>Proyecto:</strong></td>
                <td>${informeActual.proyecto || 'No especificado'}</td>
            </tr>
            <tr>
                <td><strong>Modo:</strong></td>
                <td>Carretero</td>
            </tr>
            <tr>
                <td><strong>Fecha salida:</strong></td>
                <td>${formatearFecha(informeActual.fecha_salida)}</td>
            </tr>
            <tr>
                <td><strong>Fecha regreso:</strong></td>
                <td>${formatearFecha(informeActual.fecha_regreso)}</td>
            </tr>
            <tr>
                <td><strong>Funcionario responsable:</strong></td>
                <td>${informeActual.nombreFuncionario || informeActual.usuario || 'No especificado'}</td>
            </tr>
            <tr>
                <td><strong>Partes interesadas con las que se reúne:</strong></td>
                <td>${Array.isArray(informeActual.participantes) ? informeActual.participantes.join(', ') : 'No especificado'}</td>
            </tr>
        </table>

        <h2>Objeto del desplazamiento</h2>
        <p style="text-align: justify;">
            ${informeActual.objeto || 'No especificado'}
        </p>

        <h2>Actividades Desarrolladas</h2>
        ${generarSeccionActividades()}

        <h2>Compromisos Estratégicos Asumidos</h2>
        ${generarSeccionCompromisos()}

        <h2>Conclusiones</h2>
        ${generarConclusiones()}

        <div class="firma">
            <p><strong>${informeActual.nombreFuncionario || 'FUNCIONARIO RESPONSABLE'}</strong></p>
            <p>GIT ${gitNombre}</p>
            <p>Vicepresidencia de Planeación, Riesgos y Entorno</p>
            <p>Agencia Nacional de Infraestructura</p>
        </div>
    `;
}

function generarSeccionActividades() {
    if (!informeActual.actividades || informeActual.actividades.length === 0) {
        return '<p>No se registraron actividades en esta comisión.</p>';
    }
    
    let html = '<div>';
    
    informeActual.actividades.forEach((actividad, index) => {
        html += `
            <div class="actividad-box">
                <h3 style="color: #004884; margin-bottom: 10px;">
                    Actividad ${index + 1}: ${actividad.titulo || 'Sin título'}
                </h3>
                <p><strong>Fecha:</strong> ${formatearFecha(actividad.fecha)}</p>
                <p><strong>Descripción:</strong></p>
                <p style="text-align: justify; margin-top: 10px;">
                    ${actividad.descripcion || 'Sin descripción'}
                </p>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function generarSeccionCompromisos() {
    if (!informeActual.compromisos || informeActual.compromisos.length === 0) {
        return '<p>No se establecieron compromisos en esta comisión.</p>';
    }
    
    // Agrupar compromisos por responsable
    const compromisosPorResponsable = {};
    informeActual.compromisos.forEach(comp => {
        const resp = comp.responsable || 'Sin asignar';
        if (!compromisosPorResponsable[resp]) {
            compromisosPorResponsable[resp] = [];
        }
        compromisosPorResponsable[resp].push(comp);
    });
    
    let html = '<div>';
    
    Object.keys(compromisosPorResponsable).forEach(responsable => {
        html += `
            <h3 style="color: #004884; margin: 20px 0 10px;">
                Compromisos - ${responsable}
            </h3>
        `;
        
        compromisosPorResponsable[responsable].forEach(comp => {
            const estadoColor = comp.estado === 'completado' ? 'green' : 
                               comp.estado === 'pendiente' ? 'orange' : 'red';
            
            html += `
                <div class="compromiso-item">
                    <p><strong>${comp.descripcion}</strong></p>
                    <p style="margin-top: 8px; font-size: 14px;">
                        <span>📅 Fecha límite: ${formatearFecha(comp.fecha_limite)}</span> | 
                        <span>Prioridad: ${comp.prioridad || 'Media'}</span> | 
                        <span style="color: ${estadoColor};">Estado: ${comp.estado || 'Pendiente'}</span>
                    </p>
                </div>
            `;
        });
    });
    
    html += '</div>';
    return html;
}

function generarConclusiones() {
    const numActividades = informeActual.actividades?.length || 0;
    const numCompromisos = informeActual.compromisos?.length || 0;
    const compromisosPendientes = informeActual.compromisos?.filter(c => c.estado !== 'completado').length || 0;
    
    return `
        <ol>
            <li style="margin-bottom: 15px;">
                <strong>Cumplimiento de objetivos:</strong> 
                La comisión realizada en ${informeActual.lugar || 'la ubicación especificada'} 
                cumplió con el objetivo establecido de ${informeActual.objeto || 'realizar las actividades programadas'}.
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Actividades ejecutadas:</strong> 
                Se desarrollaron ${numActividades} actividad(es) durante la comisión, 
                las cuales se ejecutaron conforme a lo programado y contribuyen al avance del proyecto.
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Compromisos establecidos:</strong> 
                Se establecieron ${numCompromisos} compromiso(s) con las partes interesadas, 
                de los cuales ${compromisosPendientes} requieren seguimiento para su cumplimiento.
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Gestión del GIT ${gitNombres[informeActual.perfilGIT] || ''}:</strong> 
                El Grupo Interno de Trabajo cumplió con sus responsabilidades específicas, 
                contribuyendo al desarrollo efectivo del proyecto ${informeActual.proyecto}.
            </li>
            <li style="margin-bottom: 15px;">
                <strong>Recomendaciones:</strong> 
                Se recomienda dar continuidad al seguimiento de los compromisos establecidos 
                y mantener la comunicación con las partes interesadas para garantizar el cumplimiento 
                de los acuerdos alcanzados.
            </li>
        </ol>
    `;
}

function formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function generarInforme() {
    if (!informeActual) {
        alert('Por favor, primero cargue un informe');
        return;
    }
    
    alert('Informe generado exitosamente. Puede exportarlo a Word o PDF usando los botones correspondientes.');
}

async function exportarWord() {
    if (!informeActual) {
        alert('Por favor, primero cargue un informe');
        return;
    }
    
    // Generar contenido HTML para Word
    const contenido = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Informe de Comisión - ANI</title>
            <style>
                body { font-family: 'Times New Roman', serif; }
                table { border-collapse: collapse; width: 100%; }
                td { border: 1px solid black; padding: 8px; }
                h2 { text-decoration: underline; }
            </style>
        </head>
        <body>
            ${generarHTMLInforme()}
        </body>
        </html>
    `;
    
    // Crear blob y descargar
    const blob = new Blob(['\ufeff', contenido], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Informe_Comision_${informeActual.lugar}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}