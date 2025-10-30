import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, activeModule, onModuleChange, isAdmin, user }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    activos: false,
    compras: true,
    materiales: false,
    proveedores: false,
    personal: false,
    aprobacion: false,
    reporteria: false
  });

  console.log('🔍 Sidebar: Usuario es admin?', isAdmin);

  const menuCategories = [
    {
      id: 'activos',
      title: 'Administración de Activos',
      icon: '📦',
      color: '#e74c3c',
      items: [
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
        { id: 'salida-materiales', title: 'Salida de Materiales', icon: '📤' }
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
        { id: 'registro-personal', title: 'Registro de Personal', icon: '👤' },
        { id: 'kardex', title: 'Kardex', icon: '📝' },
        { id: 'registro-familia', title: 'Registro de Familia', icon: '👨‍👩‍👧' }
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
    const restrictedModules = ['aprobacion-ordenes'];
    
    if (restrictedModules.includes(itemId) && !isAdmin) {
      alert('🚫 Acceso Denegado\n\nEste módulo está disponible únicamente para usuarios con rol de Administrador.\n\nContacte al administrador del sistema si necesita acceso.');
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

      {/* Dashboard Item */}
      <div className="sidebar-content">
        <div 
          className={`menu-item dashboard-item ${activeModule === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleItemClick('dashboard')}
        >
          <span className="menu-icon">🏠</span>
          {!isCollapsed && <span className="menu-title">Dashboard</span>}
        </div>

        {/* Categorías del Menú */}
        {menuCategories.map(category => {
          // Ocultar categorías solo para admin si el usuario no es admin
          if (category.adminOnly && !isAdmin) {
            return null;
          }

          return (
            <div key={category.id} className="menu-category">
              <div 
                className={`category-header ${expandedCategories[category.id] ? 'expanded' : ''} ${category.adminOnly && !isAdmin ? 'disabled' : ''}`}
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
                  {category.items.map(item => (
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

      {/* Información del Usuario */}
      {!isCollapsed && (
        <div className="user-info-sidebar">
          <div className="user-status">
            <div className="user-avatar-small">
              <span>{isAdmin ? '👑' : '👤'}</span>
            </div>
            <div className="user-details-small">
              <span className="user-name-small">{user?.nombre || 'Usuario'}</span>
              <span className={`user-role-small ${isAdmin ? 'admin' : 'user'}`}>
                {isAdmin ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
          {!isAdmin && (
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
    </div>
  );
};

export default Sidebar;