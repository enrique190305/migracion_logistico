import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    contraseña: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular delay de autenticación
    setTimeout(() => {
      onLogin(formData);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-text">ProcessMart</span>
          </div>
        </div>
        
        <div className="system-info">
          <h1 className="system-title">ProcessMart</h1>
          <p className="system-subtitle">Sistema de Gestión Empresarial</p>
          
          <div className="system-description">
            <p>Bienvenido al sistema integral de</p>
            <p>gestión de compras, inventarios y</p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <span>Gestión completa de inventarios y compras</span>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Reportes y análisis en tiempo real</span>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Seguridad avanzada y control de accesos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-header">
            <div className="logo-small">
              <span className="logo-text-small">ProcessMart</span>
            </div>
            <h2>Iniciar Sesión</h2>
            <p className="login-subtitle">Acceda a su cuenta empresarial</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="usuario">Usuario</label>
              <div className="input-container">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  required
                  placeholder=""
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contraseña">Contraseña</label>
              <div className="input-container">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="contraseña"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su contraseña"
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2025 ProcessMart - Todos los derechos reservados</p>
            <p className="version">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;