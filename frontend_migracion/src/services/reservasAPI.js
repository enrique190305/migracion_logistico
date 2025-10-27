import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/reservas';

/**
 * Obtener todas las reservas
 */
export const obtenerReservas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener solo reservas activas
 */
export const obtenerReservasActivas = async () => {
  try {
    const response = await axios.get(`${API_URL}/activas`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener reservas activas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener estadísticas de reservas
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await axios.get(`${API_URL}/estadisticas`);
    return response.data.data || {};
  } catch (error) {
    console.error('Error al obtener estadísticas de reservas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener una reserva específica
 */
export const obtenerReserva = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    throw error.response?.data || error;
  }
};

/**
 * Crear una nueva reserva
 */
export const crearReserva = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar una reserva existente
 */
export const actualizarReserva = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar una reserva
 */
export const eliminarReserva = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    throw error.response?.data || error;
  }
};
