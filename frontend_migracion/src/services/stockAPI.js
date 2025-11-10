import axios from 'axios';

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

/**
 * Verificar disponibilidad de stock para traslado
 * NOTA: Esta función usa un endpoint diferente que aún puede estar activo
 */
export const verificarDisponibilidad = async (idReserva, codigoProducto, cantidad) => {
    try {
        const response = await axios.post(`http://127.0.0.1:8000/api/traslado-materiales/verificar-disponibilidad`, {
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
