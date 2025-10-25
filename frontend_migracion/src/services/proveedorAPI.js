const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Obtener todos los proveedores
 */
export const obtenerProveedores = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener proveedores');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerProveedores:', error);
        throw error;
    }
};

/**
 * Obtener un proveedor por ID
 * @param {number} id - ID del proveedor
 */
export const obtenerProveedorPorId = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener proveedor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerProveedorPorId:', error);
        throw error;
    }
};

/**
 * Crear un nuevo proveedor
 * @param {Object} proveedorData - Datos del proveedor
 */
export const crearProveedor = async (proveedorData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(proveedorData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear proveedor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en crearProveedor:', error);
        throw error;
    }
};

/**
 * Actualizar un proveedor existente
 * @param {number} id - ID del proveedor
 * @param {Object} proveedorData - Datos actualizados del proveedor
 */
export const actualizarProveedor = async (id, proveedorData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(proveedorData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar proveedor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en actualizarProveedor:', error);
        throw error;
    }
};

/**
 * Eliminar un proveedor
 * @param {number} id - ID del proveedor
 */
export const eliminarProveedor = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar proveedor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en eliminarProveedor:', error);
        throw error;
    }
};

/**
 * Buscar proveedores
 * @param {string} criterio - Criterio de búsqueda
 */
export const buscarProveedores = async (criterio) => {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/buscar?q=${encodeURIComponent(criterio)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Error al buscar proveedores');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en buscarProveedores:', error);
        throw error;
    }
};