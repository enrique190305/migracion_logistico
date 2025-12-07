import axios from 'axios';

// URL del backend de RRHH
const RRHH_API_URL = 'https://bappasistencia.processmart.net/api/v1';

// Crear instancia de axios para RRHH
const rrhhApi = axios.create({
  baseURL: RRHH_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 segundos
});

// Interceptor para agregar token de autenticación ESPECÍFICO DE RRHH
rrhhApi.interceptors.request.use(
  (config) => {
    // PRIORIDAD: Usar token específico de RRHH (bappasistencia)
    const tokenRRHH = localStorage.getItem('jwt_token_rrhh');
    if (tokenRRHH) {
      config.headers.Authorization = `Bearer ${tokenRRHH}`;
    } else {
      // Fallback: si no hay token RRHH, intentar con el token principal
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      // Token expirado o inválido - solo limpiar token RRHH
      console.error('❌ Error 401: Token RRHH inválido o expirado');
      localStorage.removeItem('jwt_token_rrhh');
      localStorage.removeItem('usuario_rrhh');
      // NO redirigir automáticamente - dejar que el componente maneje la re-autenticación
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

export const obtenerReporteAsistencia = async (params = {}) => {
  try {
    console.log('🔍 Servicio - Parámetros recibidos:', params);
    console.log('🔍 Servicio - Cantidad de parámetros:', Object.keys(params).length);
    
    const config = Object.keys(params).length > 0 ? { params } : {};
    console.log('🔍 Servicio - Config enviado:', config);
    
    const response = await rrhhApi.get('/reportes/asistencia', config);
    console.log('✅ Servicio - Respuesta recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Servicio - Error al obtener reporte de asistencia:', error);
    console.error('❌ Servicio - Response:', error.response?.data);
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

// ============================================
// SERVICIOS DE PROGRAMACION DE HORARIOS (BACKEND REAL)
// ============================================

export const getTrabajadores = async () => {
  try {
    console.log('📡 Obteniendo trabajadores del backend...');
    const response = await rrhhApi.get('/programacion/trabajadores');
    console.log('✅ Trabajadores obtenidos:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener trabajadores:', error.response?.data || error.message);
    throw error;
  }
};

export const getHorarios = async () => {
  try {
    console.log('📡 Obteniendo horarios del backend...');
    const response = await rrhhApi.get('/programacion/horarios');
    console.log('✅ Horarios obtenidos:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener horarios:', error.response?.data || error.message);
    throw error;
  }
};

export const getProgramacionDia = async (fecha) => {
  try {
    console.log('📡 Obteniendo programación del día:', fecha);
    // Backend usa query params: /programacion/dia?fecha=YYYY-MM-DD
    const response = await rrhhApi.get('/programacion/dia', { params: { fecha } });
    console.log('✅ Programación obtenida:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener programación:', error.response?.data || error.message);
    throw error;
  }
};

export const getProgramacionMes = async (mes, anio) => {
  try {
    console.log('📡 Obteniendo programación del mes:', mes, anio);
    // Backend usa query params: /programacion/mes?mes=12&anio=2025
    const response = await rrhhApi.get('/programacion/mes', { params: { mes, anio } });
    console.log('✅ Programación del mes obtenida:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener programación del mes:', error.response?.data || error.message);
    throw error;
  }
};

export const guardarAsignaciones = async (fecha, asignaciones) => {
  // Formato correcto para el backend
  const payload = {
    fecha: fecha,
    asignaciones: asignaciones.map(a => ({
      id_usuario: parseInt(a.id_usuario),
      id_horario: parseInt(a.id_horario)
    }))
  };
  
  try {
    console.log('📡 Guardando asignaciones para fecha:', fecha);
    console.log('📋 Asignaciones:', asignaciones);
    console.log('📤 Payload enviado:', JSON.stringify(payload, null, 2));
    
    const response = await rrhhApi.post('/programacion/guardar', payload);
    console.log('✅ Asignaciones guardadas:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al guardar asignaciones:', error.response?.data || error.message);
    console.error('📤 Payload que falló:', JSON.stringify(payload, null, 2));
    throw error;
  }
};

export const asignarMasivo = async (fecha, id_horario) => {
  try {
    console.log('📡 Asignando masivo:', { fecha, id_horario });
    const response = await rrhhApi.post('/programacion/asignar-masivo', { fecha, id_horario });
    console.log('✅ Asignación masiva exitosa:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error en asignación masiva:', error.response?.data || error.message);
    throw error;
  }
};

export const limpiarDia = async (fecha) => {
  try {
    console.log('📡 Limpiando día:', fecha);
    // Backend usa DELETE con query params: /programacion/limpiar?fecha=YYYY-MM-DD
    const response = await rrhhApi.delete('/programacion/limpiar', { params: { fecha } });
    console.log('✅ Día limpiado:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al limpiar día:', error.response?.data || error.message);
    throw error;
  }
};

export const getEstadisticasDia = async (fecha) => {
  try {
    console.log('📡 Obteniendo estadísticas del día:', fecha);
    // Backend usa query params: /programacion/estadisticas?fecha=YYYY-MM-DD
    // Agregar timestamp para evitar cache
    const response = await rrhhApi.get('/programacion/estadisticas', { 
      params: { fecha, _t: Date.now() } 
    });
    console.log('✅ Estadísticas obtenidas:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.response?.data || error.message);
    throw error;
  }
};

export const getHistorialUsuario = async (id_usuario) => {
  try {
    console.log('📡 Obteniendo historial del usuario:', id_usuario);
    // Este endpoint mantiene el parámetro en la URL
    const response = await rrhhApi.get(`/programacion/historial/usuario/${id_usuario}`);
    console.log('✅ Historial obtenido:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener historial:', error.response?.data || error.message);
    throw error;
  }
};

export const getHistorialFecha = async (fecha) => {
  try {
    console.log('📡 Obteniendo historial de la fecha:', fecha);
    // Backend usa query params: /programacion/historial/fecha?fecha=YYYY-MM-DD
    const response = await rrhhApi.get('/programacion/historial/fecha', { params: { fecha } });
    console.log('✅ Historial de fecha obtenido:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener historial de fecha:', error.response?.data || error.message);
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
  testConexion,

  // Programación de Horarios
  getTrabajadores,
  getHorarios,
  getProgramacionDia,
  getProgramacionMes,
  guardarAsignaciones,
  asignarMasivo,
  limpiarDia,
  getEstadisticasDia,
  getHistorialUsuario,
  getHistorialFecha
};

export default rrhhService;

// ============================================
// FUNCIONES DE AUTENTICACIÓN RRHH
// ============================================

/**
 * Login específico para el módulo de RRHH
 * Guarda el token en jwt_token_rrhh para separarlo del token principal
 * 
 * FORMATO CORRECTO IDENTIFICADO:
 * { documento: "24688462", contrasena: "123456789" }
 * Respuesta: { success: true, data: { token: "...", usuario: {...} } }
 */
export const loginRRHH = async (documentoOrEmail, password) => {
  try {
    console.log('🔐 Intentando login RRHH con documento:', documentoOrEmail);
    
    // El API espera: { documento, contrasena }
    const response = await rrhhApi.post('/auth/login', {
      documento: documentoOrEmail,
      contrasena: password
    });

    console.log('📥 Respuesta del servidor:', response.data);

    if (response.data && response.data.success) {
      // El token viene en data.token
      const token = response.data.data?.token;
      const usuario = response.data.data?.usuario;

      if (token) {
        console.log('✅ Login RRHH exitoso');
        
        // Guardar token específico de RRHH
        localStorage.setItem('jwt_token_rrhh', token);
        
        // Guardar información del usuario RRHH
        if (usuario) {
          localStorage.setItem('usuario_rrhh', JSON.stringify(usuario));
        }

        // Retornar formato unificado
        return {
          success: true,
          jwt_token: token,
          usuario: usuario,
          message: response.data.message || 'Login exitoso'
        };
      }
    }

    // Si llegamos aquí, la respuesta no fue exitosa
    throw new Error(response.data?.message || 'Respuesta inesperada del servidor');

  } catch (error) {
    console.error('❌ Error en login RRHH:', error);
    
    // Re-lanzar el error para que lo maneje el componente
    throw error;
  }
};

/**
 * Verificar si el usuario tiene sesión activa en RRHH
 */
export const verificarSesionRRHH = () => {
  const tokenRRHH = localStorage.getItem('jwt_token_rrhh');
  return !!tokenRRHH;
};

/**
 * Cerrar sesión de RRHH (mantiene la sesión principal intacta)
 */
export const cerrarSesionRRHH = () => {
  localStorage.removeItem('jwt_token_rrhh');
  localStorage.removeItem('usuario_rrhh');
  console.log('✅ Sesión de RRHH cerrada');
};

/**
 * Obtener información del usuario RRHH actual
 */
export const obtenerUsuarioRRHH = () => {
  try {
    const usuario = localStorage.getItem('usuario_rrhh');
    return usuario ? JSON.parse(usuario) : null;
  } catch (error) {
    return null;
  }
};
