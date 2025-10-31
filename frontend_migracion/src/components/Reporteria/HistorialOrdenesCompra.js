  import React, { useState, useEffect } from 'react';
import './HistorialComun.css';
import * as XLSX from 'xlsx';

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
    // Crear un nuevo libro de Excel
    const wb = XLSX.utils.book_new();
    
    // Preparar datos para la hoja
    const datosExcel = ordenesFiltradas.map(orden => ({
      'N° ORDEN': orden.correlativo,
      'FECHA EMISIÓN': new Date(orden.fecha_emision).toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      'EMPRESA': orden.empresa?.razon_social || 'N/A',
      'PROVEEDOR': orden.proveedor?.nombre || 'N/A',
      'RUC PROVEEDOR': orden.proveedor?.ruc || 'N/A',
      'MONTO TOTAL': parseFloat(orden.total_general || 0).toFixed(2),
      'ESTADO': orden.estado
    }));

    // Calcular total general (excluyendo anuladas)
    const totalGeneral = ordenesFiltradas
      .filter(o => o.estado !== 'ANULADO')
      .reduce((sum, orden) => sum + parseFloat(orden.total_general || 0), 0);

    // Crear array para la hoja con encabezado
    const fechaActual = new Date().toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const wsData = [
      ['HISTORIAL DE ÓRDENES DE COMPRA'],
      [`Fecha de generación: ${fechaActual}`],
      [],
      ['N° ORDEN', 'FECHA EMISIÓN', 'EMPRESA', 'PROVEEDOR', 'RUC PROVEEDOR', 'MONTO TOTAL', 'ESTADO'],
      ...datosExcel.map(orden => [
        orden['N° ORDEN'],
        orden['FECHA EMISIÓN'],
        orden['EMPRESA'],
        orden['PROVEEDOR'],
        orden['RUC PROVEEDOR'],
        parseFloat(orden['MONTO TOTAL']),
        orden['ESTADO']
      ]),
      [],
      ['', '', '', '', 'TOTAL GENERAL (Excluye anuladas):', totalGeneral.toFixed(2)],
      ['', '', '', '', 'TOTAL DE ÓRDENES:', ordenesFiltradas.length]
    ];

    // Crear hoja de trabajo
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar anchos de columna
    ws['!cols'] = [
      { wch: 12 },  // N° ORDEN
      { wch: 15 },  // FECHA EMISIÓN
      { wch: 30 },  // EMPRESA
      { wch: 30 },  // PROVEEDOR
      { wch: 15 },  // RUC PROVEEDOR
      { wch: 15 },  // MONTO TOTAL
      { wch: 12 }   // ESTADO
    ];

    // Aplicar formato de moneda a la columna de MONTO TOTAL
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let i = 4; i < wsData.length - 2; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 5 });
      if (ws[cellAddress]) {
        ws[cellAddress].z = '"S/ "#,##0.00';
      }
    }

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Historial OC');

    // Generar archivo y descargar
    XLSX.writeFile(wb, `Historial_Ordenes_Compra_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarOrdenIndividual = (orden) => {
    // Crear un nuevo libro de Excel
    const wb = XLSX.utils.book_new();
    
    const fechaEmision = new Date(orden.fecha_emision).toLocaleDateString('es-PE', { 
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

    // Crear datos para la hoja en formato horizontal
    const wsData = [
      [`ORDEN DE COMPRA - ${orden.correlativo}`, '', '', '', '', '', ''],
      [`Fecha de emisión: ${fechaEmision}`, '', '', '', '', '', ''],
      [`Generado: ${fechaGeneracion}`, '', '', '', '', '', ''],
      [],
      ['N° Orden', 'Fecha Emisión', 'Estado', 'Empresa', 'RUC Empresa', 'Proveedor', 'RUC Proveedor', 'Total'],
      [
        orden.correlativo,
        fechaEmision,
        orden.estado,
        orden.empresa?.razon_social || 'N/A',
        orden.empresa?.ruc || 'N/A',
        orden.proveedor?.nombre || 'N/A',
        orden.proveedor?.ruc || 'N/A',
        parseFloat(orden.total_general || 0)
      ]
    ];

    // Crear hoja de trabajo
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar anchos de columna
    ws['!cols'] = [
      { wch: 12 },  // N° Orden
      { wch: 15 },  // Fecha Emisión
      { wch: 12 },  // Estado
      { wch: 30 },  // Empresa
      { wch: 15 },  // RUC Empresa
      { wch: 30 },  // Proveedor
      { wch: 15 },  // RUC Proveedor
      { wch: 15 }   // Total
    ];

    // Aplicar formato de moneda a la celda del total
    const totalCell = 'H6';
    if (ws[totalCell]) {
      ws[totalCell].z = '"S/ "#,##0.00';
    }

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, `OC-${orden.correlativo}`);

    // Generar archivo y descargar
    XLSX.writeFile(wb, `OC_${orden.correlativo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importarExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        
        // Validar que tenga contenido
        if (lines.length < 2) {
          alert('❌ El archivo está vacío o no tiene el formato correcto');
          return;
        }

        // Parsear el CSV
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            data.push(row);
          }
        }

        console.log('📊 Datos importados:', data);
        alert(`✅ Se importaron ${data.length} registros correctamente\n\n(La integración con el backend está pendiente)`);
        
        // Limpiar el input
        event.target.value = '';
      } catch (error) {
        console.error('Error al importar:', error);
        alert('❌ Error al procesar el archivo. Verifique que sea un CSV válido');
      }
    };
    
    reader.readAsText(file);
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

        <button 
          className="btn-recargar" 
          onClick={exportarExcel}
          disabled={ordenesFiltradas.length === 0}
          style={{ 
            background: ordenesFiltradas.length === 0 ? '#95a5a6' : '#10b981',
            cursor: ordenesFiltradas.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          📊 Exportar Excel
        </button>

        <label 
          className="btn-recargar" 
          style={{ 
            background: '#f39c12',
            cursor: 'pointer',
            display: 'inline-block'
          }}
        >
          📥 Importar Excel
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={importarExcel}
            style={{ display: 'none' }}
          />
        </label>
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
                        onClick={() => exportarOrdenIndividual(orden)}
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
          Total: <strong>S/ {ordenesFiltradas
            .filter(o => o.estado !== 'ANULADO')
            .reduce((sum, o) => sum + parseFloat(o.total_general || 0), 0)
            .toFixed(2)}</strong>
          <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '10px' }}>
            (Excluye órdenes anuladas)
          </span>
        </p>
      </div>
    </div>
  );
};

export default HistorialOrdenesCompra;
