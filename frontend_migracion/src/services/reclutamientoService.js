import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Obtiene todas las vacantes desde Google Sheets
 * @param {Object} filtros - Filtros opcionales (estado, busqueda)
 * @returns {Promise<Array>}
 */
export const getVacantes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    
    const response = await axios.get(
      `${API_URL}/reclutamiento/vacantes${params.toString() ? `?${params.toString()}` : ''}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
    throw error;
  }
};

/**
 * Obtiene todos los postulantes desde Google Sheets
 * @param {Object} filtros - Filtros opcionales (idoneo, puntuacion_min, busqueda)
 * @returns {Promise<Array>}
 */
export const getPostulantes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.idoneo !== undefined && filtros.idoneo !== '') {
      params.append('idoneo', filtros.idoneo);
    }
    if (filtros.puntuacion_min) params.append('puntuacion_min', filtros.puntuacion_min);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    
    const response = await axios.get(
      `${API_URL}/reclutamiento/postulantes${params.toString() ? `?${params.toString()}` : ''}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener postulantes:', error);
    throw error;
  }
};

/**
 * Obtiene el detalle de un postulante específico
 * @param {string} idUnico - ID único del postulante
 * @returns {Promise<Object>}
 */
export const getPostulanteDetalle = async (idUnico) => {
  try {
    const response = await axios.get(
      `${API_URL}/reclutamiento/postulantes/${idUnico}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle del postulante:', error);
    throw error;
  }
};
