import React, { useState, useEffect } from 'react';
import Login from './Login';
import Layout from './Layout/Layout';

const AuthManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (credentials) => {
    // Aquí se implementará la lógica de autenticación con el backend
    console.log('Intentando login con:', credentials);
    
    // Por ahora, simulamos un login exitoso
    if (credentials.usuario && credentials.contraseña) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        name: credentials.usuario,
        role: 'Administrador'
      }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  // Verificar si el usuario ya está autenticado al cargar la aplicación
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div>
      {isAuthenticated ? (
        <Layout onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default AuthManager;