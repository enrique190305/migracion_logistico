import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

const HistorialIngresoMateriales = () => {
  const [ingresos, setIngresos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      
      // Cargar ingresos (combinar los 3 tipos de historial)
      try {
        const [ingresosRes, serviciosRes, directosRes] = await Promise.all([
          fetch('http://localhost:8000/api/ingreso-materiales/historial-ingresos'),
          fetch('http://localhost:8000/api/ingreso-materiales/historial-servicios'),
          fetch('http://localhost:8000/api/ingreso-materiales/historial-directos')
        ]);
        
        const ingresosData = await ingresosRes.json();
        const serviciosData = await serviciosRes.json();
        const directosData = await directosRes.json();
        
        // Combinar todos los ingresos
        const todosIngresos = [
          ...(Array.isArray(ingresosData) ? ingresosData : ingresosData.data || []),
          ...(Array.isArray(serviciosData) ? serviciosData : serviciosData.data || []),
          ...(Array.isArray(directosData) ? directosData : directosData.data || [])
        ];
        
        setIngresos(todosIngresos);
      } catch (err) {
        console.error('Error al cargar ingresos:', err);
        setIngresos([]);
      }
      
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
      setIngresos([]);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  const ingresosFiltrados = Array.isArray(ingresos) ? ingresos.filter(ingreso => {
    const cumpleFiltroTipo = filtroTipo === 'TODOS' || ingreso.tipo_ingreso === filtroTipo;
    const cumpleFiltroProyecto = !filtroProyecto || ingreso.id_proyecto === parseInt(filtroProyecto);
    const cumpleFechaInicio = !fechaInicio || ingreso.fecha_ingreso >= fechaInicio;
    const cumpleFechaFin = !fechaFin || ingreso.fecha_ingreso <= fechaFin;
    const cumpleBusqueda = busqueda === '' || 
      ingreso.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ingreso.proyecto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ingreso.bodega?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroTipo && cumpleFiltroProyecto && cumpleFechaInicio && cumpleFechaFin && cumpleBusqueda;
  }) : [];

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroProyecto('');
    setFiltroTipo('TODOS');
    setFechaInicio('');
    setFechaFin('');
  };

  const verDetalles = (ingreso) => {
    alert(`📥 DETALLES DE INGRESO\n\nCorrelativo: ${ingreso.correlativo}\nProyecto: ${ingreso.proyecto}\nBodega: ${ingreso.bodega}\nFecha: ${new Date(ingreso.fecha_ingreso).toLocaleDateString('es-PE')}\nProductos: ${ingreso.total_productos}\n\n(Modal de detalles en desarrollo)`);
  };

  const descargarPDF = async (idIngreso) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ingreso-materiales/${idIngreso}/pdf`);
      if (!response.ok) throw new Error('Error al generar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ingreso_Material_${idIngreso}.pdf`;
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
        <h3>📥 Historial de Ingreso de Materiales</h3>
        <p>Consulta todos los ingresos de materiales registrados</p>
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
          <label>📦 Tipo:</label>
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="select-filtro"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="COMPRA">Compra</option>
            <option value="TRASLADO">Traslado</option>
            <option value="DEVOLUCION">Devolución</option>
            <option value="AJUSTE">Ajuste</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Correlativo, proyecto, bodega..."
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
                <th>Fecha</th>
                <th>Proyecto</th>
                <th>Bodega</th>
                <th>Tipo</th>
                <th className="text-center">Productos</th>
                <th>Usuario</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingresosFiltrados.map((ingreso, index) => (
                <tr key={ingreso.id || index}>
                  <td><strong>{ingreso.correlativo || 'N/A'}</strong></td>
                  <td>{ingreso.fecha_ingreso ? new Date(ingreso.fecha_ingreso).toLocaleDateString('es-PE') : 'N/A'}</td>
                  <td>{ingreso.proyecto || 'N/A'}</td>
                  <td>{ingreso.bodega || 'N/A'}</td>
                  <td>
                    <span 
                      className="badge-estado" 
                      style={{backgroundColor: '#3498db'}}
                    >
                      {ingreso.tipo_ingreso || 'COMPRA'}
                    </span>
                  </td>
                  <td className="text-center"><strong>{ingreso.total_productos || 0}</strong></td>
                  <td>{ingreso.usuario || 'Sistema'}</td>
                  <td className="text-center">
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => verDetalles(ingreso)}
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
                        onClick={() => descargarPDF(ingreso.id_ingreso)}
                        style={{
                          padding: '5px 10px',
                          background: '#3498db',
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
          Mostrando <strong>{ingresosFiltrados.length}</strong> de <strong>{ingresos.length}</strong> ingresos de materiales
        </p>
        <p>
          Total de productos: <strong>{ingresosFiltrados.reduce((sum, i) => sum + (parseInt(i.total_productos) || 0), 0)}</strong>
        </p>
      </div>
    </div>
  );
};

export default HistorialIngresoMateriales;
