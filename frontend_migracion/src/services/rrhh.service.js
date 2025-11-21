import axios from 'axios';

// URL del backend de RRHH
const RRHH_API_URL = 'https://pruebabackend.processmart.net/api/v1';

// Crear instancia de axios para RRHH
const rrhhApi = axios.create({
  baseURL: RRHH_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 segundos
});

// Interceptor para agregar token de autenticación
rrhhApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
rrhhApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// SERVICIOS DE USUARIOS
// ============================================

export const obtenerUsuarios = async () => {
  try {
    const response = await rrhhApi.get('/usuarios');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const obtenerTrabajadores = async () => {
  try {
    const response = await rrhhApi.get('/trabajadores');
    return response.data;
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    throw error;
  }
};

export const crearUsuario = async (userData) => {
  try {
    const response = await rrhhApi.post('/usuarios', userData);
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

export const editarUsuario = async (id, userData) => {
  try {
    const response = await rrhhApi.put(`/usuarios/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error al editar usuario:', error);
    throw error;
  }
};

export const eliminarUsuario = async (id) => {
  try {
    const response = await rrhhApi.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

export const actualizarUsuario = async (id, userData) => {
  try {
    const response = await rrhhApi.put(`/usuarios/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS DE ASISTENCIA
// ============================================

export const obtenerAsistenciaTrabajador = async (params) => {
  try {
    const response = await rrhhApi.get('/asistencia/trabajador', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    throw error;
  }
};

export const verificarAsistenciaCompleta = async (idUsuario) => {
  try {
    const response = await rrhhApi.get(`/asistencia/verificar/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar asistencia:', error);
    throw error;
  }
};

export const obtenerReporteAsistencia = async (params) => {
  try {
    const response = await rrhhApi.get('/reportes/asistencia', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener reporte de asistencia:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS DE REPORTES HORARIOS
// ============================================

export const obtenerReportesHorarios = async (params) => {
  try {
    const response = await rrhhApi.get('/reportes/horarios', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener reportes horarios:', error);
    throw error;
  }
};

export const obtenerReportesHorariosPorSede = async (params) => {
  try {
    const response = await rrhhApi.get('/reportes/horarios-por-sede', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener reportes horarios por sede:', error);
    throw error;
  }
};

export const registrarReporte = async (reporteData) => {
  try {
    const response = await rrhhApi.post('/reportes/registrar', reporteData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar reporte:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS DE JORNADAS LABORALES
// ============================================

export const obtenerJornadaActiva = async (params) => {
  try {
    const response = await rrhhApi.get('/jornadas/activa', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener jornada activa:', error);
    throw error;
  }
};

export const obtenerJornadasUsuario = async (params) => {
  try {
    const response = await rrhhApi.get('/jornadas/usuario', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener jornadas del usuario:', error);
    throw error;
  }
};

export const obtenerTodasJornadas = async (params) => {
  try {
    const response = await rrhhApi.get('/jornadas/todas', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener todas las jornadas:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS DE EMERGENCIAS
// ============================================

export const obtenerEmergencias = async (params) => {
  try {
    const response = await rrhhApi.get('/reportes/emergencias', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener emergencias:', error);
    throw error;
  }
};

export const registrarEmergencia = async (emergenciaData) => {
  try {
    const response = await rrhhApi.post('/emergencias/registrar', emergenciaData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar emergencia:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS DE SEDES
// ============================================

export const obtenerSedes = async () => {
  try {
    const response = await rrhhApi.get('/sedes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener sedes:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS DE CONFIGURACIÓN
// ============================================

export const obtenerConfiguracion = async () => {
  try {
    const response = await rrhhApi.get('/configuracion');
    return response.data;
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    throw error;
  }
};

export const obtenerTiempoActual = async () => {
  try {
    const response = await rrhhApi.get('/tiempo-actual');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tiempo actual:', error);
    throw error;
  }
};

// ============================================
// SERVICIO DE PRUEBA DE CONEXIÓN
// ============================================

export const testConexion = async () => {
  try {
    const response = await rrhhApi.get('/test');
    return response.data;
  } catch (error) {
    console.error('Error al probar conexión:', error);
    throw error;
  }
};

// Exportar todos los servicios como un objeto por defecto
const rrhhService = {
  // Usuarios
  obtenerUsuarios,
  obtenerTrabajadores,
  crearUsuario,
  editarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  
  // Asistencia
  obtenerAsistenciaTrabajador,
  verificarAsistenciaCompleta,
  obtenerReporteAsistencia,
  
  // Reportes Horarios
  obtenerReportesHorarios,
  obtenerReportesHorariosPorSede,
  registrarReporte,
  
  // Jornadas
  obtenerJornadaActiva,
  obtenerJornadasUsuario,
  obtenerTodasJornadas,
  
  // Emergencias
  obtenerEmergencias,
  registrarEmergencia,
  
  // Sedes
  obtenerSedes,
  
  // Configuración
  obtenerConfiguracion,
  obtenerTiempoActual,
  
  // Test
  testConexion
};

export default rrhhService;
