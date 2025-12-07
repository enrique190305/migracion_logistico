// ============================================
// UTILIDADES: Exportación de Horarios
// ============================================
// Funciones para exportar horarios a PDF, Excel e Imprimir

/**
 * Exportar horarios a PDF
 * @param {Object} data - Datos de horarios { fecha, trabajadores, asignaciones, estadisticas }
 */
export const exportToPDF = async (data) => {
  try {
    const { jsPDF } = window.jspdf || {};
    
    if (!jsPDF) {
      alert('⚠️ Librería jsPDF no está disponible. Por favor, recarga la página.');
      return;
    }

    const doc = new jsPDF();
    const fecha = new Date(data.fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('GESTIÓN DE HORARIOS', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${fecha}`, 105, 30, { align: 'center' });
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    let yPos = 45;

    // Estadísticas
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Estadísticas del Día', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`☀️ Turno 1 (T1): ${data.estadisticas.t1} trabajadores`, 25, yPos);
    yPos += 7;
    doc.text(`🌙 Turno 2 (T2): ${data.estadisticas.t2} trabajadores`, 25, yPos);
    yPos += 7;
    doc.text(`😴 Descanso: ${data.estadisticas.descanso} trabajadores`, 25, yPos);
    yPos += 7;
    doc.text(`❓ Sin asignar: ${data.estadisticas.sinAsignar} trabajadores`, 25, yPos);
    
    yPos += 15;

    // Trabajadores por turno
    const turnosData = {
      'T1': { titulo: 'TURNO 1 (T1)', emoji: '☀️', trabajadores: [] },
      'T2': { titulo: 'TURNO 2 (T2)', emoji: '🌙', trabajadores: [] },
      'DESCANSO': { titulo: 'DESCANSO', emoji: '😴', trabajadores: [] },
      'SIN_ASIGNAR': { titulo: 'SIN ASIGNAR', emoji: '❓', trabajadores: [] }
    };

    // Organizar trabajadores por turno
    data.trabajadores.forEach(trabajador => {
      const turno = data.asignaciones[trabajador.id] || 'SIN_ASIGNAR';
      turnosData[turno].trabajadores.push(trabajador);
    });

    // Imprimir cada turno
    Object.values(turnosData).forEach(turnoInfo => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(`${turnoInfo.emoji} ${turnoInfo.titulo} (${turnoInfo.trabajadores.length})`, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      turnoInfo.trabajadores.forEach((trabajador, index) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        
        const texto = `${index + 1}. ${trabajador.nombreCompleto} - DNI: ${trabajador.documento}`;
        doc.text(texto, 25, yPos);
        yPos += 6;
      });

      yPos += 10;
    });

    // Footer en última página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.text(
        `Process-One - Sistema de Gestión | Página ${i} de ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
    }

    // Descargar
    doc.save(`horarios_${data.fecha}.pdf`);
    return true;
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    alert('❌ Error al generar el PDF. Verifica que jsPDF esté cargado.');
    return false;
  }
};

/**
 * Exportar horarios a Excel
 * @param {Object} data - Datos de horarios { fecha, trabajadores, asignaciones, estadisticas }
 */
export const exportToExcel = async (data) => {
  try {
    const XLSX = window.XLSX;
    
    if (!XLSX) {
      alert('⚠️ Librería XLSX no está disponible. Por favor, recarga la página.');
      return;
    }

    const fecha = new Date(data.fecha).toLocaleDateString('es-PE');

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja 1: Listado completo
    const wsData = [
      ['GESTIÓN DE HORARIOS'],
      [`Fecha: ${fecha}`],
      [],
      ['Nro', 'DNI', 'Nombres', 'Apellidos', 'Turno Asignado'],
    ];

    data.trabajadores.forEach((trabajador, index) => {
      const turno = data.asignaciones[trabajador.id] || 'SIN ASIGNAR';
      wsData.push([
        index + 1,
        trabajador.documento,
        trabajador.nombres,
        trabajador.apellidos,
        turno
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 5 },   // Nro
      { wch: 12 },  // DNI
      { wch: 20 },  // Nombres
      { wch: 25 },  // Apellidos
      { wch: 15 }   // Turno
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Horarios');

    // Hoja 2: Estadísticas
    const wsStats = XLSX.utils.aoa_to_sheet([
      ['ESTADÍSTICAS DEL DÍA'],
      [`Fecha: ${fecha}`],
      [],
      ['Turno', 'Cantidad', 'Porcentaje'],
      ['Turno 1 (T1)', data.estadisticas.t1, `${((data.estadisticas.t1 / data.trabajadores.length) * 100).toFixed(1)}%`],
      ['Turno 2 (T2)', data.estadisticas.t2, `${((data.estadisticas.t2 / data.trabajadores.length) * 100).toFixed(1)}%`],
      ['Descanso', data.estadisticas.descanso, `${((data.estadisticas.descanso / data.trabajadores.length) * 100).toFixed(1)}%`],
      ['Sin asignar', data.estadisticas.sinAsignar, `${((data.estadisticas.sinAsignar / data.trabajadores.length) * 100).toFixed(1)}%`],
      [],
      ['Total trabajadores', data.trabajadores.length, '100%']
    ]);

    wsStats['!cols'] = [
      { wch: 20 },
      { wch: 12 },
      { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');

    // Descargar
    XLSX.writeFile(wb, `horarios_${data.fecha}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    alert('❌ Error al generar el archivo Excel. Verifica que XLSX esté cargado.');
    return false;
  }
};

/**
 * Imprimir horarios
 * @param {Object} data - Datos de horarios { fecha, trabajadores, asignaciones, estadisticas }
 */
export const printHorarios = (data) => {
  try {
    const fecha = new Date(data.fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Organizar trabajadores por turno
    const turnosData = {
      'T1': { titulo: 'TURNO 1 (T1)', emoji: '☀️', color: '#3B82F6', trabajadores: [] },
      'T2': { titulo: 'TURNO 2 (T2)', emoji: '🌙', color: '#10B981', trabajadores: [] },
      'DESCANSO': { titulo: 'DESCANSO', emoji: '😴', color: '#6B7280', trabajadores: [] },
      'SIN_ASIGNAR': { titulo: 'SIN ASIGNAR', emoji: '❓', color: '#F3F4F6', trabajadores: [] }
    };

    data.trabajadores.forEach(trabajador => {
      const turno = data.asignaciones[trabajador.id] || 'SIN_ASIGNAR';
      turnosData[turno].trabajadores.push(trabajador);
    });

    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    
    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Horarios - ${fecha}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 24px;
            color: #1F2937;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            color: #6B7280;
          }
          
          .estadisticas {
            background: #F3F4F6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .estadisticas h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #1F2937;
          }
          
          .estadisticas-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          
          .stat-item {
            padding: 10px;
            background: white;
            border-radius: 5px;
            font-size: 14px;
          }
          
          .turno-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .turno-header {
            padding: 12px;
            border-radius: 8px 8px 0 0;
            color: white;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 0;
          }
          
          .turno-lista {
            border: 2px solid #E5E7EB;
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 15px;
          }
          
          .trabajador-item {
            padding: 8px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 13px;
          }
          
          .trabajador-item:last-child {
            border-bottom: none;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            border-top: 1px solid #E5E7EB;
            padding-top: 15px;
          }
          
          @media print {
            body {
              padding: 10px;
            }
            
            .turno-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🕐 GESTIÓN DE HORARIOS</h1>
          <p>Process-One - Sistema de Gestión</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
        </div>
        
        <div class="estadisticas">
          <h2>📊 Estadísticas del Día</h2>
          <div class="estadisticas-grid">
            <div class="stat-item">☀️ <strong>Turno 1:</strong> ${data.estadisticas.t1} trabajadores</div>
            <div class="stat-item">🌙 <strong>Turno 2:</strong> ${data.estadisticas.t2} trabajadores</div>
            <div class="stat-item">😴 <strong>Descanso:</strong> ${data.estadisticas.descanso} trabajadores</div>
            <div class="stat-item">❓ <strong>Sin asignar:</strong> ${data.estadisticas.sinAsignar} trabajadores</div>
          </div>
        </div>
        
        ${Object.entries(turnosData).map(([key, turnoInfo]) => `
          <div class="turno-section">
            <div class="turno-header" style="background-color: ${turnoInfo.color};">
              ${turnoInfo.emoji} ${turnoInfo.titulo} (${turnoInfo.trabajadores.length} trabajadores)
            </div>
            <div class="turno-lista">
              ${turnoInfo.trabajadores.length > 0 
                ? turnoInfo.trabajadores.map((trabajador, index) => `
                  <div class="trabajador-item">
                    <strong>${index + 1}.</strong> ${trabajador.nombreCompleto} - <em>DNI: ${trabajador.documento}</em>
                  </div>
                `).join('')
                : '<div class="trabajador-item" style="text-align: center; color: #9CA3AF;">No hay trabajadores asignados</div>'
              }
            </div>
          </div>
        `).join('')}
        
        <div class="footer">
          <p><strong>Total de trabajadores:</strong> ${data.trabajadores.length}</p>
          <p>Generado el ${new Date().toLocaleString('es-PE')}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    ventanaImpresion.document.close();
    return true;
  } catch (error) {
    console.error('Error al imprimir:', error);
    alert('❌ Error al generar la vista de impresión.');
    return false;
  }
};

/**
 * Cargar librerías necesarias (jsPDF y XLSX)
 */
export const loadExportLibraries = () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya están cargadas
    if (window.jspdf && window.XLSX) {
      resolve(true);
      return;
    }

    const scriptsToLoad = [];

    // Cargar jsPDF
    if (!window.jspdf) {
      const jsPDFScript = document.createElement('script');
      jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      scriptsToLoad.push(
        new Promise((res, rej) => {
          jsPDFScript.onload = () => res();
          jsPDFScript.onerror = () => rej('Error cargando jsPDF');
          document.head.appendChild(jsPDFScript);
        })
      );
    }

    // Cargar XLSX
    if (!window.XLSX) {
      const xlsxScript = document.createElement('script');
      xlsxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      scriptsToLoad.push(
        new Promise((res, rej) => {
          xlsxScript.onload = () => res();
          xlsxScript.onerror = () => rej('Error cargando XLSX');
          document.head.appendChild(xlsxScript);
        })
      );
    }

    if (scriptsToLoad.length === 0) {
      resolve(true);
    } else {
      Promise.all(scriptsToLoad)
        .then(() => resolve(true))
        .catch(err => reject(err));
    }
  });
};
