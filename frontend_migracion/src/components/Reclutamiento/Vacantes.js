import React, { useState, useEffect } from 'react';
import { getVacantes, updateVacante } from '../../services/reclutamientoService';
import './Vacantes.css';

const Vacantes = () => {
  const [vacantes, setVacantes] = useState([]);
  const [vacantesOriginales, setVacantesOriginales] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    busqueda: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [vacanteEditar, setVacanteEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarVacantes();
  }, []);

  // Aplicar filtros automáticamente cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, vacantesOriginales]);

  const cargarVacantes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar todas las vacantes sin filtros
      const response = await getVacantes({});
      
      if (response.success) {
        setVacantesOriginales(response.data);
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

  const aplicarFiltros = () => {
    let resultado = [...vacantesOriginales];

    // Filtro de búsqueda (código o nombre de vacante)
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      const busqueda = filtros.busqueda.toLowerCase().trim();
      resultado = resultado.filter(v => 
        (v.job_key?.toLowerCase() || '').includes(busqueda) ||
        (v.nombre_vacante?.toLowerCase() || '').includes(busqueda)
      );
    }

    // Filtro de estado
    if (filtros.estado && filtros.estado !== '') {
      resultado = resultado.filter(v => 
        v.estado?.toLowerCase() === filtros.estado.toLowerCase()
      );
    }

    setVacantes(resultado);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLimpiar = () => {
    setFiltros({
      estado: '',
      busqueda: ''
    });
  };

  const handleRefrescar = () => {
    cargarVacantes();
  };

  const handleAbrirModalEditar = (vacante) => {
    setVacanteEditar({ ...vacante });
    setModalEditar(true);
  };

  const handleCerrarModal = () => {
    setModalEditar(false);
    setVacanteEditar(null);
    setError(null);
  };

  const handleCambioFormulario = (e) => {
    const { name, value } = e.target;
    setVacanteEditar(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardarVacante = async () => {
    if (!vacanteEditar) return;

    // Validaciones
    if (!vacanteEditar.nombre_vacante || !vacanteEditar.nombre_vacante.trim()) {
      setError('El nombre de la vacante es obligatorio');
      return;
    }

    if (!vacanteEditar.estado) {
      setError('Debe seleccionar un estado');
      return;
    }

    if (!vacanteEditar.min_years || parseFloat(vacanteEditar.min_years) < 0) {
      setError('Los años mínimos deben ser un número válido');
      return;
    }

    if (!vacanteEditar.threshold || parseFloat(vacanteEditar.threshold) < 0 || parseFloat(vacanteEditar.threshold) > 100) {
      setError('La puntuación mínima debe estar entre 0 y 100');
      return;
    }

    if (!vacanteEditar.target_titles || !vacanteEditar.target_titles.trim()) {
      setError('Los puestos objetivo son obligatorios');
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const response = await updateVacante(vacanteEditar.job_key, {
        nombre_vacante: vacanteEditar.nombre_vacante.trim(),
        estado: vacanteEditar.estado,
        min_years: parseFloat(vacanteEditar.min_years),
        threshold: parseFloat(vacanteEditar.threshold),
        target_titles: vacanteEditar.target_titles.trim(),
      });

      if (response.success) {
        // Actualizar la lista de vacantes
        await cargarVacantes();
        handleCerrarModal();
      } else {
        setError(response.message || 'Error al actualizar la vacante');
      }
    } catch (err) {
      setError('Error de conexión al actualizar la vacante');
      console.error(err);
    } finally {
      setGuardando(false);
    }
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
              <option value="inactiva">Inactiva</option>
            </select>
          </div>

          <div className="filtros-actions">
            <button className="btn-limpiar" onClick={handleLimpiar} disabled={loading}>
              <i className="fas fa-eraser"></i> LIMPIAR
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
                        <div className="acciones-vacante">
                          <button 
                            className="btn-editar"
                            onClick={() => handleAbrirModalEditar(vacante)}
                            title="Editar vacante"
                          >
                            <i className="fas fa-edit"></i>
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

      {/* Modal de Edición */}
      {modalEditar && vacanteEditar && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-edit"></i> Editar Vacante
              </h2>
              <button className="btn-close-modal" onClick={handleCerrarModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="error-message-modal">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="job_key">Código</label>
                  <input
                    type="text"
                    id="job_key"
                    name="job_key"
                    value={vacanteEditar.job_key || ''}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nombre_vacante">
                    Nombre de la Vacante <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre_vacante"
                    name="nombre_vacante"
                    value={vacanteEditar.nombre_vacante || ''}
                    onChange={handleCambioFormulario}
                    placeholder="Ej: Desarrollador Backend"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estado">
                    Estado <span className="required">*</span>
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={vacanteEditar.estado || ''}
                    onChange={handleCambioFormulario}
                  >
                    <option value="">Seleccione...</option>
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="min_years">
                    Años Mínimos <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="min_years"
                    name="min_years"
                    value={vacanteEditar.min_years || ''}
                    onChange={handleCambioFormulario}
                    min="0"
                    step="0.5"
                    placeholder="Ej: 2"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="threshold">
                    Puntuación Mínima <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="threshold"
                    name="threshold"
                    value={vacanteEditar.threshold || ''}
                    onChange={handleCambioFormulario}
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Ej: 60"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="target_titles">
                    Puestos Objetivo <span className="required">*</span>
                  </label>
                  <textarea
                    id="target_titles"
                    name="target_titles"
                    value={vacanteEditar.target_titles || ''}
                    onChange={handleCambioFormulario}
                    rows="3"
                    placeholder="Ej: backend, backend developer, desarrollador backend..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancelar-modal" 
                onClick={handleCerrarModal}
                disabled={guardando}
              >
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button 
                className="btn-guardar-modal" 
                onClick={handleGuardarVacante}
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vacantes;
