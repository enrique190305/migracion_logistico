import React, { useState, useEffect } from 'react';
import './ReportesEmergencias.css';
import { 
  obtenerEmergencias, 
  obtenerTrabajadores
} from '../../services/rrhh.service';

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
