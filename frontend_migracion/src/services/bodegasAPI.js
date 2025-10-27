import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/bodegas';

/**
 * Obtener todas las bodegas
 */
export const obtenerBodegas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener bodegas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener bodegas por empresa
 */
export const obtenerBodegasPorEmpresa = async (idEmpresa) => {
  try {
    const response = await axios.get(`${API_URL}/empresa/${idEmpresa}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener bodegas por empresa:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener estadísticas de bodegas
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await axios.get(`${API_URL}/estadisticas`);
    return response.data.data || {};
  } catch (error) {
    console.error('Error al obtener estadísticas de bodegas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener una bodega específica
 */
export const obtenerBodega = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error al obtener bodega:', error);
    throw error.response?.data || error;
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
