import React, { useState } from 'react';
import './Dashboard.css';
import OrdenesCompraServicio from '../OrdenesCompraServicio';
import OrdenPedido from '../OrdenPedido/OrdenPedido';
import Aprobacion from '../Aprobacion/Aprobacion'; 
import Kardex from '../Kardex/Kardex ';

const Dashboard = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [vistaActual, setVistaActual] = useState('menu'); // 'menu' o nombre del módulo
  const [moduloActivo, setModuloActivo] = useState(null);

  const menuItems = [
    // Fila 1 - Azul (Órdenes y Productos)
    { 
      title: 'Orden de Pedido', 
      icon: '📝', 
      color: '#667eea',
      category: 'pedido'
    },
    { 
      title: 'Órdenes de Compra/Servicio', 
      icon: '📋', 
      color: '#4a90e2',
      category: 'compras'
    },
    { 
      title: 'Registro de Productos', 
      icon: '📦', 
      color: '#4a90e2',
      category: 'productos'
    },
    { 
      title: 'Eliminar OC/OS', 
      icon: '🗑️', 
      color: '#4a90e2',
      category: 'eliminar'
    },
    
    // Fila 2 - Morado (Materiales)
    { 
      title: 'Ingreso de Materiales', 
      icon: '📥', 
      color: '#9b59b6',
      category: 'ingreso'
    },
    { 
      title: 'Traslado de Materiales', 
      icon: '🔄', 
      color: '#9b59b6',
      category: 'traslado'
    },
    { 
      title: 'Salida de Materiales', 
      icon: '📤', 
      color: '#9b59b6',
      category: 'salida'
    },
    
    // Fila 3 - Verde (Proveedores y Proyectos)
    { 
      title: 'Registro de Proveedores', 
      icon: '🏢', 
      color: '#27ae60',
      category: 'proveedores'
    },
    { 
      title: 'Editar Proveedores', 
      icon: '✏️', 
      color: '#27ae60',
      category: 'editar'
    },
    { 
      title: 'Registro de Proyecto', 
      icon: '📊', 
      color: '#27ae60',
      category: 'proyecto'
    },
    
    // Fila 4 - Amarillo (Personal y Kardex)
    { 
      title: 'Registro de Personal', 
      icon: '👥', 
      color: '#f39c12',
      category: 'personal'
    },
    { 
      title: 'Kardex', 
      icon: '📈', 
      color: '#f39c12',
      category: 'kardex'
    },
    { 
      title: 'Registro de Familia', 
      icon: '👥', 
      color: '#f39c12',
      category: 'familia'
    },
    
    // Fila 5 - Morado (Aprobación)
    { 
      title: 'Aprobación de Órdenes', 
      icon: '✅', 
      color: '#8e44ad',
      category: 'aprobacion'
    }
  ];

  const handleMenuClick = (item) => {
    console.log(`Navegando a: ${item.title}`);
    setVistaActual('modulo');
    setModuloActivo(item.category);
  };

  const volverAlMenu = () => {
    setVistaActual('menu');
    setModuloActivo(null);
  };

  // Si estamos en una vista de módulo, mostrar el componente correspondiente
  if (vistaActual === 'modulo') {
    return (
      <div className="dashboard-container">
        {/* Header con botón de volver */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="btn-volver" onClick={volverAlMenu}>
              ← Volver al Menú
            </button>
            <div className="logo-container">
              <div className="logo-icon">PM</div>
              <div className="logo-text">
                <h1>Sistema de Compras y Almacén</h1>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <span className="user-name">{user.name || 'admin'}</span>
                <span className="user-role">{user.role || 'Administrador'}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <span className="logout-icon">🚪</span>
            </button>
          </div>
        </header>

        {/* Renderizar el módulo correspondiente */}
        <main className="dashboard-main-modulo">
          {moduloActivo === 'pedido' && <OrdenPedido />}
          {moduloActivo === 'compras' && <OrdenesCompraServicio />}
          {moduloActivo === 'productos' && <div className="modulo-placeholder">Módulo de Registro de Productos (En desarrollo)</div>}
          {moduloActivo === 'eliminar' && <div className="modulo-placeholder">Módulo de Eliminar OC/OS (En desarrollo)</div>}
          {moduloActivo === 'ingreso' && <div className="modulo-placeholder">Módulo de Ingreso de Materiales (En desarrollo)</div>}
          {moduloActivo === 'traslado' && <div className="modulo-placeholder">Módulo de Traslado de Materiales (En desarrollo)</div>}
          {moduloActivo === 'salida' && <div className="modulo-placeholder">Módulo de Salida de Materiales (En desarrollo)</div>}
          {moduloActivo === 'proveedores' && <div className="modulo-placeholder">Módulo de Registro de Proveedores (En desarrollo)</div>}
          {moduloActivo === 'editar' && <div className="modulo-placeholder">Módulo de Editar Proveedores (En desarrollo)</div>}
          {moduloActivo === 'proyecto' && <div className="modulo-placeholder">Módulo de Registro de Proyecto (En desarrollo)</div>}
          {moduloActivo === 'personal' && <div className="modulo-placeholder">Módulo de Registro de Personal (En desarrollo)</div>}
          {moduloActivo === 'kardex' && <Kardex />}
          {moduloActivo === 'familia' && <div className="modulo-placeholder">Módulo de Registro de Familia (En desarrollo)</div>}
          {moduloActivo === 'aprobacion' && <Aprobacion />}
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <div className="logo-icon">PM</div>
            <div className="logo-text">
              <h1>Sistema de Compras y Almacén</h1>
              <p>Gestión integral de inventarios, compras y materiales</p>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">{user.name || 'admin'}</span>
              <span className="user-role">{user.role || 'Administrador'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <span className="logout-icon">🚪</span>
          </button>
        </div>
      </header>

      {/* Help Button */}
      <div className="help-container">
        <button className="help-btn">
          <span>?? Ayuda</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="menu-grid">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className="menu-item"
              style={{ backgroundColor: item.color }}
              onClick={() => handleMenuClick(item)}
            >
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-title">{item.title}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="stats-container">
          <span>?? 267 productos registrados</span>
          <span>?? 9 proyectos activos</span>
          <span>?? 27 movimientos este mes</span>
          <span>?? Sistema operativo</span>
        </div>
        <div className="session-info">
          <span>Usuario: {user.name || 'admin'} ({user.role || 'Administrador'}) | Sesión iniciada: 16/10/2025 19:41</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;