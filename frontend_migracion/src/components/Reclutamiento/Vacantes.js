import React, { useState, useEffect } from 'react';
import { getVacantes } from '../../services/reclutamientoService';
import './Vacantes.css';

const Vacantes = () => {
  const [vacantes, setVacantes] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    busqueda: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarVacantes();
  }, []);

  const cargarVacantes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getVacantes(filtros);
      
      if (response.success) {
        setVacantes(response.data);
      } else {
        setError(response.message || 'Error al cargar vacantes');
      }
    } catch (err) {
      setError('Error de conexión al cargar vacantes');
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
    cargarVacantes();
  };

  const handleLimpiar = () => {
    setFiltros({
      estado: '',
      busqueda: ''
    });
    setTimeout(() => cargarVacantes(), 100);
  };

  const handleRefrescar = () => {
    cargarVacantes();
  };

  return (
    <div className="vacantes-container">
      {/* Header */}
      <div className="vacantes-header">
        <div className="header-content">
          <h1>Gestión de Vacantes</h1>
          <p className="subtitle">Vacantes disponibles desde el sistema de reclutamiento</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={handleRefrescar} disabled={loading}>
            <i className="fas fa-sync-alt"></i> Refrescar
          </button>
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
              placeholder="Buscar por nombre o código..."
              value={filtros.busqueda}
              onChange={handleFiltroChange}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
          </div>

          <div className="filtro-item">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              <option value="activa">Activa</option>
              <option value="cerrada">Cerrada</option>
              <option value="pausada">Pausada</option>
            </select>
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
          <p>Cargando vacantes...</p>
        </div>
      )}

      {/* Tabla de Vacantes */}
      {!loading && !error && (
        <div className="tabla-section">
          <div className="tabla-header">
            <h3>
              <i className="fas fa-briefcase"></i> Vacantes Registradas
            </h3>
            <span className="total-count">{vacantes.length} vacante(s)</span>
          </div>

          {vacantes.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No se encontraron vacantes</p>
            </div>
          ) : (
            <div className="tabla-wrapper">
              <table className="tabla-vacantes">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre Vacante</th>
                    <th>Estado</th>
                    <th>Años Mínimos</th>
                    <th>Puntuación Mínima</th>
                    <th>Puestos Objetivo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vacantes.map((vacante, index) => (
                    <tr key={index}>
                      <td>
                        <span className="codigo-badge">{vacante.job_key}</span>
                      </td>
                      <td>
                        <strong>{vacante.nombre_vacante}</strong>
                      </td>
                      <td>
                        <span className={`estado-badge estado-${vacante.estado?.toLowerCase()}`}>
                          {vacante.estado || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center">{vacante.min_years || '0'}</td>
                      <td className="text-center">{vacante.threshold || '0'}</td>
                      <td>
                        <div className="puestos-objetivo">
                          {vacante.target_titles || 'No especificado'}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn-ver-detalle"
                          title="Ver detalles"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
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

export default Vacantes;
