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
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState(null);

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
    
    try {
      const data = tipoOrden === 'OC' 
        ? await listarOrdenesCompra() 
        : await listarOrdenesServicio();
      
      console.log('📋 Órdenes cargadas:', data);
      setOrdenes(data);
      
      if (data.length === 0) {
        setError(`No hay ${tipoOrden === 'OC' ? 'Órdenes de Compra' : 'Órdenes de Servicio'} registradas`);
      }
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('Error al cargar las órdenes. Verifique la conexión con el servidor.');
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener razones sociales únicas de las órdenes
   */
  const getRazonesSociales = () => {
    if (!ordenes || ordenes.length === 0) return [];
    
    // Extraer proveedores únicos
    const proveedoresUnicos = [...new Map(
      ordenes.map(orden => [
        orden.proveedor?.id, 
        orden.proveedor?.nombre
      ])
    ).values()];
    
    return proveedoresUnicos.filter(nombre => nombre);
  };

  /**
   * Obtener correlativos por razón social
   */
  const getCorrelativos = (razonSocial) => {
    if (!razonSocial || !ordenes) return [];
    
    return ordenes
      .filter(orden => orden.proveedor?.nombre === razonSocial)
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
      alert('⚠️ Por favor seleccione una orden');
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
      } else {
        setDetallesOrden([]);
        alert('ℹ️ No se encontraron detalles para esta orden');
      }
    } catch (err) {
      console.error('Error al buscar orden:', err);
      setError('Error al cargar el detalle de la orden');
      setDetallesOrden([]);
      alert('❌ Error al cargar el detalle de la orden');
    } finally {
      setLoadingDetalle(false);
    }
  };

  /**
   * Eliminar orden
   */
  const handleEliminar = async () => {
    if (!ordenSeleccionada || detallesOrden.length === 0) {
      alert('⚠️ No hay orden seleccionada para eliminar');
      return;
    }

    const tipoTexto = tipoOrden === 'OC' ? 'Orden de Compra' : 'Orden de Servicio';
    const confirmacion = window.confirm(
      `⚠️ ADVERTENCIA\n\n¿Está seguro de eliminar permanentemente la ${tipoTexto} ${correlativoSeleccionado}?\n\nEsta acción NO se puede deshacer.\n\nSe eliminarán ${detallesOrden.length} registro(s).`
    );

    if (!confirmacion) return;

    setLoading(true);
    setError(null);

    try {
      const result = tipoOrden === 'OC'
        ? await eliminarOrdenCompra(ordenSeleccionada.id)
        : await eliminarOrdenServicio(ordenSeleccionada.id);

      console.log('✅ Eliminación exitosa:', result);

      alert(`✅ ${tipoTexto} eliminada correctamente\n\nCorrelativo: ${correlativoSeleccionado}\nRegistros eliminados: ${result.detalles_eliminados || detallesOrden.length}`);
      
      // Recargar lista y limpiar formulario
      handleLimpiar();
      await cargarOrdenes();
      
    } catch (err) {
      console.error('Error al eliminar orden:', err);
      const mensajeError = err.message || 'Error al eliminar la orden';
      setError(mensajeError);
      alert(`❌ ${mensajeError}`);
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
    setError(null);
  };

  /**
   * Calcular total general
   */
  const calcularTotal = () => {
    return detallesOrden.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2);
  };

  return (
    <div className="eliminar-ocs-container">
      {/* Header */}
      <div className="eliminar-ocs-header">
        <div className="header-icon-title">
          <span className="header-icon">🗑️</span>
          <h1>ELIMINAR ÓRDENES DE COMPRA Y SERVICIOS</h1>
        </div>
      </div>

      {/* Advertencia */}
      <div className="advertencia-box">
        <span className="advertencia-icon">⚠️</span>
        <p>
          <strong>ADVERTENCIA:</strong> Esta acción eliminará permanentemente la orden y todos sus datos relacionados. 
          Esta operación <strong>NO</strong> se puede deshacer.
        </p>
      </div>

      {/* Mensaje de error general */}
      {error && (
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
                    <td><strong>{detalle.codigo}</strong></td>
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
                  <td colSpan="6" className="text-right"><strong>TOTAL GENERAL:</strong></td>
                  <td className="text-right total-general"><strong>S/ {calcularTotal()}</strong></td>
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
          disabled={detallesOrden.length === 0 || loading || loadingDetalle}
        >
          <span>🗑️</span> {loading ? 'ELIMINANDO...' : 'ELIMINAR'}
        </button>
      </div>
    </div>
  );
};

export default EliminarOCS;