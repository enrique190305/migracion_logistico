import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ProfileModal from '../ProfileModal/ProfileModal';
import OrdenesCompraServicio from '../OrdenesCompraServicio';
import OrdenPedido from '../OrdenPedido/OrdenPedido';
import Aprobacion from '../Aprobacion/Aprobacion';
import Kardex from '../Kardex/Kardex';
import './Layout.css';
import RegistroProyecto from '../RegistroProyecto/RegistroProyecto';
import RegistroBodega from '../RegistroBodega/RegistroBodega';
import RegistroReserva from '../RegistroReserva/RegistroReserva';
import RegistroProductos from '../RegistroProductos/RegistroProductos';
import RegistroEmpresa from '../RegistroEmpresa/RegistroEmpresa';
import EliminarOCS from '../EliminarOCS/EliminarOCS';
import RegistroProveedor from '../RegistroProveedor/RegistroProveedor';
import EditarProveedor from '../EditarProveedor/EditarProveedor';
import RegistroFamilia from '../RegistroFamilia/RegistroFamilia';

import RegistroPersonal from '../RegistroPersonal/RegistroPersonal';
import IngresoMateriales from '../IngresoMateriales/IngresoMateriales';
import TrasladoMateriales from '../TrasladoMateriales/TrasladoMateriales';
import SalidaMateriales from '../SalidaMateriales/SalidaMateriales';
import StockBodegas from '../StockBodegas/StockBodegas';
import AjusteInventario from '../AjusteInventario/AjusteInventario';
import Reporteria from '../Reporteria/Reporteria';
import Prestamos from '../Prestamos/Prestamos_NEW';




