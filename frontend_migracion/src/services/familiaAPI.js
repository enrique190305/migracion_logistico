/**
 * API Service para Familias Nuevas y Subfamilias
 * Sistema dual de códigos de productos
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Helper para realizar peticiones HTTP
 */
const fetchAPI = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || data.error || 'Error en la petición');
    }

    return data.data || data;
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    throw error;
  }
};

// ============================================
// FAMILIAS NUEVAS
// ============================================

/**
 * Listar todas las familias nuevas
 * @returns {Promise<Array>} Lista de familias
 */
export const listarFamiliasNuevas = async () => {
  try {
    const result = await fetchAPI('/familias-nuevas');
    return result;
  } catch (error) {
    console.error('Error al listar familias nuevas:', error);
    throw error;
  }
};

/**
 * Obtener una familia específica con sus subfamilias
 * @param {number} id - ID de la familia
 * @returns {Promise<Object>} Familia con subfamilias
 */
export const obtenerFamiliaNueva = async (id) => {
  try {
    const result = await fetchAPI(`/familias-nuevas/${id}`);
    return result;
  } catch (error) {
    console.error('Error al obtener familia:', error);
    throw error;
  }
};

/**
 * Crear nueva familia
 * @param {Object} familia - Datos de la familia
 * @returns {Promise<Object>} Familia creada
 */
export const crearFamiliaNueva = async (familia) => {
  try {
    const result = await fetchAPI('/familias-nuevas', {
      method: 'POST',
      body: JSON.stringify(familia)
    });
    return result;
  } catch (error) {
    console.error('Error al crear familia:', error);
    throw error;
  }
};

/**
 * Actualizar familia existente
 * @param {number} id - ID de la familia
 * @param {Object} familia - Datos actualizados
 * @returns {Promise<Object>} Familia actualizada
 */
export const actualizarFamiliaNueva = async (id, familia) => {
  try {
    const result = await fetchAPI(`/familias-nuevas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(familia)
    });
    return result;
  } catch (error) {
    console.error('Error al actualizar familia:', error);
    throw error;
  }
};

// ============================================
// SUBFAMILIAS
// ============================================

/**
 * Listar todas las subfamilias
 * @param {number} idFamilia - ID de familia para filtrar (opcional)
 * @returns {Promise<Array>} Lista de subfamilias
 */
export const listarSubfamilias = async (idFamilia = null) => {
  try {
    const url = idFamilia 
      ? `/subfamilias?id_familia=${idFamilia}`
      : '/subfamilias';
    const result = await fetchAPI(url);
    return result;
  } catch (error) {
    console.error('Error al listar subfamilias:', error);
    throw error;
  }
};

/**
 * Crear nueva subfamilia
 * @param {Object} subfamilia - Datos de la subfamilia
 * @returns {Promise<Object>} Subfamilia creada
 */
export const crearSubfamilia = async (subfamilia) => {
  try {
    const result = await fetchAPI('/subfamilias', {
      method: 'POST',
      body: JSON.stringify(subfamilia)
    });
    return result;
  } catch (error) {
    console.error('Error al crear subfamilia:', error);
    throw error;
  }
};

/**
 * Actualizar subfamilia existente
 * @param {number} id - ID de la subfamilia
 * @param {Object} subfamilia - Datos actualizados
 * @returns {Promise<Object>} Subfamilia actualizada
 */
export const actualizarSubfamilia = async (id, subfamilia) => {
  try {
    const result = await fetchAPI(`/subfamilias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subfamilia)
    });
    return result;
  } catch (error) {
    console.error('Error al actualizar subfamilia:', error);
    throw error;
  }
};

/**
 * Generar código de producto para una subfamilia
 * @param {number} idSubfamilia - ID de la subfamilia
 * @returns {Promise<string>} Código generado
 */
export const generarCodigoConSubfamilia = async (idSubfamilia) => {
  try {
    const result = await fetchAPI(`/subfamilias/${idSubfamilia}/generar-codigo`);
    // Devolver solo el código, no el objeto completo
    return result.codigo_producto || result;
  } catch (error) {
    console.error('Error al generar código con subfamilia:', error);
    throw error;
  }
};

/**
 * Obtener productos de una subfamilia
 * @param {number} idSubfamilia - ID de la subfamilia
 * @returns {Promise<Array>} Lista de productos
 */
export const obtenerProductosSubfamilia = async (idSubfamilia) => {
  try {
    const result = await fetchAPI(`/subfamilias/${idSubfamilia}/productos`);
    return result;
  } catch (error) {
    console.error('Error al obtener productos de subfamilia:', error);
    throw error;
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Familias
  listarFamiliasNuevas,
  obtenerFamiliaNueva,
  crearFamiliaNueva,
  actualizarFamiliaNueva,
  
  // Subfamilias
  listarSubfamilias,
  crearSubfamilia,
  actualizarSubfamilia,
  generarCodigoConSubfamilia,
  obtenerProductosSubfamilia
};
