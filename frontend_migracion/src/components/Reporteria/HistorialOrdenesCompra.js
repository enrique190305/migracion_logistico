import React, { useState, useEffect } from 'react';
import './HistorialComun.css';

const HistorialOrdenesCompra = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo - usando endpoint de historial que incluye ANULADO
      const [ordenesRes, provRes, empRes] = await Promise.all([
        fetch('http://localhost:8000/api/ordenes/compra/historial'),
        fetch('http://localhost:8000/api/ordenes/proveedores'),
        fetch('http://localhost:8000/api/ordenes/empresas')
      ]);
      
      const ordenesData = await ordenesRes.json();
      const provData = await provRes.json();
      const empData = await empRes.json();
      
      setOrdenes(ordenesData.data || []);
      setProveedores(provData || []);
      setEmpresas(empData || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setOrdenes([]);
      setProveedores([]);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const cumpleFiltroEstado = filtroEstado === 'TODOS' || orden.estado === filtroEstado;
    const cumpleFiltroProv = !filtroProveedor || orden.proveedor?.id === parseInt(filtroProveedor);
    const cumpleFiltroEmp = !filtroEmpresa || orden.empresa?.id === parseInt(filtroEmpresa);
    const cumpleFechaInicio = !fechaInicio || orden.fecha_emision >= fechaInicio;
    const cumpleFechaFin = !fechaFin || orden.fecha_emision <= fechaFin;
    const cumpleBusqueda = busqueda === '' || 
      orden.correlativo.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.proveedor?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.empresa?.razon_social.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleFiltroProv && cumpleFiltroEmp && cumpleFechaInicio && cumpleFechaFin && cumpleBusqueda;
  });

  const limpiarFiltros = () => {
    setFiltroEstado('TODOS');
    setFiltroProveedor('');
    setFiltroEmpresa('');
    setFechaInicio('');
    setFechaFin('');
    setBusqueda('');
  };

  const descargarPDF = async (idOrden) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ordenes/compra/${idOrden}/pdf`);
      if (!response.ok) throw new Error('Error al generar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orden_Compra_${idOrden}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const verDetalles = (orden) => {
    alert(`📋 DETALLES DE ORDEN DE COMPRA\n\nN° OC: ${orden.correlativo}\nEmpresa: ${orden.empresa?.razon_social}\nProveedor: ${orden.proveedor?.nombre}\nTotal: S/ ${parseFloat(orden.total_general).toFixed(2)}\nEstado: ${orden.estado}\n\n(Modal de detalles en desarrollo)`);
  };

  const exportarExcel = () => {
    alert('📊 Exportación a Excel en desarrollo');
  };

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
          <label>🏢 Empresa:</label>
          <select 
            value={filtroEmpresa} 
            onChange={(e) => setFiltroEmpresa(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todas las empresas</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>📦 Proveedor:</label>
          <select 
            value={filtroProveedor} 
            onChange={(e) => setFiltroProveedor(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map(prov => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
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
            <option value="COMPLETADO">Completado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="ANULADO">Anulado</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Correlativo, proveedor..."
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
        ) : ordenesFiltradas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No se encontraron registros</p>
          </div>
        ) : (
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>N° OC</th>
                <th>Fecha</th>
                <th>Empresa</th>
                <th>Proveedor</th>
                <th>RUC</th>
                <th className="text-right">Total</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map(orden => (
                <tr key={orden.id}>
                  <td><strong>{orden.correlativo}</strong></td>
                  <td>{new Date(orden.fecha_emision).toLocaleDateString('es-PE')}</td>
                  <td>{orden.empresa?.razon_social || 'N/A'}</td>
                  <td>{orden.proveedor?.nombre || 'N/A'}</td>
                  <td>{orden.proveedor?.ruc || 'N/A'}</td>
                  <td className="text-right"><strong>S/ {parseFloat(orden.total_general || 0).toFixed(2)}</strong></td>
                  <td className="text-center">
                    <span 
                      className="badge-estado" 
                      style={{backgroundColor: obtenerColorEstado(orden.estado)}}
                    >
                      {orden.estado}
                    </span>
                  </td>
                  <td className="text-center">
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => descargarPDF(orden.id)}
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
                        onClick={() => verDetalles(orden)}
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
          Mostrando <strong>{ordenesFiltradas.length}</strong> de <strong>{ordenes.length}</strong> órdenes de compra
        </p>
        <p>
          Total: <strong>S/ {ordenesFiltradas.reduce((sum, o) => sum + parseFloat(o.total_general || 0), 0).toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
};

export default HistorialOrdenesCompra;
