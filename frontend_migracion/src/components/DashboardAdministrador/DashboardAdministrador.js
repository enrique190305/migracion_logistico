import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardAdministrador.css';

const DashboardAdministrador = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Obtener información del usuario actual
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const handleNavigateToModule = (moduleId) => {
    // Disparar evento personalizado para cambiar de módulo
    window.dispatchEvent(new CustomEvent('cambiarModulo', {
      detail: { moduleId }
    }));
  };

  return (
    <div className="dashboard-admin-container">
      {/* Header con bienvenida */}
      <div className="dashboard-admin-header">
        <div className="welcome-section">
          <div className="avatar-admin">
            <i className="fas fa-user-shield"></i>
          </div>
          <div className="welcome-text">
            <h1>Bienvenido</h1>
            <h2>{user?.nombres_completos || 'Administrador'}</h2>
            <p>al panel de administración</p>
          </div>
        </div>
      </div>

      <div className="dashboard-admin-content">
        {/* Tarjeta de información personal */}
        <div className="info-card-section">
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-icon">
                <i className="fas fa-user"></i>
              </div>
              <h3>Información Personal</h3>
            </div>
            <div className="info-card-body">
              <div className="info-row">
                <span className="info-label">Documento:</span>
                <span className="info-value">{user?.documento_completo || 'No disponible'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{user?.nombres_completos || 'No disponible'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Rol:</span>
                <span className="info-value">{user?.rol?.nombre || 'Administrador'}</span>
              </div>
              {user?.correo && (
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.correo}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de acciones */}
        <div className="actions-panel">
          {/* Sección de Gestión de Usuarios */}
          <div className="actions-section">
            <div className="section-header error-theme">
              <div className="section-icon">
                <i className="fas fa-cog"></i>
              </div>
              <h3>Gestión de Usuarios</h3>
            </div>
            <div className="actions-grid">
              <button
                className="action-card success-card"
                onClick={() => handleNavigateToModule('gestion-usuarios-rrhh')}
              >
                <div className="action-icon success-gradient">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="action-content">
                  <h4>REGISTRAR USUARIO</h4>
                  <p>Crear nuevo trabajador o supervisor</p>
                </div>
                <div className="action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>

              <button
                className="action-card warning-card"
                onClick={() => handleNavigateToModule('gestion-usuarios-rrhh')}
              >
                <div className="action-icon warning-gradient">
                  <i className="fas fa-user-edit"></i>
                </div>
                <div className="action-content">
                  <h4>EDITAR USUARIO</h4>
                  <p>Modificar información de usuarios</p>
                </div>
                <div className="action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>

              <button
                className="action-card error-card"
                onClick={() => handleNavigateToModule('gestion-usuarios-rrhh')}
              >
                <div className="action-icon error-gradient">
                  <i className="fas fa-user-minus"></i>
                </div>
                <div className="action-content">
                  <h4>ELIMINAR USUARIO</h4>
                  <p>Dar de baja usuarios del sistema</p>
                </div>
                <div className="action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>
            </div>
          </div>

          {/* Sección de Reportes */}
          <div className="actions-section">
            <div className="section-header primary-theme">
              <div className="section-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Reportes</h3>
            </div>
            <div className="actions-grid">
              <button
                className="action-card primary-card"
                onClick={() => handleNavigateToModule('reportes-asistencia-rrhh')}
              >
                <div className="action-icon primary-gradient">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div className="action-content">
                  <h4>REPORTES DE ASISTENCIA</h4>
                  <p>Ver registros de entrada y salida</p>
                </div>
                <div className="action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>

              <button
                className="action-card primary-card"
                onClick={() => handleNavigateToModule('reportes-horarios-rrhh')}
              >
                <div className="action-icon primary-gradient">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="action-content">
                  <h4>REPORTES DE HORARIOS</h4>
                  <p>Ver reportes por jornada laboral</p>
                </div>
                <div className="action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>

              <button
                className="action-card primary-card"
                onClick={() => handleNavigateToModule('reportes-emergencias-rrhh')}
              >
                <div className="action-icon primary-gradient">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="action-content">
                  <h4>REPORTES DE EMERGENCIAS</h4>
                  <p>Ver alertas y emergencias reportadas</p>
                </div>
                <div className="action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>
            </div>
          </div>

          {/* Sección de Acciones Rápidas */}
          <div className="quick-stats-section">
            <h3 className="section-title">
              <i className="fas fa-bolt"></i>
              Acceso Rápido
            </h3>
            <div className="quick-stats-grid">
              <div className="quick-stat-card" onClick={() => handleNavigateToModule('gestion-usuarios-rrhh')}>
                <div className="stat-icon success-bg">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Gestión de</span>
                  <span className="stat-value">Usuarios</span>
                </div>
              </div>

              <div className="quick-stat-card" onClick={() => handleNavigateToModule('reportes-asistencia-rrhh')}>
                <div className="stat-icon primary-bg">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Reportes de</span>
                  <span className="stat-value">Asistencia</span>
                </div>
              </div>

              <div className="quick-stat-card" onClick={() => handleNavigateToModule('reportes-horarios-rrhh')}>
                <div className="stat-icon warning-bg">
                  <i className="fas fa-business-time"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Jornadas</span>
                  <span className="stat-value">Laborales</span>
                </div>
              </div>

              <div className="quick-stat-card" onClick={() => handleNavigateToModule('reportes-emergencias-rrhh')}>
                <div className="stat-icon error-bg">
                  <i className="fas fa-ambulance"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Alertas de</span>
                  <span className="stat-value">Emergencia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdministrador;
