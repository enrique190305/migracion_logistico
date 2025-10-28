import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

const HistorialTrasladoMateriales = () => {
  const [traslados, setTraslados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/traslado-materiales/historial', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      setTraslados(result.data || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setTraslados([]);
    } finally {
      setLoading(false);
    }
  };

  const trasladosFiltrados = traslados.filter(traslado => {
    if (busqueda === '') return true;
    
    return traslado.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
           traslado.proyecto_origen?.toLowerCase().includes(busqueda.toLowerCase()) ||
           traslado.proyecto_destino?.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h3>🔄 Historial de Traslado de Materiales</h3>
        <p>Consulta todos los traslados de materiales entre proyectos</p>
      </div>

      {/* Filtros */}
      <div className="historial-filtros">
        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Buscar por correlativo, proyecto origen o destino..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
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
        ) : trasladosFiltrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No se encontraron registros</p>
          </div>
        ) : (
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>Correlativo</th>
                <th>Proyecto Origen</th>
                <th>Proyecto Destino</th>
                <th>Fecha Traslado</th>
                <th>Productos</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {trasladosFiltrados.map((traslado, index) => (
                <tr key={traslado.id || index}>
                  <td><strong>{traslado.correlativo || 'N/A'}</strong></td>
                  <td>{traslado.proyecto_origen || 'N/A'}</td>
                  <td>{traslado.proyecto_destino || 'N/A'}</td>
                  <td>{traslado.fecha_traslado ? new Date(traslado.fecha_traslado).toLocaleDateString('es-PE') : 'N/A'}</td>
                  <td className="text-center">{traslado.total_productos || 0}</td>
                  <td>{traslado.usuario || 'Sistema'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="historial-footer">
        <p>Total de registros: <strong>{trasladosFiltrados.length}</strong></p>
      </div>
    </div>
  );
};

export default HistorialTrasladoMateriales;
