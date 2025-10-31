import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/stock';

/**
 * Obtener stock por bodega
 */
export const obtenerStockPorBodega = async (idBodega) => {
    try {
        const response = await axios.get(`${API_URL}/bodega/${idBodega}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener stock por bodega:', error);
        throw error.response?.data || error;
    }
};

/**
 * Obtener stock por reserva
 */
export const obtenerStockPorReserva = async (idReserva) => {
    try {
        const response = await axios.get(`${API_URL}/reserva/${idReserva}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener stock por reserva:', error);
        throw error.response?.data || error;
    }
};

/**
 * Obtener ubicaciones de un producto en todas las bodegas
 */
export const obtenerStockProducto = async (codigoProducto) => {
    try {
        const response = await axios.get(`${API_URL}/producto/${codigoProducto}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener stock del producto:', error);
        throw error.response?.data || error;
    }
};

/**
 * Obtener resumen general de stock
 */
export const obtenerResumenStock = async () => {
    try {
        const response = await axios.get(`${API_URL}/resumen`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener resumen de stock:', error);
        throw error.response?.data || error;
    }
};

/**
 * Verificar disponibilidad de stock para traslado
 */
export const verificarDisponibilidad = async (idReserva, codigoProducto, cantidad) => {
    try {
        const response = await axios.post(`${API_URL}/verificar-disponibilidad`, {
            id_reserva: idReserva,
            codigo_producto: codigoProducto,
            cantidad: cantidad
        });
        return response.data;
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        throw error.response?.data || error;
    }
};

/**
 * Obtener productos con stock en una reserva (para traslados)
 */
export const obtenerProductosConStockReserva = async (idReserva) => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/traslado-materiales/reservas/${idReserva}/productos-stock`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener productos con stock en reserva:', error);
        throw error.response?.data || error;
    }
};
