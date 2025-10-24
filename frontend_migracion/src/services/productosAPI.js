// src/services/productosAPI.js
// Servicio para el módulo de Registro de Productos

const API_BASE_URL = 'http://localhost:8000/api/productos';

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
 * Función helper para hacer peticiones POST
 */
const postAPI = async (endpoint, data) => {
  try {
    console.log(`📤 Posting to: ${API_BASE_URL}${endpoint}`, data);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error en POST ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Función helper para hacer peticiones PUT
 */
const putAPI = async (endpoint, data) => {
  try {
    console.log(`🔄 Updating: ${API_BASE_URL}${endpoint}`, data);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error en PUT ${endpoint}:`, error);
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
// LISTAR Y CONSULTAR PRODUCTOS
// ============================================

/**
 * Listar todos los productos
 * @param {Object} filtros - Filtros opcionales {tipo_producto, unidad, search}
 * @returns {Promise<Array>} Lista de productos
 */
export const listarProductos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.tipo_producto && filtros.tipo_producto !== 'todos') {
      params.append('tipo_producto', filtros.tipo_producto);
    }
    if (filtros.unidad && filtros.unidad !== 'todos') {
      params.append('unidad', filtros.unidad);
    }
    if (filtros.search) {
      params.append('search', filtros.search);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const result = await fetchAPI(`/${queryString}`);
    return result.data || [];
  } catch (error) {
    console.error('Error al listar productos:', error);
    throw error;
  }
};

/**
 * Obtener un producto específico
 * @param {string} codigo - Código del producto
 * @returns {Promise<Object>} Datos del producto
 */
export const obtenerProducto = async (codigo) => {
  try {
    const result = await fetchAPI(`/${codigo}`);
    return result.data || null;
  } catch (error) {
    console.error(`Error al obtener producto ${codigo}:`, error);
    throw error;
  }
};

// ============================================
// CATÁLOGOS
// ============================================

/**
 * Obtener familias/tipos de producto
 * @returns {Promise<Array>} Lista de familias
 */
export const obtenerFamilias = async () => {
  try {
    const result = await fetchAPI('/familias');
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener familias:', error);
    throw error;
  }
};

/**
 * Obtener unidades de medida
 * @returns {Promise<Array>} Lista de unidades
 */
export const obtenerUnidades = async () => {
  try {
    const result = await fetchAPI('/unidades');
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener unidades:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de productos
 * @returns {Promise<Object>} Estadísticas
 */
export const obtenerEstadisticas = async () => {
  try {
    const result = await fetchAPI('/estadisticas');
    return result.data || {};
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// ============================================
// VALIDACIONES Y UTILIDADES
// ============================================

/**
 * Generar siguiente código de producto
 * @param {string} tipo_producto - Tipo de producto (opcional)
 * @returns {Promise<string>} Código generado
 */
export const generarCodigo = async (tipo_producto = '') => {
  try {
    const params = tipo_producto ? `?tipo_producto=${tipo_producto}` : '';
    const result = await fetchAPI(`/generar-codigo${params}`);
    return result.codigo || '';
  } catch (error) {
    console.error('Error al generar código:', error);
    throw error;
  }
};

/**
 * Validar si un código está disponible
 * @param {string} codigo - Código a validar
 * @returns {Promise<Object>} {existe, disponible}
 */
export const validarCodigo = async (codigo) => {
  try {
    const result = await fetchAPI(`/validar-codigo/${codigo}`);
    return {
      existe: result.existe || false,
      disponible: result.disponible || false
    };
  } catch (error) {
    console.error('Error al validar código:', error);
    throw error;
  }
};

// ============================================
// CRUD PRODUCTOS
// ============================================

/**
 * Crear un nuevo producto
 * @param {Object} productoData - Datos del producto
 * @returns {Promise<Object>} Producto creado
 */
export const crearProducto = async (productoData) => {
  try {
    const result = await postAPI('/', productoData);
    return result;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

/**
 * Actualizar un producto existente
 * @param {string} codigo - Código del producto
 * @param {Object} productoData - Datos actualizados
 * @returns {Promise<Object>} Producto actualizado
 */
export const actualizarProducto = async (codigo, productoData) => {
  try {
    const result = await putAPI(`/${codigo}`, productoData);
    return result;
  } catch (error) {
    console.error(`Error al actualizar producto ${codigo}:`, error);
    throw error;
  }
};

/**
 * Eliminar un producto
 * @param {string} codigo - Código del producto
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarProducto = async (codigo) => {
  try {
    const result = await deleteAPI(`/${codigo}`);
    return result;
  } catch (error) {
    console.error(`Error al eliminar producto ${codigo}:`, error);
    throw error;
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Listar y consultar
  listarProductos,
  obtenerProducto,
  
  // Catálogos
  obtenerFamilias,
  obtenerUnidades,
  obtenerEstadisticas,
  
  // Validaciones
  generarCodigo,
  validarCodigo,
  
  // CRUD
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
