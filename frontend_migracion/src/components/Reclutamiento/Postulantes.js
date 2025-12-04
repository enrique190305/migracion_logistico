import React, { useState, useEffect } from 'react';
import { getPostulantes } from '../../services/reclutamientoService';
import './Postulantes.css';

const Postulantes = () => {
  const [postulantes, setPostulantes] = useState([]);
  const [filtros, setFiltros] = useState({
    idoneo: '',
    puntuacion_min: '',
    busqueda: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState({
    campo: 'puntuacion',
    direccion: 'desc'
  });

  useEffect(() => {
    cargarPostulantes();
  }, []);

  const cargarPostulantes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPostulantes(filtros);
      
      if (response.success) {
        setPostulantes(response.data);
      } else {
        setError(response.message || 'Error al cargar postulantes');
      }
    } catch (err) {
      setError('Error de conexión al cargar postulantes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBuscar = () => {
    cargarPostulantes();
  };

  const handleLimpiar = () => {
    setFiltros({
      idoneo: '',
      puntuacion_min: '',
      busqueda: ''
    });
    setTimeout(() => cargarPostulantes(), 100);
  };

  const handleRefrescar = () => {
    cargarPostulantes();
  };

  const handleOrdenar = (campo) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const postulantesOrdenados = [...postulantes].sort((a, b) => {
    const { campo, direccion } = ordenamiento;
    let valorA = a[campo];
    let valorB = b[campo];

    // Convertir a número si es puntuación
    if (campo === 'puntuacion') {
      valorA = parseFloat(valorA) || 0;
      valorB = parseFloat(valorB) || 0;
    }

    if (direccion === 'asc') {
      return valorA > valorB ? 1 : -1;
    } else {
      return valorA < valorB ? 1 : -1;
    }
  });

  const getPuntuacionClass = (puntuacion) => {
    const valor = parseFloat(puntuacion) || 0;
    if (valor >= 80) return 'puntuacion-excelente';
    if (valor >= 70) return 'puntuacion-buena';
    if (valor >= 50) return 'puntuacion-regular';
    return 'puntuacion-baja';
  };

  return (
    <div className="postulantes-container">
      {/* Header */}
      <div className="postulantes-header">
        <div className="header-content">
          <h1>Gestión de Postulantes</h1>
          <p className="subtitle">Candidatos registrados en el sistema de reclutamiento</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={handleRefrescar} disabled={loading}>
            <i className="fas fa-sync-alt"></i> Refrescar
          </button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon stat-icon-total">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{postulantes.length}</div>
            <div className="stat-label">Total Postulantes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-aprobados">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {postulantes.filter(p => p.idoneo?.toLowerCase() === 'sí').length}
            </div>
            <div className="stat-label">Idóneos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-promedio">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {postulantes.length > 0
                ? (postulantes.reduce((sum, p) => sum + (parseFloat(p.puntuacion) || 0), 0) / postulantes.length).toFixed(1)
                : '0'}
            </div>
            <div className="stat-label">Puntuación Promedio</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h3>
          <i className="fas fa-filter"></i> Filtros
        </h3>
        <div className="filtros-grid">
          <div className="filtro-item">
            <label htmlFor="busqueda">Búsqueda</label>
            <input
              type="text"
              id="busqueda"
              name="busqueda"
              placeholder="Nombre, correo o puesto..."
              value={filtros.busqueda}
              onChange={handleFiltroChange}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
          </div>

          <div className="filtro-item">
            <label htmlFor="idoneo">Idoneidad</label>
            <select
              id="idoneo"
              name="idoneo"
              value={filtros.idoneo}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              <option value="sí">Idóneo</option>
              <option value="no">No Idóneo</option>
            </select>
          </div>

          <div className="filtro-item">
            <label htmlFor="puntuacion_min">Puntuación Mínima</label>
            <input
              type="number"
              id="puntuacion_min"
              name="puntuacion_min"
              placeholder="Ej: 70"
              min="0"
              max="100"
              value={filtros.puntuacion_min}
              onChange={handleFiltroChange}
            />
          </div>

          <div className="filtros-actions">
            <button className="btn-buscar" onClick={handleBuscar} disabled={loading}>
              <i className="fas fa-search"></i> Buscar
            </button>
            <button className="btn-limpiar" onClick={handleLimpiar} disabled={loading}>
              <i className="fas fa-eraser"></i> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando postulantes...</p>
        </div>
      )}

      {/* Tabla de Postulantes */}
      {!loading && !error && (
        <div className="tabla-section">
          <div className="tabla-header">
            <h3>
              <i className="fas fa-list"></i> Postulantes Registrados
            </h3>
            <span className="total-count">{postulantesOrdenados.length} postulante(s)</span>
          </div>

          {postulantesOrdenados.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No se encontraron postulantes</p>
            </div>
          ) : (
            <div className="tabla-wrapper">
              <table className="tabla-postulantes">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Puesto Objetivo</th>
                    <th>Experiencia</th>
                    <th 
                      className="sortable"
                      onClick={() => handleOrdenar('puntuacion')}
                    >
                      Puntuación
                      {ordenamiento.campo === 'puntuacion' && (
                        <i className={`fas fa-sort-${ordenamiento.direccion === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Idóneo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {postulantesOrdenados.map((postulante, index) => (
                    <tr key={index}>
                      <td className="fecha-cell">
                        {new Date(postulante.fecha_registro).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <strong>{postulante.nombre}</strong>
                      </td>
                      <td className="email-cell">{postulante.correo}</td>
                      <td>{postulante.puesto_objetivo || 'N/A'}</td>
                      <td className="text-center">{postulante.años_experiencia || '0'} años</td>
                      <td className="text-center">
                        <span className={`puntuacion-badge ${getPuntuacionClass(postulante.puntuacion)}`}>
                          {parseFloat(postulante.puntuacion || 0).toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`idoneo-badge idoneo-${postulante.idoneo?.toLowerCase() === 'sí' ? 'si' : 'no'}`}>
                          {postulante.idoneo || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-cell">
                          <button 
                            className="btn-ver-cv"
                            onClick={() => window.open(postulante.enlace_archivo, '_blank')}
                            title="Ver CV"
                            disabled={!postulante.enlace_archivo}
                          >
                            <i className="fas fa-file-pdf"></i>
                          </button>
                          <button 
                            className="btn-ver-detalle"
                            title="Ver detalles"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Postulantes;
