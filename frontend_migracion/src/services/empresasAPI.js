import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/empresas';

/**
 * Obtener todas las empresas
 */
export const obtenerEmpresas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener una empresa específica
 */
export const obtenerEmpresa = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    throw error.response?.data || error;
  }
};

/**
 * Crear una nueva empresa
 */
export const crearEmpresa = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear empresa:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar una empresa existente
 */
export const actualizarEmpresa = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar una empresa
 */
export const eliminarEmpresa = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    throw error.response?.data || error;
  }
};
