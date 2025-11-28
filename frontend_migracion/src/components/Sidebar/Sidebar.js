import React, { useState, useRef, useEffect } from 'react';
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

const Sidebar = ({ isCollapsed, onToggle, activeModule, onModuleChange, isAdmin, user, onMouseEnter, onMouseLeave }) => {
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
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });
  const tooltipTimerRef = useRef(null);

  // Limpiar tooltip cuando el sidebar deja de estar colapsado
  useEffect(() => {
    if (!isCollapsed) {
      setHoveredCategory(null);
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    }
  }, [isCollapsed]);

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

  // Determinar qué módulo principal mostrar según el rol del usuario
  const [currentMainModule, setCurrentMainModule] = useState('logistica');
  const [selectedCategory, setSelectedCategory] = useState('dashboard');
  
  // Definir las categorías principales de LOGÍSTICA con sus iconos
  const logisticaCategories = [
    { id: 'dashboard', icon: '🏠', title: 'Dashboard', modules: ['dashboard'] },
    { id: 'activos', icon: '📦', title: 'Administración de Activos', modules: ['registro-empresa', 'registro-bodega', 'registro-reserva'] },
    { id: 'compras', icon: '🛒', title: 'Compras y Productos', modules: ['orden-pedido', 'ordenes-compra', 'registro-productos', 'eliminar-oc'] },
    { id: 'materiales', icon: '📊', title: 'Gestión de Materiales', modules: ['ingreso-materiales', 'traslado-materiales', 'salida-materiales', 'ajuste-inventario'] },
    { id: 'proveedores', icon: '🏢', title: 'Proveedores y Proyectos', modules: ['registro-proveedores', 'editar-proveedores', 'registro-proyecto', 'kardex', 'registro-familia'] },
    { id: 'prestamos', icon: '💳', title: 'Gestión y Reportes', modules: ['prestamos', 'historial-prestamos', 'aprobacion-ordenes', 'reporteria'] }
  ];

  // Definir las categorías principales de RECURSOS HUMANOS con sus iconos
  const recursosHumanosCategories = [
    { id: 'dashboard-rrhh', icon: '📊', title: 'Dashboard Supervisor', modules: ['dashboard-supervisor'] },
    { id: 'reportes-rrhh', icon: '📋', title: 'Reportes', modules: ['reportes-asistencia-rrhh', 'reportes-horarios-rrhh', 'reportes-emergencias-rrhh'] },
    { id: 'gestion-rrhh', icon: '👥', title: 'Gestión de Usuarios', modules: ['gestion-usuarios-rrhh', 'dashboard-admin-rrhh'] }
  ];

  // Obtener las categorías según el módulo actual
  const getCurrentCategories = () => {
    return currentMainModule === 'logistica' ? logisticaCategories : recursosHumanosCategories;
  };
  
  // Obtener todos los items del módulo actual filtrados por categoría
  const getCurrentCategoryItems = () => {
    const module = menuCategories.find(m => m.id === currentMainModule);
    if (!module) return [];
    
    const categories = getCurrentCategories();
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return [];
    
    let allItems = [];
    module.subcategories.forEach(subcat => {
      const filteredItems = subcat.items.filter(item => {
        if (item.adminOnly && !isAdmin) return false;
        if (subcat.rrhhAccess && !isRecursosHumanos) return false;
        return category.modules.includes(item.id);
      });
      allItems = [...allItems, ...filteredItems];
    });
    return allItems;
  };

  // Obtener items de una categoría específica (para tooltips)
  const getCurrentCategoryItemsForCategory = (categoryId) => {
    const module = menuCategories.find(m => m.id === currentMainModule);
    if (!module) return [];
    
    const categories = getCurrentCategories();
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];
    
    let allItems = [];
    module.subcategories.forEach(subcat => {
      const filteredItems = subcat.items.filter(item => {
        if (item.adminOnly && !isAdmin) return false;
        if (subcat.rrhhAccess && !isRecursosHumanos) return false;
        return category.modules.includes(item.id);
      });
      allItems = [...allItems, ...filteredItems];
    });
    return allItems;
  };

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
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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

      {/* Contenido del Sidebar - Orden correcto: Módulos Generales -> Iconos Laterales -> Submódulos */}
      <div className="sidebar-main-container">
        <div className="sidebar-content-figma">
          {!isCollapsed && (
            <>
              {/* Selector de Módulo General (LOGÍSTICA / RECURSOS HUMANOS) */}
              <div className="sidebar-module-title">
                <h2>{currentMainModule === 'logistica' ? 'LOGÍSTICA' : 'RECURSOS HUMANOS'}</h2>
              </div>

              {/* Botones para cambiar de módulo general (si el usuario tiene acceso a RRHH) */}
              {isRecursosHumanos && (
                <div className="module-selector">
                  <button 
                    className={`module-selector-btn ${currentMainModule === 'logistica' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentMainModule('logistica');
                      setSelectedCategory('dashboard');
                    }}
                  >
                    🚚 LOGÍSTICA
                  </button>
                  <button 
                    className={`module-selector-btn ${currentMainModule === 'recursosHumanos' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentMainModule('recursosHumanos');
                      setSelectedCategory('dashboard-rrhh');
                    }}
                  >
                    👔 RECURSOS HUMANOS
                  </button>
                </div>
              )}

              {/* Contenedor con iconos laterales y submódulos */}
              <div className="sidebar-category-container">
                {/* Iconos circulares laterales según el módulo general seleccionado */}
                <div className="sidebar-lateral-icons">
                  {getCurrentCategories().map(category => (
                    <button
                      key={category.id}
                      className={`lateral-icon-btn ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                      title={category.title}
                    >
                      {category.icon}
                    </button>
                  ))}
                </div>

                {/* Lista de submódulos de la categoría seleccionada */}
                <div className="sidebar-menu-list">
                  {getCurrentCategoryItems().map(item => (
                    <button
                      key={item.id}
                      className={`sidebar-menu-item ${activeModule === item.id ? 'active' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <span className="menu-item-icon">{item.icon}</span>
                      <span className="menu-item-text">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Vista colapsada */}
          {isCollapsed && (
            <div className="sidebar-collapsed-icons">
              {getCurrentCategories().map((category, index) => {
                const categoryItems = getCurrentCategoryItemsForCategory(category.id);
                return (
                  <div 
                    key={category.id} 
                    className="collapsed-icon-wrapper"
                    onMouseEnter={(e) => {
                      if (tooltipTimerRef.current) {
                        clearTimeout(tooltipTimerRef.current);
                      }
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPosition({ top: rect.top });
                      setHoveredCategory(category.id);
                    }}
                    onMouseLeave={() => {
                      tooltipTimerRef.current = setTimeout(() => {
                        setHoveredCategory(null);
                      }, 100);
                    }}
                  >
                    <button
                      className={`sidebar-icon-btn ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                      title={category.title}
                    >
                      {category.icon}
                    </button>
                    
                    {/* Tooltip con submódulos */}
                    {isCollapsed && hoveredCategory === category.id && categoryItems.length > 0 && (
                      <div 
                        className="sidebar-tooltip"
                        style={{ top: tooltipPosition.top }}
                        onMouseEnter={() => {
                          if (tooltipTimerRef.current) {
                            clearTimeout(tooltipTimerRef.current);
                          }
                          setHoveredCategory(category.id);
                        }}
                        onMouseLeave={() => {
                          tooltipTimerRef.current = setTimeout(() => {
                            setHoveredCategory(null);
                          }, 100);
                        }}
                      >
                        <div className="tooltip-header">
                          <span className="tooltip-icon">{category.icon}</span>
                          <span className="tooltip-title">{category.title}</span>
                        </div>
                        <div className="tooltip-items">
                          {categoryItems.map(item => (
                            <button
                              key={item.id}
                              className={`tooltip-item ${activeModule === item.id ? 'active' : ''}`}
                              onClick={() => {
                                handleItemClick(item.id);
                                setHoveredCategory(null);
                              }}
                            >
                              <span className="tooltip-item-icon">{item.icon}</span>
                              <span className="tooltip-item-text">{item.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sección inferior del sidebar */}
      {!isCollapsed && (
        <div className="sidebar-bottom-section">
          <div className="user-info-figma">
            <div className="user-avatar-figma">
              <span>👤</span>
            </div>
            <div className="user-details-figma">
              <span className="user-name-figma">{user?.nombre || 'Usuario'}</span>
              <span className="user-role-figma">
                {isAdmin ? 'Recursos Humanos' : (isRecursosHumanos ? 'Recursos Humanos' : 'Usuario (Acceso limitado)')}
              </span>
            </div>
          </div>
          
          {/* Botón de Ayuda */}
          <button className="help-button-figma">
            <span className="help-icon">❓</span>
            <span className="help-text">AYUDA</span>
          </button>
        </div>
      )}

      {/* Vista colapsada - Botón de ayuda */}
      {isCollapsed && (
        <div className="sidebar-footer">
          <button className="help-icon-collapsed" title="Ayuda">
            ❓
          </button>
        </div>
      )}

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