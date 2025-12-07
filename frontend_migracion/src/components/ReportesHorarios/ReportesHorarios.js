import React, { useState, useEffect } from 'react';
import rrhhService from '../../services/rrhh.service';
import './ReportesHorarios.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportesHorarios = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState('');
  const [reportesHorarios, setReportesHorarios] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    try {
      setLoading(true);
      console.log('👥 Cargando trabajadores...');
      const response = await rrhhService.obtenerTrabajadores();
      console.log('👥 Respuesta trabajadores:', response);
      console.log('👥 Success:', response.success);
      console.log('👥 Cantidad:', response.data?.length);
      
      if (response.success) {
        const trabajadoresData = response.data || [];
        setTrabajadores(trabajadoresData);
        console.log('✅ Trabajadores cargados:', trabajadoresData.length);
        if (trabajadoresData.length > 0) {
          console.log('📋 Primer trabajador:', trabajadoresData[0]);
        }
      } else {
        console.error('❌ Error al cargar trabajadores:', response.message);
        setError('Error al cargar trabajadores');
      }
    } catch (error) {
      console.error('💥 Error al cargar trabajadores:', error);
      setError('Error al cargar trabajadores');
    } finally {
      setLoading(false);
    }
  };

  const cargarReportesHorarios = async (trabajadorId) => {
    if (!trabajadorId || !fechaSeleccionada) {
      console.warn('⚠️ No hay trabajador o fecha seleccionada');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Usar id_usuario y fecha
      const params = {
        id_usuario: trabajadorId,
        fecha: fechaSeleccionada
      };
      
      console.log('🔍 Buscando reportes horarios...');
      console.log('📋 Trabajador ID:', trabajadorId);
      console.log('📅 Fecha:', fechaSeleccionada);
      console.log('📦 Params enviados:', params);
      
      const response = await rrhhService.obtenerReportesHorarios(params);
      
      console.log('📊 Respuesta completa del servidor:', response);
      console.log('✅ Success:', response.success);
      console.log('📦 Data:', response.data);
      console.log('📏 Cantidad de registros:', response.data ? response.data.length : 0);
      
      if (response.data && response.data.length > 0) {
        console.log('🔍 Primer registro completo:', response.data[0]);
        console.log('🔍 Campos del primer registro:', Object.keys(response.data[0]));
        console.log('🔍 Campo estado específico:', response.data[0].estado);
        console.log('🔍 Tipo de estado:', typeof response.data[0].estado);
      }

      if (response.success) {
        const reportes = response.data || [];
        setReportesHorarios(reportes);
        
        if (reportes.length === 0) {
          setError('No se encontraron reportes horarios para este trabajador en la fecha seleccionada');
          console.warn('⚠️ No hay datos para mostrar');
        } else {
          console.log(`✅ ${reportes.length} reportes encontrados`);
        }
      } else {
        const errorMsg = response.message || 'No se encontraron reportes horarios para esta fecha';
        console.error('❌ Error en respuesta:', errorMsg);
        setError(errorMsg);
        setReportesHorarios([]);
      }
    } catch (error) {
      console.error('💥 Error al cargar reportes horarios:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error response:', error.response?.data);
      console.error('💥 Error status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message 
        || error.message 
        || 'Error al cargar los reportes horarios';
      
      setError(`Error: ${errorMsg}`);
      setReportesHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrabajadorChange = (trabajador) => {
    console.log('👤 Trabajador seleccionado:', trabajador);
    setTrabajadorSeleccionado(trabajador.id);
    setBusqueda(trabajador.nombre_completo);
    setShowDropdown(false);
    cargarReportesHorarios(trabajador.id);
  };

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaSeleccionada(nuevaFecha);
    if (trabajadorSeleccionado) {
      cargarReportesHorarios(trabajadorSeleccionado);
    }
  };

  const trabajadoresFiltrados = trabajadores.filter(t => {
    const searchTerm = (busqueda || '').toLowerCase();
    const nombreCompleto = (t.nombre_completo || '').toLowerCase();
    const documento = (t.documento || '').toString().toLowerCase();
    
    return nombreCompleto.includes(searchTerm) ||
           documento.includes(searchTerm);
  });
  
  console.log('📊 Total trabajadores:', trabajadores.length);
  console.log('📊 Trabajadores filtrados:', trabajadoresFiltrados.length);

  const abrirGoogleMaps = (latitud, longitud) => {
    const url = `https://maps.google.com/?q=${latitud},${longitud}`;
    window.open(url, '_blank');
  };

  const formatearFechaHora = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // ============================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================

  const exportarPDFGeneral = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reportes de Horarios', 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${fechaSeleccionada}`, 14, 28);
    doc.text(`Total de registros: ${reportesHorarios.length}`, 14, 34);
    
    const tableData = reportesHorarios.map(r => [
      formatearFechaHora(r.fecha_hora),
      r.estado || 'No reportó',
      `${r.latitud ? Number(r.latitud).toFixed(6) : '0'}, ${r.longitud ? Number(r.longitud).toFixed(6) : '0'}`,
      r.dentro_area || r.dentro_de_area ? 'Dentro' : 'Fuera',
      `${r.distancia_metros ? Number(r.distancia_metros).toFixed(2) : '0'} m`,
      r.comentarios || 'Sin comentarios'
    ]);
    
    doc.autoTable({
      startY: 40,
      head: [['Fecha/Hora', 'Estado', 'Ubicación', 'Área', 'Distancia', 'Comentarios']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`reportes_horarios_${fechaSeleccionada}.pdf`);
  };

  const exportarPDFIndividual = (reporte) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Horario Individual', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Fecha y Hora: ${formatearFechaHora(reporte.fecha_hora)}`, 14, 35);
    doc.text(`Estado: ${reporte.estado || 'No reportó'}`, 14, 42);
    doc.text(`Latitud: ${reporte.latitud ? Number(reporte.latitud).toFixed(6) : '0'}`, 14, 49);
    doc.text(`Longitud: ${reporte.longitud ? Number(reporte.longitud).toFixed(6) : '0'}`, 14, 56);
    doc.text(`Área: ${reporte.dentro_area || reporte.dentro_de_area ? 'Dentro' : 'Fuera'}`, 14, 63);
    doc.text(`Distancia: ${reporte.distancia_metros ? Number(reporte.distancia_metros).toFixed(2) : '0'} m`, 14, 70);
    doc.text(`Comentarios: ${reporte.comentarios || 'Sin comentarios'}`, 14, 77);
    
    doc.save(`reporte_horario_${reporte.id || Date.now()}.pdf`);
  };

  const exportarExcelGeneral = () => {
    const datos = reportesHorarios.map(r => ({
      'Fecha y Hora': formatearFechaHora(r.fecha_hora),
      'Estado': r.estado || 'No reportó',
      'Latitud': r.latitud ? Number(r.latitud).toFixed(6) : '0',
      'Longitud': r.longitud ? Number(r.longitud).toFixed(6) : '0',
      'Dentro de Área': r.dentro_area || r.dentro_de_area ? 'Sí' : 'No',
      'Distancia (m)': r.distancia_metros ? Number(r.distancia_metros).toFixed(2) : '0',
      'Comentarios': r.comentarios || 'Sin comentarios'
    }));
    
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes Horarios');
    XLSX.writeFile(wb, `reportes_horarios_${fechaSeleccionada}.xlsx`);
  };

  const exportarExcelIndividual = (reporte) => {
    const datos = [{
      'Fecha y Hora': formatearFechaHora(reporte.fecha_hora),
      'Estado': reporte.estado || 'No reportó',
      'Latitud': reporte.latitud ? Number(reporte.latitud).toFixed(6) : '0',
      'Longitud': reporte.longitud ? Number(reporte.longitud).toFixed(6) : '0',
      'Dentro de Área': reporte.dentro_area || reporte.dentro_de_area ? 'Sí' : 'No',
      'Distancia (m)': reporte.distancia_metros ? Number(reporte.distancia_metros).toFixed(2) : '0',
      'Comentarios': reporte.comentarios || 'Sin comentarios'
    }];
    
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte_horario_${reporte.id || Date.now()}.xlsx`);
  };

  const exportarCSVGeneral = () => {
    const headers = ['Fecha y Hora', 'Estado', 'Latitud', 'Longitud', 'Dentro de Área', 'Distancia (m)', 'Comentarios'];
    const rows = reportesHorarios.map(r => [
      formatearFechaHora(r.fecha_hora),
      r.estado || 'No reportó',
      r.latitud ? Number(r.latitud).toFixed(6) : '0',
      r.longitud ? Number(r.longitud).toFixed(6) : '0',
      r.dentro_area || r.dentro_de_area ? 'Sí' : 'No',
      r.distancia_metros ? Number(r.distancia_metros).toFixed(2) : '0',
      r.comentarios || 'Sin comentarios'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reportes_horarios_${fechaSeleccionada}.csv`;
    link.click();
  };

  const exportarCSVIndividual = (reporte) => {
    const headers = ['Fecha y Hora', 'Estado', 'Latitud', 'Longitud', 'Dentro de Área', 'Distancia (m)', 'Comentarios'];
    const row = [
      formatearFechaHora(reporte.fecha_hora),
      reporte.estado || 'No reportó',
      reporte.latitud ? Number(reporte.latitud).toFixed(6) : '0',
      reporte.longitud ? Number(reporte.longitud).toFixed(6) : '0',
      reporte.dentro_area || reporte.dentro_de_area ? 'Sí' : 'No',
      reporte.distancia_metros ? Number(reporte.distancia_metros).toFixed(2) : '0',
      reporte.comentarios || 'Sin comentarios'
    ];
    
    const csvContent = [headers, row].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_horario_${reporte.id || Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="reportes-horarios-container">
      <div className="reportes-horarios-header">
        <div className="header-icon-wrapper">
          <div className="header-icon">
            <i className="fas fa-clock"></i>
          </div>
        </div>
        <div className="header-text">
          <h1>Reportes de Horarios</h1>
          <p>Consulta los reportes de horarios de los trabajadores</p>
        </div>
      </div>

      {reportesHorarios.length > 0 && (
        <div className="export-buttons-container">
          <div className="export-buttons-group">
            <button className="btn-export btn-pdf" onClick={exportarPDFGeneral}>
              <i className="fas fa-file-pdf"></i> Exportar PDF
            </button>
            <button className="btn-export btn-excel" onClick={exportarExcelGeneral}>
              <i className="fas fa-file-excel"></i> Exportar Excel
            </button>
            <button className="btn-export btn-csv" onClick={exportarCSVGeneral}>
              <i className="fas fa-file-csv"></i> Exportar CSV
            </button>
          </div>
        </div>
      )}

      <div className="reportes-horarios-filters">
        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-user"></i> Trabajador
          </label>
          <div className="trabajador-search-container">
            <input
              type="text"
              className="filter-input search-input"
              placeholder="Buscar por nombre o documento..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            <i className="fas fa-search search-icon"></i>
            
            {showDropdown && busqueda && busqueda.trim() !== '' && (
              <div className="trabajador-dropdown">
                {trabajadoresFiltrados.length > 0 ? (
                  trabajadoresFiltrados.map(trabajador => (
                    <div
                      key={trabajador.id}
                      className="trabajador-option"
                      onClick={() => handleTrabajadorChange(trabajador)}
                    >
                      <div className="trabajador-info">
                        <span className="trabajador-nombre">{trabajador.nombre_completo}</span>
                        <span className="trabajador-documento">{trabajador.documento}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="trabajador-option no-results">
                    No se encontraron trabajadores
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-calendar-alt"></i> Fecha
          </label>
          <input
            type="date"
            className="filter-input"
            value={fechaSeleccionada}
            onChange={handleFechaChange}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando reportes horarios...</p>
        </div>
      ) : (
        <>
          {reportesHorarios.length > 0 ? (
            <div className="reportes-horarios-content">
              <div className="reportes-table-container">
                <table className="reportes-table">
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Estado</th>
                      <th>Ubicación</th>
                      <th>Área</th>
                      <th>Distancia</th>
                      <th>Comentarios</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportesHorarios.map((reporte, index) => (
                      <tr key={reporte.id || index}>
                        <td data-label="Fecha y Hora">
                          <div className="fecha-hora-cell">
                            <i className="fas fa-clock"></i>
                            {formatearFechaHora(reporte.fecha_hora)}
                          </div>
                        </td>
                        <td data-label="Estado">
                          <span className={`estado-badge ${reporte.estado === 'Reportado' ? 'estado-reportado' : 'estado-no-reporto'}`}>
                            {reporte.estado || 'No reportó'}
                          </span>
                        </td>
                        <td data-label="Ubicación">
                          <div className="ubicacion-cell">
                            <i className="fas fa-map-marker-alt"></i>
                            <span className="coordenadas">
                              {(reporte.latitud ? Number(reporte.latitud).toFixed(6) : '0.000000')}, {(reporte.longitud ? Number(reporte.longitud).toFixed(6) : '0.000000')}
                            </span>
                          </div>
                        </td>
                        <td data-label="Área">
                          <span className={`area-badge ${reporte.dentro_area || reporte.dentro_de_area ? 'area-dentro' : 'area-fuera'}`}>
                            <i className={`fas ${reporte.dentro_area || reporte.dentro_de_area ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                            {reporte.dentro_area || reporte.dentro_de_area ? 'Dentro' : 'Fuera'}
                          </span>
                        </td>
                        <td data-label="Distancia">
                          <span className="distancia-cell">
                            {(reporte.distancia_metros ? Number(reporte.distancia_metros).toFixed(2) : '0.00')} m
                          </span>
                        </td>
                        <td data-label="Comentarios">
                          <div className="comentarios-cell">
                            {reporte.comentarios || 'Sin comentarios'}
                          </div>
                        </td>
                        <td data-label="Acciones">
                          <div className="acciones-buttons">
                            <button
                              className="btn-mapa"
                              onClick={() => abrirGoogleMaps(reporte.latitud || 0, reporte.longitud || 0)}
                              title="Ver ubicación en Google Maps"
                            >
                              <i className="fas fa-map-marker-alt"></i>
                            </button>
                            <button
                              className="btn-export-small btn-pdf-small"
                              onClick={() => exportarPDFIndividual(reporte)}
                              title="Descargar PDF"
                            >
                              <i className="fas fa-file-pdf"></i>
                            </button>
                            <button
                              className="btn-export-small btn-excel-small"
                              onClick={() => exportarExcelIndividual(reporte)}
                              title="Descargar Excel"
                            >
                              <i className="fas fa-file-excel"></i>
                            </button>
                            <button
                              className="btn-export-small btn-csv-small"
                              onClick={() => exportarCSVIndividual(reporte)}
                              title="Descargar CSV"
                            >
                              <i className="fas fa-table"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="reportes-summary">
                <div className="summary-card">
                  <i className="fas fa-list-ol"></i>
                  <div className="summary-info">
                    <span className="summary-label">Total de reportes</span>
                    <span className="summary-value">{reportesHorarios.length}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <i className="fas fa-check-circle summary-icon-reportados"></i>
                  <div className="summary-info">
                    <span className="summary-label">Reportados</span>
                    <span className="summary-value">
                      {reportesHorarios.filter(r => r.estado === 'Reportado').length}
                    </span>
                  </div>
                </div>
                <div className="summary-card">
                  <i className="fas fa-map-marker-alt summary-icon-dentro"></i>
                  <div className="summary-info">
                    <span className="summary-label">Dentro de área</span>
                    <span className="summary-value">
                      {reportesHorarios.filter(r => r.dentro_area || r.dentro_de_area).length}
                    </span>
                  </div>
                </div>
                <div className="summary-card">
                  <i className="fas fa-exclamation-triangle summary-icon-fuera"></i>
                  <div className="summary-info">
                    <span className="summary-label">Fuera de área</span>
                    <span className="summary-value">
                      {reportesHorarios.filter(r => !(r.dentro_area || r.dentro_de_area)).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            !loading && trabajadorSeleccionado && (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-calendar-times"></i>
                </div>
                <h3>No hay reportes horarios</h3>
                <p>No se encontraron reportes para la fecha seleccionada</p>
              </div>
            )
          )}

          {!trabajadorSeleccionado && !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-user-clock"></i>
              </div>
              <h3>Selecciona un trabajador</h3>
              <p>Busca y selecciona un trabajador para ver sus reportes horarios</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportesHorarios;
