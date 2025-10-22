import React, { useState } from 'react';
import './EliminarOCS.css';

const EliminarOCS = () => {
  const [tipoOrden, setTipoOrden] = useState('OC');
  const [razonSocial, setRazonSocial] = useState('');
  const [correlativo, setCorrelativo] = useState('');
  const [detallesOrden, setDetallesOrden] = useState([]);

  // Datos estáticos de razones sociales
  const razonesSociales = [
    'EMPRESA CONSTRUCTORA SAC',
    'COMERCIAL RODRIGUEZ EIRL',
    'INVERSIONES PERU SA',
    'SERVICIOS GENERALES SAC',
    'DISTRIBUIDORA NACIONAL SAC',
    'TECNOLOGIA Y SISTEMAS SAC',
    'IMPORTADORA DEL SUR EIRL',
    'LOGISTICA INTEGRAL SAC'
  ];

  // Datos estáticos de órdenes de compra
  const ordenesCompra = {
    'EMPRESA CONSTRUCTORA SAC': [
      { correlativo: 'OC-2024-001', codigo: 'PROD-001', descripcion: 'Cemento Portland', cantidad: 100, unidad: 'Bolsa', precio: 25.50, subtotal: 2550.00, total: 2550.00 },
      { correlativo: 'OC-2024-001', codigo: 'PROD-002', descripcion: 'Fierro 1/2"', cantidad: 50, unidad: 'Varilla', precio: 35.00, subtotal: 1750.00, total: 1750.00 }
    ],
    'COMERCIAL RODRIGUEZ EIRL': [
      { correlativo: 'OC-2024-015', codigo: 'PROD-010', descripcion: 'Laptop HP Core i7', cantidad: 5, unidad: 'Unidad', precio: 2500.00, subtotal: 12500.00, total: 12500.00 },
      { correlativo: 'OC-2024-015', codigo: 'PROD-011', descripcion: 'Mouse Inalámbrico', cantidad: 10, unidad: 'Unidad', precio: 25.00, subtotal: 250.00, total: 250.00 }
    ],
    'INVERSIONES PERU SA': [
      { correlativo: 'OC-2024-023', codigo: 'PROD-020', descripcion: 'Escritorio Ejecutivo', cantidad: 8, unidad: 'Unidad', precio: 450.00, subtotal: 3600.00, total: 3600.00 }
    ]
  };

  // Datos estáticos de órdenes de servicio
  const ordenesServicio = {
    'SERVICIOS GENERALES SAC': [
      { correlativo: 'OS-2024-005', codigo: 'SERV-001', descripcion: 'Mantenimiento de Aires Acondicionados', cantidad: 1, unidad: 'Servicio', precio: 800.00, subtotal: 800.00, total: 800.00 }
    ],
    'TECNOLOGIA Y SISTEMAS SAC': [
      { correlativo: 'OS-2024-012', codigo: 'SERV-010', descripcion: 'Desarrollo de Software', cantidad: 1, unidad: 'Proyecto', precio: 15000.00, subtotal: 15000.00, total: 15000.00 },
      { correlativo: 'OS-2024-012', codigo: 'SERV-011', descripcion: 'Soporte Técnico Mensual', cantidad: 3, unidad: 'Mes', precio: 500.00, subtotal: 1500.00, total: 1500.00 }
    ],
    'LOGISTICA INTEGRAL SAC': [
      { correlativo: 'OS-2024-018', codigo: 'SERV-015', descripcion: 'Transporte de Carga', cantidad: 10, unidad: 'Viaje', precio: 350.00, subtotal: 3500.00, total: 3500.00 }
    ]
  };

  const handleBuscarOrden = () => {
    if (!razonSocial) {
      alert('⚠️ Por favor seleccione una Razón Social');
      return;
    }

    if (!correlativo) {
      alert('⚠️ Por favor seleccione un Correlativo');
      return;
    }

    const ordenes = tipoOrden === 'OC' ? ordenesCompra : ordenesServicio;
    const detalles = ordenes[razonSocial] || [];
    const detallesFiltrados = detalles.filter(item => item.correlativo === correlativo);
    
    setDetallesOrden(detallesFiltrados);

    if (detallesFiltrados.length === 0) {
      alert('ℹ️ No se encontraron detalles para esta orden');
    }
  };

  const handleEliminar = () => {
    if (detallesOrden.length === 0) {
      alert('⚠️ No hay orden seleccionada para eliminar');
      return;
    }

    const tipoTexto = tipoOrden === 'OC' ? 'Orden de Compra' : 'Orden de Servicio';
    const confirmacion = window.confirm(
      `⚠️ ADVERTENCIA\n\n¿Está seguro de eliminar permanentemente la ${tipoTexto} ${correlativo}?\n\nEsta acción NO se puede deshacer.\n\nSe eliminarán ${detallesOrden.length} registro(s).`
    );

    if (confirmacion) {
      alert(`✅ ${tipoTexto} eliminada correctamente\n\nCorrelativo: ${correlativo}\nRazón Social: ${razonSocial}\nRegistros eliminados: ${detallesOrden.length}`);
      handleLimpiar();
    }
  };

  const handleLimpiar = () => {
    setRazonSocial('');
    setCorrelativo('');
    setDetallesOrden([]);
  };

  const getCorrelativos = () => {
    if (!razonSocial) return [];
    
    const ordenes = tipoOrden === 'OC' ? ordenesCompra : ordenesServicio;
    const detalles = ordenes[razonSocial] || [];
    const correlativos = [...new Set(detalles.map(item => item.correlativo))];
    
    return correlativos;
  };

  const calcularTotal = () => {
    return detallesOrden.reduce((sum, item) => sum + item.total, 0).toFixed(2);
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
              />
              <span className="radio-icon">🔧</span>
              Orden de Servicio (OS)
            </label>
          </div>
        </div>

        <div className="form-row">
          <label>🏢 Razón Social:</label>
          <select
            value={razonSocial}
            onChange={(e) => {
              setRazonSocial(e.target.value);
              setCorrelativo('');
              setDetallesOrden([]);
            }}
          >
            <option value="">Seleccione una razón social...</option>
            {razonesSociales.map((razon, index) => (
              <option key={index} value={razon}>{razon}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>🔖 Correlativo:</label>
          <div className="correlativo-row">
            <select
              value={correlativo}
              onChange={(e) => setCorrelativo(e.target.value)}
              disabled={!razonSocial}
            >
              <option value="">Seleccione un correlativo...</option>
              {getCorrelativos().map((corr, index) => (
                <option key={index} value={corr}>{corr}</option>
              ))}
            </select>
            <button 
              className="btn-buscar"
              onClick={handleBuscarOrden}
              disabled={!correlativo}
            >
              🔍 Buscar
            </button>
          </div>
        </div>
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
              {detallesOrden.length > 0 ? (
                detallesOrden.map((detalle, index) => (
                  <tr key={index}>
                    <td><strong>{detalle.codigo}</strong></td>
                    <td>{detalle.descripcion}</td>
                    <td className="text-center">{detalle.cantidad}</td>
                    <td>{detalle.unidad}</td>
                    <td className="text-right">S/ {detalle.precio.toFixed(2)}</td>
                    <td className="text-right">S/ {detalle.subtotal.toFixed(2)}</td>
                    <td className="text-right"><strong>S/ {detalle.total.toFixed(2)}</strong></td>
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
            {detallesOrden.length > 0 && (
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
          disabled={detallesOrden.length === 0}
        >
          <span>🗑️</span> ELIMINAR
        </button>
      </div>
    </div>
  );
};

export default EliminarOCS;