const Layout = ({ onLogout, user: propUser }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [ingresoMaterialesTab, setIngresoMaterialesTab] = useState(null); // Para controlar el tab de Ingreso Materiales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // ✅ Estado del modal de perfil
  
  // Usar el usuario de props si está disponible, sino del localStorage
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Verificar si el usuario es administrador
  const isAdmin = user?.permissions?.is_admin || user?.id_rol === 1 || false;

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    // Resetear el tab cuando se cambia de módulo manualmente
    setIngresoMaterialesTab(null);
  };

  // ✅ Manejar apertura del modal de perfil
  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  // ✅ Manejar cierre del modal de perfil
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // ✅ Manejar actualización de perfil
  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    // Actualizar también el localStorage para persistir los cambios
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ Perfil actualizado en Layout y localStorage:', updatedUser);
  };

  // Escuchar evento personalizado para cambiar de módulo desde otros componentes
  useEffect(() => {
    const handleCambiarModulo = (event) => {
      const { modulo, tab } = event.detail;
      setActiveModule(modulo);
      
      // Si se especifica un tab para Ingreso Materiales, guardarlo
      if (modulo === 'ingreso-materiales' && tab) {
        setIngresoMaterialesTab(tab);
      } else {
        setIngresoMaterialesTab(null);
      }
    };

    window.addEventListener('cambiarModulo', handleCambiarModulo);

    return () => {
      window.removeEventListener('cambiarModulo', handleCambiarModulo);
    };
  }, []);

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardContent />;
      case 'registro-bodega':
        return <RegistroBodega />;
      case 'registro-reserva':
        return <RegistroReserva />;
      case 'registro-empresa':
        return <RegistroEmpresa />;
      case 'orden-pedido':
        return <OrdenPedido />;
      case 'ordenes-compra':
        return <OrdenesCompraServicio />;
      case 'registro-productos':
        return <RegistroProductos />;
      case 'eliminar-oc':
        return <EliminarOCS />;
      case 'ingreso-materiales':
        return <IngresoMateriales initialTab={ingresoMaterialesTab} />;
      case 'traslado-materiales':
        return <TrasladoMateriales />;
      case 'salida-materiales':
        return <SalidaMateriales />;
      case 'stock-bodegas':
        return <StockBodegas />;
      case 'ajuste-inventario':
        return <AjusteInventario />;
      case 'registro-proveedores':
        return <RegistroProveedor />;
      case 'editar-proveedores':
        return <EditarProveedor />;
      case 'registro-proyecto':
        return <RegistroProyecto />;
      case 'registro-personal':
        return <RegistroPersonal/>;
      case 'kardex':
        return <Kardex />;
      case 'registro-familia':
        return <RegistroFamilia />;
        case 'prestamos':
        return <Prestamos />;
      case 'historial-prestamos':
        return <Prestamos />;
      case 'aprobacion-ordenes':
        return <Aprobacion />;
      case 'reporteria':
        return <Reporteria />;
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
        isAdmin={isAdmin}
        user={user}
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
                <span className="user-name">{user.nombre || user.name || 'Usuario'}</span>
                <span className="user-role">
                  {user.role || user.permissions?.role_name || (isAdmin ? 'Administrador' : 'Usuario')}
                  {!isAdmin && ' (Acceso Limitado)'}
                </span>
              </div>
            </div>
            
            {/* ✅ Botón de Editar Perfil */}
            <button className="profile-edit-btn" onClick={handleOpenProfileModal} title="Editar Perfil">
              <span className="profile-edit-icon">⚙️</span>
              <span className="profile-edit-text">Mi Perfil</span>
            </button>

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
            <span>
              Usuario: {user.nombre || user.name || 'Usuario'} 
              ({user.role || user.permissions?.role_name || (isAdmin ? 'Administrador' : 'Usuario')})
              {!isAdmin && ' - Acceso Limitado'}
              | Sesión iniciada: {new Date().toLocaleDateString('es-PE')}
            </span>
          </div>
        </footer>
      </div>

      {/* ✅ Modal de Perfil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        user={user}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

// Componente para el Dashboard de resumen
const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Importar el servicio del dashboard
  const { dashboardService } = require('../../services/authService');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('🔄 Cargando datos del dashboard...');
        setIsLoading(true);
        setError(null);

        // Cargar datos del dashboard
        const result = await dashboardService.getDashboardSummary();
        
        if (result.success) {
          setDashboardData(result.data);
          console.log('✅ Dashboard cargado exitosamente');
        } else {
          // Usar datos de fallback si hay error pero tenemos datos
          if (result.data) {
            setDashboardData(result.data);
            setError('Datos cargados con conectividad limitada');
          } else {
            throw new Error(result.message);
          }
        }
      } catch (err) {
        console.error('❌ Error al cargar dashboard:', err);
        setError('Error al cargar datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="dashboard-content">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ fontSize: '48px' }}>📊</div>
          <h3>Cargando Dashboard...</h3>
          <p>Obteniendo datos del sistema...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay datos
  if (!dashboardData && error) {
    return (
      <div className="dashboard-content">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: '20px',
          color: '#e74c3c'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h3>Error al cargar Dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const activities = dashboardData?.recent_activity || [];
  const alerts = dashboardData?.alerts || [];

  return (
    <div className="dashboard-content">
      {/* Mostrar alerta de conectividad si hay problemas */}
      {error && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '10px 15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Estadísticas principales */}
        <div className="stats-section">
          <h2>Estadísticas del Sistema</h2>
          <div className="stats-cards">
            <div className="stat-card blue">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats.productos_registrados || 0}</h3>
                <p>Productos Registrados</p>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>{stats.proyectos_activos || 0}</h3>
                <p>Proyectos Activos</p>
              </div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>{stats.movimientos_mes || 0}</h3>
                <p>Movimientos este mes</p>
              </div>
            </div>
            <div className="stat-card orange">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.personal_activo || 0}</h3>
                <p>Personal Activo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="activity-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-info">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-item">
                <div className="activity-icon">📋</div>
                <div className="activity-info">
                  <h4>Sin actividad reciente</h4>
                  <p>No hay movimientos registrados</p>
                  <span className="activity-time">Ahora</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="alerts-section">
          <h2>Alertas del Sistema</h2>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">{alert.icon}</div>
                  <div className="alert-info">
                    <h4>{alert.title}</h4>
                    <p>{alert.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert-item info">
                <div className="alert-icon">✅</div>
                <div className="alert-info">
                  <h4>Sistema operativo</h4>
                  <p>No hay alertas pendientes</p>
                </div>
              </div>
            )}
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
    'registro-bodega': 'Registro de Bodega',
    'registro-reserva': 'Registro de Reserva',
    'orden-pedido': 'Orden de Pedido',
    'ordenes-compra': 'Órdenes de Compra/Servicio',
    'registro-productos': 'Registro de Productos',
    'eliminar-oc': 'Eliminar OC/OS',
    'ingreso-materiales': 'Ingreso de Materiales',
    'traslado-materiales': 'Traslado de Materiales',
    'salida-materiales': 'Salida de Materiales',
    'stock-bodegas': 'Stock de Bodegas',
    'ajuste-inventario': 'Ajuste de Inventario',
    'registro-proveedores': 'Registro de Proveedores',
    'editar-proveedores': 'Editar Proveedores',
    'registro-proyecto': 'Registro de Proyecto',
    'registro-personal': 'Registro de Personal',
    'kardex': 'Kardex',
    'registro-familia': 'Registro de Familia',
    'prestamos': 'Préstamos',
    'historial-prestamos': 'Historial de Préstamos',
    'aprobacion-ordenes': 'Aprobación de Órdenes',
    'reporteria': 'Reportería'
  };
  return titles[moduleId] || 'Módulo';
};

export default Layout;