import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

const HistorialIngresoMateriales = () => {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/ingreso-materiales/historial', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      setIngresos(result.data || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setIngresos([]);
    } finally {
      setLoading(false);
    }
  };

  const ingresosFiltrados = ingresos.filter(ingreso => {
    if (busqueda === '') return true;
    
    return ingreso.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
           ingreso.proyecto?.toLowerCase().includes(busqueda.toLowerCase()) ||
           ingreso.bodega?.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h3>📥 Historial de Ingreso de Materiales</h3>
        <p>Consulta todos los ingresos de materiales registrados</p>
      </div>

      {/* Filtros */}
      <div className="historial-filtros">
        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Buscar por correlativo, proyecto o bodega..."
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
        ) : ingresosFiltrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No se encontraron registros</p>
          </div>
        ) : (
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>Correlativo</th>
                <th>Proyecto</th>
                <th>Bodega</th>
                <th>Fecha Ingreso</th>
                <th>Productos</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {ingresosFiltrados.map((ingreso, index) => (
                <tr key={ingreso.id || index}>
                  <td><strong>{ingreso.correlativo || 'N/A'}</strong></td>
                  <td>{ingreso.proyecto || 'N/A'}</td>
                  <td>{ingreso.bodega || 'N/A'}</td>
                  <td>{ingreso.fecha_ingreso ? new Date(ingreso.fecha_ingreso).toLocaleDateString('es-PE') : 'N/A'}</td>
                  <td className="text-center">{ingreso.total_productos || 0}</td>
                  <td>{ingreso.usuario || 'Sistema'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="historial-footer">
        <p>Total de registros: <strong>{ingresosFiltrados.length}</strong></p>
      </div>
    </div>
  );
};

export default HistorialIngresoMateriales;
