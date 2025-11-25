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

import IngresoMateriales from '../IngresoMateriales/IngresoMateriales';
import TrasladoMateriales from '../TrasladoMateriales/TrasladoMateriales';
import SalidaMateriales from '../SalidaMateriales/SalidaMateriales';
import AjusteInventario from '../AjusteInventario/AjusteInventario';
import Reporteria from '../Reporteria/Reporteria';
import Prestamos from '../Prestamos/Prestamos_COMPLETO';
import DashboardSupervisor from '../DashboardSupervisor/DashboardSupervisor';
import ReportesAsistencia from '../ReportesAsistencia/ReportesAsistencia';
import ReportesEmergencias from '../ReportesEmergencias/ReportesEmergencias';
import ReportesHorarios from '../ReportesHorarios/ReportesHorarios';
import GestionUsuarios from '../GestionUsuarios/GestionUsuarios';
import DashboardAdministrador from '../DashboardAdministrador/DashboardAdministrador';
import DashboardStats from '../DashboardStats/DashboardStats';




const Layout = ({ onLogout, user: propUser }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [ingresoMaterialesTab, setIngresoMaterialesTab] = useState(null); // Para controlar el tab de Ingreso Materiales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // ✅ Estado del modal de perfil
  
  // Usar el usuario de props si está disponible, sino del localStorage
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Verificar si el usuario es administrador o Recursos Humanos
  // id_rol === 1: Administrador
  // id_rol === 2: Usuario
  // id_rol === 3: Recursos Humanos
  const isAdmin = user?.permissions?.is_admin || user?.id_rol === 1 || false;
  const isRecursosHumanos = user?.id_rol === 3 || false;

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
      case 'ajuste-inventario':
        return <AjusteInventario />;
      case 'registro-proveedores':
        return <RegistroProveedor />;
      case 'editar-proveedores':
        return <EditarProveedor />;
      case 'registro-proyecto':
        return <RegistroProyecto />;
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
      case 'dashboard-supervisor':
        return <DashboardSupervisor />;
      case 'reportes-asistencia-rrhh':
        return <ReportesAsistencia />;
      case 'reportes-emergencias-rrhh':
        return <ReportesEmergencias />;
      case 'reportes-horarios-rrhh':
        return <ReportesHorarios />;
      case 'gestion-usuarios-rrhh':
        return <GestionUsuarios />;
      case 'dashboard-admin-rrhh':
        return <DashboardAdministrador />;
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
                <span>{isAdmin ? '👑' : (isRecursosHumanos ? '👔' : '👤')}</span>
              </div>
              <div className="user-details">
                <span className="user-name">{user.nombre || user.name || 'Usuario'}</span>
                <span className="user-role">
                  {user.role || user.permissions?.role_name || (isAdmin ? 'Administrador' : (isRecursosHumanos ? 'Recursos Humanos' : 'Usuario'))}
                  {(!isAdmin && !isRecursosHumanos) && ' (Acceso Limitado)'}
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
              ({user.role || user.permissions?.role_name || (isAdmin ? 'Administrador' : (isRecursosHumanos ? 'Recursos Humanos' : 'Usuario'))})
              {(!isAdmin && !isRecursosHumanos) && ' - Acceso Limitado'}
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

  // Renderizar el nuevo componente DashboardStats
  return <DashboardStats dashboardData={dashboardData} error={error} />;
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
    'ajuste-inventario': 'Ajuste de Inventario',
    'registro-proveedores': 'Registro de Proveedores',
    'editar-proveedores': 'Editar Proveedores',
    'registro-proyecto': 'Registro de Proyecto',
    'kardex': 'Kardex',
    'registro-familia': 'Registro de Familia',
    'prestamos': 'Préstamos',
    'historial-prestamos': 'Historial de Préstamos',
    'aprobacion-ordenes': 'Aprobación de Órdenes',
    'reporteria': 'Reportería',
    'dashboard-supervisor': 'Dashboard Supervisor',
    'reportes-asistencia-rrhh': 'Reportes de Asistencia',
    'reportes-horarios-rrhh': 'Reportes Horarios',
    'reportes-emergencias-rrhh': 'Reportes de Emergencias',
    'gestion-usuarios-rrhh': 'Gestión de Usuarios',
    'dashboard-admin-rrhh': 'Dashboard Administrador'
  };
  return titles[moduleId] || 'Módulo';
};

export default Layout;