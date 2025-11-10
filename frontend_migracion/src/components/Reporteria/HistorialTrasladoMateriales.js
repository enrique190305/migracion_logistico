import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

// ============================================
// COMPONENTE: Toast Notification
// ============================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`toast-historial toast-historial-${type}`}>
      <span className="toast-historial-icon">{icons[type]}</span>
      <span className="toast-historial-message">{message}</span>
      <button className="toast-historial-close" onClick={onClose}>×</button>
    </div>
  );
};

const HistorialTrasladoMateriales = () => {
  const [traslados, setTraslados] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroProyectoOrigen, setFiltroProyectoOrigen] = useState('');
  const [filtroProyectoDestino, setFiltroProyectoDestino] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      
      // Cargar traslados
      const trasladosRes = await fetch('http://localhost:8000/api/traslado-materiales/historial');
      const trasladosData = await trasladosRes.json();
      
      // Validar que sea array
      const trasladosArray = Array.isArray(trasladosData) ? trasladosData : (trasladosData.data || []);
      setTraslados(Array.isArray(trasladosArray) ? trasladosArray : []);
      
      // Intentar cargar proyectos (opcional)
      try {
        const proyectosRes = await fetch('http://localhost:8000/api/proyectos/lista');
        const proyectosData = await proyectosRes.json();
        const proyectosArray = Array.isArray(proyectosData) ? proyectosData : (proyectosData.data || []);
        setProyectos(Array.isArray(proyectosArray) ? proyectosArray : []);
      } catch (err) {
        console.warn('No se pudieron cargar proyectos:', err);
        setProyectos([]);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setTraslados([]);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  const trasladosFiltrados = Array.isArray(traslados) ? traslados.filter(traslado => {
    const cumpleFiltroOrigen = !filtroProyectoOrigen || traslado.id_proyecto_origen === parseInt(filtroProyectoOrigen);
    const cumpleFiltroDestino = !filtroProyectoDestino || traslado.id_proyecto_destino === parseInt(filtroProyectoDestino);
    const cumpleFechaInicio = !fechaInicio || traslado.fecha_traslado >= fechaInicio;
    const cumpleFechaFin = !fechaFin || traslado.fecha_traslado <= fechaFin;
    const cumpleBusqueda = busqueda === '' || 
      traslado.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      traslado.proyecto_origen?.toLowerCase().includes(busqueda.toLowerCase()) ||
      traslado.proyecto_destino?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroOrigen && cumpleFiltroDestino && cumpleFechaInicio && cumpleFechaFin && cumpleBusqueda;
  }) : [];

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroProyectoOrigen('');
    setFiltroProyectoDestino('');
    setFechaInicio('');
    setFechaFin('');
  };

  const descargarPDF = async (idTraslado) => {
    try {
      const response = await fetch(`http://localhost:8000/api/traslado-materiales/${idTraslado}/pdf`);
      if (!response.ok) throw new Error('Error al generar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Traslado_${idTraslado}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showToast('Error al descargar el PDF', 'error');
    }
  };

  const verDetalles = (traslado) => {
    showToast(`🔄 DETALLES DE TRASLADO\n\nCorrelativo: ${traslado.correlativo}\nOrigen: ${traslado.proyecto_origen}\nDestino: ${traslado.proyecto_destino}\nFecha: ${new Date(traslado.fecha_traslado).toLocaleDateString('es-PE')}\nProductos: ${traslado.total_productos}\n\n(Modal de detalles en desarrollo)`, 'info');
  };

  const exportarExcel = () => {
    showToast('📊 Exportación a Excel en desarrollo', 'warning');
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h3>🔄 Historial de Traslado de Materiales</h3>
        <p>Consulta todos los traslados de materiales entre proyectos</p>
      </div>

      {/* Filtros */}
      <div className="historial-filtros">
        <div className="filtro-grupo">
          <label>� Fecha Inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="input-busqueda"
          />
        </div>

        <div className="filtro-grupo">
          <label>📅 Fecha Fin:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="input-busqueda"
          />
        </div>

        <div className="filtro-grupo">
          <label>📤 Proyecto Origen:</label>
          <select 
            value={filtroProyectoOrigen} 
            onChange={(e) => setFiltroProyectoOrigen(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos los proyectos</option>
            {Array.isArray(proyectos) && proyectos.map(proy => (
              <option key={proy.id_proyecto || proy.id} value={proy.id_proyecto || proy.id}>
                {proy.nombre_proyecto || proy.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>📥 Proyecto Destino:</label>
          <select 
            value={filtroProyectoDestino} 
            onChange={(e) => setFiltroProyectoDestino(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos los proyectos</option>
            {Array.isArray(proyectos) && proyectos.map(proy => (
              <option key={proy.id_proyecto || proy.id} value={proy.id_proyecto || proy.id}>
                {proy.nombre_proyecto || proy.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Correlativo, proyecto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>

        <button className="btn-recargar" onClick={limpiarFiltros}>
          🧹 Limpiar
        </button>

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
                <th>Fecha</th>
                <th>Proyecto Origen</th>
                <th>Proyecto Destino</th>
                <th className="text-center">Productos</th>
                <th>Usuario</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trasladosFiltrados.map((traslado, index) => (
                <tr key={traslado.id || index}>
                  <td><strong>{traslado.correlativo || 'N/A'}</strong></td>
                  <td>{traslado.fecha_traslado ? new Date(traslado.fecha_traslado).toLocaleDateString('es-PE') : 'N/A'}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      📤 {traslado.proyecto_origen || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      📥 {traslado.proyecto_destino || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center"><strong>{traslado.total_productos || 0}</strong></td>
                  <td>{traslado.usuario || 'Sistema'}</td>
                  <td className="text-center">
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => verDetalles(traslado)}
                        style={{
                          padding: '5px 10px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        title="Ver detalles"
                      >
                        👁️ Ver
                      </button>
                      <button
                        onClick={() => descargarPDF(traslado.id)}
                        style={{
                          padding: '5px 10px',
                          background: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        title="Descargar PDF"
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => exportarExcel()}
                        style={{
                          padding: '5px 10px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        title="Exportar a Excel"
                      >
                        � Excel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="historial-footer">
        <p>
          Mostrando <strong>{trasladosFiltrados.length}</strong> de <strong>{traslados.length}</strong> traslados de materiales
        </p>
        <p>
          Total de productos trasladados: <strong>{trasladosFiltrados.reduce((sum, t) => sum + (parseInt(t.total_productos) || 0), 0)}</strong>
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
    </div>
  );
};

export default HistorialTrasladoMateriales;
