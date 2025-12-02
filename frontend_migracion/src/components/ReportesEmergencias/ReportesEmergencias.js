import React, { useState, useEffect } from 'react';
import './ReportesEmergencias.css';
import { 
  obtenerEmergencias, 
  obtenerTrabajadores
} from '../../services/rrhh.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportesEmergencias = () => {
  const [loading, setLoading] = useState(false);
  const [emergencias, setEmergencias] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [trabajadoresFiltrados, setTrabajadoresFiltrados] = useState([]);
  
  // Filtros
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  // Modal de foto
  const [modalFoto, setModalFoto] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState('');

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  useEffect(() => {
    filtrarTrabajadores();
  }, [textoBusqueda, trabajadores]);

  useEffect(() => {
    if (trabajadorSeleccionado && fechaSeleccionada) {
      cargarEmergencias();
    }
  }, [trabajadorSeleccionado, fechaSeleccionada]);

  const cargarTrabajadores = async () => {
    try {
      setLoading(true);
      const response = await obtenerTrabajadores();
      
      if (response.success) {
        setTrabajadores(response.data || []);
        setTrabajadoresFiltrados(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar trabajadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarTrabajadores = () => {
    if (!textoBusqueda) {
      setTrabajadoresFiltrados(trabajadores);
      return;
    }

    const busqueda = textoBusqueda.toLowerCase();
    const filtrados = trabajadores.filter(t => {
      const nombre = t.nombre_completo?.toLowerCase() || '';
      const documento = t.documento?.toLowerCase() || '';
      return nombre.includes(busqueda) || documento.includes(busqueda);
    });

    setTrabajadoresFiltrados(filtrados);

    // Si el trabajador seleccionado no está en filtrados, limpiar selección
    if (trabajadorSeleccionado && !filtrados.find(t => t.id === parseInt(trabajadorSeleccionado))) {
      setTrabajadorSeleccionado('');
    }
  };

  const cargarEmergencias = async () => {
    try {
      setLoading(true);
      const params = {
        id_usuario: trabajadorSeleccionado,
        fecha: fechaSeleccionada
      };

      const response = await obtenerEmergencias(params);
      
      if (response.success) {
        setEmergencias(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar emergencias:', error);
      setEmergencias([]);
    } finally {
      setLoading(false);
    }
  };

  const verFoto = (fotoUrl) => {
    setFotoSeleccionada(fotoUrl);
    setModalFoto(true);
  };

  const verUbicacionMapa = (latitud, longitud) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
    window.open(url, '_blank');
  };

  // ============================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================

  const exportarPDFGeneral = () => {
    if (!emergencias || emergencias.length === 0) {
      alert('No hay emergencias para exportar');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reportes de Emergencias', 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${fechaSeleccionada}`, 14, 28);
    doc.text(`Total de registros: ${emergencias.length}`, 14, 34);
    
    const tableData = emergencias.map(e => [
      new Date(e.hora_local || e.creado_en).toLocaleString('es-PE'),
      e.tipo || 'N/A',
      e.descripcion || 'Sin descripción',
      `${e.latitud || '0'}, ${e.longitud || '0'}`,
      e.precision_m ? `${e.precision_m}m` : 'N/A'
    ]);
    
    doc.autoTable({
      startY: 40,
      head: [['Fecha/Hora', 'Tipo', 'Descripción', 'Ubicación', 'Precisión']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69] }
    });
    
    doc.save(`emergencias_${fechaSeleccionada}.pdf`);
  };

  const exportarPDFIndividual = (emergencia) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Emergencia Individual', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Fecha y Hora: ${new Date(emergencia.hora_local || emergencia.creado_en).toLocaleString('es-PE')}`, 14, 35);
    doc.text(`Tipo: ${emergencia.tipo || 'N/A'}`, 14, 42);
    doc.text(`Descripción: ${emergencia.descripcion || 'Sin descripción'}`, 14, 49);
    doc.text(`Latitud: ${emergencia.latitud || '0'}`, 14, 56);
    doc.text(`Longitud: ${emergencia.longitud || '0'}`, 14, 63);
    doc.text(`Precisión: ${emergencia.precision_m ? emergencia.precision_m + 'm' : 'N/A'}`, 14, 70);
    if (emergencia.foto_url) {
      doc.text(`Foto: ${emergencia.foto_url}`, 14, 77);
    }
    
    doc.save(`emergencia_${emergencia.id_emergencia || Date.now()}.pdf`);
  };

  const exportarExcelGeneral = () => {
    if (!emergencias || emergencias.length === 0) {
      alert('No hay emergencias para exportar');
      return;
    }

    const datos = emergencias.map(e => ({
      'Fecha y Hora': new Date(e.hora_local || e.creado_en).toLocaleString('es-PE'),
      'Tipo': e.tipo || 'N/A',
      'Descripción': e.descripcion || 'Sin descripción',
      'Latitud': e.latitud || '0',
      'Longitud': e.longitud || '0',
      'Precisión (m)': e.precision_m || 'N/A',
      'Foto URL': e.foto_url || 'Sin foto'
    }));
    
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Emergencias');
    XLSX.writeFile(wb, `emergencias_${fechaSeleccionada}.xlsx`);
  };

  const exportarExcelIndividual = (emergencia) => {
    const datos = [{
      'Fecha y Hora': new Date(emergencia.hora_local || emergencia.creado_en).toLocaleString('es-PE'),
      'Tipo': emergencia.tipo || 'N/A',
      'Descripción': emergencia.descripcion || 'Sin descripción',
      'Latitud': emergencia.latitud || '0',
      'Longitud': emergencia.longitud || '0',
      'Precisión (m)': emergencia.precision_m || 'N/A',
      'Foto URL': emergencia.foto_url || 'Sin foto'
    }];
    
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Emergencia');
    XLSX.writeFile(wb, `emergencia_${emergencia.id_emergencia || Date.now()}.xlsx`);
  };

  const exportarCSVGeneral = () => {
    if (!emergencias || emergencias.length === 0) {
      alert('No hay emergencias para exportar');
      return;
    }

    const headers = ['Fecha y Hora', 'Tipo', 'Descripción', 'Latitud', 'Longitud', 'Precisión (m)', 'Foto URL'];
    const rows = emergencias.map(e => [
      new Date(e.hora_local || e.creado_en).toLocaleString('es-PE'),
      e.tipo || 'N/A',
      e.descripcion || 'Sin descripción',
      e.latitud || '0',
      e.longitud || '0',
      e.precision_m || 'N/A',
      e.foto_url || 'Sin foto'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emergencias_${fechaSeleccionada}.csv`;
    link.click();
  };

  const exportarCSVIndividual = (emergencia) => {
    const headers = ['Fecha y Hora', 'Tipo', 'Descripción', 'Latitud', 'Longitud', 'Precisión (m)', 'Foto URL'];
    const row = [
      new Date(emergencia.hora_local || emergencia.creado_en).toLocaleString('es-PE'),
      emergencia.tipo || 'N/A',
      emergencia.descripcion || 'Sin descripción',
      emergencia.latitud || '0',
      emergencia.longitud || '0',
      emergencia.precision_m || 'N/A',
      emergencia.foto_url || 'Sin foto'
    ];
    
    const csvContent = [headers, row].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emergencia_${emergencia.id_emergencia || Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="reportes-emergencias-container">
      {/* Header */}
      <div className="emergencias-header">
        <div className="header-content">
          <h1>🚨 Reportes de Emergencias</h1>
          <p className="subtitle">Consulta y seguimiento de emergencias reportadas</p>
        </div>
        <button className="btn-refresh" onClick={cargarEmergencias}>
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h3>🔍 Filtros</h3>
        <div className="filtros-grid">
          {/* Búsqueda de trabajador */}
          <div className="filtro-item full-width">
            <label>Buscar Trabajador</label>
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>

          {/* Selector de trabajador */}
          <div className="filtro-item">
            <label>Trabajador *</label>
            <select
              value={trabajadorSeleccionado}
              onChange={(e) => setTrabajadorSeleccionado(e.target.value)}
              required
            >
              <option value="">Seleccione un trabajador</option>
              {trabajadoresFiltrados.map((trabajador) => (
                <option key={trabajador.id} value={trabajador.id}>
                  {trabajador.nombre_completo} - {trabajador.documento}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de fecha */}
          <div className="filtro-item">
            <label>Fecha</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
          </div>
        </div>

        {trabajadoresFiltrados.length === 0 && textoBusqueda && (
          <div className="no-resultados">
            <p>⚠️ No se encontraron trabajadores que coincidan con "{textoBusqueda}"</p>
          </div>
        )}
      </div>

      {/* Botones de exportación general */}
      {emergencias.length > 0 && (
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

      {/* Lista de Emergencias */}
      <div className="emergencias-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando emergencias...</p>
          </div>
        ) : !trabajadorSeleccionado ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Selecciona un trabajador</h3>
            <p>Selecciona un trabajador y una fecha para ver sus emergencias</p>
          </div>
        ) : emergencias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Sin emergencias</h3>
            <p>No hay emergencias registradas para este trabajador en la fecha seleccionada</p>
          </div>
        ) : (
          <div className="emergencias-list">
            <div className="list-header">
              <h3>📋 Emergencias Encontradas</h3>
              <span className="badge-count">{emergencias.length}</span>
            </div>
            
            {emergencias.map((emergencia, index) => (
              <div key={index} className="emergencia-card">
                <div className="emergencia-header-card">
                  <div className="emergencia-tipo">
                    <span className="tipo-icon">🚨</span>
                    <span className="tipo-text">{emergencia.tipo || 'Emergencia'}</span>
                  </div>
                  <div className="emergencia-fecha">
                    {new Date(emergencia.hora_local || emergencia.creado_en).toLocaleString('es-PE')}
                  </div>
                </div>

                <div className="emergencia-body">
                  <div className="emergencia-descripcion">
                    <h4>Descripción:</h4>
                    <p>{emergencia.descripcion || 'Sin descripción'}</p>
                  </div>

                  {emergencia.foto_url && (
                    <div className="emergencia-foto-preview">
                      <h4>Fotografía:</h4>
                      <div className="foto-thumbnail" onClick={() => verFoto(emergencia.foto_url)}>
                        <img src={emergencia.foto_url} alt="Emergencia" />
                        <div className="foto-overlay">
                          <span>🔍 Ver imagen</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {emergencia.latitud && emergencia.longitud && (
                    <div className="emergencia-ubicacion">
                      <h4>Ubicación:</h4>
                      <div className="ubicacion-info">
                        <p>📍 Lat: {emergencia.latitud}, Lng: {emergencia.longitud}</p>
                        {emergencia.precision_m && (
                          <p className="precision">Precisión: {emergencia.precision_m}m</p>
                        )}
                        <button
                          className="btn-ver-mapa"
                          onClick={() => verUbicacionMapa(emergencia.latitud, emergencia.longitud)}
                        >
                          🗺️ Ver en Mapa
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="emergencia-acciones">
                    <h4>Exportar:</h4>
                    <div className="acciones-buttons">
                      <button
                        className="btn-export-small btn-pdf-small"
                        onClick={() => exportarPDFIndividual(emergencia)}
                        title="Descargar PDF"
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                      <button
                        className="btn-export-small btn-excel-small"
                        onClick={() => exportarExcelIndividual(emergencia)}
                        title="Descargar Excel"
                      >
                        <i className="fas fa-file-excel"></i>
                      </button>
                      <button
                        className="btn-export-small btn-csv-small"
                        onClick={() => exportarCSVIndividual(emergencia)}
                        title="Descargar CSV"
                      >
                        <i className="fas fa-table"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Foto */}
      {modalFoto && (
        <div className="modal-overlay-foto" onClick={() => setModalFoto(false)}>
          <div className="modal-foto-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-foto" onClick={() => setModalFoto(false)}>
              ✕
            </button>
            <img src={fotoSeleccionada} alt="Emergencia" className="foto-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesEmergencias;
