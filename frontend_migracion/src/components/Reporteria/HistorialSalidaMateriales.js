import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

const HistorialSalidaMateriales = () => {
  const [salidas, setSalidas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroTipoSalida, setFiltroTipoSalida] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      
      // Cargar salidas
      const salidasRes = await fetch('http://localhost:8000/api/salida-materiales/historial');
      const salidasData = await salidasRes.json();
      
      // Validar que sea array
      const salidasArray = Array.isArray(salidasData) ? salidasData : (salidasData.data || []);
      setSalidas(Array.isArray(salidasArray) ? salidasArray : []);
      
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
      setSalidas([]);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  const salidasFiltradas = Array.isArray(salidas) ? salidas.filter(salida => {
    const cumpleFiltroTipo = filtroTipoSalida === 'TODOS' || salida.tipo_salida === filtroTipoSalida;
    const cumpleFiltroProyecto = !filtroProyecto || salida.id_proyecto === parseInt(filtroProyecto);
    const cumpleFechaInicio = !fechaInicio || salida.fecha_salida >= fechaInicio;
    const cumpleFechaFin = !fechaFin || salida.fecha_salida <= fechaFin;
    const cumpleBusqueda = busqueda === '' || 
      salida.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      salida.proyecto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      salida.motivo?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroTipo && cumpleFiltroProyecto && cumpleFechaInicio && cumpleFechaFin && cumpleBusqueda;
  }) : [];

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroProyecto('');
    setFiltroTipoSalida('TODOS');
    setFechaInicio('');
    setFechaFin('');
  };

  const verDetalles = (salida) => {
    alert(`📤 DETALLES DE SALIDA\n\nCorrelativo: ${salida.correlativo}\nProyecto: ${salida.proyecto}\nMotivo: ${salida.motivo}\nFecha: ${new Date(salida.fecha_salida).toLocaleDateString('es-PE')}\nProductos: ${salida.total_productos}\n\n(Modal de detalles en desarrollo)`);
  };

  const descargarPDF = async (numeroSalida) => {
    try {
      const response = await fetch(`http://localhost:8000/api/salida-materiales/pdf/${numeroSalida}`);
      if (!response.ok) throw new Error('Error al generar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Salida_${numeroSalida}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const exportarExcel = () => {
    alert('📊 Exportación a Excel en desarrollo');
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h3>📤 Historial de Salida de Materiales</h3>
        <p>Consulta todas las salidas de materiales registradas</p>
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
          <label>🏗️ Proyecto:</label>
          <select 
            value={filtroProyecto} 
            onChange={(e) => setFiltroProyecto(e.target.value)}
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
          <label>📦 Tipo de Salida:</label>
          <select 
            value={filtroTipoSalida} 
            onChange={(e) => setFiltroTipoSalida(e.target.value)}
            className="select-filtro"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="CONSUMO">Consumo</option>
            <option value="DEVOLUCION">Devolución</option>
            <option value="TRASLADO">Traslado</option>
            <option value="AJUSTE">Ajuste</option>
            <option value="MERMA">Merma</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Correlativo, proyecto, motivo..."
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
                <th>Fecha</th>
                <th>Proyecto</th>
                <th>Tipo Salida</th>
                <th>Motivo</th>
                <th className="text-center">Productos</th>
                <th>Usuario</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {salidasFiltradas.map((salida, index) => (
                <tr key={salida.id || index}>
                  <td><strong>{salida.correlativo || 'N/A'}</strong></td>
                  <td>{salida.fecha_salida ? new Date(salida.fecha_salida).toLocaleDateString('es-PE') : 'N/A'}</td>
                  <td>{salida.proyecto || 'N/A'}</td>
                  <td>
                    <span 
                      className="badge-estado" 
                      style={{backgroundColor: '#f59e0b'}}
                    >
                      {salida.tipo_salida || 'CONSUMO'}
                    </span>
                  </td>
                  <td>{salida.motivo || 'N/A'}</td>
                  <td className="text-center"><strong>{salida.total_productos || 0}</strong></td>
                  <td>{salida.usuario || 'Sistema'}</td>
                  <td className="text-center">
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => verDetalles(salida)}
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
                        onClick={() => descargarPDF(salida.numero_salida || salida.correlativo)}
                        style={{
                          padding: '5px 10px',
                          background: '#ef4444',
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
          Mostrando <strong>{salidasFiltradas.length}</strong> de <strong>{salidas.length}</strong> salidas de materiales
        </p>
        <p>
          Total de productos: <strong>{salidasFiltradas.reduce((sum, s) => sum + (parseInt(s.total_productos) || 0), 0)}</strong>
        </p>
      </div>
    </div>
  );
};

export default HistorialSalidaMateriales;
