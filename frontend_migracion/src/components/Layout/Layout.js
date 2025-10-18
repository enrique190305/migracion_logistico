import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import OrdenesCompraServicio from '../OrdenesCompraServicio';
import './Layout.css';

const Layout = ({ onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardContent />;
      case 'ordenes-compra':
        return <OrdenesCompraServicio />;
      case 'registro-productos':
        return <ModuleContent title="Registro de Productos" icon="📦" />;
      case 'eliminar-oc':
        return <ModuleContent title="Eliminar OC/OS" icon="🗑️" />;
      case 'ingreso-materiales':
        return <ModuleContent title="Ingreso de Materiales" icon="📥" />;
      case 'traslado-materiales':
        return <ModuleContent title="Traslado de Materiales" icon="🔄" />;
      case 'salida-materiales':
        return <ModuleContent title="Salida de Materiales" icon="📤" />;
      case 'registro-proveedores':
        return <ModuleContent title="Registro de Proveedores" icon="🏢" />;
      case 'editar-proveedores':
        return <ModuleContent title="Editar Proveedores" icon="✏️" />;
      case 'registro-proyecto':
        return <ModuleContent title="Registro de Proyecto" icon="📊" />;
      case 'registro-personal':
        return <ModuleContent title="Registro de Personal" icon="👥" />;
      case 'kardex':
        return <ModuleContent title="Kardex" icon="📈" />;
      case 'registro-familia':
        return <ModuleContent title="Registro de Familia" icon="👥" />;
      case 'aprobacion-ordenes':
        return <ModuleContent title="Aprobación de Órdenes" icon="✅" />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="layout">
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />
      
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header del contenido principal */}
        <header className="content-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeModule === 'dashboard' ? 'Dashboard Principal' : getModuleTitle(activeModule)}
            </h1>
            <p className="page-subtitle">
              {activeModule === 'dashboard' 
                ? 'Resumen general del sistema' 
                : 'Gestión y administración'}
            </p>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <span>👤</span>
              </div>
              <div className="user-details">
                <span className="user-name">{user.name || 'admin'}</span>
                <span className="user-role">{user.role || 'Administrador'}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="content-main">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="content-footer">
          <div className="stats-container">
            <span>📊 267 productos registrados</span>
            <span>📋 9 proyectos activos</span>
            <span>📈 27 movimientos este mes</span>
            <span>✅ Sistema operativo</span>
          </div>
          <div className="session-info">
            <span>Usuario: {user.name || 'admin'} ({user.role || 'Administrador'}) | Sesión iniciada: 16/10/2025 19:41</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Componente para el Dashboard de resumen
const DashboardContent = () => {
  return (
    <div className="dashboard-content">
      <div className="dashboard-grid">
        {/* Estadísticas principales */}
        <div className="stats-section">
          <h2>Estadísticas del Sistema</h2>
          <div className="stats-cards">
            <div className="stat-card blue">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>267</h3>
                <p>Productos Registrados</p>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>9</h3>
                <p>Proyectos Activos</p>
              </div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>27</h3>
                <p>Movimientos este mes</p>
              </div>
            </div>
            <div className="stat-card orange">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>15</h3>
                <p>Personal Activo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="activity-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📥</div>
              <div className="activity-info">
                <h4>Ingreso de materiales</h4>
                <p>Se registraron 50 unidades de cemento</p>
                <span className="activity-time">Hace 2 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-info">
                <h4>Nueva orden de compra</h4>
                <p>OC-2025-001 creada para proveedor ABC</p>
                <span className="activity-time">Hace 4 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-info">
                <h4>Orden aprobada</h4>
                <p>OC-2025-002 aprobada y enviada</p>
                <span className="activity-time">Hace 6 horas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="alerts-section">
          <h2>Alertas del Sistema</h2>
          <div className="alerts-list">
            <div className="alert-item warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-info">
                <h4>Stock bajo</h4>
                <p>5 productos por debajo del stock mínimo</p>
              </div>
            </div>
            <div className="alert-item info">
              <div className="alert-icon">ℹ️</div>
              <div className="alert-info">
                <h4>Mantenimiento programado</h4>
                <p>Actualización del sistema el 20/10/2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente genérico para módulos en desarrollo
const ModuleContent = ({ title, icon }) => {
  return (
    <div className="module-content">
      <div className="module-placeholder">
        <div className="module-icon">{icon}</div>
        <h2>{title}</h2>
        <p>Este módulo está en desarrollo</p>
        <div className="coming-soon">
          <span>🚧 Próximamente disponible</span>
        </div>
      </div>
    </div>
  );
};

// Función helper para obtener títulos de módulos
const getModuleTitle = (moduleId) => {
  const titles = {
    'ordenes-compra': 'Órdenes de Compra/Servicio',
    'registro-productos': 'Registro de Productos',
    'eliminar-oc': 'Eliminar OC/OS',
    'ingreso-materiales': 'Ingreso de Materiales',
    'traslado-materiales': 'Traslado de Materiales',
    'salida-materiales': 'Salida de Materiales',
    'registro-proveedores': 'Registro de Proveedores',
    'editar-proveedores': 'Editar Proveedores',
    'registro-proyecto': 'Registro de Proyecto',
    'registro-personal': 'Registro de Personal',
    'kardex': 'Kardex',
    'registro-familia': 'Registro de Familia',
    'aprobacion-ordenes': 'Aprobación de Órdenes'
  };
  return titles[moduleId] || 'Módulo';
};

export default Layout;