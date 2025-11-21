import React, { useState, useEffect } from 'react';
import './DashboardSupervisor.css';
import { 
  obtenerTrabajadores, 
  obtenerReporteAsistencia, 
  obtenerEmergencias,
  obtenerReportesHorarios 
} from '../../services/rrhh.service';

const DashboardSupervisor = () => {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    trabajadoresActivos: 0,
    asistenciasHoy: 0,
    emergenciasPendientes: 0,
    reportesHoy: 0
  });
  const [trabajadores, setTrabajadores] = useState([]);
  const [emergenciasRecientes, setEmergenciasRecientes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const fechaHoy = new Date().toISOString().split('T')[0];

      // Cargar trabajadores
      const resTrabajadores = await obtenerTrabajadores();
      if (resTrabajadores.success) {
        setTrabajadores(resTrabajadores.data || []);
      }

      // Cargar asistencias de hoy
      const resAsistencias = await obtenerReporteAsistencia({ 
        fecha_inicio: fechaHoy,
        fecha_fin: fechaHoy
      });

      // Cargar emergencias pendientes
      const resEmergencias = await obtenerEmergencias({ 
        estado: 'pendiente' 
      });
      
      if (resEmergencias.success) {
        setEmergenciasRecientes(resEmergencias.data?.slice(0, 5) || []);
      }

      // Cargar reportes horarios de hoy
      const resReportes = await obtenerReportesHorarios({
        fecha: fechaHoy
      });

      // Actualizar estadísticas
      setEstadisticas({
        trabajadoresActivos: resTrabajadores.data?.length || 0,
        asistenciasHoy: resAsistencias.data?.length || 0,
        emergenciasPendientes: resEmergencias.data?.filter(e => e.estado === 'pendiente').length || 0,
        reportesHoy: resReportes.data?.length || 0
      });

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-supervisor-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-supervisor-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Dashboard Supervisor</h1>
          <p className="subtitle">Panel de control y monitoreo de recursos humanos</p>
        </div>
        <button className="btn-refresh" onClick={cargarDatos}>
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card stat-trabajadores">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{estadisticas.trabajadoresActivos}</h3>
            <p>Trabajadores Activos</p>
          </div>
        </div>

        <div className="stat-card stat-asistencias">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{estadisticas.asistenciasHoy}</h3>
            <p>Asistencias Hoy</p>
          </div>
        </div>

        <div className="stat-card stat-emergencias">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <h3>{estadisticas.emergenciasPendientes}</h3>
            <p>Emergencias Pendientes</p>
          </div>
        </div>

        <div className="stat-card stat-reportes">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{estadisticas.reportesHoy}</h3>
            <p>Reportes Hoy</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="dashboard-content">
        {/* Trabajadores Activos */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>👥 Trabajadores Activos</h2>
            <span className="badge">{trabajadores.length}</span>
          </div>
          <div className="trabajadores-list">
            {trabajadores.length === 0 ? (
              <div className="empty-state">
                <p>No hay trabajadores registrados</p>
              </div>
            ) : (
              trabajadores.map((trabajador, index) => (
                <div key={index} className="trabajador-item">
                  <div className="trabajador-avatar">
                    {trabajador.nombre_completo?.charAt(0) || '?'}
                  </div>
                  <div className="trabajador-info">
                    <h4>{trabajador.nombre_completo}</h4>
                    <p>{trabajador.documento}</p>
                  </div>
                  <div className="trabajador-status">
                    <span className="status-badge active">Activo</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergencias Recientes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>🚨 Emergencias Pendientes</h2>
            <span className="badge badge-danger">{emergenciasRecientes.length}</span>
          </div>
          <div className="emergencias-list">
            {emergenciasRecientes.length === 0 ? (
              <div className="empty-state">
                <p>✅ No hay emergencias pendientes</p>
              </div>
            ) : (
              emergenciasRecientes.map((emergencia, index) => (
                <div key={index} className="emergencia-item">
                  <div className="emergencia-icon">🚨</div>
                  <div className="emergencia-info">
                    <h4>{emergencia.tipo_emergencia || 'Emergencia'}</h4>
                    <p>{emergencia.descripcion?.substring(0, 50) || 'Sin descripción'}...</p>
                    <span className="fecha-emergencia">
                      {new Date(emergencia.hora_registro).toLocaleString('es-PE')}
                    </span>
                  </div>
                  <div className="emergencia-status">
                    <span className="status-badge pendiente">Pendiente</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h3>⚡ Acciones Rápidas</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">📅</span>
            <span>Ver Asistencias</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🕐</span>
            <span>Reportes Horarios</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🚨</span>
            <span>Gestionar Emergencias</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>Ver Estadísticas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSupervisor;
