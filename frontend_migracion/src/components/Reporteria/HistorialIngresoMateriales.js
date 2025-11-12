import React, { useState, useEffect } from 'react';
import './HistorialComun.css';
import { obtenerBodegas } from '../../services/bodegasAPI';
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

const HistorialIngresoMateriales = () => {
  const [ingresos, setIngresos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroBodega, setFiltroBodega] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [toast, setToast] = useState(null);
  const [modalDetalles, setModalDetalles] = useState(null);
  const [detallesIngreso, setDetallesIngreso] = useState(null);

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
      
      // Intentar cargar bodegas (opcional)
      try {
        const bodegasResponse = await obtenerBodegas();
        console.log('📦 Respuesta de bodegas:', bodegasResponse);
        if (bodegasResponse.success) {
          console.log('✅ Bodegas cargadas:', bodegasResponse.data);
          setBodegas(bodegasResponse.data || []);
        } else {
          console.error('❌ Error al cargar bodegas:', bodegasResponse.message);
          setBodegas([]);
        }
      } catch (err) {
        console.warn('No se pudieron cargar bodegas:', err);
        setBodegas([]);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setIngresos([]);
      setBodegas([]);
    } finally {
      setLoading(false);
    }
  };

  const ingresosFiltrados = Array.isArray(ingresos) ? ingresos.filter(ingreso => {
    const cumpleFiltroTipo = filtroTipo === 'TODOS' || ingreso.tipo_ingreso === filtroTipo;
    const cumpleFiltroBodega = !filtroBodega || ingreso.id_bodega === parseInt(filtroBodega);
    const cumpleFechaInicio = !fechaInicio || ingreso.fecha_ingreso >= fechaInicio;
    const cumpleFechaFin = !fechaFin || ingreso.fecha_ingreso <= fechaFin;
    const cumpleBusqueda = busqueda === '' || 
      ingreso.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ingreso.bodega?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroTipo && cumpleFiltroBodega && cumpleFechaInicio && cumpleFechaFin && cumpleBusqueda;
  }) : [];

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroBodega('');
    setFiltroTipo('TODOS');
    setFechaInicio('');
    setFechaFin('');
  };

  const verDetalles = async (ingreso) => {
    try {
      setModalDetalles(true);
      setDetallesIngreso(ingreso);
      
      // Aquí podrías hacer una llamada adicional al backend si necesitas más información
      // Por ahora mostramos la información básica que ya tenemos
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      showToast('Error al cargar los detalles del ingreso', 'error');
    }
  };

  const cerrarModal = () => {
    setModalDetalles(false);
    setDetallesIngreso(null);
  };

  const descargarPDF = async (idIngreso) => {
    try {
      // Obtener token JWT del localStorage
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch(`http://localhost:8000/api/ingreso-materiales/${idIngreso}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });
      
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
      showToast('Error al generar el PDF. Por favor, intente nuevamente.', 'error');
    }
  };

  // Exportación GENERAL de todos los registros filtrados
  const exportarExcelGeneral = () => {
    try {
      if (ingresosFiltrados.length === 0) {
        showToast('⚠️ No hay datos para exportar', 'warning');
        return;
      }

      // Crear un nuevo libro de Excel
      const wb = XLSX.utils.book_new();

      // Información del encabezado
      const fechaActual = new Date().toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Crear array para la hoja con encabezado
      const data = [
        ['HISTORIAL DE INGRESO DE MATERIALES'],
        ['Fecha de generación:', fechaActual],
        ['Total de registros:', ingresosFiltrados.length],
        [], // Fila vacía
        ['N°', 'CORRELATIVO', 'FECHA', 'BODEGA', 'PROVEEDOR', 'TIPO', 'PRODUCTOS', 'USUARIO'] // Encabezados
      ];

      // Agregar los datos
      ingresosFiltrados.forEach((ingreso, index) => {
        data.push([
          index + 1,
          ingreso.correlativo || 'N/A',
          ingreso.fecha_ingreso 
            ? new Date(ingreso.fecha_ingreso).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : 'N/A',
          ingreso.bodega || 'N/A',
          ingreso.proveedor || 'N/A',
          ingreso.tipo_ingreso || 'COMPRA',
          ingreso.total_productos || 0,
          ingreso.usuario || 'Sistema'
        ]);
      });

      // Agregar fila de totales
      data.push([]);
      data.push([
        '',
        'TOTAL GENERAL',
        '',
        '',
        '',
        '',
        ingresosFiltrados.reduce((sum, i) => sum + (parseInt(i.total_productos) || 0), 0),
        ''
      ]);

      // Crear la hoja de cálculo
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Establecer el ancho de las columnas
      ws['!cols'] = [
        { wch: 5 },  // N°
        { wch: 15 }, // CORRELATIVO
        { wch: 12 }, // FECHA
        { wch: 30 }, // BODEGA
        { wch: 30 }, // PROVEEDOR
        { wch: 15 }, // TIPO
        { wch: 12 }, // PRODUCTOS
        { wch: 20 }  // USUARIO
      ];

      // Combinar celdas del título
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Título
      ];

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Historial Ingresos');

      // Generar el nombre del archivo
      const nombreArchivo = `Historial_Ingresos_Materiales_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(wb, nombreArchivo);

      showToast(`✅ Excel generado exitosamente: ${ingresosFiltrados.length} registros`, 'success');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      showToast('❌ Error al exportar a Excel', 'error');
    }
  };

  // Exportación INDIVIDUAL de un ingreso específico
  const exportarIngresoIndividual = async (ingreso) => {
    try {
      // Crear un nuevo libro de Excel
      const wb = XLSX.utils.book_new();
      
      const fechaIngreso = new Date(ingreso.fecha_ingreso).toLocaleDateString('es-PE', { 
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

      // Crear datos para la hoja
      const wsData = [
        [`INGRESO DE MATERIAL - ${ingreso.correlativo}`],
        [`Fecha de ingreso: ${fechaIngreso}`],
        [`Generado: ${fechaGeneracion}`],
        [],
        ['INFORMACIÓN DEL INGRESO'],
        ['Correlativo:', ingreso.correlativo || 'N/A'],
        ['Fecha:', fechaIngreso],
        ['Bodega:', ingreso.bodega || 'N/A'],
        ['Proveedor:', ingreso.proveedor || 'N/A'],
        ['Tipo:', ingreso.tipo_ingreso || 'COMPRA'],
        ['Total Productos:', ingreso.total_productos || 0],
        ['Usuario:', ingreso.usuario || 'Sistema'],
        ['N° Guía:', ingreso.num_guia || 'N/A'],
        ['N° Factura:', ingreso.factura || 'N/A'],
        ['Estado:', ingreso.estado || 'N/A']
      ];

      // Crear hoja de trabajo
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Configurar anchos de columna
      ws['!cols'] = [
        { wch: 20 },
        { wch: 40 }
      ];

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, `Ingreso-${ingreso.correlativo}`);

      // Generar archivo y descargar
      XLSX.writeFile(wb, `Ingreso_${ingreso.correlativo}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast(`✅ Excel generado: ${ingreso.correlativo}`, 'success');
    } catch (error) {
      console.error('Error al exportar ingreso:', error);
      showToast('❌ Error al exportar el ingreso', 'error');
    }
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
          <label>🏪 Bodega:</label>
          <select 
            value={filtroBodega} 
            onChange={(e) => setFiltroBodega(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todas las bodegas</option>
            {Array.isArray(bodegas) && bodegas.map(bodega => (
              <option key={bodega.id_bodega || bodega.id} value={bodega.id_bodega || bodega.id}>
                {bodega.nombre || bodega.nombre_bodega}
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

        <button 
          className="btn-recargar" 
          onClick={exportarExcelGeneral}
          disabled={ingresosFiltrados.length === 0}
          style={{ 
            background: ingresosFiltrados.length === 0 ? '#95a5a6' : '#10b981',
            cursor: ingresosFiltrados.length === 0 ? 'not-allowed' : 'pointer'
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
                        onClick={() => exportarIngresoIndividual(ingreso)}
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

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}

      {/* Modal de Detalles */}
      {modalDetalles && detallesIngreso && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📥 Detalles del Ingreso de Material</h2>
              <button className="modal-close-btn" onClick={cerrarModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-seccion">
                <h3>📋 Información General</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Correlativo:</span>
                    <span className="detalle-valor">{detallesIngreso.correlativo || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha de Ingreso:</span>
                    <span className="detalle-valor">
                      {detallesIngreso.fecha_ingreso 
                        ? new Date(detallesIngreso.fecha_ingreso).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Tipo de Ingreso:</span>
                    <span className="detalle-valor badge-tipo">{detallesIngreso.tipo_ingreso || 'COMPRA'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Estado:</span>
                    <span className="detalle-valor badge-estado">{detallesIngreso.estado || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>🏪 Información de Bodega</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Bodega:</span>
                    <span className="detalle-valor">{detallesIngreso.bodega || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Total de Productos:</span>
                    <span className="detalle-valor badge-productos">{detallesIngreso.total_productos || 0}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>👤 Información Adicional</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Proveedor:</span>
                    <span className="detalle-valor">{detallesIngreso.proveedor || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Usuario:</span>
                    <span className="detalle-valor">{detallesIngreso.usuario || 'Sistema'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">N° Guía:</span>
                    <span className="detalle-valor">{detallesIngreso.num_guia || 'N/A'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">N° Factura:</span>
                    <span className="detalle-valor">{detallesIngreso.factura || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cerrar" onClick={cerrarModal}>
                Cerrar
              </button>
              <button 
                className="btn-modal-pdf" 
                onClick={() => {
                  descargarPDF(detallesIngreso.id_ingreso);
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

export default HistorialIngresoMateriales;
