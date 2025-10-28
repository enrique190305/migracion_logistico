import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

const HistorialSalidaMateriales = () => {
  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/salida-materiales/historial', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      setSalidas(result.data || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setSalidas([]);
    } finally {
      setLoading(false);
    }
  };

  const salidasFiltradas = salidas.filter(salida => {
    if (busqueda === '') return true;
    
    return salida.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
           salida.proyecto?.toLowerCase().includes(busqueda.toLowerCase()) ||
           salida.motivo?.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h3>📤 Historial de Salida de Materiales</h3>
        <p>Consulta todas las salidas de materiales registradas</p>
      </div>

      {/* Filtros */}
      <div className="historial-filtros">
        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Buscar por correlativo, proyecto o motivo..."
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
        ) : salidasFiltradas.length === 0 ? (
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
                <th>Motivo</th>
                <th>Fecha Salida</th>
                <th>Productos</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {salidasFiltradas.map((salida, index) => (
                <tr key={salida.id || index}>
                  <td><strong>{salida.correlativo || 'N/A'}</strong></td>
                  <td>{salida.proyecto || 'N/A'}</td>
                  <td>{salida.motivo || 'N/A'}</td>
                  <td>{salida.fecha_salida ? new Date(salida.fecha_salida).toLocaleDateString('es-PE') : 'N/A'}</td>
                  <td className="text-center">{salida.total_productos || 0}</td>
                  <td>{salida.usuario || 'Sistema'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="historial-footer">
        <p>Total de registros: <strong>{salidasFiltradas.length}</strong></p>
      </div>
    </div>
  );
};

export default HistorialSalidaMateriales;
