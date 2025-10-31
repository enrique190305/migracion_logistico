import React, { useState, useEffect } from 'react';
import './EliminarOCS.css';
import {
  listarOrdenesCompra,
  listarOrdenesServicio,
  obtenerDetalleOrdenCompra,
  obtenerDetalleOrdenServicio,
  eliminarOrdenCompra,
  eliminarOrdenServicio
} from '../../services/ordenesEliminarAPI';

const EliminarOCS = () => {
  // Estados principales
  const [tipoOrden, setTipoOrden] = useState('OC');
  const [ordenes, setOrdenes] = useState([]);
  const [razonSocialSeleccionada, setRazonSocialSeleccionada] = useState('');
  const [correlativoSeleccionado, setCorrelativoSeleccionado] = useState('');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [detallesOrden, setDetallesOrden] = useState([]);
  const [totalesOrden, setTotalesOrden] = useState({
    subtotal: 0,
    igv: 0,
    total: 0
  });
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState(null);

  // Estados para modales
  const [modalMensaje, setModalMensaje] = useState({
    mostrar: false,
    tipo: '', // 'success', 'error', 'warning', 'info'
    titulo: '',
    mensaje: ''
  });

  const [modalConfirmacion, setModalConfirmacion] = useState({
    mostrar: false,
    titulo: '',
    mensaje: '',
    onConfirm: null
  });

  // Cargar órdenes cuando cambia el tipo
  useEffect(() => {
    cargarOrdenes();
  }, [tipoOrden]);

  /**
   * Cargar lista de órdenes desde el backend
   */
  const cargarOrdenes = async () => {
    setLoading(true);
    setError(null);
    setRazonSocialSeleccionada('');
    setCorrelativoSeleccionado('');
    setOrdenSeleccionada(null);
    setDetallesOrden([]);
    setTotalesOrden({ subtotal: 0, igv: 0, total: 0 });
    
    try {
      const data = tipoOrden === 'OC' 
        ? await listarOrdenesCompra() 
        : await listarOrdenesServicio();
      
      console.log('📋 Órdenes cargadas:', data);
      setOrdenes(data);
      
      // No mostrar mensaje de error si no hay órdenes, solo limpiar
      // El usuario verá "No hay órdenes disponibles" en el select
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('Error al cargar las órdenes. Verifique la conexión con el servidor.');
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener razones sociales únicas de las órdenes (EMPRESAS)
   */
  const getRazonesSociales = () => {
    if (!ordenes || ordenes.length === 0) return [];
    
    // Extraer empresas únicas usando Map con ID como clave
    const empresasMap = new Map();
    ordenes.forEach(orden => {
      if (orden.empresa?.id && orden.empresa?.razon_social) {
        empresasMap.set(orden.empresa.id, orden.empresa.razon_social);
      }
    });
    
    // Convertir a array de razones sociales
    return Array.from(empresasMap.values());
  };

  /**
   * Obtener correlativos por razón social (empresa)
   */
  const getCorrelativos = (razonSocial) => {
    if (!razonSocial || !ordenes) return [];
    
    return ordenes
      .filter(orden => orden.empresa?.razon_social === razonSocial)
      .map(orden => ({
        id: orden.id,
        correlativo: orden.correlativo
      }));
  };

  /**
   * Buscar y cargar detalle de la orden
   */
  const handleBuscarOrden = async () => {
    if (!ordenSeleccionada) {
      mostrarModalMensaje('warning', '⚠️ Atención', 'Por favor seleccione una orden');
      return;
    }

    setLoadingDetalle(true);
    setError(null);

    try {
      const detalle = tipoOrden === 'OC'
        ? await obtenerDetalleOrdenCompra(ordenSeleccionada.id)
        : await obtenerDetalleOrdenServicio(ordenSeleccionada.id);

      console.log('📄 Detalle cargado:', detalle);
      
      if (detalle && detalle.detalles) {
        setDetallesOrden(detalle.detalles);
        // Guardar totales (subtotal, IGV, total)
        setTotalesOrden({
          subtotal: detalle.subtotal || 0,
          igv: detalle.igv || 0,
          total: detalle.total_general || 0
        });
      } else {
        setDetallesOrden([]);
        setTotalesOrden({ subtotal: 0, igv: 0, total: 0 });
        mostrarModalMensaje('info', 'ℹ️ Información', 'No se encontraron detalles para esta orden');
      }
    } catch (err) {
      console.error('Error al buscar orden:', err);
      setError('Error al cargar el detalle de la orden');
      setDetallesOrden([]);
      setTotalesOrden({ subtotal: 0, igv: 0, total: 0 });
      mostrarModalMensaje('error', '❌ Error', 'Error al cargar el detalle de la orden');
    } finally {
      setLoadingDetalle(false);
    }
  };

  /**
   * Eliminar orden (ahora anula en lugar de eliminar)
   */
  const handleEliminar = () => {
    if (!ordenSeleccionada || detallesOrden.length === 0) {
      mostrarModalMensaje('warning', '⚠️ Atención', 'No hay orden seleccionada para anular');
      return;
    }

    // Validar que la orden esté en estado PENDIENTE
    if (ordenSeleccionada.estado !== 'PENDIENTE') {
      mostrarModalMensaje(
        'warning',
        '⚠️ No se puede anular',
        `No se puede anular esta orden.\n\nSolo se pueden anular órdenes en estado PENDIENTE.\n\nEstado actual: ${ordenSeleccionada.estado}`
      );
      return;
    }

    const tipoTexto = tipoOrden === 'OC' ? 'Orden de Compra' : 'Orden de Servicio';
    const mensaje = `¿Está seguro de anular la ${tipoTexto} ${correlativoSeleccionado}?\n\nLa orden cambiará su estado a ANULADO y no se mostrará en las interfaces normales.\n\nPodrá visualizarla únicamente en el HISTORIAL.\n\nSubtotal: S/ ${parseFloat(totalesOrden.subtotal || 0).toFixed(2)}\nIGV (18%): S/ ${parseFloat(totalesOrden.igv || 0).toFixed(2)}\nTotal: S/ ${parseFloat(totalesOrden.total || 0).toFixed(2)}`;

    mostrarModalConfirmacion(
      '⚠️ Confirmar Anulación',
      mensaje,
      confirmarAnulacion
    );
  };

  /**
   * Confirmar anulación de la orden
   */
  const confirmarAnulacion = async () => {
    setLoading(true);
    setError(null);

    const tipoTexto = tipoOrden === 'OC' ? 'Orden de Compra' : 'Orden de Servicio';

    try {
      const result = tipoOrden === 'OC'
        ? await eliminarOrdenCompra(ordenSeleccionada.id)
        : await eliminarOrdenServicio(ordenSeleccionada.id);

      console.log('✅ Anulación exitosa:', result);

      mostrarModalMensaje(
        'success',
        '✅ Anulación Exitosa',
        `${tipoTexto} anulada correctamente\n\nCorrelativo: ${correlativoSeleccionado}\nEstado: ANULADO\n\nLa orden ya no aparecerá en listados normales.`
      );
      
      // Recargar lista y limpiar formulario
      handleLimpiar();
      await cargarOrdenes();
      
    } catch (err) {
      console.error('Error al anular orden:', err);
      const mensajeError = err.message || 'Error al anular la orden';
      setError(mensajeError);
      mostrarModalMensaje('error', '❌ Error al Anular', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar formulario
   */
  const handleLimpiar = () => {
    setRazonSocialSeleccionada('');
    setCorrelativoSeleccionado('');
    setOrdenSeleccionada(null);
    setDetallesOrden([]);
    setTotalesOrden({ subtotal: 0, igv: 0, total: 0 });
    setError(null);
  };

  /**
   * Mostrar modal de mensaje
   */
  const mostrarModalMensaje = (tipo, titulo, mensaje) => {
    setModalMensaje({
      mostrar: true,
      tipo,
      titulo,
      mensaje
    });
  };

  /**
   * Cerrar modal de mensaje
   */
  const cerrarModalMensaje = () => {
    setModalMensaje({
      mostrar: false,
      tipo: '',
      titulo: '',
      mensaje: ''
    });
  };

  /**
   * Mostrar modal de confirmación
   */
  const mostrarModalConfirmacion = (titulo, mensaje, onConfirm) => {
    setModalConfirmacion({
      mostrar: true,
      titulo,
      mensaje,
      onConfirm
    });
  };

  /**
   * Cerrar modal de confirmación
   */
  const cerrarModalConfirmacion = () => {
    setModalConfirmacion({
      mostrar: false,
      titulo: '',
      mensaje: '',
      onConfirm: null
    });
  };

  /**
   * Confirmar acción del modal
   */
  const confirmarAccion = () => {
    if (modalConfirmacion.onConfirm) {
      modalConfirmacion.onConfirm();
    }
    cerrarModalConfirmacion();
  };

  return (
    <div className="eliminar-ocs-container">
      {/* Header */}
      <div className="eliminar-ocs-header">
        <div className="header-icon-title">
          <span className="header-icon">🗑️</span>
          <h1>ANULAR ÓRDENES DE COMPRA Y SERVICIOS</h1>
        </div>
      </div>

      {/* Advertencia */}
      <div className="advertencia-box">
        <span className="advertencia-icon">⚠️</span>
        <p>
          <strong>INFORMACIÓN:</strong> Esta acción cambiará el estado de la orden a <strong>ANULADO</strong>. 
          Las órdenes anuladas no se mostrarán en las interfaces normales, solo podrán visualizarse en el HISTORIAL.
          <br/><br/>
          <strong>Solo se pueden anular órdenes en estado PENDIENTE.</strong>
        </p>
      </div>

      {/* Mensaje de error general - Solo mostrar errores de conexión */}
      {error && error.includes('conexión') && (
        <div className="advertencia-box" style={{ backgroundColor: '#fee', borderColor: '#fcc' }}>
          <span className="advertencia-icon">❌</span>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Formulario de Búsqueda */}
      <div className="busqueda-section">
        <div className="form-row">
          <label>🛒 Tipo de Orden:</label>
          <div className="radio-group">
            <label className={`radio-option ${tipoOrden === 'OC' ? 'active' : ''}`}>
              <input
                type="radio"
                name="tipoOrden"
                value="OC"
                checked={tipoOrden === 'OC'}
                onChange={(e) => {
                  setTipoOrden(e.target.value);
                  handleLimpiar();
                }}
                disabled={loading}
              />
              <span className="radio-icon">🛒</span>
              Orden de Compra (OC)
            </label>
            <label className={`radio-option ${tipoOrden === 'OS' ? 'active' : ''}`}>
              <input
                type="radio"
                name="tipoOrden"
                value="OS"
                checked={tipoOrden === 'OS'}
                onChange={(e) => {
                  setTipoOrden(e.target.value);
                  handleLimpiar();
                }}
                disabled={loading}
              />
              <span className="radio-icon">🔧</span>
              Orden de Servicio (OS)
            </label>
          </div>
        </div>

        {loading && !loadingDetalle ? (
          <div className="form-row">
            <p style={{ textAlign: 'center', color: '#666' }}>⏳ Cargando órdenes...</p>
          </div>
        ) : (
          <>
            <div className="form-row">
              <label>🏢 Razón Social:</label>
              <select
                value={razonSocialSeleccionada}
                onChange={(e) => {
                  const razonSocial = e.target.value;
                  console.log('📌 Razón Social seleccionada:', razonSocial);
                  setRazonSocialSeleccionada(razonSocial);
                  setCorrelativoSeleccionado('');
                  setOrdenSeleccionada(null);
                  setDetallesOrden([]);
                }}
                disabled={loading || ordenes.length === 0}
              >
                <option value="">
                  {ordenes.length === 0 
                    ? 'No hay órdenes disponibles...' 
                    : 'Seleccione una razón social...'}
                </option>
                {getRazonesSociales().map((razon, index) => (
                  <option key={index} value={razon}>{razon}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>🔖 Correlativo:</label>
              <div className="correlativo-row">
                <select
                  value={correlativoSeleccionado}
                  onChange={(e) => {
                    const correlativo = e.target.value;
                    console.log('📌 Correlativo seleccionado:', correlativo);
                    setCorrelativoSeleccionado(correlativo);
                    
                    // Buscar la orden completa con ese correlativo
                    const orden = ordenes.find(o => o.correlativo === correlativo);
                    console.log('📦 Orden encontrada:', orden);
                    setOrdenSeleccionada(orden || null);
                    setDetallesOrden([]);
                  }}
                  disabled={!razonSocialSeleccionada || loading}
                >
                  <option value="">Seleccione un correlativo...</option>
                  {razonSocialSeleccionada && getCorrelativos(razonSocialSeleccionada).map((item, index) => (
                    <option key={index} value={item.correlativo}>{item.correlativo}</option>
                  ))}
                </select>
                <button 
                  className="btn-buscar"
                  onClick={handleBuscarOrden}
                  disabled={!ordenSeleccionada?.id || loadingDetalle || loading}
                >
                  {loadingDetalle ? '⏳ Buscando...' : '🔍 Buscar'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabla de Detalles */}
      <div className="detalles-section">
        <div className="table-wrapper">
          <table className="detalles-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loadingDetalle ? (
                <tr>
                  <td colSpan="7" className="empty-message">
                    <div className="empty-state">
                      <span className="empty-icon">⏳</span>
                      <p>Cargando detalles...</p>
                    </div>
                  </td>
                </tr>
              ) : detallesOrden.length > 0 ? (
                detallesOrden.map((detalle, index) => (
                  <tr key={index}>
                    <td><strong>{correlativoSeleccionado || 'N/A'}</strong></td>
                    <td>{detalle.descripcion}</td>
                    <td className="text-center">{detalle.cantidad}</td>
                    <td>{detalle.unidad}</td>
                    <td className="text-right">S/ {parseFloat(detalle.precio || 0).toFixed(2)}</td>
                    <td className="text-right">S/ {parseFloat(detalle.subtotal || 0).toFixed(2)}</td>
                    <td className="text-right"><strong>S/ {parseFloat(detalle.total || 0).toFixed(2)}</strong></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-message">
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <p>No hay detalles para mostrar</p>
                      <span className="empty-hint">Seleccione una orden para ver los detalles</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {detallesOrden.length > 0 && !loadingDetalle && (
              <tfoot>
                <tr>
                  <td colSpan="6" className="text-right"><strong>SUBTOTAL:</strong></td>
                  <td className="text-right"><strong>S/ {parseFloat(totalesOrden.subtotal || 0).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colSpan="6" className="text-right"><strong>IGV (18%):</strong></td>
                  <td className="text-right"><strong>S/ {parseFloat(totalesOrden.igv || 0).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colSpan="6" className="text-right"><strong>TOTAL GENERAL:</strong></td>
                  <td className="text-right total-general"><strong>S/ {parseFloat(totalesOrden.total || 0).toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="acciones-section">
        <button 
          className="btn-eliminar"
          onClick={handleEliminar}
          disabled={detallesOrden.length === 0 || loading || loadingDetalle || ordenSeleccionada?.estado !== 'PENDIENTE'}
          title={ordenSeleccionada?.estado !== 'PENDIENTE' ? 'Solo se pueden anular órdenes en estado PENDIENTE' : 'Anular orden'}
        >
          <span>🗑️</span> {loading ? 'ANULANDO...' : 'ANULAR ORDEN'}
        </button>
      </div>

      {/* Modal de Mensaje */}
      {modalMensaje.mostrar && (
        <>
          <div className="modal-overlay" onClick={cerrarModalMensaje}></div>
          <div className={`modal-mensaje modal-mensaje-${modalMensaje.tipo}`}>
            <div className="modal-mensaje-header">
              <div className="modal-mensaje-icono">
                {modalMensaje.tipo === 'success' && '✅'}
                {modalMensaje.tipo === 'error' && '❌'}
                {modalMensaje.tipo === 'warning' && '⚠️'}
                {modalMensaje.tipo === 'info' && 'ℹ️'}
              </div>
              <h3>{modalMensaje.titulo}</h3>
            </div>
            <div className="modal-mensaje-body">
              <p style={{ whiteSpace: 'pre-line' }}>{modalMensaje.mensaje}</p>
            </div>
            <div className="modal-mensaje-footer">
              <button 
                className={`btn-mensaje btn-mensaje-${modalMensaje.tipo}`}
                onClick={cerrarModalMensaje}
              >
                Aceptar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Confirmación */}
      {modalConfirmacion.mostrar && (
        <>
          <div className="modal-overlay" onClick={cerrarModalConfirmacion}></div>
          <div className="modal-confirmacion">
            <div className="modal-confirmacion-header">
              <h3>{modalConfirmacion.titulo}</h3>
            </div>
            <div className="modal-confirmacion-body">
              <p style={{ whiteSpace: 'pre-line' }}>{modalConfirmacion.mensaje}</p>
            </div>
            <div className="modal-confirmacion-footer">
              <button 
                className="btn-cancelar"
                onClick={cerrarModalConfirmacion}
              >
                ✕ Cancelar
              </button>
              <button 
                className="btn-confirmar"
                onClick={confirmarAccion}
              >
                ✓ Confirmar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EliminarOCS;