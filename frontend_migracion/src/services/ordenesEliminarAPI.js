// src/services/ordenesEliminarAPI.js
// Servicio para eliminar Órdenes de Compra y Servicio

const API_BASE_URL = 'http://localhost:8000/api/ordenes';

/**
 * Función helper para manejar respuestas de la API
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: 'Error de conexión',
      mensaje: `HTTP ${response.status}: ${response.statusText}` 
    }));
    throw new Error(error.mensaje || error.error || 'Error en la petición');
  }
  return response.json();
};

/**
 * Función helper para hacer peticiones GET
 */
const fetchAPI = async (endpoint) => {
  try {
    console.log(`🌐 Fetching: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error en GET ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Función helper para hacer peticiones DELETE
 */
const deleteAPI = async (endpoint) => {
  try {
    console.log(`🗑️ Deleting: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error en DELETE ${endpoint}:`, error);
    throw error;
  }
};

// ============================================
// ÓRDENES DE COMPRA
// ============================================

/**
 * Listar todas las Órdenes de Compra PENDIENTES (solo para eliminar)
 * @returns {Promise<Array>} Lista de órdenes de compra pendientes
 */
export const listarOrdenesCompra = async () => {
  try {
    const result = await fetchAPI('/compra/pendientes');
    return result.data || [];
  } catch (error) {
    console.error('Error al listar órdenes de compra:', error);
    throw error;
  }
};

/**
 * Obtener detalle de una Orden de Compra específica
 * @param {number} id - ID de la orden de compra
 * @returns {Promise<Object>} Detalle completo de la orden
 */
export const obtenerDetalleOrdenCompra = async (id) => {
  try {
    const result = await fetchAPI(`/compra/${id}`);
    return result.data || null;
  } catch (error) {
    console.error(`Error al obtener detalle de OC ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar una Orden de Compra
 * @param {number} id - ID de la orden de compra a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const eliminarOrdenCompra = async (id) => {
  try {
    const result = await deleteAPI(`/compra/${id}`);
    return result;
  } catch (error) {
    console.error(`Error al eliminar OC ${id}:`, error);
    throw error;
  }
};

// ============================================
// ÓRDENES DE SERVICIO
// ============================================

/**
 * Listar todas las Órdenes de Servicio PENDIENTES (solo para eliminar)
 * @returns {Promise<Array>} Lista de órdenes de servicio pendientes
 */
export const listarOrdenesServicio = async () => {
  try {
    const result = await fetchAPI('/servicio/pendientes');
    return result.data || [];
  } catch (error) {
    console.error('Error al listar órdenes de servicio:', error);
    throw error;
  }
};

/**
 * Obtener detalle de una Orden de Servicio específica
 * @param {number} id - ID de la orden de servicio
 * @returns {Promise<Object>} Detalle completo de la orden
 */
export const obtenerDetalleOrdenServicio = async (id) => {
  try {
    const result = await fetchAPI(`/servicio/${id}`);
    return result.data || null;
  } catch (error) {
    console.error(`Error al obtener detalle de OS ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar una Orden de Servicio
 * @param {number} id - ID de la orden de servicio a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const eliminarOrdenServicio = async (id) => {
  try {
    const result = await deleteAPI(`/servicio/${id}`);
    return result;
  } catch (error) {
    console.error(`Error al eliminar OS ${id}:`, error);
    throw error;
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Órdenes de Compra
  listarOrdenesCompra,
  obtenerDetalleOrdenCompra,
  eliminarOrdenCompra,
  
  // Órdenes de Servicio
  listarOrdenesServicio,
  obtenerDetalleOrdenServicio,
  eliminarOrdenServicio,
};
