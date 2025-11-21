import React, { useState, useEffect } from 'react';
import rrhhService from '../../services/rrhh.service';
import './ReportesHorarios.css';

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
      const response = await rrhhService.obtenerTrabajadores();
      if (response.success) {
        setTrabajadores(response.data || []);
      } else {
        setError('Error al cargar trabajadores');
      }
    } catch (error) {
      console.error('Error al cargar trabajadores:', error);
      setError('Error al cargar trabajadores');
    } finally {
      setLoading(false);
    }
  };

  const cargarReportesHorarios = async (trabajadorId) => {
    if (!trabajadorId || !fechaSeleccionada) return;

    try {
      setLoading(true);
      setError('');
      const response = await rrhhService.obtenerReportesHorarios({
        id_usuario: trabajadorId,
        fecha_inicio: fechaSeleccionada,
        fecha_fin: fechaSeleccionada
      });

      if (response.success) {
        setReportesHorarios(response.data || []);
      } else {
        setError('No se encontraron reportes horarios para esta fecha');
        setReportesHorarios([]);
      }
    } catch (error) {
      console.error('Error al cargar reportes horarios:', error);
      setError('Error al cargar reportes horarios');
      setReportesHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrabajadorChange = (trabajador) => {
    setTrabajadorSeleccionado(trabajador.id_usuario);
    setBusqueda(trabajador.nombres_completos);
    setShowDropdown(false);
    cargarReportesHorarios(trabajador.id_usuario);
  };

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaSeleccionada(nuevaFecha);
    if (trabajadorSeleccionado) {
      cargarReportesHorarios(trabajadorSeleccionado);
    }
  };

  const trabajadoresFiltrados = trabajadores.filter(t =>
    (t.nombres_completos || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (t.documento || '').includes(busqueda) ||
    (t.documento_completo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

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
            
            {showDropdown && busqueda && (
              <div className="trabajador-dropdown">
                {trabajadoresFiltrados.length > 0 ? (
                  trabajadoresFiltrados.map(trabajador => (
                    <div
                      key={trabajador.id_usuario}
                      className="trabajador-option"
                      onClick={() => handleTrabajadorChange(trabajador)}
                    >
                      <div className="trabajador-info">
                        <span className="trabajador-nombre">{trabajador.nombres_completos}</span>
                        <span className="trabajador-documento">{trabajador.documento_completo}</span>
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
                              {(reporte.latitud || 0).toFixed(6)}, {(reporte.longitud || 0).toFixed(6)}
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
                            {(reporte.distancia_metros || 0).toFixed(2)} m
                          </span>
                        </td>
                        <td data-label="Comentarios">
                          <div className="comentarios-cell">
                            {reporte.comentarios || 'Sin comentarios'}
                          </div>
                        </td>
                        <td data-label="Acciones">
                          <button
                            className="btn-mapa"
                            onClick={() => abrirGoogleMaps(reporte.latitud || 0, reporte.longitud || 0)}
                            title="Ver en Google Maps"
                          >
                            <i className="fas fa-map-marked-alt"></i>
                            <span>Mapa</span>
                          </button>
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
