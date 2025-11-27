import React, { useState, useEffect, useRef } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    contraseña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Generar partículas flotantes
  useEffect(() => {
    const particleCount = 50;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5
      });
    }
    
    setParticles(newParticles);
  }, []);
  
  // Seguimiento del mouse para efecto parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="login-container" ref={containerRef}>
      {/* Partículas flotantes */}
      <div className="particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* Olas SVG animadas */}
      <div className="waves-container">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path className="wave-path wave1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path className="wave-path wave2" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,213.3C960,213,1056,171,1152,154.7C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path className="wave-path wave3" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="login-left-panel" 
        style={{
          transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`
        }}>
        {/* Formas geométricas decorativas */}
        <div className="geometric-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        
        <div className="logo-container">
          <div className="logo logo-3d">
            <img 
              src="/Processmart.png" 
              alt="Process-One Logo" 
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            />
            <div className="logo-glow"></div>
          </div>
        </div>
        
        <div className="system-info">
          <h1 className="system-title">Process-One</h1>
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
              <img 
                src="/Processmart.png" 
                alt="Process-One Logo" 
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain',
                  marginBottom: '10px'
                }}
              />
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
              <label htmlFor="usuario" className={formData.usuario ? 'label-float' : ''}>Usuario</label>
              <div className={`input-container input-modern ${isLoading ? 'disabled' : ''} ${formData.usuario ? 'has-value' : ''}`}>
                <span className="input-icon icon-animated">👥</span>
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
                <span className="input-highlight"></span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contraseña" className={formData.contraseña ? 'label-float' : ''}>Contraseña</label>
              <div className={`input-container input-modern ${isLoading ? 'disabled' : ''} ${formData.contraseña ? 'has-value' : ''}`} style={{ position: 'relative' }}>
                <span className="input-icon icon-animated">🔐</span>
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
                <span className="input-highlight"></span>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle password-toggle-modern"
                  disabled={isLoading}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button login-button-ripple" disabled={isLoading}>
              <span className="button-content">
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="loading-spinner">⏳</span>
                    INICIANDO SESIÓN...
                  </span>
                ) : (
                  <>
                    <span className="button-text">INICIAR SESIÓN</span>
                    <span className="button-icon">→</span>
                  </>
                )}
              </span>
              <span className="button-shine"></span>
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