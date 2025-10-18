import React, { useState, useEffect } from 'react';
import Login from './Login';
import Layout from './Layout/Layout';
import { authService } from '../services/authService';

const AuthManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Manejar login con el backend real
  const handleLogin = async (credentials) => {
    console.log('🔐 AuthManager: Procesando login...');
    
    try {
      // Probar conexión primero
      const connectionTest = await authService.testConnection();
      if (!connectionTest.success) {
        return {
          success: false,
          message: 'No se pudo conectar con el servidor. Verifique que Laravel esté ejecutándose en puerto 8000.'
        };
      }

      // Intentar login
      const loginResult = await authService.login(credentials);
      
      if (loginResult.success) {
        setIsAuthenticated(true);
        setUser(loginResult.user);
        setConnectionError(null);
        console.log('✅ AuthManager: Login exitoso para', loginResult.user.nombre);
        
        return { success: true, message: 'Login exitoso' };
      } else {
        console.log('❌ AuthManager: Login fallido -', loginResult.message);
        
        return {
          success: false,
          message: loginResult.message || 'Credenciales incorrectas'
        };
      }
    } catch (error) {
      console.error('💥 AuthManager: Error crítico en login:', error);
      
      return {
        success: false,
        message: 'Error interno del sistema. Intente nuevamente.'
      };
    }
  };

  // Manejar logout
  const handleLogout = async () => {
    console.log('🚪 AuthManager: Procesando logout...');
    
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      console.log('✅ AuthManager: Logout completado');
    } catch (error) {
      console.error('⚠️ AuthManager: Error en logout:', error);
      // Limpiar estado local aunque falle el logout del servidor
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthManager: Inicializando autenticación...');
      setIsLoading(true);

      try {
        // Verificar si hay datos de autenticación guardados
        const isAuth = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();

        if (isAuth && currentUser) {
          console.log('🔍 AuthManager: Encontrados datos de sesión, verificando con servidor...');
          
          // Verificar que el token sigue siendo válido
          const userInfoResult = await authService.getUserInfo();
          
          if (userInfoResult.success) {
            setIsAuthenticated(true);
            setUser(userInfoResult.user);
            setConnectionError(null);
            console.log('✅ AuthManager: Sesión válida restaurada para', userInfoResult.user.nombre);
          } else {
            console.log('⚠️ AuthManager: Token inválido, limpiando sesión');
            authService.clearAuthData();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('ℹ️ AuthManager: No hay sesión guardada');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('💥 AuthManager: Error al inicializar:', error);
        
        // Si hay error de conexión, mantener sesión local pero mostrar warning
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
          setConnectionError('Sin conexión al servidor. Trabajando en modo offline.');
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Mostrar loading mientras se inicializa
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <h2>Cargando Sistema Logístico...</h2>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mostrar alerta de conexión si hay problemas */}
      {connectionError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ff9800',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          zIndex: 9999,
          fontSize: '14px'
        }}>
          ⚠️ {connectionError}
        </div>
      )}
      
      {isAuthenticated ? (
        <Layout onLogout={handleLogout} user={user} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default AuthManager;