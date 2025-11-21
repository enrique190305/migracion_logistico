import React, { useState, useEffect } from 'react';
import './ReportesAsistencia.css';
import { 
  obtenerReporteAsistencia, 
  obtenerTrabajadores,
  obtenerSedes 
} from '../../services/rrhh.service';

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
    // Funcionalidad de exportación a implementar
    alert('Función de exportación en desarrollo');
  };

  // Filtrar por búsqueda
  const asistenciasFiltradas = asistencias.filter(asistencia => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase();
    const nombreCompleto = (asistencia.nombre_usuario || asistencia.usuario?.nombre_completo || '').toLowerCase();
    const documento = (asistencia.documento_usuario || asistencia.usuario?.documento || '').toLowerCase();
    const sede = (asistencia.nombre_sede || asistencia.sede?.nombre || '').toLowerCase();
    
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
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="resultados-info">
          <span className="badge-info">
            {asistenciasFiltradas.length} registros encontrados
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
                            <button 
                              className="btn-ver-detalle"
                              onClick={() => verDetalle({...asistencia, tipo: 'entrada', hora: horaEntrada})}
                            >
                              👁️ Ver
                            </button>
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
                            <button 
                              className="btn-ver-detalle"
                              onClick={() => verDetalle({...asistencia, tipo: 'salida', hora: horaSalida})}
                            >
                              👁️ Ver
                            </button>
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
                  {[...Array(totalPaginas)].map((_, index) => (
                    <button
                      key={index}
                      className={`btn-pagina ${paginaActual === index + 1 ? 'active' : ''}`}
                      onClick={() => cambiarPagina(index + 1)}
                    >
                      {index + 1}
                    </button>
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
