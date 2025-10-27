// Servicio API para gestión de proyectos
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ========================================
// CATÁLOGOS (para llenar selectores)
// ========================================

/**
 * Obtener lista de empresas
 */
export const obtenerEmpresas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/empresas`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener empresas');
  } catch (error) {
    console.error('Error en obtenerEmpresas:', error);
    throw error;
  }
};

/**
 * Obtener todas las bodegas
 */
export const obtenerBodegas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/bodegas`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener bodegas');
  } catch (error) {
    console.error('Error en obtenerBodegas:', error);
    throw error;
  }
};

/**
 * Obtener bodegas filtradas por empresa
 */
export const obtenerBodegasPorEmpresa = async (idEmpresa) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/bodegas/${idEmpresa}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener bodegas');
  } catch (error) {
    console.error('Error en obtenerBodegasPorEmpresa:', error);
    throw error;
  }
};

/**
 * Obtener tipos de reserva
 */
export const obtenerReservas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/reservas`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener tipos de reserva');
  } catch (error) {
    console.error('Error en obtenerReservas:', error);
    throw error;
  }
};

/**
 * Obtener lista de personas (responsables)
 */
export const obtenerPersonas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/personas`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener personas');
  } catch (error) {
    console.error('Error en obtenerPersonas:', error);
    throw error;
  }
};

// ========================================
// CRUD PROYECTOS
// ========================================

/**
 * Obtener lista de proyectos
 */
export const obtenerProyectos = async (filtros = {}) => {
  try {
    let url = `${API_BASE_URL}/proyectos`;
    
    // Agregar filtros si existen
    const params = new URLSearchParams();
    if (filtros.id_empresa) {
      params.append('id_empresa', filtros.id_empresa);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener proyectos');
  } catch (error) {
    console.error('Error en obtenerProyectos:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un proyecto
 */
export const obtenerProyecto = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${id}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener proyecto');
  } catch (error) {
    console.error('Error en obtenerProyecto:', error);
    throw error;
  }
};

/**
 * Crear nuevo proyecto
 */
export const crearProyecto = async (proyectoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proyectoData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data;
    }
    
    // Si hay errores de validación
    if (data.errors) {
      const errores = Object.values(data.errors).flat().join('\n');
      throw new Error(errores);
    }
    
    throw new Error(data.message || 'Error al crear proyecto');
  } catch (error) {
    console.error('Error en crearProyecto:', error);
    throw error;
  }
};

/**
 * Actualizar proyecto
 */
export const actualizarProyecto = async (id, proyectoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proyectoData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data;
    }
    throw new Error(data.message || 'Error al actualizar proyecto');
  } catch (error) {
    console.error('Error en actualizarProyecto:', error);
    throw error;
  }
};

/**
 * Eliminar (desactivar) proyecto
 */
export const eliminarProyecto = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data;
    }
    throw new Error(data.message || 'Error al eliminar proyecto');
  } catch (error) {
    console.error('Error en eliminarProyecto:', error);
    throw error;
  }
};

// ========================================
// SUBPROYECTOS
// ========================================

/**
 * Obtener subproyectos de un proyecto
 */
export const obtenerSubproyectos = async (idProyecto) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${idProyecto}/subproyectos`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Error al obtener subproyectos');
  } catch (error) {
    console.error('Error en obtenerSubproyectos:', error);
    throw error;
  }
};

/**
 * Crear subproyecto
 */
export const crearSubproyecto = async (idProyecto, subproyectoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${idProyecto}/subproyectos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subproyectoData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data;
    }
    
    // Si hay errores de validación
    if (data.errors) {
      const errores = Object.values(data.errors).flat().join('\n');
      throw new Error(errores);
    }
    
    throw new Error(data.message || 'Error al crear subproyecto');
  } catch (error) {
    console.error('Error en crearSubproyecto:', error);
    throw error;
  }
};

/**
 * Actualizar subproyecto
 */
export const actualizarSubproyecto = async (idProyecto, idSubproyecto, subproyectoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${idProyecto}/subproyectos/${idSubproyecto}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subproyectoData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data;
    }
    
    // Si hay errores de validación
    if (data.errors) {
      const errores = Object.values(data.errors).flat().join('\n');
      throw new Error(errores);
    }
    
    throw new Error(data.message || 'Error al actualizar subproyecto');
  } catch (error) {
    console.error('Error en actualizarSubproyecto:', error);
    throw error;
  }
};

/**
 * Eliminar (desactivar) subproyecto
 */
export const eliminarSubproyecto = async (idProyecto, idSubproyecto) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${idProyecto}/subproyectos/${idSubproyecto}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data;
    }
    throw new Error(data.message || 'Error al eliminar subproyecto');
  } catch (error) {
    console.error('Error en eliminarSubproyecto:', error);
    throw error;
  }
};

export default {
  // Catálogos
  obtenerEmpresas,
  obtenerBodegas,
  obtenerBodegasPorEmpresa,
  obtenerReservas,
  obtenerPersonas,
  
  // CRUD Proyectos
  obtenerProyectos,
  obtenerProyecto,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  
  // Subproyectos
  obtenerSubproyectos,
  crearSubproyecto,
  actualizarSubproyecto,
  eliminarSubproyecto
};
