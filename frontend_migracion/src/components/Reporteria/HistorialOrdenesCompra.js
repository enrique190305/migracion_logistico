import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

const HistorialOrdenesCompra = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/ordenes/compra', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      setOrdenes(result.data || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const cumpleFiltroEstado = filtroEstado === 'TODOS' || orden.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      orden.correlativo.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.proveedor?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.empresa?.razon_social.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  const obtenerColorEstado = (estado) => {
    switch(estado) {
      case 'PENDIENTE': return '#f39c12';
      case 'APROBADO': return '#27ae60';
      case 'RECHAZADO': return '#e74c3c';
      case 'ANULADO': return '#95a5a6';
      default: return '#34495e';
    }
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h3>🛒 Historial de Órdenes de Compra</h3>
        <p>Consulta todas las órdenes de compra registradas en el sistema</p>
      </div>

      {/* Filtros */}
      <div className="historial-filtros">
        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Buscar por correlativo, proveedor o empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>

        <div className="filtro-grupo">
          <label>📊 Estado:</label>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="select-filtro"
          >
            <option value="TODOS">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="ANULADO">Anulado</option>
          </select>
        </div>

        <button className="btn-recargar" onClick={cargarHistorial}>
          🔄 Recargar
        </button>
      </div>

      {/* Tabla */}
      <div className="historial-tabla-wrapper">
        {loading ? (
          <div className="loading-state">
            <span className="loading-icon">⏳</span>
            <p>Cargando historial...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No se encontraron registros</p>
          </div>
        ) : (
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>Correlativo</th>
                <th>Empresa</th>
                <th>Proveedor</th>
                <th>Fecha Emisión</th>
                <th>Total General</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map(orden => (
                <tr key={orden.id}>
                  <td><strong>{orden.correlativo}</strong></td>
                  <td>{orden.empresa?.razon_social || 'N/A'}</td>
                  <td>{orden.proveedor?.nombre || 'N/A'}</td>
                  <td>{new Date(orden.fecha_emision).toLocaleDateString('es-PE')}</td>
                  <td className="text-right">S/ {parseFloat(orden.total_general || 0).toFixed(2)}</td>
                  <td>
                    <span 
                      className="badge-estado" 
                      style={{backgroundColor: obtenerColorEstado(orden.estado)}}
                    >
                      {orden.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="historial-footer">
        <p>Total de registros: <strong>{ordenesFiltradas.length}</strong></p>
      </div>
    </div>
  );
};

export default HistorialOrdenesCompra;
