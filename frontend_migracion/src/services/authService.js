import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar el token JWT automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores automáticamente
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró o es inválido, limpiar el storage
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  
  // Login - Autenticar usuario
  async login(credentials) {
    try {
      console.log('🔐 Intentando login con:', credentials.usuario);
      
      const response = await apiClient.post('/auth/login', {
        usuario: credentials.usuario,
        contraseña: credentials.contraseña
      });

      if (response.data.success && response.data.data.token) {
        const { user, token, token_type, expires_in } = response.data.data;
        
        // Guardar información de autenticación
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('token_type', token_type);
        localStorage.setItem('token_expires_in', expires_in.toString());
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        
        console.log('✅ Login exitoso para usuario:', user.nombre);
        
        return {
          success: true,
          user,
          token,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Error en el login');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Manejar diferentes tipos de error
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  // Logout - Cerrar sesión
  async logout() {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Intentar logout en el servidor
      await apiClient.post('/auth/logout');
      
      console.log('✅ Logout exitoso en servidor');
    } catch (error) {
      console.warn('⚠️ Error al hacer logout en servidor:', error.message);
      // Continuar con logout local aunque falle el servidor
    } finally {
      // Limpiar storage local siempre
      this.clearAuthData();
      console.log('🧹 Datos de autenticación limpiados');
    }
  },

  // Obtener información del usuario actual
  async getUserInfo() {
    try {
      console.log('👤 Obteniendo información del usuario...');
      
      const response = await apiClient.get('/auth/me');
      
      if (response.data.success) {
        const user = response.data.data.user;
        
        // Actualizar información del usuario en storage
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Información de usuario actualizada:', user.nombre);
        
        return {
          success: true,
          user
        };
      } else {
        throw new Error('Error al obtener información del usuario');
      }
    } catch (error) {
      console.error('❌ Error al obtener info del usuario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener información del usuario'
      };
    }
  },

  // Verificar permisos de administrador
  async checkAdminPermissions() {
    try {
      console.log('🔍 Verificando permisos de administrador...');
      
      const response = await apiClient.get('/auth/check-admin');
      
      if (response.data.success) {
        const permissions = response.data.data;
        
        console.log('✅ Permisos obtenidos:', permissions);
        
        return {
          success: true,
          permissions
        };
      } else {
        throw new Error('Error al verificar permisos');
      }
    } catch (error) {
      console.error('❌ Error al verificar permisos:', error);
      return {
        success: false,
        permissions: {
          is_admin: false,
          can_access_approval_modules: false
        }
      };
    }
  },

  // Refrescar token JWT
  async refreshToken() {
    try {
      console.log('🔄 Refrescando token...');
      
      const response = await apiClient.post('/auth/refresh');
      
      if (response.data.success) {
        const { token, token_type, expires_in } = response.data.data;
        
        // Actualizar token en storage
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('token_expires_in', expires_in.toString());
        
        console.log('✅ Token refrescado exitosamente');
        
        return {
          success: true,
          token
        };
      } else {
        throw new Error('Error al refrescar token');
      }
    } catch (error) {
      console.error('❌ Error al refrescar token:', error);
      
      // Si falla el refresh, limpiar autenticación
      this.clearAuthData();
      
      return {
        success: false,
        message: 'Sesión expirada. Por favor, inicie sesión nuevamente.'
      };
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('jwt_token');
    const isAuth = localStorage.getItem('isAuthenticated');
    return !!(token && isAuth === 'true');
  },

  // Obtener usuario desde localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener usuario del storage:', error);
      return null;
    }
  },

  // Verificar si el usuario actual es administrador
  isCurrentUserAdmin() {
    const user = this.getCurrentUser();
    return user?.permissions?.is_admin || user?.id_rol === 1 || false;
  },

  // Limpiar todos los datos de autenticación
  clearAuthData() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('token_expires_in');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },

  // Test de conexión con la API
  async testConnection() {
    try {
      console.log('🔌 Probando conexión con API...');
      
      const response = await apiClient.get('/test');
      
      if (response.data.success) {
        console.log('✅ Conexión con API exitosa');
        return { success: true, message: 'Conexión exitosa con el servidor' };
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('❌ Error de conexión con API:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor. Verifique que esté ejecutándose.'
      };
    }
  }
};

// Servicio para el Dashboard
export const dashboardService = {
  
  // Obtener estadísticas principales
  async getStats() {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      
      const response = await apiClient.get('/dashboard/stats');
      
      if (response.data.success) {
        console.log('✅ Estadísticas obtenidas:', response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error('Error al obtener estadísticas');
      }
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estadísticas',
        // Datos de fallback para que el dashboard no se rompa
        data: {
          productos_registrados: 267,
          proyectos_activos: 9,
          movimientos_mes: 27,
          personal_activo: 15
        }
      };
    }
  },

  // Obtener actividad reciente
  async getRecentActivity() {
    try {
      console.log('🔄 Obteniendo actividad reciente...');
      
      const response = await apiClient.get('/dashboard/activity');
      
      if (response.data.success) {
        console.log('✅ Actividad obtenida:', response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error('Error al obtener actividad');
      }
    } catch (error) {
      console.error('❌ Error al obtener actividad:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener actividad',
        // Datos de fallback
        data: [
          {
            type: 'ingreso',
            icon: '📥',
            title: 'Ingreso de materiales',
            description: 'Se registraron 50 unidades de cemento',
            time: 'Hace 2 horas',
            user: 'Sistema'
          },
          {
            type: 'orden',
            icon: '📋',
            title: 'Nueva orden de compra',
            description: 'OC-2025-001 creada para proveedor ABC',
            time: 'Hace 4 horas',
            user: 'Admin'
          },
          {
            type: 'aprobacion',
            icon: '✅',
            title: 'Orden aprobada',
            description: 'OC-2025-002 aprobada y enviada',
            time: 'Hace 6 horas',
            user: 'Supervisor'
          }
        ]
      };
    }
  },

  // Obtener alertas del sistema
  async getSystemAlerts() {
    try {
      console.log('🚨 Obteniendo alertas del sistema...');
      
      const response = await apiClient.get('/dashboard/alerts');
      
      if (response.data.success) {
        console.log('✅ Alertas obtenidas:', response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error('Error al obtener alertas');
      }
    } catch (error) {
      console.error('❌ Error al obtener alertas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener alertas',
        // Datos de fallback
        data: [
          {
            type: 'warning',
            icon: '⚠️',
            title: 'Stock bajo',
            description: '5 productos por debajo del stock mínimo',
            priority: 'high'
          },
          {
            type: 'info',
            icon: 'ℹ️',
            title: 'Sistema operativo',
            description: 'Todos los servicios funcionando correctamente',
            priority: 'low'
          }
        ]
      };
    }
  },

  // Obtener resumen completo del dashboard
  async getDashboardSummary() {
    try {
      console.log('📋 Obteniendo resumen completo del dashboard...');
      
      const response = await apiClient.get('/dashboard/summary');
      
      if (response.data.success) {
        console.log('✅ Resumen completo obtenido');
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error('Error al obtener resumen');
      }
    } catch (error) {
      console.error('❌ Error al obtener resumen del dashboard:', error);
      
      // En caso de error, obtener los datos por separado como fallback
      const [stats, activity, alerts] = await Promise.all([
        this.getStats(),
        this.getRecentActivity(),
        this.getSystemAlerts()
      ]);
      
      return {
        success: false,
        message: 'Datos obtenidos con limitaciones de conectividad',
        data: {
          stats: stats.data,
          recent_activity: activity.data,
          alerts: alerts.data
        }
      };
    }
  }
};

// Exportar también la instancia de axios por si se necesita usar directamente
export { apiClient };

// Exportar URL base para uso en otros lugares
export { API_BASE_URL };