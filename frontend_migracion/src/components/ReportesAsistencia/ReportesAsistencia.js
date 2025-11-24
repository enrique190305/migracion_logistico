import React, { useState, useEffect } from 'react';
import './ReportesAsistencia.css';
import { 
  obtenerReporteAsistencia, 
  obtenerTrabajadores,
  obtenerSedes 
} from '../../services/rrhh.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportesAsistencia = () => {
  const [loading, setLoading] = useState(false);
  const [asistencias, setAsistencias] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [sedes, setSedes] = useState([]);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    id_usuario: '',
    id_sede: '',
    tipo: '' // entrada, salida
  });

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState('');

  // Estado de modal de detalle
  const [modalDetalle, setModalDetalle] = useState(false);
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    cargarAsistencias();
  }, [filtros]);

  const cargarDatosIniciales = async () => {
    try {
      const [resTrabajadores, resSedes] = await Promise.all([
        obtenerTrabajadores(),
        obtenerSedes()
      ]);

      if (resTrabajadores.success) {
        setTrabajadores(resTrabajadores.data || []);
      }

      if (resSedes.success) {
        setSedes(resSedes.data || []);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      if (filtros.id_usuario) params.id_usuario = filtros.id_usuario;
      if (filtros.id_sede) params.id_sede = filtros.id_sede;
      if (filtros.tipo) params.tipo = filtros.tipo;

      const response = await obtenerReporteAsistencia(params);
      
      console.log('📊 Datos de asistencia recibidos:', response);
      
      // Debug: Mostrar las claves del primer registro para entender la estructura
      if (response.success && response.data && response.data.length > 0) {
        console.log('🔑 Campos disponibles en el primer registro:', Object.keys(response.data[0]));
        console.log('📝 Primer registro completo:', response.data[0]);
      }
      
      if (response.success) {
        setAsistencias(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      setAsistencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date().toISOString().split('T')[0],
      id_usuario: '',
      id_sede: '',
      tipo: ''
    });
    setBusqueda('');
    setPaginaActual(1);
  };

  const verDetalle = (asistencia) => {
    setAsistenciaSeleccionada(asistencia);
    setModalDetalle(true);
  };

  const cerrarModal = () => {
    setModalDetalle(false);
    setAsistenciaSeleccionada(null);
  };

  const exportarDatos = () => {
    // Exportar TODOS los registros filtrados a Excel en formato tabla horizontal
    
    if (asistenciasFiltradas.length === 0) {
      alert('⚠️ No hay registros para exportar');
      return;
    }
    
    // Preparar datos para el Excel (formato horizontal con cabeceras arriba)
    const datosExcel = [];
    
    // === CABECERAS ===
    datosExcel.push([
      'N°',
      'Trabajador',
      'Documento',
      'Sede',
      'Tipo',
      'Fecha',
      'Hora',
      'Latitud',
      'Longitud',
      'Precisión (m)',
      'Proveedor GPS'
    ]);
    
    // === DATOS ===
    let numeroFila = 1;
    asistenciasFiltradas.forEach((asistencia) => {
      const nombreUsuario = asistencia.trabajador || 'N/A';
      const documentoUsuario = asistencia.documento || 'N/A';
      const nombreSede = asistencia.sede || 'N/A';
      const fecha = asistencia.fecha;
      const horaEntrada = asistencia.hora_entrada;
      const horaSalida = asistencia.hora_salida;
      
      // Agregar fila para ENTRADA si existe
      if (horaEntrada) {
        datosExcel.push([
          numeroFila++,
          nombreUsuario,
          documentoUsuario,
          nombreSede,
          'Entrada',
          fecha ? new Date(fecha).toLocaleDateString('es-PE') : 'N/A',
          horaEntrada || 'N/A',
          asistencia.latitud || '',
          asistencia.longitud || '',
          asistencia.precision_m || '',
          asistencia.proveedor_gps || ''
        ]);
      }
      
      // Agregar fila para SALIDA si existe
      if (horaSalida) {
        datosExcel.push([
          numeroFila++,
          nombreUsuario,
          documentoUsuario,
          nombreSede,
          'Salida',
          fecha ? new Date(fecha).toLocaleDateString('es-PE') : 'N/A',
          horaSalida || 'N/A',
          asistencia.latitud || '',
          asistencia.longitud || '',
          asistencia.precision_m || '',
          asistencia.proveedor_gps || ''
        ]);
      }
    });
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Crear hoja desde los datos
    const ws = XLSX.utils.aoa_to_sheet(datosExcel);
    
    // Configurar anchos de columna
    ws['!cols'] = [
      { wch: 5 },   // N°
      { wch: 30 },  // Trabajador
      { wch: 12 },  // Documento
      { wch: 20 },  // Sede
      { wch: 10 },  // Tipo
      { wch: 12 },  // Fecha
      { wch: 10 },  // Hora
      { wch: 12 },  // Latitud
      { wch: 12 },  // Longitud
      { wch: 12 },  // Precisión
      { wch: 15 }   // Proveedor GPS
    ];
    
    // Aplicar filtros a la primera fila (cabeceras)
    ws['!autofilter'] = { ref: `A1:K${datosExcel.length}` };
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes de Asistencia');
    
    // Agregar una segunda hoja con resumen
    const resumenData = [
      ['RESUMEN DEL REPORTE'],
      [''],
      ['Total de registros exportados:', numeroFila - 1],
      ['Fecha de generación:', new Date().toLocaleString('es-PE')],
      ['Filtros aplicados:'],
      ['  - Fecha inicio:', filtros.fecha_inicio || 'Sin filtro'],
      ['  - Fecha fin:', filtros.fecha_fin || 'Sin filtro'],
      ['  - Sede:', filtros.id_sede ? sedes.find(s => s.id_sede == filtros.id_sede)?.nombre || 'N/A' : 'Todas'],
      [''],
      ['Sistema de Gestión - Process-One']
    ];
    
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    
    // Generar y descargar el archivo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reporte_Asistencias_${fechaActual}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
    
    alert(`✅ ${numeroFila - 1} registros exportados exitosamente a Excel`);
  };

  // Exportar registro individual a PDF
  const exportarPDF = (asistencia, tipo, hora) => {
    const nombreUsuario = asistencia.trabajador || 'N/A';
    const documentoUsuario = asistencia.documento || 'N/A';
    const nombreSede = asistencia.sede || 'N/A';
    const fecha = asistencia.fecha;
    const tipoRegistro = tipo === 'entrada' ? 'Entrada' : 'Salida';
    
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // === HEADER ===
    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // #2c3e50
    doc.text('REPORTE DE ASISTENCIA', 105, 20, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(127, 140, 141); // #7f8c8d
    doc.text('Sistema de Gestión - Process-One', 105, 28, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString('es-PE')}`, 105, 34, { align: 'center' });
    
    // Línea divisoria
    doc.setDrawColor(74, 144, 226); // #4a90e2
    doc.setLineWidth(1);
    doc.line(20, 38, 190, 38);
    
    let yPos = 48;
    
    // === SECCIÓN: INFORMACIÓN DEL TRABAJADOR ===
    doc.setFontSize(14);
    doc.setTextColor(74, 144, 226); // #4a90e2
    doc.text('Información del Trabajador', 20, yPos);
    yPos += 8;
    
    // Tabla de información del trabajador
    doc.autoTable({
      startY: yPos,
      head: [['Campo', 'Valor']],
      body: [
        ['Nombre Completo', nombreUsuario],
        ['Documento', documentoUsuario],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [74, 144, 226],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: { 
        fontSize: 10,
        textColor: [44, 62, 80]
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', fillColor: [248, 249, 250] },
        1: { cellWidth: 110 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 12;
    
    // === SECCIÓN: INFORMACIÓN DE REGISTRO ===
    doc.setFontSize(14);
    doc.setTextColor(74, 144, 226);
    doc.text('Información de Registro', 20, yPos);
    yPos += 8;
    
    // Tabla de información del registro
    const tipoIcon = tipo === 'entrada' ? 'ENTRADA' : 'SALIDA';
    doc.autoTable({
      startY: yPos,
      head: [['Campo', 'Valor']],
      body: [
        ['Tipo', tipoIcon],
        ['Sede', nombreSede],
        ['Fecha', fecha ? new Date(fecha).toLocaleDateString('es-PE') : 'N/A'],
        ['Hora', hora || 'N/A'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [74, 144, 226],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: { 
        fontSize: 10,
        textColor: [44, 62, 80]
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', fillColor: [248, 249, 250] },
        1: { cellWidth: 110 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 12;
    
    // === SECCIÓN: UBICACIÓN GPS (si existe) ===
    if (asistencia.latitud && asistencia.longitud) {
      doc.setFontSize(14);
      doc.setTextColor(74, 144, 226);
      doc.text('Ubicación GPS', 20, yPos);
      yPos += 8;
      
      const gpsData = [
        ['Latitud', asistencia.latitud || 'N/A'],
        ['Longitud', asistencia.longitud || 'N/A'],
        ['Precisión (m)', asistencia.precision_m || 'N/A'],
        ['Proveedor GPS', asistencia.proveedor_gps || 'N/A'],
      ];
      
      doc.autoTable({
        startY: yPos,
        head: [['Campo', 'Valor']],
        body: gpsData,
        theme: 'grid',
        headStyles: { 
          fillColor: [74, 144, 226],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 11
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [44, 62, 80]
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold', fillColor: [248, 249, 250] },
          1: { cellWidth: 110 }
        },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 12;
    }
    
    // === FOOTER ===
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea divisoria del footer
      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.5);
      doc.line(20, 280, 190, 280);
      
      // Texto del footer
      doc.setFontSize(9);
      doc.setTextColor(153, 153, 153);
      doc.text(
        'Este documento es un reporte automático generado por el Sistema de Gestión Process-One',
        105,
        285,
        { align: 'center' }
      );
      doc.text(
        `© ${new Date().getFullYear()} - Todos los derechos reservados`,
        105,
        290,
        { align: 'center' }
      );
      
      // Número de página
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        190,
        290,
        { align: 'right' }
      );
    }
    
    // Guardar el PDF
    const nombreArchivo = `Asistencia_${nombreUsuario.replace(/\s+/g, '_')}_${tipoRegistro}_${fecha}.pdf`;
    doc.save(nombreArchivo);
  };

  // Exportar registro individual a Excel
  const exportarExcel = (asistencia, tipo, hora) => {
    const nombreUsuario = asistencia.trabajador || 'N/A';
    const documentoUsuario = asistencia.documento || 'N/A';
    const nombreSede = asistencia.sede || 'N/A';
    const fecha = asistencia.fecha;
    const tipoRegistro = tipo === 'entrada' ? 'Entrada' : 'Salida';
    
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // === HOJA 1: REPORTE DE ASISTENCIA ===
    const wsData = [
      // Header
      ['REPORTE DE ASISTENCIA'],
      ['Sistema de Gestión - Process-One'],
      [`Generado el: ${new Date().toLocaleString('es-PE')}`],
      [], // Línea en blanco
      
      // Sección: Información del Trabajador
      ['INFORMACIÓN DEL TRABAJADOR'],
      ['Campo', 'Valor'],
      ['Nombre Completo', nombreUsuario],
      ['Documento', documentoUsuario],
      [], // Línea en blanco
      
      // Sección: Información de Registro
      ['INFORMACIÓN DE REGISTRO'],
      ['Campo', 'Valor'],
      ['Tipo', tipoRegistro],
      ['Sede', nombreSede],
      ['Fecha', fecha ? new Date(fecha).toLocaleDateString('es-PE') : 'N/A'],
      ['Hora', hora || 'N/A'],
    ];
    
    // Agregar sección GPS si existe
    if (asistencia.latitud && asistencia.longitud) {
      wsData.push(
        [], // Línea en blanco
        ['UBICACIÓN GPS'],
        ['Campo', 'Valor'],
        ['Latitud', asistencia.latitud || 'N/A'],
        ['Longitud', asistencia.longitud || 'N/A'],
        ['Precisión (m)', asistencia.precision_m || 'N/A'],
        ['Proveedor GPS', asistencia.proveedor_gps || 'N/A']
      );
    }
    
    // Crear hoja de cálculo desde los datos
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Aplicar anchos de columna
    ws['!cols'] = [
      { wch: 25 }, // Columna A
      { wch: 40 }  // Columna B
    ];
    
    // Aplicar estilos a las celdas (merge para el título)
    const merge = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Título principal
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // Subtítulo
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Fecha generación
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Título sección trabajador
      { s: { r: 9, c: 0 }, e: { r: 9, c: 1 } }, // Título sección registro
    ];
    
    // Agregar merge para sección GPS si existe
    if (asistencia.latitud && asistencia.longitud) {
      merge.push({ s: { r: 16, c: 0 }, e: { r: 16, c: 1 } }); // Título sección GPS
    }
    
    ws['!merges'] = merge;
    
    // Aplicar formato a celdas específicas (en Excel esto se ve como negrita)
    // Nota: xlsx no soporta estilos directamente en CSV, pero sí en .xlsx
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Asistencia');
    
    // Generar archivo Excel
    const nombreArchivo = `Asistencia_${nombreUsuario.replace(/\s+/g, '_')}_${tipoRegistro}_${fecha}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  };

  // Filtrar por búsqueda
  const asistenciasFiltradas = asistencias.filter(asistencia => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase().trim();
    
    // Obtener todos los campos posibles para búsqueda
    const nombreCompleto = (asistencia.trabajador || asistencia.nombre_usuario || asistencia.usuario?.nombre_completo || '').toLowerCase();
    const documento = (asistencia.documento || asistencia.documento_usuario || asistencia.usuario?.documento || '').toLowerCase();
    const sede = (asistencia.sede || asistencia.nombre_sede || asistencia.sede?.nombre || '').toLowerCase();
    
    // Buscar en cualquiera de los campos
    return nombreCompleto.includes(searchLower) || 
           documento.includes(searchLower) || 
           sede.includes(searchLower);
  });

  // Paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const asistenciasActuales = asistenciasFiltradas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(asistenciasFiltradas.length / registrosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Función para generar números de página inteligentes
  const generarNumerosPagina = () => {
    const delta = 2; // Cuántos números mostrar a cada lado de la página actual
    const range = [];
    const rangeWithDots = [];
    let l;

    // Siempre mostrar la primera página
    range.push(1);

    // Generar rango alrededor de la página actual
    for (let i = paginaActual - delta; i <= paginaActual + delta; i++) {
      if (i > 1 && i < totalPaginas) {
        range.push(i);
      }
    }

    // Siempre mostrar la última página
    if (totalPaginas > 1) {
      range.push(totalPaginas);
    }

    // Agregar puntos suspensivos donde haya saltos
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="reportes-asistencia-container">
      {/* Header */}
      <div className="reportes-header">
        <div className="header-content">
          <h1>📅 Reportes de Asistencia</h1>
          <p className="subtitle">Control y seguimiento de registros de entrada y salida</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={exportarDatos}>
            📥 Exportar
          </button>
          <button className="btn-refresh" onClick={cargarAsistencias}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h3>🔍 Filtros de Búsqueda</h3>
        <div className="filtros-grid">
          <div className="filtro-item">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
            />
          </div>

          <div className="filtro-item">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
            />
          </div>

          <div className="filtro-item">
            <label>Sede</label>
            <select
              value={filtros.id_sede}
              onChange={(e) => handleFiltroChange('id_sede', e.target.value)}
            >
              <option value="">Todas</option>
              {sedes.map((sede) => (
                <option key={sede.id_sede} value={sede.id_sede}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-item filtro-actions">
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="busqueda-section">
        <div className="search-box">
          <span className="search-icon">🔎</span>
          <input
            type="text"
            placeholder="Buscar por nombre, documento o sede..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1); // Resetear a la primera página al buscar
            }}
          />
          {busqueda && (
            <button 
              className="btn-limpiar-busqueda"
              onClick={() => {
                setBusqueda('');
                setPaginaActual(1);
              }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        <div className="resultados-info">
          <span className={`badge-info ${busqueda ? 'badge-info-active' : ''}`}>
            {busqueda && asistenciasFiltradas.length !== asistencias.length ? (
              <>
                {asistenciasFiltradas.length} de {asistencias.length} registros
              </>
            ) : (
              <>
                {asistenciasFiltradas.length} registros encontrados
              </>
            )}
          </span>
        </div>
      </div>

      {/* Tabla de Asistencias */}
      <div className="tabla-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando registros...</p>
          </div>
        ) : asistenciasActuales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay registros</h3>
            <p>No se encontraron asistencias con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div className="tabla-wrapper">
              <table className="tabla-asistencias">
                <thead>
                  <tr>
                    <th>Trabajador</th>
                    <th>Documento</th>
                    <th>Sede</th>
                    <th>Tipo</th>
                    <th>Fecha y Hora</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciasActuales.flatMap((asistencia, index) => {
                    // Los datos vienen agrupados de vw_export_asistencia
                    const nombreUsuario = asistencia.trabajador || 'N/A';
                    const documentoUsuario = asistencia.documento || 'N/A';
                    const nombreSede = asistencia.sede || 'N/A';
                    const fecha = asistencia.fecha;
                    const horaEntrada = asistencia.hora_entrada;
                    const horaSalida = asistencia.hora_salida;
                    
                    // Crear filas para entrada y salida
                    const filas = [];
                    
                    // Fila de entrada
                    if (horaEntrada) {
                      filas.push(
                        <tr key={`${index}-entrada`}>
                          <td>
                            <div className="trabajador-cell">
                              <div className="avatar-small">
                                {nombreUsuario.charAt(0).toUpperCase()}
                              </div>
                              <span>{nombreUsuario}</span>
                            </div>
                          </td>
                          <td>{documentoUsuario}</td>
                          <td>
                            <span className="sede-badge">
                              {nombreSede}
                            </span>
                          </td>
                          <td>
                            <span className="tipo-badge tipo-entrada">
                              📥 Entrada
                            </span>
                          </td>
                          <td>
                            <div className="fecha-cell">
                              {fecha ? (
                                <>
                                  <div>{new Date(fecha).toLocaleDateString('es-PE')}</div>
                                  <small>{horaEntrada}</small>
                                </>
                              ) : (
                                <span>Sin fecha</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="acciones-cell">
                              <button 
                                className="btn-accion btn-pdf"
                                onClick={() => exportarPDF(asistencia, 'entrada', horaEntrada)}
                                title="Exportar a PDF"
                              >
                                📄 PDF
                              </button>
                              <button 
                                className="btn-accion btn-excel"
                                onClick={() => exportarExcel(asistencia, 'entrada', horaEntrada)}
                                title="Exportar a Excel"
                              >
                                📊 Excel
                              </button>
                              <button 
                                className="btn-accion btn-ver"
                                onClick={() => verDetalle({...asistencia, tipo: 'entrada', hora: horaEntrada})}
                                title="Ver detalle"
                              >
                                👁️ Ver
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    
                    // Fila de salida
                    if (horaSalida) {
                      filas.push(
                        <tr key={`${index}-salida`}>
                          <td>
                            <div className="trabajador-cell">
                              <div className="avatar-small">
                                {nombreUsuario.charAt(0).toUpperCase()}
                              </div>
                              <span>{nombreUsuario}</span>
                            </div>
                          </td>
                          <td>{documentoUsuario}</td>
                          <td>
                            <span className="sede-badge">
                              {nombreSede}
                            </span>
                          </td>
                          <td>
                            <span className="tipo-badge tipo-salida">
                              📤 Salida
                            </span>
                          </td>
                          <td>
                            <div className="fecha-cell">
                              {fecha ? (
                                <>
                                  <div>{new Date(fecha).toLocaleDateString('es-PE')}</div>
                                  <small>{horaSalida}</small>
                                </>
                              ) : (
                                <span>Sin fecha</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="acciones-cell">
                              <button 
                                className="btn-accion btn-pdf"
                                onClick={() => exportarPDF(asistencia, 'salida', horaSalida)}
                                title="Exportar a PDF"
                              >
                                📄 PDF
                              </button>
                              <button 
                                className="btn-accion btn-excel"
                                onClick={() => exportarExcel(asistencia, 'salida', horaSalida)}
                                title="Exportar a Excel"
                              >
                                📊 Excel
                              </button>
                              <button 
                                className="btn-accion btn-ver"
                                onClick={() => verDetalle({...asistencia, tipo: 'salida', hora: horaSalida})}
                                title="Ver detalle"
                              >
                                👁️ Ver
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    
                    return filas;
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion">
                <button
                  className="btn-paginacion"
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  ← Anterior
                </button>
                
                <div className="paginas">
                  {generarNumerosPagina().map((numero, index) => (
                    numero === '...' ? (
                      <span key={`dots-${index}`} className="pagination-dots">...</span>
                    ) : (
                      <button
                        key={numero}
                        className={`btn-pagina ${paginaActual === numero ? 'active' : ''}`}
                        onClick={() => cambiarPagina(numero)}
                      >
                        {numero}
                      </button>
                    )
                  ))}
                </div>

                <button
                  className="btn-paginacion"
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalle */}
      {modalDetalle && asistenciaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detalle de Asistencia</h2>
              <button className="btn-close" onClick={cerrarModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-grid">
                <div className="detalle-section">
                  <h3>👤 Información del Trabajador</h3>
                  <div className="detalle-item">
                    <label>Nombre Completo:</label>
                    <span>{asistenciaSeleccionada.trabajador || asistenciaSeleccionada.nombre_usuario || asistenciaSeleccionada.usuario?.nombre_completo || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Documento:</label>
                    <span>{asistenciaSeleccionada.documento || asistenciaSeleccionada.documento_usuario || asistenciaSeleccionada.usuario?.documento || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Correo:</label>
                    <span>{asistenciaSeleccionada.correo || asistenciaSeleccionada.correo_usuario || asistenciaSeleccionada.usuario?.correo || 'N/A'}</span>
                  </div>
                </div>

                <div className="detalle-section">
                  <h3>📍 Información de Registro</h3>
                  <div className="detalle-item">
                    <label>Tipo:</label>
                    <span className={`tipo-badge tipo-${(asistenciaSeleccionada.tipo || 'entrada').toLowerCase()}`}>
                      {((asistenciaSeleccionada.tipo || 'entrada').toLowerCase()) === 'entrada' ? '📥 Entrada' : '📤 Salida'}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <label>Sede:</label>
                    <span>{asistenciaSeleccionada.sede || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Fecha y Hora:</label>
                    <span>
                      {asistenciaSeleccionada.fecha && asistenciaSeleccionada.hora
                        ? `${new Date(asistenciaSeleccionada.fecha).toLocaleDateString('es-PE')} ${asistenciaSeleccionada.hora}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="detalle-section">
                  <h3>🌍 Ubicación GPS</h3>
                  <div className="detalle-item">
                    <label>Latitud:</label>
                    <span>{asistenciaSeleccionada.latitud || asistenciaSeleccionada.lat || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Longitud:</label>
                    <span>{asistenciaSeleccionada.longitud || asistenciaSeleccionada.lng || asistenciaSeleccionada.lon || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Precisión:</label>
                    <span>{asistenciaSeleccionada.precision_m || asistenciaSeleccionada.precision ? `${asistenciaSeleccionada.precision_m || asistenciaSeleccionada.precision} m` : 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Proveedor GPS:</label>
                    <span>{asistenciaSeleccionada.proveedor_gps || asistenciaSeleccionada.proveedor || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Foto */}
              {asistenciaSeleccionada.foto_url && (
                <div className="foto-section">
                  <h3>📸 Fotografía de Registro</h3>
                  <img 
                    src={asistenciaSeleccionada.foto_url} 
                    alt="Foto de registro" 
                    className="foto-registro"
                  />
                </div>
              )}

              {/* Mapa */}
              {(asistenciaSeleccionada.latitud || asistenciaSeleccionada.lat) && (asistenciaSeleccionada.longitud || asistenciaSeleccionada.lng || asistenciaSeleccionada.lon) && (
                <div className="mapa-section">
                  <h3>🗺️ Ubicación en Mapa</h3>
                  <div className="mapa-placeholder">
                    <p>📍 Lat: {asistenciaSeleccionada.latitud || asistenciaSeleccionada.lat}, Lng: {asistenciaSeleccionada.longitud || asistenciaSeleccionada.lng || asistenciaSeleccionada.lon}</p>
                    <small>Mapa interactivo - Funcionalidad en desarrollo</small>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesAsistencia;
