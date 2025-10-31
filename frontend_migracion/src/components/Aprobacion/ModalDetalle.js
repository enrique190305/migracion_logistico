import React from 'react';
import './ModalDetalle.css';

const ModalDetalle = ({ 
  selectedOrden, 
  detallesOrden, 
  loadingDetalles, 
  onClose, 
  onAprobar, 
  onRechazar,
  formatCurrency,
  calcularTotalDetalles 
}) => {
  if (!selectedOrden) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">📋</span>
            <h2>Detalle de la Orden: {selectedOrden.numero_orden} - {selectedOrden.tipo_orden}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loadingDetalles ? (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Cargando detalles...</p>
            </div>
          ) : detallesOrden && detallesOrden.length > 0 ? (
            <>
              <div className="detalle-info-header">
                <div className="info-badge">
                  <span className="badge-icon">📦</span>
                  <span className="badge-text">{detallesOrden.length} Producto{detallesOrden.length > 1 ? 's' : ''}</span>
                </div>
                <div className="info-badge">
                  <span className="badge-icon">💰</span>
                  <span className="badge-text">Moneda: {selectedOrden.moneda}</span>
                </div>
              </div>

              <div className="detalle-items">
                <table className="detalle-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Unidad</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesOrden.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.codigo_producto || item.codigo_servicio}</td>
                        <td>{item.descripcion}</td>
                        <td>{item.unidad}</td>
                        <td>{parseFloat(item.cantidad).toFixed(2)}</td>
                        <td>{formatCurrency(item.precio_unitario, selectedOrden.moneda)}</td>
                        <td>{formatCurrency(item.subtotal, selectedOrden.moneda)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="detalle-total-row">
                      <td colSpan="5" className="detalle-total-label">
                        TOTAL GENERAL:
                      </td>
                      <td className="detalle-total-value">
                        {formatCurrency(calcularTotalDetalles(), selectedOrden.moneda)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          ) : (
            <div className="modal-loading">
              <p>No hay detalles disponibles para esta orden</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <h3 className="actions-title">
            <span className="actions-icon">⚡</span>
            Acciones de Verificación
          </h3>
          <div className="action-buttons">
            <button className="btn-confirmar" onClick={onAprobar}>
              ✅ Confirmar/Aprobar
            </button>
            <button className="btn-rechazar" onClick={onRechazar}>
              ✕ Rechazar
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="modal-footer-info">
          <span className="footer-icon">📊</span>
          Sistema de verificación activo | Órdenes cargadas: 3 | Última actualización: {new Date().toLocaleString('es-PE')}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalle;