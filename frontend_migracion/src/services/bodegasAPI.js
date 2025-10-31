import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/bodegas';

/**
 * Obtener todas las bodegas
 */
export const obtenerBodegas = async () => {
  try {
    const response = await axios.get(API_URL);
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Error al obtener bodegas:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar bodegas',
      data: []
    };
  }
};

/**
 * Obtener bodegas por empresa
 */
export const obtenerBodegasPorEmpresa = async (idEmpresa) => {
  try {
    const response = await axios.get(`${API_URL}/empresa/${idEmpresa}`);
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Error al obtener bodegas por empresa:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar bodegas',
      data: []
    };
  }
};

/**
 * Obtener estadísticas de bodegas
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await axios.get(`${API_URL}/estadisticas`);
    return {
      success: true,
      data: response.data.data || {}
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de bodegas:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar estadísticas',
      data: {}
    };
  }
};

/**
 * Obtener una bodega específica
 */
export const obtenerBodega = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return {
      success: true,
      data: response.data.data || null
    };
  } catch (error) {
    console.error('Error al obtener bodega:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar bodega',
      data: null
    };
  }
};

/**
 * Crear una nueva bodega
 */
export const crearBodega = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear bodega:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar una bodega existente
 */
export const actualizarBodega = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar bodega:', error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar una bodega
 */
export const eliminarBodega = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar bodega:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener todas las reservas
 */
export const obtenerReservas = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/reservas');
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener reservas por bodega
 */
export const obtenerReservasPorBodega = async (idBodega) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/reservas/bodega/${idBodega}`);
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Error al obtener reservas por bodega:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar reservas',
      data: []
    };
  }
};

/**
 * Obtener reservas para traslado (con info completa de bodega)
 */
export const obtenerReservasParaTraslado = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/traslado-materiales/reservas');
    return {
      success: response.data.success || true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Error al obtener reservas para traslado:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar reservas',
      data: []
    };
  }
};
