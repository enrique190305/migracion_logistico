import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/traslado-materiales';

/**
 * Servicio API para Traslado de Materiales
 * 
 * Maneja todas las operaciones relacionadas con el traslado de materiales
 * entre proyectos/bodegas
 */
const trasladoMaterialesAPI = {
    
    /**
     * Generar número de traslado automático
     * 
     * @returns {Promise<Object>} Objeto con número de traslado generado
     */
    generarNumeroTraslado: async () => {
        try {
            const response = await axios.get(`${API_URL}/generar-numero`);
            return {
                success: true,
                numero_traslado: response.data.numero_traslado
            };
        } catch (error) {
            console.error('Error al generar número de traslado:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al generar número de traslado'
            };
        }
    },

    /**
     * Listar proyectos/almacenes disponibles
     * 
     * @returns {Promise<Object>} Lista de proyectos
     */
    listarProyectos: async () => {
        try {
            const response = await axios.get(`${API_URL}/proyectos`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al listar proyectos:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar proyectos',
                data: []
            };
        }
    },

    /**
     * Obtener productos con stock disponible en un proyecto
     * 
     * @param {number} proyectoId - ID del proyecto
     * @returns {Promise<Object>} Lista de productos con stock
     */
    obtenerProductosConStock: async (proyectoId) => {
        try {
            const response = await axios.get(`${API_URL}/proyectos/${proyectoId}/productos-stock`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al obtener productos con stock:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar productos del proyecto',
                data: []
            };
        }
    },

    /**
     * Obtener stock disponible de un producto específico en un proyecto
     * 
     * @param {string} codigoProducto - Código del producto
     * @param {number} proyectoId - ID del proyecto
     * @returns {Promise<Object>} Información de stock del producto
     */
    obtenerStockProducto: async (codigoProducto, proyectoId) => {
        try {
            const response = await axios.get(`${API_URL}/stock/${codigoProducto}/proyecto/${proyectoId}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al obtener stock del producto:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener stock del producto',
                data: {
                    stock_disponible: 0,
                    precio_promedio: 0
                }
            };
        }
    },

    /**
     * Guardar un nuevo traslado de materiales
     * 
     * @param {Object} datosTraslado - Datos del traslado
     * @param {string} datosTraslado.numero_traslado - Número del traslado
     * @param {string} datosTraslado.proyecto_origen - Nombre del proyecto origen
     * @param {string} datosTraslado.proyecto_destino - Nombre del proyecto destino
     * @param {string} datosTraslado.fecha_traslado - Fecha del traslado (YYYY-MM-DD)
     * @param {string} datosTraslado.usuario - Usuario responsable
     * @param {string} datosTraslado.observaciones - Observaciones generales
     * @param {Array} datosTraslado.productos - Array de productos a trasladar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    guardarTraslado: async (datosTraslado) => {
        try {
            const response = await axios.post(API_URL, datosTraslado);
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al guardar traslado:', error);
            
            // Manejar errores de validación
            if (error.response?.status === 422) {
                return {
                    success: false,
                    message: error.response.data.message || 'Error de validación',
                    errors: error.response.data.errors
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al guardar el traslado'
            };
        }
    },

    /**
     * Obtener historial de traslados con filtros opcionales
     * 
     * @param {Object} filtros - Filtros opcionales
     * @param {string} filtros.fecha_desde - Fecha inicio (YYYY-MM-DD)
     * @param {string} filtros.fecha_hasta - Fecha fin (YYYY-MM-DD)
     * @param {string} filtros.proyecto_origen - Proyecto origen
     * @param {string} filtros.proyecto_destino - Proyecto destino
     * @param {string} filtros.usuario - Usuario responsable
     * @returns {Promise<Object>} Lista de traslados
     */
    obtenerHistorial: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
            if (filtros.proyecto_origen) params.append('proyecto_origen', filtros.proyecto_origen);
            if (filtros.proyecto_destino) params.append('proyecto_destino', filtros.proyecto_destino);
            if (filtros.usuario) params.append('usuario', filtros.usuario);
            
            const queryString = params.toString();
            const url = queryString ? `${API_URL}/historial?${queryString}` : `${API_URL}/historial`;
            
            const response = await axios.get(url);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al obtener historial:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar el historial',
                data: []
            };
        }
    },

    /**
     * Obtener detalle de un traslado específico
     * 
     * @param {string} idTraslado - ID del traslado (ej: NT-001)
     * @returns {Promise<Object>} Detalle completo del traslado
     */
    obtenerDetalle: async (idTraslado) => {
        try {
            const response = await axios.get(`${API_URL}/${idTraslado}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al obtener detalle:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cargar el detalle del traslado'
            };
        }
    },

    /**
     * Generar y descargar PDF del traslado
     * (Placeholder - implementar cuando se agregue funcionalidad de PDF en backend)
     * 
     * @param {string} idTraslado - ID del traslado
     * @returns {Promise<Object>} Respuesta de descarga
     */
    generarPDF: async (idTraslado) => {
        try {
            const response = await axios.get(`${API_URL}/${idTraslado}/pdf`, {
                responseType: 'blob'
            });
            
            // Crear URL del blob para descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Traslado_${idTraslado}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return {
                success: true,
                message: 'PDF generado correctamente'
            };
        } catch (error) {
            console.error('Error al generar PDF:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al generar PDF'
            };
        }
    },

    /**
     * Guardar un nuevo traslado de materiales entre RESERVAS (NUEVO)
     * 
     * @param {Object} datosTraslado - Datos del traslado
     * @param {string} datosTraslado.numero_traslado - Número del traslado
     * @param {number} datosTraslado.reserva_origen - ID de la reserva origen
     * @param {number} datosTraslado.reserva_destino - ID de la reserva destino
     * @param {string} datosTraslado.fecha_traslado - Fecha del traslado (YYYY-MM-DD)
     * @param {string} datosTraslado.usuario - Usuario responsable
     * @param {string} datosTraslado.observaciones - Observaciones generales
     * @param {Array} datosTraslado.productos - Array de productos a trasladar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    guardarTrasladoConReservas: async (datosTraslado) => {
        try {
            const response = await axios.post(`${API_URL}/con-reservas`, datosTraslado);
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error al guardar traslado con reservas:', error);
            
            // Manejar errores de validación
            if (error.response?.status === 422) {
                return {
                    success: false,
                    message: error.response.data.message || 'Error de validación',
                    errors: error.response.data.errors
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Error al guardar el traslado'
            };
        }
    }
};

export default trasladoMaterialesAPI;
