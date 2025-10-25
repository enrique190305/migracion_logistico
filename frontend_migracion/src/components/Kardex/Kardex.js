import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './Kardex.css';

const API_BASE_URL = 'http://localhost:8000/api';

const Kardex = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('inventario');
  const [inventarioData, setInventarioData] = useState([]);
  const [historialData, setHistorialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de búsqueda
  const [searchInventario, setSearchInventario] = useState('');
  const [searchHistorial, setSearchHistorial] = useState('');

  // Estados de filtros de fecha
  const [fechaInicio, setFechaInicio] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // Estados de estadísticas
  const [statsInventario, setStatsInventario] = useState({
    totalProductos: 0,
    valorTotal: 0,
    productoMayor: 'N/A'
  });
  const [statsHistorial, setStatsHistorial] = useState({
    totalMovimientos: 0,
    ingresos: 0,
    salidas: 0
  });

  // Cache de datos
  const [inventarioCache, setInventarioCache] = useState([]);
  const [historialCache, setHistorialCache] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Actualizar estadísticas cuando cambia la pestaña
  useEffect(() => {
    if (activeTab === 'inventario') {
      actualizarEstadisticasInventario();
    } else {
      actualizarEstadisticasHistorial();
    }
  }, [activeTab, inventarioData, historialData]);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarInventario(),
        cargarHistorial()
      ]);
      mostrarMensajeTemporal('✅ Sistema Kardex cargado correctamente', 'success');
    } catch (err) {
      setError('Error al cargar datos del sistema');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarInventario = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kardex/inventario`);
      const datos = response.data || [];
      setInventarioCache(datos);
      setInventarioData(datos);
      actualizarEstadisticasInventario(datos);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setInventarioCache([]);
      setInventarioData([]);
    }
  };

  const cargarHistorial = async (inicio = null, fin = null) => {
    try {
      const params = {
        fecha_inicio: inicio || fechaInicio,
        fecha_fin: fin || fechaFin
      };
      const response = await axios.get(`${API_BASE_URL}/kardex/historial`, { params });
      const datos = response.data || [];
      setHistorialCache(datos);
      setHistorialData(datos);
      actualizarEstadisticasHistorial(datos);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setHistorialCache([]);
      setHistorialData([]);
    }
  };

  const aplicarFiltroInventario = (termino) => {
    setSearchInventario(termino);
    if (!termino.trim()) {
      setInventarioData(inventarioCache);
      return;
    }

    const term = termino.toLowerCase();
    const filtrados = inventarioCache.filter(item =>
      item.proyecto?.toLowerCase().includes(term) ||
      item.codigo_producto?.toLowerCase().includes(term) ||
      item.descripcion?.toLowerCase().includes(term)
    );
    setInventarioData(filtrados);
  };

  const aplicarFiltroHistorial = (termino) => {
    setSearchHistorial(termino);
    if (!termino.trim()) {
      setHistorialData(historialCache);
      return;
    }

    const term = termino.toLowerCase();
    const filtrados = historialCache.filter(item =>
      item.codigo_producto?.toLowerCase().includes(term) ||
      item.descripcion?.toLowerCase().includes(term) ||
      item.documento?.toLowerCase().includes(term) ||
      item.proyecto?.toLowerCase().includes(term)
    );
    setHistorialData(filtrados);
  };

  const aplicarFiltroFechas = async () => {
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('❌ La fecha de inicio no puede ser mayor que la fecha de fin');
      return;
    }
    await cargarHistorial(fechaInicio, fechaFin);
    mostrarMensajeTemporal(`✅ Filtro aplicado: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`, 'success');
  };

  const limpiarFiltros = async () => {
    const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hace30Dias);
    setFechaFin(hoy);
    await cargarHistorial(hace30Dias, hoy);
    mostrarMensajeTemporal('✅ Filtros limpiados correctamente', 'success');
  };

  const actualizarEstadisticasInventario = (datos = inventarioData) => {
    if (!datos || datos.length === 0) {
      setStatsInventario({
        totalProductos: 0,
        valorTotal: 0,
        productoMayor: 'N/A'
      });
      return;
    }

    const totalProductos = datos.length;
    const valorTotal = datos.reduce((sum, item) => sum + (parseFloat(item.precio_total) || 0), 0);
    const productoMayor = datos.reduce((max, item) => {
      const valorItem = parseFloat(item.precio_total) || 0;
      return valorItem > (parseFloat(max.precio_total) || 0) ? item : max;
    }, datos[0]);

    setStatsInventario({
      totalProductos,
      valorTotal,
      productoMayor: productoMayor?.descripcion || 'N/A'
    });
  };

  const actualizarEstadisticasHistorial = (datos = historialData) => {
    if (!datos || datos.length === 0) {
      setStatsHistorial({
        totalMovimientos: 0,
        ingresos: 0,
        salidas: 0
      });
      return;
    }

    const totalMovimientos = datos.length;
    const ingresos = datos.filter(item => item.tipo_movimiento === 'INGRESO').length;
    const salidas = datos.filter(item => item.tipo_movimiento === 'SALIDA').length;

    setStatsHistorial({
      totalMovimientos,
      ingresos,
      salidas
    });
  };

  const exportarExcel = (tipo) => {
    try {
      const data = tipo === 'inventario' ? inventarioData : historialData;
      const nombre = tipo === 'inventario' ? 'InventarioActual' : `Historial_${fechaInicio}_${fechaFin}`;
      
      if (data.length === 0) {
        alert('❌ No hay datos para exportar');
        return;
      }

      let worksheetData = [];
      
      if (tipo === 'inventario') {
        worksheetData.push([
          'Proyecto',
          'Código',
          'Descripción',
          'Unidad',
          'Cantidad',
          'Precio Unit.',
          'Precio Total'
        ]);

        data.forEach(item => {
          worksheetData.push([
            item.proyecto || 'N/A',
            item.codigo_producto,
            item.descripcion,
            item.unidad,
            item.stock,
            parseFloat(item.precio_unitario || 0).toFixed(2),
            parseFloat(item.precio_total || 0).toFixed(2)
          ]);
        });

        const totalValor = data.reduce((sum, item) => sum + parseFloat(item.precio_total || 0), 0);
        worksheetData.push([]);
        worksheetData.push(['TOTAL GENERAL', '', '', '', data.length, '', totalValor.toFixed(2)]);

      } else {
        worksheetData.push([
          'Fecha',
          'Tipo',
          'Código',
          'Descripción',
          'Unidad',
          'Cantidad',
          'Proyecto',
          'Documento',
          'Observaciones'
        ]);

        data.forEach(item => {
          worksheetData.push([
            formatearFecha(item.fecha),
            item.tipo_movimiento,
            item.codigo_producto,
            item.descripcion,
            item.unidad,
            item.cantidad,
            item.proyecto || 'N/A',
            item.documento || 'N/A',
            item.observaciones || 'N/A'
          ]);
        });

        const ingresos = data.filter(i => i.tipo_movimiento === 'INGRESO').length;
        const salidas = data.filter(i => i.tipo_movimiento === 'SALIDA').length;
        worksheetData.push([]);
        worksheetData.push(['RESUMEN', '', '', '', '', '', '', '', '']);
        worksheetData.push(['Total Movimientos:', data.length, '', '', '', '', '', '', '']);
        worksheetData.push(['Ingresos:', ingresos, '', '', '', '', '', '', '']);
        worksheetData.push(['Salidas:', salidas, '', '', '', '', '', '', '']);
      }

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      const colWidths = tipo === 'inventario' 
        ? [{ wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }]
        : [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 30 }];
      
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tipo === 'inventario' ? 'Inventario' : 'Historial');

      XLSX.writeFile(workbook, `${nombre}.xlsx`);
      
      mostrarMensajeTemporal(`✅ ${tipo} exportado a Excel exitosamente`, 'success');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('❌ Error al exportar a Excel: ' + error.message);
    }
  };

  const exportarPDF = (tipo) => {
    try {
      const data = tipo === 'inventario' ? inventarioData : historialData;
      const nombre = tipo === 'inventario' ? 'InventarioActual' : `Historial_${fechaInicio}_${fechaFin}`;
      
      if (data.length === 0) {
        alert('❌ No hay datos para exportar');
        return;
      }

      const doc = new jsPDF({
        orientation: tipo === 'inventario' ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont('helvetica');
      doc.setFontSize(18);
      doc.setTextColor(102, 126, 234);
      doc.text('ProcessMart - Sistema de Gestión', 14, 15);

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(tipo === 'inventario' ? 'Inventario Actual' : 'Historial de Movimientos', 14, 25);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const fechaGeneracion = new Date();
      doc.text(`Fecha de generación: ${fechaGeneracion.toLocaleDateString('es-PE')} ${fechaGeneracion.toLocaleTimeString('es-PE')}`, 14, 32);

      if (tipo === 'historial') {
        doc.text(`Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`, 14, 38);
      }

      let columns, rows;

      if (tipo === 'inventario') {
        columns = [
          { header: 'Proyecto', dataKey: 'proyecto' },
          { header: 'Código', dataKey: 'codigo' },
          { header: 'Descripción', dataKey: 'descripcion' },
          { header: 'Unidad', dataKey: 'unidad' },
          { header: 'Cantidad', dataKey: 'cantidad' },
          { header: 'P. Unit.', dataKey: 'precio_unit' },
          { header: 'P. Total', dataKey: 'precio_total' }
        ];

        rows = data.map(item => ({
          proyecto: item.proyecto || 'N/A',
          codigo: item.codigo_producto,
          descripcion: item.descripcion.substring(0, 40) + (item.descripcion.length > 40 ? '...' : ''),
          unidad: item.unidad,
          cantidad: item.stock,
          precio_unit: formatearMoneda(item.precio_unitario, item.moneda),
          precio_total: formatearMoneda(item.precio_total, item.moneda)
        }));

        doc.autoTable({
          columns: columns,
          body: rows,
          startY: 40,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: 'left'
          },
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            cantidad: { halign: 'center' },
            precio_unit: { halign: 'right' },
            precio_total: { halign: 'right' }
          },
          didDrawPage: function(hookData) {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
              `Página ${hookData.pageNumber} de ${pageCount}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        const totalProductos = data.length;
        const totalValor = data.reduce((sum, item) => sum + parseFloat(item.precio_total || 0), 0);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total de productos: ${totalProductos}`, 14, finalY);
        doc.text(`Valor total del inventario: ${formatearMoneda(totalValor)}`, 14, finalY + 6);

      } else {
        columns = [
          { header: 'Fecha', dataKey: 'fecha' },
          { header: 'Tipo', dataKey: 'tipo' },
          { header: 'Código', dataKey: 'codigo' },
          { header: 'Descripción', dataKey: 'descripcion' },
          { header: 'Unidad', dataKey: 'unidad' },
          { header: 'Cantidad', dataKey: 'cantidad' },
          { header: 'Proyecto', dataKey: 'proyecto' },
          { header: 'Documento', dataKey: 'documento' }
        ];

        rows = data.map(item => ({
          fecha: formatearFecha(item.fecha),
          tipo: item.tipo_movimiento,
          codigo: item.codigo_producto,
          descripcion: item.descripcion.substring(0, 30) + (item.descripcion.length > 30 ? '...' : ''),
          unidad: item.unidad,
          cantidad: item.cantidad,
          proyecto: (item.proyecto || 'N/A').substring(0, 15),
          documento: (item.documento || 'N/A').substring(0, 12)
        }));

        doc.autoTable({
          columns: columns,
          body: rows,
          startY: tipo === 'historial' ? 45 : 40,
          theme: 'grid',
          styles: {
            fontSize: 7,
            cellPadding: 1.5,
            halign: 'left'
          },
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 8
          },
          columnStyles: {
            fecha: { halign: 'center', cellWidth: 20 },
            tipo: { halign: 'center', cellWidth: 18 },
            codigo: { halign: 'center', cellWidth: 20 },
            cantidad: { halign: 'center', cellWidth: 15 }
          },
          didDrawPage: function(hookData) {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
              `Página ${hookData.pageNumber} de ${pageCount}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        const ingresos = data.filter(i => i.tipo_movimiento === 'INGRESO').length;
        const salidas = data.filter(i => i.tipo_movimiento === 'SALIDA').length;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total de movimientos: ${data.length}`, 14, finalY);
        doc.text(`Ingresos: ${ingresos}`, 14, finalY + 6);
        doc.text(`Salidas: ${salidas}`, 14, finalY + 12);
      }

      doc.save(`${nombre}.pdf`);
      
      mostrarMensajeTemporal(`✅ ${tipo} exportado a PDF exitosamente`, 'success');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('❌ Error al exportar a PDF: ' + error.message);
    }
  };

  const exportarCSV = (tipo) => {
    const data = tipo === 'inventario' ? inventarioData : historialData;
    const nombre = tipo === 'inventario' ? 'InventarioActual' : `Historial_${fechaInicio}_${fechaFin}`;
    
    let csv = '';
    if (tipo === 'inventario') {
      csv = 'Proyecto,Código,Descripción,Unidad,Cantidad,Precio Unit.,Precio Total\n';
      data.forEach(item => {
        csv += `"${item.proyecto}","${item.codigo_producto}","${item.descripcion}","${item.unidad}",${item.stock},${item.precio_unitario},${item.precio_total}\n`;
      });
    } else {
      csv = 'Fecha,Tipo,Código,Descripción,Unidad,Cantidad,Proyecto,Documento,Observaciones\n';
      data.forEach(item => {
        csv += `"${formatearFecha(item.fecha)}","${item.tipo_movimiento}","${item.codigo_producto}","${item.descripcion}","${item.unidad}",${item.cantidad},"${item.proyecto}","${item.documento}","${item.observaciones}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombre}.csv`;
    link.click();
    
    mostrarMensajeTemporal(`✅ ${tipo} exportado a CSV`, 'success');
  };

  const formatearMoneda = (valor, moneda = 'SOLES') => {
    const simbolo = moneda?.toUpperCase().includes('DOLAR') || moneda === 'USD' ? '$' : 'S/';
    return `${simbolo} ${parseFloat(valor || 0).toFixed(2)}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const mostrarMensajeTemporal = (mensaje, tipo = 'info') => {
    console.log(mensaje);
  };

  const obtenerClaseStock = (stock) => {
    if (stock < 10) return 'stock-bajo-kardex';
    if (stock > 100) return 'stock-alto-kardex';
    return 'stock-normal-kardex';
  };

  if (loading) {
    return (
      <div className="kardex-container">
        <div className="loading-container-kardex">
          <div className="spinner-kardex"></div>
          <p>Cargando sistema Kardex...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kardex-container">
      {/* Header */}
      <div className="kardex-header">
        <div className="header-icon-kardex">
          <span>📊</span>
        </div>
        <div className="header-content-kardex">
          <h1 className="header-title-kardex">Sistema de Kardex</h1>
          <p className="header-subtitle-kardex">Gestión y control de inventario</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="kardex-tabs">
        <button
          className={`tab-button-kardex ${activeTab === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventario')}
        >
          <span className="tab-icon-kardex">📦</span>
          Inventario Actual
          {inventarioData.length > 0 && (
            <span className="tab-badge-kardex">{inventarioData.length}</span>
          )}
        </button>
        <button
          className={`tab-button-kardex ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          <span className="tab-icon-kardex">📋</span>
          Historial de Movimientos
          {historialData.length > 0 && (
            <span className="tab-badge-kardex">{historialData.length}</span>
          )}
        </button>
      </div>

      {/* Contenido de Inventario */}
      {activeTab === 'inventario' && (
        <div className="tab-content-kardex">
          {/* Estadísticas */}
          <div className="stats-panel-kardex">
            <span className="stats-icon-kardex">📊</span>
            <span className="stats-text-kardex">
              {statsInventario.totalProductos} productos en stock | 💰 Valor total: {formatearMoneda(statsInventario.valorTotal)} | 📈 Producto mayor valor: {statsInventario.productoMayor}
            </span>
          </div>

          {/* Búsqueda */}
          <div className="search-container-kardex">
            <div className="search-box-kardex">
              <span className="search-icon-kardex">🔍</span>
              <input
                type="text"
                placeholder="Buscar por proyecto, código o descripción..."
                value={searchInventario}
                onChange={(e) => aplicarFiltroInventario(e.target.value)}
                className="search-input-kardex"
              />
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="export-buttons-kardex">
            <button className="btn-export-kardex btn-excel-kardex" onClick={() => exportarExcel('inventario')}>
              📊 Excel
            </button>
            <button className="btn-export-kardex btn-pdf-kardex" onClick={() => exportarPDF('inventario')}>
              📄 PDF
            </button>
            <button className="btn-export-kardex btn-csv-kardex" onClick={() => exportarCSV('inventario')}>
              📋 CSV
            </button>
          </div>

          {/* Tabla de Inventario */}
          <div className="table-wrapper-kardex">
            <table className="kardex-table">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Precio Total</th>
                </tr>
              </thead>
              <tbody>
                {inventarioData.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state-kardex">
                        <span className="empty-icon-kardex">📦</span>
                        <h3>No hay productos en el inventario</h3>
                        <p>Los productos ingresados aparecerán aquí</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inventarioData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.proyecto || 'N/A'}</td>
                      <td>{item.codigo_producto}</td>
                      <td>{item.descripcion}</td>
                      <td>{item.unidad}</td>
                      <td className={obtenerClaseStock(item.stock)}>
                        {item.stock}
                      </td>
                      <td className="precio-cell-kardex">
                        {formatearMoneda(item.precio_unitario, item.moneda)}
                      </td>
                      <td className="precio-cell-kardex">
                        {formatearMoneda(item.precio_total, item.moneda)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenido de Historial */}
      {activeTab === 'historial' && (
        <div className="tab-content-kardex">
          {/* Estadísticas */}
          <div className="stats-panel-kardex">
            <span className="stats-icon-kardex">📈</span>
            <span className="stats-text-kardex">
              {statsHistorial.totalMovimientos} movimientos | ⬆️ {statsHistorial.ingresos} ingresos | ⬇️ {statsHistorial.salidas} salidas | 📅 Período: {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
            </span>
          </div>

          {/* Filtros de fecha */}
          <div className="filter-container-kardex">
            <div className="filter-group-kardex">
              <label>Fecha Inicio:</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="date-input-kardex"
              />
            </div>
            <div className="filter-group-kardex">
              <label>Fecha Fin:</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="date-input-kardex"
              />
            </div>
            <button className="btn-filter-kardex" onClick={aplicarFiltroFechas}>
              🔍 Filtrar
            </button>
            <button className="btn-clear-filter-kardex" onClick={limpiarFiltros}>
              🔄 Limpiar Filtros
            </button>
          </div>

          {/* Búsqueda */}
          <div className="search-container-kardex">
            <div className="search-box-kardex">
              <span className="search-icon-kardex">🔍</span>
              <input
                type="text"
                placeholder="Buscar por código, descripción, documento o proyecto..."
                value={searchHistorial}
                onChange={(e) => aplicarFiltroHistorial(e.target.value)}
                className="search-input-kardex"
              />
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="export-buttons-kardex">
            <button className="btn-export-kardex btn-excel-kardex" onClick={() => exportarExcel('historial')}>
              📊 Excel
            </button>
            <button className="btn-export-kardex btn-pdf-kardex" onClick={() => exportarPDF('historial')}>
              📄 PDF
            </button>
            <button className="btn-export-kardex btn-csv-kardex" onClick={() => exportarCSV('historial')}>
              📋 CSV
            </button>
          </div>

          {/* Tabla de Historial */}
          <div className="table-wrapper-kardex">
            <table className="kardex-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>Proyecto</th>
                  <th>Documento</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {historialData.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <div className="empty-state-kardex">
                        <span className="empty-icon-kardex">📋</span>
                        <h3>No hay movimientos en el período seleccionado</h3>
                        <p>Ajusta los filtros de fecha para ver movimientos</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  historialData.map((item, index) => (
                    <tr key={index}>
                      <td>{formatearFecha(item.fecha)}</td>
                      <td>
                        <span className={`tipo-badge-kardex tipo-${item.tipo_movimiento.toLowerCase()}-kardex`}>
                          {item.tipo_movimiento}
                        </span>
                      </td>
                      <td>{item.codigo_producto}</td>
                      <td>{item.descripcion}</td>
                      <td>{item.unidad}</td>
                      <td>{item.cantidad}</td>
                      <td>{item.proyecto || 'N/A'}</td>
                      <td>{item.documento || 'N/A'}</td>
                      <td>{item.observaciones || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kardex;