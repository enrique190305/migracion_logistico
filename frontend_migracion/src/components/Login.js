import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    contraseña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validaciones básicas
    if (!formData.usuario.trim()) {
      setError('Por favor ingrese su usuario');
      setIsLoading(false);
      return;
    }
    
    if (!formData.contraseña) {
      setError('Por favor ingrese su contraseña');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('🔐 Login: Enviando credenciales al AuthManager...');
      
      // Llamar a la función de login del AuthManager
      const result = await onLogin(formData);
      
      if (!result.success) {
        setError(result.message || 'Error en el login');
      }
      // Si es exitoso, AuthManager manejará la redirección
      
    } catch (error) {
      console.error('💥 Login: Error crítico:', error);
      setError('Error interno del sistema. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            {/* Mostrar errores si los hay */}
            {error && (
              <div className="error-message" style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffcdd2',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>❌</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="usuario">Usuario</label>
              <div className={`input-container ${isLoading ? 'disabled' : ''}`}>
                <span className="input-icon">👥</span>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su usuario"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contraseña">Contraseña</label>
              <div className={`input-container ${isLoading ? 'disabled' : ''}`} style={{ position: 'relative' }}>
                <span className="input-icon">🔐</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="contraseña"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su contraseña"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  disabled={isLoading}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⏳</span>
                  INICIANDO SESIÓN...
                </span>
              ) : (
                'INICIAR SESIÓN'
              )}
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