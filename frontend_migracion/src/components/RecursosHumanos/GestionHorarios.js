import React, { useState, useEffect } from 'react';
import EstadisticasDia from './EstadisticasDia';
import ListaTrabajadores from './ListaTrabajadores';
import { exportToPDF, exportToExcel, loadExportLibraries } from '../../utils/exportHorarios';
import { getTrabajadores, getHorarios, getProgramacionDia, guardarAsignaciones, asignarMasivo, limpiarDia, getEstadisticasDia } from '../../services/rrhh.service';
import './GestionHorarios.css';

const GestionHorarios = () => {
  // Estado principal
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [asignacionesDia, setAsignacionesDia] = useState({});
  const [toast, setToast] = useState(null);
  const [cargandoLibrerias, setCargandoLibrerias] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar librerías de exportación al montar
  useEffect(() => {
    setCargandoLibrerias(true);
    loadExportLibraries()
      .then(() => {
        console.log('✅ Librerías de exportación cargadas');
      })
      .catch(err => {
        console.warn('⚠️ Error al cargar librerías:', err);
      })
      .finally(() => {
        setCargandoLibrerias(false);
      });
  }, []);

  // Cargar datos iniciales (trabajadores y horarios)
  useEffect(() => {
    setCargando(true);
    Promise.all([
      getTrabajadores(),
      getHorarios()
    ]).then(([trabRes, horRes]) => {
      const todosTrabajadores = trabRes.data.data || [];
      console.log('👥 Total trabajadores recibidos:', todosTrabajadores.length);
      
      // Filtrar solo trabajadores con id_rol = 1 (Trabajadores)
      const soloTrabajadores = todosTrabajadores.filter(t => parseInt(t.id_rol) === 1);
      console.log('✅ Trabajadores filtrados (id_rol=1):', soloTrabajadores.length);
      
      setTrabajadores(soloTrabajadores);
      setHorarios(horRes.data.data || []);
    }).catch(() => {
      mostrarToast('Error al cargar datos', 'error');
    }).finally(() => {
      setCargando(false);
    });
  }, []);

  // Cargar asignaciones y estadísticas del día
  useEffect(() => {
    if (!fechaSeleccionada) return;
    console.log('🔄 Cargando programación para fecha:', fechaSeleccionada);
    getProgramacionDia(fechaSeleccionada).then(res => {
      console.log('📥 Datos recibidos del backend:', res.data);
      
      // SOLO cargar asignaciones que tengan un horario válido (no null)
      const asignaciones = {};
      (res.data.data || []).forEach(item => {
        // Solo agregar si tiene id_horario válido
        if (item.id_horario !== null && item.id_horario !== undefined) {
          asignaciones[item.id_usuario] = item.id_horario;
        }
      });
      
      console.log('📊 Asignaciones válidas cargadas:', Object.keys(asignaciones).length);
      console.log('✅ Asignaciones:', asignaciones);
      setAsignacionesDia(asignaciones);
    }).catch(err => {
      console.error('❌ Error al cargar programación:', err);
      // En caso de error, iniciar con objeto vacío
      setAsignacionesDia({});
    });
    
    getEstadisticasDia(fechaSeleccionada).then(res => {
      setEstadisticas(res.data.data || null);
    });
  }, [fechaSeleccionada]);

  // Mostrar toast
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  // Asignar turno a un trabajador (solo en estado local, guardar con botón)
  const asignarTurno = (idTrabajador, idHorario) => {
    console.log('🔵 Asignando turno:', { idTrabajador, idHorario });
    setAsignacionesDia(prev => {
      const nuevas = { ...prev };
      nuevas[idTrabajador] = idHorario;
      console.log('🔵 Estado actualizado:', nuevas);
      console.log('🔵 Total asignaciones:', Object.keys(nuevas).length);
      return nuevas;
    });
  };

  // Asignar turno a todos (masivo, usa API)
  const asignarTurnoTodos = async (idHorario) => {
    await asignarMasivo(fechaSeleccionada, idHorario);
    
    // Recargar programación y estadísticas
    getProgramacionDia(fechaSeleccionada).then(res => {
      const asignaciones = {};
      (res.data.data || []).forEach(item => {
        if (item.id_horario !== null && item.id_horario !== undefined) {
          asignaciones[item.id_usuario] = item.id_horario;
        }
      });
      setAsignacionesDia(asignaciones);
    });
    
    // Recargar estadísticas del backend
    getEstadisticasDia(fechaSeleccionada).then(res => {
      setEstadisticas(res.data.data || null);
    });
    
    const nombreTurno = idHorario === 1 ? 'T1' : idHorario === 2 ? 'T2' : 'Descanso';
    mostrarToast(`✅ Turno ${nombreTurno} asignado a todos`, 'success');
  };

  // Guardar cambios individuales
  const guardarCambios = async () => {
    try {
      console.log('🚀 INICIANDO GUARDADO...');
      console.log('🔍 Estado asignacionesDia RAW:', asignacionesDia);
      console.log('🔍 Tipo de asignacionesDia:', typeof asignacionesDia);
      console.log('🔍 Keys de asignacionesDia:', Object.keys(asignacionesDia));
      console.log('🔍 Valores de asignacionesDia:', Object.values(asignacionesDia));
      
      // Filtrar solo las asignaciones válidas (que tengan id_horario válido, incluyendo Descanso)
      const asignaciones = Object.entries(asignacionesDia)
        .filter(([id_usuario, id_horario]) => {
          const esValido = id_horario !== null && 
                           id_horario !== undefined && 
                           !isNaN(parseInt(id_horario));
          console.log(`  ⚖️ Usuario ${id_usuario}: horario=${id_horario}, esValido=${esValido}`);
          return esValido;
        })
        .map(([id_usuario, id_horario]) => ({
          id_usuario: parseInt(id_usuario),
          id_horario: parseInt(id_horario)
        }))
        .filter(item => {
          const esValidoFinal = !isNaN(item.id_usuario) && !isNaN(item.id_horario);
          console.log(`  ✅ Item final:`, item, `esValido=${esValidoFinal}`);
          return esValidoFinal;
        });
      
      console.log('📋 RESULTADO DEL FILTRO:', asignaciones);
      
      if (asignaciones.length === 0) {
        console.log('❌ Array vacío, mostrando advertencia');
        mostrarToast('⚠️ No hay cambios para guardar. Selecciona al menos un turno.', 'warning');
        return;
      }
      
      console.log('💾 Estado asignacionesDia completo:', asignacionesDia);
      console.log('💾 Asignaciones filtradas a enviar:', asignaciones);
      console.log('📅 Fecha:', fechaSeleccionada);
      console.log('📊 Cantidad a guardar:', asignaciones.length);
      
      const response = await guardarAsignaciones(fechaSeleccionada, asignaciones);
      
      if (response.data.success) {
        mostrarToast('✅ Cambios guardados exitosamente', 'success');
        
        // Recargar asignaciones del día
        getProgramacionDia(fechaSeleccionada).then(res => {
          const asignaciones = {};
          (res.data.data || []).forEach(item => {
            if (item.id_horario !== null && item.id_horario !== undefined) {
              asignaciones[item.id_usuario] = item.id_horario;
            }
          });
          setAsignacionesDia(asignaciones);
        });
        
        // Recargar estadísticas del backend
        getEstadisticasDia(fechaSeleccionada).then(res => {
          setEstadisticas(res.data.data || null);
        });
      } else {
        mostrarToast('⚠️ ' + (response.data.message || 'Error al guardar'), 'warning');
      }
    } catch (error) {
      console.error('❌ Error al guardar cambios:', error);
      
      // Mensajes de error específicos
      if (error.response?.status === 422) {
        mostrarToast('❌ Datos inválidos. Verifica las asignaciones.', 'error');
      } else if (error.response?.status === 404) {
        mostrarToast('❌ Endpoint no encontrado. El backend no tiene esta funcionalidad aún.', 'error');
      } else if (error.response?.status === 401) {
        mostrarToast('❌ Sesión expirada. Vuelve a iniciar sesión en RRHH.', 'error');
      } else {
        mostrarToast('❌ Error al guardar cambios: ' + (error.message || 'Error desconocido'), 'error');
      }
    }
  };

  // Guardar cambio individual de un solo trabajador
  const guardarIndividual = async (idUsuario, idHorario) => {
    try {
      console.log('💾 Guardando individualmente:', { idUsuario, idHorario, fecha: fechaSeleccionada });
      
      // Crear array con solo este trabajador
      const asignacion = [{
        id_usuario: parseInt(idUsuario),
        id_horario: parseInt(idHorario)
      }];
      
      const response = await guardarAsignaciones(fechaSeleccionada, asignacion);
      
      if (response.data.success) {
        mostrarToast(`✅ Turno guardado para el trabajador #${idUsuario}`, 'success');
        
        // Recargar asignaciones del día para reflejar el cambio guardado
        getProgramacionDia(fechaSeleccionada).then(res => {
          const asignaciones = {};
          (res.data.data || []).forEach(item => {
            if (item.id_horario !== null && item.id_horario !== undefined) {
              asignaciones[item.id_usuario] = item.id_horario;
            }
          });
          setAsignacionesDia(asignaciones);
        });
        
        // Recargar estadísticas del backend
        getEstadisticasDia(fechaSeleccionada).then(res => {
          setEstadisticas(res.data.data || null);
        });
      } else {
        mostrarToast('⚠️ ' + (response.data.message || 'Error al guardar'), 'warning');
      }
    } catch (error) {
      console.error('❌ Error al guardar trabajador individual:', error);
      
      if (error.response?.status === 422) {
        mostrarToast('❌ Datos inválidos. Verifica el turno seleccionado.', 'error');
      } else if (error.response?.status === 404) {
        mostrarToast('❌ Endpoint no encontrado.', 'error');
      } else if (error.response?.status === 401) {
        mostrarToast('❌ Sesión expirada. Vuelve a iniciar sesión.', 'error');
      } else {
        mostrarToast('❌ Error al guardar: ' + (error.message || 'Error desconocido'), 'error');
      }
    }
  };

  // Limpiar selecciones locales (solo frontend, no toca la BD)
  const limpiarDiaCompleto = () => {
    setAsignacionesDia({});
    
    // Recargar estadísticas del backend para reflejar estado real de BD
    getEstadisticasDia(fechaSeleccionada).then(res => {
      setEstadisticas(res.data.data || null);
    });
    
    mostrarToast('🔄 Selecciones limpiadas. Los turnos guardados en la BD permanecen intactos.', 'info');
  };

  // Exportar a PDF
  const handleExportarPDF = async () => {
    if (cargandoLibrerias) {
      mostrarToast('⏳ Cargando librerías, espera un momento...', 'info');
      return;
    }

    const stats = calcularEstadisticas();
    const resultado = await exportToPDF({
      fecha: fechaSeleccionada,
      trabajadores: trabajadores,
      asignaciones: asignacionesDia,
      estadisticas: stats
    });

    if (resultado) {
      mostrarToast('✅ PDF generado exitosamente', 'success');
    } else {
      mostrarToast('❌ Error al generar PDF', 'error');
    }
  };

  // Exportar a Excel
  const handleExportarExcel = async () => {
    if (cargandoLibrerias) {
      mostrarToast('⏳ Cargando librerías, espera un momento...', 'info');
      return;
    }

    const stats = calcularEstadisticas();
    const resultado = await exportToExcel({
      fecha: fechaSeleccionada,
      trabajadores: trabajadores,
      asignaciones: asignacionesDia,
      estadisticas: stats
    });

    if (resultado) {
      mostrarToast('✅ Excel generado exitosamente', 'success');
    } else {
      mostrarToast('❌ Error al generar Excel', 'error');
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const stats = {
      t1: 0,
      t2: 0,
      descanso: 0,
      sinAsignar: 0
    };

    Object.values(asignacionesDia).forEach(turno => {
      // Comparar con IDs numéricos (1=T1, 2=T2, 3=Descanso)
      if (turno === 1) stats.t1++;
      else if (turno === 2) stats.t2++;
      else if (turno === 3) stats.descanso++;
    });

    stats.sinAsignar = trabajadores.length - (stats.t1 + stats.t2 + stats.descanso);

    return stats;
  };

  return (
    <div className="gestion-horarios-container">
      {/* Toast de notificaciones */}
      {toast && (
        <div className={`toast-notification toast-${toast.tipo}`}>
          <span>{toast.mensaje}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header principal con selector de fecha */}
      <div className="gestion-header">
        <div className="gestion-titulo">
          <h2>🕐 Gestión de Horarios</h2>
          <p>Asigna turnos diarios a los trabajadores</p>
        </div>
        <div className="selector-fecha-container">
          <label htmlFor="fecha-input">📅 Fecha:</label>
          <input
            type="date"
            id="fecha-input"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="input-fecha"
          />
        </div>
      </div>

      {/* Estadísticas del día */}
      <EstadisticasDia
        asignaciones={asignacionesDia}
        totalTrabajadores={trabajadores.length}
        estadisticas={estadisticas}
      />

      {/* Botones de asignación masiva */}
      <div className="acciones-masivas">
        <h3>🔧 Asignación Masiva</h3>
        <div className="botones-masivos">
          <button
            className="btn-masivo btn-masivo-t1"
            onClick={() => asignarTurnoTodos(1)}
          >
            ☀️ Asignar T1 para Todos
          </button>
          <button
            className="btn-masivo btn-masivo-t2"
            onClick={() => asignarTurnoTodos(2)}
          >
            🌙 Asignar T2 para Todos
          </button>
        </div>
      </div>

      {/* Botones de exportación */}
      <div className="acciones-exportacion">
        <h3>📄 Exportar</h3>
        <div className="botones-exportacion">
          <button
            className="btn-exportar btn-pdf"
            onClick={handleExportarPDF}
            disabled={cargandoLibrerias}
          >
            📄 Exportar PDF
          </button>
          <button
            className="btn-exportar btn-excel"
            onClick={handleExportarExcel}
            disabled={cargandoLibrerias}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* Lista de trabajadores */}
      <ListaTrabajadores
        trabajadores={trabajadores}
        horarios={horarios}
        asignaciones={asignacionesDia}
        onAsignarTurno={asignarTurno}
        onGuardarIndividual={guardarIndividual}
        fechaSeleccionada={fechaSeleccionada}
      />

      {/* Botones de acción finales */}
      <div className="acciones-finales">
        <button
          className="btn-final btn-guardar"
          onClick={guardarCambios}
        >
          💾 Guardar Cambios
        </button>
        <button
          className="btn-final btn-limpiar"
          onClick={limpiarDiaCompleto}
        >
          🗑️ Limpiar Día Completo
        </button>
      </div>
    </div>
  );
};

export default GestionHorarios;
