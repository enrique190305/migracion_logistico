import axios from 'axios';

const API_URL = 'http://localhost:8000/api/ingreso-materiales';

/**
 * Servicio para gestionar Ingreso de Materiales
 */
const ingresoMaterialesAPI = {
    
    /**
     * Obtener lista de órdenes pendientes (OC y OS con estado APROBADO o PARCIAL)
     */
    async listarOrdenesPendientes() {
        try {
            const response = await axios.get(`${API_URL}/ordenes-pendientes`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener órdenes pendientes:', error);
            throw error;
        }
    },

    /**
     * Obtener información completa de una orden específica (OC o OS)
     */
    async obtenerInfoOrden(correlativo) {
        try {
            const response = await axios.post(`${API_URL}/info-orden`, { correlativo });
            return response.data;
        } catch (error) {
            console.error('Error al obtener información de la orden:', error);
            throw error;
        }
    },

    /**
     * Precargar productos de una orden con saldo pendiente
     */
    async precargarProductos(correlativo) {
        try {
            const response = await axios.post(`${API_URL}/precargar-productos`, { correlativo });
            return response.data;
        } catch (error) {
            console.error('Error al precargar productos:', error);
            throw error;
        }
    },

    /**
     * Obtener lista de proyectos almacén activos
     */
    async listarProyectosAlmacen() {
        try {
            const response = await axios.get(`${API_URL}/proyectos-almacen`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener proyectos almacén:', error);
            throw error;
        }
    },

    /**
     * Obtener lista de productos disponibles
     */
    async listarProductos() {
        try {
            const response = await axios.get(`${API_URL}/productos`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    },

    /**
     * Generar número automático de ingreso
     */
    async generarNumeroIngreso() {
        try {
            const response = await axios.get(`${API_URL}/generar-numero`);
            return response.data;
        } catch (error) {
            console.error('Error al generar número de ingreso:', error);
            throw error;
        }
    },

    /**
     * Guardar ingreso de material o conformidad de servicio
     * @param {Object} datos - Datos del ingreso
     * @param {string} datos.correlativo - Correlativo de OC o OS
     * @param {string} datos.proyecto_almacen - Nombre del proyecto almacén
     * @param {string} datos.fecha_ingreso - Fecha del ingreso (YYYY-MM-DD)
     * @param {string} datos.num_guia - Número de guía de remisión
     * @param {string} datos.factura - Número de factura
     * @param {string} datos.observaciones - Observaciones generales
     * @param {string} datos.usuario - Usuario que registra
     * @param {Array} datos.productos - Array de productos a ingresar
     */
    async guardarIngreso(datos) {
        try {
            const response = await axios.post(`${API_URL}/guardar`, datos);
            return response.data;
        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            throw error;
        }
    },

    /**
     * Obtener historial de ingresos de materiales (OC)
     * @param {Object} filtros - Filtros opcionales
     * @param {string} filtros.fecha_desde - Fecha inicio (YYYY-MM-DD)
     * @param {string} filtros.fecha_hasta - Fecha fin (YYYY-MM-DD)
     */
    async obtenerHistorialIngresos(filtros = {}) {
        try {
            const params = new URLSearchParams(filtros);
            const response = await axios.get(`${API_URL}/historial-ingresos?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener historial de ingresos:', error);
            throw error;
        }
    },

    /**
     * Obtener historial de conformidades de servicio (OS)
     * @param {Object} filtros - Filtros opcionales
     * @param {string} filtros.fecha_desde - Fecha inicio (YYYY-MM-DD)
     * @param {string} filtros.fecha_hasta - Fecha fin (YYYY-MM-DD)
     */
    async obtenerHistorialServicios(filtros = {}) {
        try {
            const params = new URLSearchParams(filtros);
            const response = await axios.get(`${API_URL}/historial-servicios?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener historial de servicios:', error);
            throw error;
        }
    },

    /**
     * Obtener historial de ingresos directos (ID)
     * @param {Object} filtros - Filtros opcionales
     * @param {string} filtros.fecha_desde - Fecha inicio (YYYY-MM-DD)
     * @param {string} filtros.fecha_hasta - Fecha fin (YYYY-MM-DD)
     */
    async obtenerHistorialDirectos(filtros = {}) {
        try {
            const params = new URLSearchParams(filtros);
            const response = await axios.get(`${API_URL}/historial-directos?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener historial de ingresos directos:', error);
            throw error;
        }
    },

    /**
     * Listar empresas para ingreso directo
     */
    async listarEmpresas() {
        try {
            const response = await axios.get(`${API_URL}/empresas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener empresas:', error);
            throw error;
        }
    },

    /**
     * Listar proveedores para ingreso directo
     */
    async listarProveedores() {
        try {
            const response = await axios.get(`${API_URL}/proveedores`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            throw error;
        }
    },

    /**
     * Listar monedas para ingreso directo
     */
    async listarMonedas() {
        try {
            const response = await axios.get(`${API_URL}/monedas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener monedas:', error);
            throw error;
        }
    },

    /**
     * Guardar ingreso directo (sin OC/OS)
     * @param {Object} datos - Datos del ingreso directo
     * @param {string} datos.numero_ingreso - Número de ingreso generado
     * @param {number} datos.id_empresa - ID de la empresa
     * @param {number} datos.id_proveedor - ID del proveedor
     * @param {string} datos.moneda - Moneda (PEN, USD, etc.)
     * @param {string} datos.proyecto_almacen - Proyecto almacén
     * @param {string} datos.fecha - Fecha del ingreso (YYYY-MM-DD)
     * @param {string} datos.num_guia - Número de guía (opcional)
     * @param {string} datos.factura - Número de factura (opcional)
     * @param {string} datos.observaciones - Observaciones generales (opcional)
     * @param {Array} datos.productos - Array de productos con cantidad y precio unitario
     */
    async guardarIngresoDirecto(datos) {
        try {
            const response = await axios.post(`${API_URL}/guardar-directo`, datos);
            return response.data;
        } catch (error) {
            console.error('Error al guardar ingreso directo:', error);
            throw error;
        }
    }
};

export default ingresoMaterialesAPI;
