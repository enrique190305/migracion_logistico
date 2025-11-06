import axios from 'axios';

const API_URL = 'http://localhost:8000/api/salida-materiales';

const salidaMaterialesAPI = {
  /**
   * Listar proyectos disponibles
   */
  listarProyectos: async () => {
    try {
      const response = await axios.get(`${API_URL}/proyectos`);
      return response.data;
    } catch (error) {
      console.error('Error al listar proyectos:', error);
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
      } else if (error.request) {
        // La solicitud se realizó pero no hubo respuesta
        console.error('No se recibió respuesta del servidor');
      } else {
        // Algo sucedió al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
      }
      throw error;
    }
  },

  /**
   * Obtener información del proyecto (incluye datos de movil_persona)
   * @param {number} idProyecto - ID del proyecto
   */
  obtenerInfoProyecto: async (idProyecto) => {
    try {
      const response = await axios.get(`${API_URL}/proyecto/${idProyecto}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener información del proyecto:', error);
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
      }
      throw error;
    }
  },

  /**
   * Obtener productos con stock por proyecto
   * @param {string} nombreProyecto - Nombre del proyecto
   */
  obtenerProductosPorProyecto: async (nombreProyecto) => {
    try {
      console.log('Buscando productos para proyecto:', nombreProyecto);
      const response = await axios.get(`${API_URL}/productos-por-proyecto`, {
        params: { proyecto: nombreProyecto }
      });
      console.log('Productos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
      }
      throw error;
    }
  },

  /**
   * Generar nuevo número de salida
   */
  generarNumeroSalida: async () => {
    try {
      const response = await axios.get(`${API_URL}/generar-numero`);
      return response.data;
    } catch (error) {
      console.error('Error al generar número:', error);
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
      }
      throw error;
    }
  },

  /**
   * Guardar salida de materiales
   * @param {Object} datosSalida - Datos de la salida
   */
  guardarSalida: async (datosSalida) => {
    try {
      const response = await axios.post(`${API_URL}/guardar`, datosSalida);
      return response.data;
    } catch (error) {
      console.error('Error al guardar salida:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de salidas
   * @param {Object} filtros - Filtros opcionales (fecha_desde, fecha_hasta, proyecto)
   */
  obtenerHistorial: async (filtros = {}) => {
    try {
      const response = await axios.get(`${API_URL}/historial`, {
        params: filtros
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle de una salida específica
   * @param {string} numeroSalida - Número de la salida
   */
  obtenerDetalleSalida: async (numeroSalida) => {
    try {
      const response = await axios.get(`${API_URL}/detalle/${numeroSalida}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      throw error;
    }
  },

  /**
   * Generar y descargar PDF de salida de materiales
   * @param {string} numeroSalida - Número de la salida
   */
  generarPDF: async (numeroSalida) => {
    try {
      const response = await axios.get(`${API_URL}/pdf/${numeroSalida}`, {
        responseType: 'blob' // Importante para archivos binarios
      });
      
      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear enlace temporal y hacer clic automático
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Salida_Materiales_${numeroSalida}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'PDF generado exitosamente' };
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  }
};

export default salidaMaterialesAPI;
