import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, activeModule, onModuleChange }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    compras: true,
    materiales: false,
    proveedores: false,
    personal: false,
    aprobacion: false
  });

  const menuCategories = [
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
      icon: '📦',
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
        { id: 'registro-personal', title: 'Registro de Personal', icon: '👥' },
        { id: 'kardex', title: 'Kardex', icon: '📈' },
        { id: 'registro-familia', title: 'Registro de Familia', icon: '👥' }
      ]
    },
    {
      id: 'aprobacion',
      title: 'Aprobación',
      icon: '✅',
      color: '#8e44ad',
      items: [
        { id: 'aprobacion-ordenes', title: 'Aprobación de Órdenes', icon: '✅' }
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
    onModuleChange(itemId);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <div className="logo-container">
          {!isCollapsed && (
            <>
              <div className="logo-icon">PM</div>
              <div className="logo-text">
                <span className="logo-title">ProcessMart</span>
                <span className="logo-subtitle">Sistema de Gestión</span>
              </div>
            </>
          )}
          {isCollapsed && <div className="logo-icon-small">PM</div>}
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
        {menuCategories.map(category => (
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
        ))}
      </div>

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