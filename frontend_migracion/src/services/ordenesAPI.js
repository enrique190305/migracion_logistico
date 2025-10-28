// src/services/ordenesAPI.js
// Servicio para consumir la API de Órdenes de Compra y Servicio

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
      mode: 'cors', // Añadido explícitamente
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error en GET ${endpoint}:`, error);
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
      mode: 'cors', // Añadido explícitamente
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error en POST ${endpoint}:`, error);
    throw error;
  }
};

// ============================================
// ENDPOINTS DE CONSULTA (GET)
// ============================================

/**
 * Obtener todas las empresas
 * @returns {Promise<Array>} Lista de empresas
 */
export const obtenerEmpresas = () => fetchAPI('/empresas');

/**
 * Obtener todos los proveedores
 * @returns {Promise<Array>} Lista de proveedores
 */
export const obtenerProveedores = () => fetchAPI('/proveedores');

/**
 * Obtener detalle de un proveedor específico
 * @param {number} id - ID del proveedor
 * @returns {Promise<Object>} Datos del proveedor
 */
export const obtenerDetalleProveedor = (id) => fetchAPI(`/proveedores/${id}`);

/**
 * Obtener todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export const obtenerProductos = () => fetchAPI('/productos');

/**
 * Buscar productos por término (código o descripción)
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Lista de productos filtrados
 */
export const buscarProductos = (termino) => fetchAPI(`/productos/buscar?termino=${encodeURIComponent(termino)}`);

/**
 * Obtener producto por código exacto
 * @param {string} codigo - Código del producto
 * @returns {Promise<Object>} Datos del producto
 */
export const obtenerProductoPorCodigo = (codigo) => fetchAPI(`/productos/${codigo}`);

/**
 * Validar si existe un producto por código
 * @param {string} codigo - Código del producto
 * @returns {Promise<Object>} {existe: boolean}
 */
export const validarProducto = (codigo) => fetchAPI(`/productos/validar/${codigo}`);

/**
 * Obtener todas las monedas
 * @returns {Promise<Array>} Lista de monedas
 */
export const obtenerMonedas = () => fetchAPI('/monedas');

/**
 * Obtener siguiente correlativo para Orden de Compra
 * @returns {Promise<Object>} {correlativo: string}
 */
export const obtenerSiguienteCorrelativoOC = () => fetchAPI('/correlativo-oc');

/**
 * Obtener siguiente correlativo para Orden de Servicio
 * @returns {Promise<Object>} {correlativo: string}
 */
export const obtenerSiguienteCorrelativoOS = () => fetchAPI('/correlativo-os');

/**
 * Obtener órdenes de pedido en estado PENDIENTE
 * @returns {Promise<Array>} Lista de órdenes de pedido pendientes
 */
export const obtenerOrdenesPedidoPendientes = () => fetchAPI('/ordenes-pedido-pendientes');

/**
 * Obtener detalle de una orden de pedido específica
 * @param {number} id - ID de la orden de pedido
 * @returns {Promise<Object>} Datos completos de la orden de pedido
 */
export const obtenerOrdenPedido = (id) => fetchAPI(`/ordenes-pedido/${id}`);

// ============================================
// ENDPOINTS DE CREACIÓN (POST)
// ============================================

/**
 * Guardar Orden de Compra
 * @param {Object} ordenData - Datos de la orden de compra
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const guardarOrdenCompra = (ordenData) => postAPI('/compra', ordenData);

/**
 * Guardar Orden de Servicio
 * @param {Object} ordenData - Datos de la orden de servicio
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const guardarOrdenServicio = (ordenData) => postAPI('/servicio', ordenData);

/**
 * Descargar PDF de Orden de Compra
 * @param {number} id - ID de la orden de compra
 * @returns {Promise<void>} Inicia la descarga del PDF
 */
export const descargarPDFOrdenCompra = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/compra/${id}/pdf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al generar PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Orden_Compra_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar PDF de Orden de Compra:', error);
    throw error;
  }
};

/**
 * Descargar PDF de Orden de Servicio
 * @param {number} id - ID de la orden de servicio
 * @returns {Promise<void>} Inicia la descarga del PDF
 */
export const descargarPDFOrdenServicio = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/servicio/${id}/pdf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al generar PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Orden_Servicio_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar PDF de Orden de Servicio:', error);
    throw error;
  }
};

// ============================================
// EXPORT DEFAULT CON TODAS LAS FUNCIONES
// ============================================

export default {
  // Consultas
  obtenerEmpresas,
  obtenerProveedores,
  obtenerDetalleProveedor,
  obtenerProductos,
  buscarProductos,
  obtenerProductoPorCodigo,
  validarProducto,
  obtenerMonedas,
  obtenerSiguienteCorrelativoOC,
  obtenerSiguienteCorrelativoOS,
  obtenerOrdenesPedidoPendientes,
  obtenerOrdenPedido,
  
  // Creación
  guardarOrdenCompra,
  guardarOrdenServicio,
  
  // PDFs
  descargarPDFOrdenCompra,
  descargarPDFOrdenServicio,
};
