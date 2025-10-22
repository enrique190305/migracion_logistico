import React, { useState, useEffect } from 'react';
import './OrdenPedido.css';
import {
  obtenerEmpresas,
  obtenerProyectosPorEmpresa,
  obtenerProductos,
  obtenerCorrelativo,
  guardarOrdenPedido
} from '../../services/pedidosAPI';
import Notificacion from './Notificacion';

const OrdenPedido = () => {
  // Estados para catálogos
  const [empresas, setEmpresas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [productos, setProductos] = useState([]);

  // Estados para formulario
  const [correlativo, setCorrelativo] = useState('');
  const [idEmpresa, setIdEmpresa] = useState('');
  const [idProyecto, setIdProyecto] = useState('');
  const [fechaPedido, setFechaPedido] = useState('');
  const [observacionGeneral, setObservacionGeneral] = useState('');

  // Estados para detalle de productos
  const [detalles, setDetalles] = useState([{
    id: 1,
    codigoProducto: '',
    descripcion: '',
    unidadMedida: '',
    cantidadSolicitada: '',
    observacion: ''
  }]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  
  // Estado para notificaciones personalizadas
  const [notificacion, setNotificacion] = useState(null);

  /**
   * Mostrar notificación personalizada
   */
  const mostrarNotificacion = (tipo, titulo, mensaje, detalles = []) => {
    setNotificacion({
      tipo,
      titulo,
      mensaje,
      detalles
    });
  };

  /**
   * Cerrar notificación
   */
  const cerrarNotificacion = () => {
    setNotificacion(null);
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [empresasData, productosData, correlativoData] = await Promise.all([
        obtenerEmpresas(),
        obtenerProductos(),
        obtenerCorrelativo()
      ]);

      setEmpresas(empresasData);
      setProductos(productosData);
      setCorrelativo(correlativoData);
      
      // Fecha actual por defecto
      const hoy = new Date().toISOString().split('T')[0];
      setFechaPedido(hoy);

    } catch (err) {
      mostrarNotificacion(
        'error',
        'Error al Cargar Datos',
        'No se pudieron cargar los datos iniciales del formulario.',
        [
          { label: '❌ Error', valor: err.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Por favor recargue la página' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de empresa
  const handleEmpresaChange = async (e) => {
    const empresaId = e.target.value;
    setIdEmpresa(empresaId);
    setIdProyecto(''); // Limpiar proyecto seleccionado
    setProyectos([]); // Limpiar lista de proyectos

    if (empresaId) {
      try {
        const proyectosData = await obtenerProyectosPorEmpresa(empresaId);
        setProyectos(proyectosData);
      } catch (err) {
        mostrarNotificacion(
          'error',
          'Error al Cargar Proyectos',
          'No se pudieron cargar los proyectos de la empresa seleccionada.',
          [
            { label: '❌ Error', valor: err.message || 'Error desconocido' },
            { label: '🏢 Empresa', valor: empresas.find(e => e.id_empresa === parseInt(empresaId))?.razon_social || '' }
          ]
        );
      }
    }
  };

  // Manejar cambio de producto en detalle
  const handleProductoChange = (index, codigoProducto) => {
    const producto = productos.find(p => p.codigo_producto === codigoProducto);
    
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      codigoProducto: codigoProducto,
      descripcion: producto ? producto.descripcion : '',
      unidadMedida: producto ? producto.unidad : ''
    };
    setDetalles(nuevosDetalles);
  };

  // Actualizar campo de detalle
  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][field] = value;
    setDetalles(nuevosDetalles);
  };

  // Agregar nueva línea de detalle
  const agregarDetalle = () => {
    setDetalles([...detalles, {
      id: detalles.length + 1,
      codigoProducto: '',
      descripcion: '',
      unidadMedida: '',
      cantidadSolicitada: '',
      observacion: ''
    }]);
  };

  // Eliminar línea de detalle
  const eliminarDetalle = (index) => {
    if (detalles.length > 1) {
      setDetalles(detalles.filter((_, i) => i !== index));
    }
  };

  // Limpiar formulario
  const limpiarFormulario = async () => {
    setIdEmpresa('');
    setIdProyecto('');
    setProyectos([]);
    setObservacionGeneral('');
    setDetalles([{
      id: 1,
      codigoProducto: '',
      descripcion: '',
      unidadMedida: '',
      cantidadSolicitada: '',
      observacion: ''
    }]);

    const hoy = new Date().toISOString().split('T')[0];
    setFechaPedido(hoy);

    try {
      const nuevoCorrelativo = await obtenerCorrelativo();
      setCorrelativo(nuevoCorrelativo);
    } catch (err) {
      mostrarNotificacion(
        'error',
        'Error al Obtener Correlativo',
        'No se pudo obtener el nuevo correlativo.',
        [
          { label: '❌ Error', valor: err.message || 'Error desconocido' }
        ]
      );
    }
  };

  // Guardar orden de pedido
  const handleGuardar = async () => {
    try {
      // Validaciones
      if (!idEmpresa) {
        mostrarNotificacion(
          'warning',
          'Empresa Requerida',
          'Debe seleccionar una empresa antes de continuar.',
          [
            { label: '⚠️ Campo faltante', valor: 'Razón Social (Empresa)' },
            { label: '📋 Acción', valor: 'Seleccione una empresa de la lista' }
          ]
        );
        return;
      }
      if (!idProyecto) {
        mostrarNotificacion(
          'warning',
          'Proyecto Requerido',
          'Debe seleccionar un proyecto antes de continuar.',
          [
            { label: '⚠️ Campo faltante', valor: 'Proyecto' },
            { label: '🏢 Empresa', valor: empresas.find(e => e.id_empresa === parseInt(idEmpresa))?.razon_social || '' },
            { label: '📋 Acción', valor: 'Seleccione un proyecto de la lista' }
          ]
        );
        return;
      }
      if (!fechaPedido) {
        mostrarNotificacion(
          'warning',
          'Fecha Requerida',
          'Debe ingresar la fecha del pedido.',
          [
            { label: '⚠️ Campo faltante', valor: 'Fecha de Creación' },
            { label: '📋 Acción', valor: 'Ingrese una fecha válida' }
          ]
        );
        return;
      }

      // Validar detalles
      const detallesValidos = detalles.filter(d => d.codigoProducto && d.cantidadSolicitada > 0);
      if (detallesValidos.length === 0) {
        mostrarNotificacion(
          'warning',
          'Productos Requeridos',
          'Debe agregar al menos un producto con cantidad mayor a cero.',
          [
            { label: '⚠️ Problema', valor: 'No hay productos válidos' },
            { label: '📦 Total de líneas', valor: detalles.length },
            { label: '✓ Líneas válidas', valor: '0' },
            { label: '📋 Acción', valor: 'Agregue productos y especifique cantidades' }
          ]
        );
        return;
      }

      setLoading(true);

      // Preparar datos
      const ordenData = {
        correlativo,
        id_empresa: parseInt(idEmpresa),
        id_proyecto: parseInt(idProyecto),
        fecha_pedido: fechaPedido,
        observacion: observacionGeneral || null,
        detalles: detallesValidos.map(d => ({
          codigo_producto: d.codigoProducto,
          cantidad_solicitada: parseFloat(d.cantidadSolicitada),
          observacion: d.observacion || null
        }))
      };

      await guardarOrdenPedido(ordenData);
      
      // Obtener datos para la notificación
      const empresaSeleccionada = empresas.find(e => e.id_empresa === parseInt(idEmpresa));
      const proyectoSeleccionado = proyectos.find(p => p.id_proyecto === parseInt(idProyecto));
      
      mostrarNotificacion(
        'success',
        'Orden de Pedido Guardada',
        'La orden de pedido se ha registrado exitosamente en el sistema.',
        [
          { label: '📋 Correlativo', valor: correlativo },
          { label: '🏢 Empresa', valor: empresaSeleccionada?.razon_social || '' },
          { label: '📍 Proyecto', valor: proyectoSeleccionado?.nombre_proyecto || '' },
          { label: '📦 Productos', valor: detallesValidos.length },
          { label: '📅 Fecha', valor: new Date(fechaPedido).toLocaleDateString('es-PE') },
          { label: '✅ Estado', valor: 'PENDIENTE' }
        ]
      );
      
      setTimeout(() => {
        limpiarFormulario();
        cerrarNotificacion();
      }, 4000);

    } catch (err) {
      mostrarNotificacion(
        'error',
        'Error al Guardar Orden',
        'Ocurrió un error al intentar guardar la orden de pedido.',
        [
          { label: '❌ Error', valor: err.message || 'Error desconocido' },
          { label: '📋 Correlativo', valor: correlativo },
          { label: '🔧 Acción', valor: 'Verifique los datos e intente nuevamente' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orden-pedido-container">
      <div className="orden-pedido-header">
        <h2>📋 Orden de Pedido</h2>
        <p className="orden-pedido-subtitle">Solicitud de productos para proyectos</p>
      </div>

      {/* Mensaje de carga */}
      {loading && <div className="mensaje-info">⏳ Cargando...</div>}

      {/* Formulario Principal */}
      <div className="orden-pedido-form">
        
        {/* Sección de Cabecera */}
        <div className="seccion">
          <h3 className="seccion-titulo">📄 Información General</h3>
          
          <div className="form-grid">
            {/* Correlativo */}
            <div className="form-group">
              <label>Correlativo</label>
              <input
                type="text"
                value={correlativo}
                readOnly
                className="input-readonly"
              />
            </div>

            {/* Fecha */}
            <div className="form-group">
              <label>Fecha de Creación *</label>
              <input
                type="date"
                value={fechaPedido}
                onChange={(e) => setFechaPedido(e.target.value)}
                required
              />
            </div>

            {/* Razón Social */}
            <div className="form-group full-width">
              <label>Razón Social (Empresa) *</label>
              <select
                value={idEmpresa}
                onChange={handleEmpresaChange}
                required
              >
                <option value="">-- Seleccione una empresa --</option>
                {empresas.map(empresa => (
                  <option key={empresa.id_empresa} value={empresa.id_empresa}>
                    {empresa.razon_social} {empresa.ruc ? `- RUC: ${empresa.ruc}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Proyecto */}
            <div className="form-group full-width">
              <label>Proyecto *</label>
              <select
                value={idProyecto}
                onChange={(e) => setIdProyecto(e.target.value)}
                disabled={!idEmpresa}
                required
              >
                <option value="">-- Seleccione un proyecto --</option>
                {proyectos.map(proyecto => (
                  <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                    {proyecto.nombre_proyecto} 
                    {proyecto.bodega ? ` - ${proyecto.bodega}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sección de Productos */}
        <div className="seccion">
          <div className="seccion-header">
            <h3 className="seccion-titulo">🛒 Productos Solicitados</h3>
            <button className="btn-agregar" onClick={agregarDetalle}>
              ➕ Agregar Producto
            </button>
          </div>

          <div className="tabla-container">
            <table className="tabla-productos">
              <thead>
                <tr>
                  <th style={{width: '30%'}}>Producto *</th>
                  <th style={{width: '15%'}}>Código</th>
                  <th style={{width: '10%'}}>U. Medida</th>
                  <th style={{width: '15%'}}>Cantidad *</th>
                  <th style={{width: '25%'}}>Observaciones</th>
                  <th style={{width: '5%'}}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => (
                  <tr key={detalle.id}>
                    {/* Producto */}
                    <td>
                      <select
                        value={detalle.codigoProducto}
                        onChange={(e) => handleProductoChange(index, e.target.value)}
                        className="select-producto"
                      >
                        <option value="">-- Seleccione --</option>
                        {productos.map(prod => (
                          <option key={prod.codigo_producto} value={prod.codigo_producto}>
                            {prod.descripcion}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Código (autocompleta) */}
                    <td>
                      <input
                        type="text"
                        value={detalle.codigoProducto}
                        readOnly
                        className="input-readonly-small"
                      />
                    </td>

                    {/* U. Medida (autocompleta) */}
                    <td>
                      <input
                        type="text"
                        value={detalle.unidadMedida}
                        readOnly
                        className="input-readonly-small"
                      />
                    </td>

                    {/* Cantidad */}
                    <td>
                      <input
                        type="number"
                        value={detalle.cantidadSolicitada}
                        onChange={(e) => handleDetalleChange(index, 'cantidadSolicitada', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </td>

                    {/* Observaciones */}
                    <td>
                      <input
                        type="text"
                        value={detalle.observacion}
                        onChange={(e) => handleDetalleChange(index, 'observacion', e.target.value)}
                        placeholder="Opcional"
                      />
                    </td>

                    {/* Eliminar */}
                    <td>
                      <button
                        className="btn-eliminar-fila"
                        onClick={() => eliminarDetalle(index)}
                        disabled={detalles.length === 1}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observaciones Generales */}
        <div className="seccion">
          <h3 className="seccion-titulo">📝 Observaciones Generales</h3>
          <textarea
            value={observacionGeneral}
            onChange={(e) => setObservacionGeneral(e.target.value)}
            placeholder="Ingrese observaciones generales de la orden de pedido (opcional)"
            rows="4"
            className="textarea-observaciones"
          />
        </div>

        {/* Botones de acción */}
        <div className="acciones-footer">
          <button 
            className="btn-limpiar"
            onClick={limpiarFormulario}
            disabled={loading}
          >
            🔄 Limpiar
          </button>
          <button 
            className="btn-guardar"
            onClick={handleGuardar}
            disabled={loading}
          >
            💾 Guardar Orden de Pedido
          </button>
        </div>
      </div>
      
      {/* Componente de Notificación */}
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          detalles={notificacion.detalles}
          onClose={cerrarNotificacion}
        />
      )}
    </div>
  );
};

export default OrdenPedido;
