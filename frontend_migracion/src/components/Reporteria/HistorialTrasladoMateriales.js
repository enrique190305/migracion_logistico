import React, { useState, useEffect } from 'react';
import './HistorialComun.css';
import * as XLSX from 'xlsx';

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
  const [modalDetalles, setModalDetalles] = useState(false);
  const [detallesTraslado, setDetallesTraslado] = useState(null);

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

  const verDetalles = async (traslado) => {
    try {
      setModalDetalles(true);
      setDetallesTraslado(traslado);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      showToast('Error al cargar los detalles del traslado', 'error');
    }
  };

  const cerrarModal = () => {
    setModalDetalles(false);
    setDetallesTraslado(null);
  };

  // Exportación GENERAL de todos los registros filtrados
  const exportarExcelGeneral = () => {
    try {
      // Validar que haya datos para exportar
      if (!trasladosFiltrados || trasladosFiltrados.length === 0) {
        showToast('⚠️ No hay datos para exportar', 'warning');
        return;
      }

      // Preparar los datos para Excel
      const fechaActual = new Date().toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const data = [
        ['HISTORIAL DE TRASLADO DE MATERIALES'],
        ['Fecha de generación:', fechaActual],
        ['Total de registros:', trasladosFiltrados.length],
        [],
        ['N°', 'CORRELATIVO', 'FECHA', 'PROYECTO ORIGEN', 'PROYECTO DESTINO', 'TOTAL PRODUCTOS', 'USUARIO', 'OBSERVACIONES']
      ];

      trasladosFiltrados.forEach((traslado, index) => {
        data.push([
          index + 1,
          traslado.correlativo || 'N/A',
          traslado.fecha_traslado 
            ? new Date(traslado.fecha_traslado).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : 'N/A',
          traslado.proyecto_origen || 'N/A',
          traslado.proyecto_destino || 'N/A',
          traslado.total_productos || 0,
          traslado.usuario || 'Sistema',
          traslado.observaciones || 'Sin observaciones'
        ]);
      });

      // Agregar totales
      data.push([]);
      data.push([
        '',
        'TOTAL GENERAL',
        '',
        '',
        '',
        trasladosFiltrados.reduce((sum, t) => sum + (parseInt(t.total_productos) || 0), 0),
        '',
        ''
      ]);

      // Crear el libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Configurar anchos de columna
      ws['!cols'] = [
        { wch: 5 },   // N°
        { wch: 15 },  // Correlativo
        { wch: 12 },  // Fecha
        { wch: 25 },  // Proyecto Origen
        { wch: 25 },  // Proyecto Destino
        { wch: 15 },  // Total Productos
        { wch: 20 },  // Usuario
        { wch: 40 }   // Observaciones
      ];

      // Combinar celdas del título
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      ];

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Traslados');

      // Generar el archivo con nombre descriptivo
      const fechaArchivo = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Historial_Traslado_Materiales_${fechaArchivo}.xlsx`;
      
      // Descargar el archivo
      XLSX.writeFile(wb, nombreArchivo);

      showToast(`✅ Excel generado exitosamente: ${trasladosFiltrados.length} registros`, 'success');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      showToast('❌ Error al generar el archivo Excel', 'error');
    }
  };

  // Exportación INDIVIDUAL de un traslado específico
  const exportarTrasladoIndividual = async (traslado) => {
    try {
      const wb = XLSX.utils.book_new();
      
      const fechaTraslado = new Date(traslado.fecha_traslado).toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      
      const fechaGeneracion = new Date().toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const wsData = [
        [`TRASLADO DE MATERIAL - ${traslado.correlativo}`],
        [`Fecha de traslado: ${fechaTraslado}`],
        [`Generado: ${fechaGeneracion}`],
        [],
        ['INFORMACIÓN DEL TRASLADO'],
        ['Correlativo:', traslado.correlativo || 'N/A'],
        ['Fecha:', fechaTraslado],
        ['Proyecto Origen:', traslado.proyecto_origen || 'N/A'],
        ['Proyecto Destino:', traslado.proyecto_destino || 'N/A'],
        ['Total Productos:', traslado.total_productos || 0],
        ['Usuario:', traslado.usuario || 'Sistema'],
        ['Observaciones:', traslado.observaciones || 'Sin observaciones']
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws['!cols'] = [
        { wch: 20 },
        { wch: 50 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, `Traslado-${traslado.correlativo}`);

      XLSX.writeFile(wb, `Traslado_${traslado.correlativo}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast(`✅ Excel generado: ${traslado.correlativo}`, 'success');
    } catch (error) {
      console.error('Error al exportar traslado:', error);
      showToast('❌ Error al exportar el traslado', 'error');
    }
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

        <button 
          className="btn-recargar" 
          onClick={exportarExcelGeneral}
          disabled={trasladosFiltrados.length === 0}
          style={{ 
            background: trasladosFiltrados.length === 0 ? '#95a5a6' : '#10b981',
            cursor: trasladosFiltrados.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          📊 Exportar Excel
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
                        onClick={() => exportarTrasladoIndividual(traslado)}
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
                        📊 Excel
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

      {/* Modal de Detalles */}
      {modalDetalles && detallesTraslado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <h2>🔄 Detalles del Traslado de Material</h2>
              <button className="modal-close-btn" onClick={cerrarModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-seccion">
                <h3>📋 Información General</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Correlativo:</span>
                    <span className="detalle-valor">{detallesTraslado.correlativo || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha de Traslado:</span>
                    <span className="detalle-valor">{detallesTraslado.fecha_traslado || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Total de Productos:</span>
                    <span className="detalle-valor badge-productos">{detallesTraslado.total_productos || 0}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Usuario:</span>
                    <span className="detalle-valor">{detallesTraslado.usuario || 'Sistema'}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>📍 Información de Origen y Destino</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">🏪 Bodega Origen:</span>
                    <span className="detalle-valor" style={{ borderLeftColor: '#e74c3c' }}>
                      {detallesTraslado.proyecto_origen || 'N/A'}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">🏪 Bodega Destino:</span>
                    <span className="detalle-valor" style={{ borderLeftColor: '#27ae60' }}>
                      {detallesTraslado.proyecto_destino || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {detallesTraslado.observaciones && (
                <div className="detalle-seccion">
                  <h3>📝 Observaciones</h3>
                  <div className="detalle-observaciones">
                    {detallesTraslado.observaciones}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cerrar" onClick={cerrarModal}>
                Cerrar
              </button>
              <button 
                className="btn-modal-pdf" 
                onClick={() => {
                  descargarPDF(detallesTraslado.id_traslado);
                  cerrarModal();
                }}
              >
                📄 Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialTrasladoMateriales;
