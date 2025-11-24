import React, { useState } from 'react';
import './Sidebar.css';

// ============================================
// COMPONENTE: Toast Notification
// ============================================
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`toast-sidebar toast-sidebar-${type}`}>
      <span className="toast-sidebar-icon">{icons[type]}</span>
      <span className="toast-sidebar-message">{message}</span>
      <button className="toast-sidebar-close" onClick={onClose}>×</button>
    </div>
  );
};

const Sidebar = ({ isCollapsed, onToggle, activeModule, onModuleChange, isAdmin, user }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    logistica: true,
    recursosHumanos: false,
    dashboard: false,
    activos: false,
    compras: true,
    materiales: false,
    proveedores: false,
    personal: false,
    prestamos: false,
    aprobacion: false,
    reporteria: false
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Verificar el rol del usuario
  // id_rol === 1: Administrador (solo ve LOGÍSTICA)
  // id_rol === 2: Usuario (solo ve LOGÍSTICA)
  // id_rol === 3: Recursos Humanos (ve ambos módulos)
  const userRoleId = user?.id_rol || 0;
  const isRecursosHumanos = userRoleId === 3;
  
  console.log('🔍 Sidebar: Usuario es admin?', isAdmin);
  console.log('🔍 Sidebar: ID Rol del usuario:', userRoleId);
  console.log('🔍 Sidebar: Es Recursos Humanos?', isRecursosHumanos);

  const menuCategories = [
    {
      id: 'logistica',
      title: 'LOGÍSTICA',
      icon: '🚚',
      color: '#3498db',
      isMainModule: true,
      subcategories: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: '🏠',
          color: '#2c3e50',
          items: [
            { id: 'dashboard', title: 'Panel Principal', icon: '📊' }
          ]
        },
        {
          id: 'activos',
          title: 'Administración de Activos',
          icon: '📦',
          color: '#e74c3c',
          items: [
            { id: 'registro-empresa', title: 'Registro de Empresa', icon: '🏢' },
            { id: 'registro-bodega', title: 'Registro de Bodega', icon: '📦' },
            { id: 'registro-reserva', title: 'Registro de Reserva', icon: '📋' },
          ]
        },
        {
          id: 'compras',
          title: 'Compras y Productos',
          icon: '🛒',
          color: '#4a90e2',
          items: [
            { id: 'orden-pedido', title: 'Orden de Pedido', icon: '📝' },
            { id: 'ordenes-compra', title: 'Órdenes de Compra/Servicio', icon: '📋' },
            { id: 'registro-productos', title: 'Registro de Productos', icon: '📦' },
            { id: 'eliminar-oc', title: 'Eliminar OC/OS', icon: '🗑️' }
          ]
        },
        {
          id: 'materiales',
          title: 'Gestión de Materiales',
          icon: '📊',
          color: '#9b59b6',
          items: [
            { id: 'ingreso-materiales', title: 'Ingreso de Materiales', icon: '📥' },
            { id: 'traslado-materiales', title: 'Traslado de Materiales', icon: '🔄' },
            { id: 'salida-materiales', title: 'Salida de Materiales', icon: '📤' },
            { id: 'ajuste-inventario', title: 'Ajuste de Inventario (Solo Admin)', icon: '⚖️', adminOnly: true }
          ]
        },
        {
          id: 'proveedores',
          title: 'Proveedores y Proyectos',
          icon: '🏢',
          color: '#27ae60',
          items: [
            { id: 'registro-proveedores', title: 'Registro de Proveedores', icon: '🏢' },
            { id: 'editar-proveedores', title: 'Editar Proveedores', icon: '✏️' },
            { id: 'registro-proyecto', title: 'Registro de Proyecto', icon: '📊' }
          ]
        },
        {
          id: 'personal',
          title: 'Personal y Kardex',
          icon: '👥',
          color: '#f39c12',
          items: [
            { id: 'kardex', title: 'Kardex', icon: '📝' },
            { id: 'registro-familia', title: 'Registro de Familia', icon: '👨‍👩‍👧' }
          ]
        },
        {
          id: 'prestamos',
          title: 'Gestión de Préstamos',
          icon: '💳',
          color: '#e67e22',
          items: [
            { id: 'prestamos', title: 'Préstamos', icon: '💰' },
            { id: 'historial-prestamos', title: 'Historial de Préstamos', icon: '📜' }
          ]
        },
        {
          id: 'aprobacion',
          title: 'Aprobación (Solo Admin)',
          icon: '✅',
          color: '#8e44ad',
          adminOnly: true,
          items: [
            { id: 'aprobacion-ordenes', title: 'Aprobación de Órdenes', icon: '✅' }
          ]
        },
        {
          id: 'reporteria',
          title: 'Reportería',
          icon: '📊',
          color: '#16a085',
          items: [
            { id: 'reporteria', title: 'Reportería', icon: '📊' }
          ]
        }
      ]
    },
    {
      id: 'recursosHumanos',
      title: 'RECURSOS HUMANOS',
      icon: '👔',
      color: '#e67e22',
      isMainModule: true,
      subcategories: [
        {
          id: 'dashboard-supervisor',
          title: 'Dashboard Supervisor',
          icon: '📊',
          color: '#3498db',
          items: [
            { id: 'dashboard-supervisor', title: 'Panel Supervisor', icon: '👁️' }
          ]
        },
        {
          id: 'reportes-rrhh',
          title: 'Reportes',
          icon: '📋',
          color: '#9b59b6',
          items: [
            { id: 'reportes-asistencia-rrhh', title: 'Reportes de Asistencia', icon: '📅' },
            { id: 'reportes-horarios-rrhh', title: 'Reportes Horarios', icon: '🕐' },
            { id: 'reportes-emergencias-rrhh', title: 'Reportes de Emergencias', icon: '🚨' }
          ]
        },
        {
          id: 'gestion-usuarios-rrhh',
          title: 'Gestión de Usuarios',
          icon: '👥',
          color: '#27ae60',
          rrhhAccess: true,
          items: [
            { id: 'gestion-usuarios-rrhh', title: 'Administrar Usuarios', icon: '👤' },
            { id: 'dashboard-admin-rrhh', title: 'Dashboard Administrador', icon: '🎯' }
          ]
        }
      ]
    }
  ];

  const toggleCategory = (categoryId) => {
    if (isCollapsed) return;
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleItemClick = (itemId) => {
    // Verificar si es un módulo que requiere permisos de admin
    const restrictedModules = ['aprobacion-ordenes', 'ajuste-inventario'];
    
    if (restrictedModules.includes(itemId) && !isAdmin) {
      showToast('🚫 Acceso Denegado\n\nEste módulo está disponible únicamente para usuarios con rol de Administrador.\n\nContacte al administrador del sistema si necesita acceso.', 'error');
      return;
    }
    
    onModuleChange(itemId);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <div className="logo-container">
          {!isCollapsed && (
            <>
              <img 
                src="/Processmart.png" 
                alt="Process-One Logo" 
                className="logo-image"
                style={{
                  width: '45px',
                  height: '45px',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
              <div className="logo-text">
                <span className="logo-title">Process-One</span>
                <span className="logo-subtitle">Sistema de Gestión</span>
              </div>
            </>
          )}
          {isCollapsed && (
            <img 
              src="/Processmart.png" 
              alt="Process-One Logo" 
              className="logo-image-small"
              style={{
                width: '35px',
                height: '35px',
                objectFit: 'contain',
                borderRadius: '6px'
              }}
            />
          )}
        </div>
        <button className="toggle-btn" onClick={onToggle}>
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Módulos Principales */}
      <div className="sidebar-content">
        {menuCategories.map(mainModule => {
          // Ocultar el módulo RECURSOS HUMANOS para roles Administrador (1) y Usuario (2)
          // Solo mostrar RECURSOS HUMANOS para rol Recursos Humanos (3)
          if (mainModule.id === 'recursosHumanos' && !isRecursosHumanos) {
            return null;
          }

          return (
            <div key={mainModule.id} className="main-module">
              {/* Header del Módulo Principal */}
              <div 
                className={`main-module-header ${expandedCategories[mainModule.id] ? 'expanded' : ''}`}
                onClick={() => toggleCategory(mainModule.id)}
                style={{ '--module-color': mainModule.color }}
                title={isCollapsed ? mainModule.title : ''}
              >
                <span className="module-icon">{mainModule.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="module-title">{mainModule.title}</span>
                    <span className="expand-icon">
                      {expandedCategories[mainModule.id] ? '▼' : '▶'}
                    </span>
                  </>
                )}
              </div>

              {/* Subcategorías del Módulo */}
              {!isCollapsed && expandedCategories[mainModule.id] && (
                <div className="module-subcategories">
                  {mainModule.subcategories.map(category => {
                    // Ocultar categorías solo para admin si el usuario no es admin
                    if (category.adminOnly && !isAdmin) {
                      return null;
                    }
                    // Ocultar categorías de RRHH si el usuario no es RRHH
                    if (category.rrhhAccess && !isRecursosHumanos) {
                      return null;
                    }

                    return (
                      <div key={category.id} className="menu-category">
                        <div 
                          className={`category-header ${expandedCategories[category.id] ? 'expanded' : ''}`}
                          onClick={() => toggleCategory(category.id)}
                          style={{ '--category-color': category.color }}
                        >
                          <span className="category-icon">{category.icon}</span>
                          {!isCollapsed && (
                            <>
                              <span className="category-title">{category.title}</span>
                              <span className="expand-icon">
                                {expandedCategories[category.id] ? '▼' : '▶'}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {!isCollapsed && expandedCategories[category.id] && (
                          <div className="category-items">
                            {category.items
                              .filter(item => !item.adminOnly || isAdmin)
                              .map(item => (
                              <div 
                                key={item.id}
                                className={`menu-item ${activeModule === item.id ? 'active' : ''}`}
                                onClick={() => handleItemClick(item.id)}
                              >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-title">{item.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información del Usuario */}
      {!isCollapsed && (
        <div className="user-info-sidebar">
          <div className="user-status">
            <div className="user-avatar-small">
              <span>{isAdmin ? '👑' : (isRecursosHumanos ? '👔' : '👤')}</span>
            </div>
            <div className="user-details-small">
              <span className="user-name-small">{user?.nombre || 'Usuario'}</span>
              <span className={`user-role-small ${isAdmin ? 'admin' : (isRecursosHumanos ? 'rrhh' : 'user')}`}>
                {isAdmin ? 'Administrador' : (isRecursosHumanos ? 'Recursos Humanos' : 'Usuario')}
              </span>
            </div>
          </div>
          {(!isAdmin && !isRecursosHumanos) && (
            <div className="access-notice">
              <span className="notice-icon">ℹ️</span>
              <span className="notice-text">Acceso limitado - Algunos módulos restringidos</span>
            </div>
          )}
        </div>
      )}

      {/* Ayuda */}
      <div className="sidebar-footer">
        <div className="help-item">
          <span className="menu-icon">❓</span>
          {!isCollapsed && <span className="menu-title">Ayuda</span>}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
    </div>
  );
};

export default Sidebar;