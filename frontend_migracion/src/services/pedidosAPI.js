// Servicio API para Órdenes de Pedido
const API_BASE_URL = 'http://localhost:8000/api/pedidos';

/**
 * Obtener todas las empresas
 */
export const obtenerEmpresas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw error;
  }
};

/**
 * Obtener proyectos por empresa
 */
export const obtenerProyectosPorEmpresa = async (idEmpresa) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${idEmpresa}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};

/**
 * Obtener todos los productos
 */
export const obtenerProductos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtener siguiente correlativo
 */
export const obtenerCorrelativo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/correlativo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.correlativo;
  } catch (error) {
    console.error('Error al obtener correlativo:', error);
    throw error;
  }
};

/**
 * Guardar nueva orden de pedido
 */
export const guardarOrdenPedido = async (ordenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(ordenData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al guardar orden de pedido:', error);
    throw error;
  }
};

/**
 * Obtener todas las órdenes de pedido
 */
export const obtenerOrdenesPedido = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    throw error;
  }
};

/**
 * Eliminar orden de pedido
 */
export const eliminarOrdenPedido = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    throw error;
  }
};
