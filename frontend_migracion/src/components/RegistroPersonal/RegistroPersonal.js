import React, { useState, useEffect } from 'react';
import './RegistroPersonal.css';

const RegistroPersonal = () => {
  // Estados
  const [personal, setPersonal] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Formulario
  const [formData, setFormData] = useState({
    id_personal: null,
    id_proyecto: '',
    id_area: '',
    nom_ape: '',
    dni: '',
    ciudad: '',
    observaciones: '',
    firma: null
  });

  // Notificaciones
  const [notificacion, setNotificacion] = useState(null);

  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroArea, setFiltroArea] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarPersonal(),
        cargarProyectos(),
        cargarAreas()
      ]);
    } catch (error) {
      mostrarNotificacion('error', 'Error al cargar datos', error.message);
    } finally {
      setLoading(false);
    }
  };

// ...existing code...

const cargarPersonal = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/personal');
    const data = await response.json();
    
    // ✅ CORRECCIÓN: Validar que sea un array
    if (Array.isArray(data)) {
      setPersonal(data);
    } else if (data.success && Array.isArray(data.data)) {
      setPersonal(data.data);
    } else {
      setPersonal([]);
      console.error('Formato inesperado de personal:', data);
    }
  } catch (error) {
    console.error('Error al cargar personal:', error);
    setPersonal([]); // ✅ Asegurar array vacío en caso de error
  }
};

const cargarProyectos = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/proyectos');
    const data = await response.json();
    
    // ✅ CORRECCIÓN: Validar que sea un array
    if (Array.isArray(data)) {
      setProyectos(data);
    } else if (data.success && Array.isArray(data.data)) {
      setProyectos(data.data);
    } else {
      setProyectos([]);
      console.error('Formato inesperado de proyectos:', data);
    }
  } catch (error) {
    console.error('Error al cargar proyectos:', error);
    setProyectos([]); // ✅ Asegurar array vacío en caso de error
  }
};

const cargarAreas = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/areas');
    const data = await response.json();
    
    // ✅ CORRECCIÓN: Validar que sea un array
    if (Array.isArray(data)) {
      setAreas(data);
    } else if (data.success && Array.isArray(data.data)) {
      setAreas(data.data);
    } else {
      setAreas([]);
      console.error('Formato inesperado de áreas:', data);
    }
  } catch (error) {
    console.error('Error al cargar áreas:', error);
    setAreas([]); // ✅ Asegurar array vacío en caso de error
  }
};

// ...existing code...

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          firma: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const abrirModalNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (persona) => {
    setFormData({
      id_personal: persona.id_personal,
      id_proyecto: persona.id_proyecto,
      id_area: persona.id_area,
      nom_ape: persona.nom_ape,
      dni: persona.dni,
      ciudad: persona.ciudad,
      observaciones: persona.observaciones || '',
      firma: persona.firma
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nom_ape || !formData.dni || !formData.id_proyecto || !formData.id_area) {
      mostrarNotificacion('warning', 'Campos requeridos', 'Complete todos los campos obligatorios');
      return;
    }

    if (formData.dni.length !== 8) {
      mostrarNotificacion('warning', 'DNI inválido', 'El DNI debe tener 8 dígitos');
      return;
    }

    try {
      setLoading(true);

      const url = modoEdicion 
        ? `http://localhost:8000/api/personal/${formData.id_personal}`
        : 'http://localhost:8000/api/personal';
      
      const method = modoEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar el personal');
      }

      mostrarNotificacion(
        'success',
        modoEdicion ? '✅ Personal Actualizado' : '✅ Personal Registrado',
        `${formData.nom_ape} ha sido ${modoEdicion ? 'actualizado' : 'registrado'} exitosamente`
      );

      cerrarModal();
      cargarPersonal();

    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('error', 'Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar a ${nombre}?`)) {
      try {
        setLoading(true);

        const response = await fetch(`http://localhost:8000/api/personal/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al eliminar');
        }

        mostrarNotificacion('success', '✅ Personal Eliminado', `${nombre} ha sido eliminado`);
        cargarPersonal();

      } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('error', 'Error al eliminar', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setFormData({
      id_personal: null,
      id_proyecto: '',
      id_area: '',
      nom_ape: '',
      dni: '',
      ciudad: '',
      observaciones: '',
      firma: null
    });
  };

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    setNotificacion({ tipo, titulo, mensaje });
    setTimeout(() => setNotificacion(null), 4000);
  };

  // Filtrar personal
  const personalFiltrado = personal.filter(p => {
    const coincideBusqueda = 
      p.nom_ape.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.dni.includes(busqueda);
    
    const coincideProyecto = !filtroProyecto || p.id_proyecto == filtroProyecto;
    const coincideArea = !filtroArea || p.id_area == filtroArea;

    return coincideBusqueda && coincideProyecto && coincideArea;
  });

  return (
    <div className="registro-personal-container">
      {/* Header */}
      <div className="personal-header">
        <div className="header-content">
          <h2>👥 Registro de Personal</h2>
          <p className="subtitle">Gestión de personal asignado a proyectos</p>
        </div>
        <button className="btn-nuevo" onClick={abrirModalNuevo}>
          <span className="icon">➕</span>
          Nuevo Personal
        </button>
      </div>

      {/* Notificaciones */}
      {notificacion && (
        <div className={`notificacion notificacion-${notificacion.tipo}`}>
          <div className="notificacion-header">
            <strong>{notificacion.titulo}</strong>
            <button onClick={() => setNotificacion(null)}>✕</button>
          </div>
          <p>{notificacion.mensaje}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-busqueda">
          <span className="icon-busqueda">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtros-select">
          <select value={filtroProyecto} onChange={(e) => setFiltroProyecto(e.target.value)}>
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => (
              <option key={p.id_proyecto} value={p.id_proyecto}>
                {p.nombre}
              </option>
            ))}
          </select>

          <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
            <option value="">Todas las áreas</option>
            {areas.map(a => (
              <option key={a.id_area} value={a.id_area}>
                {a.nombre_area}
              </option>
            ))}
          </select>

          {(busqueda || filtroProyecto || filtroArea) && (
            <button 
              className="btn-limpiar-filtros"
              onClick={() => {
                setBusqueda('');
                setFiltroProyecto('');
                setFiltroArea('');
              }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Personal */}
      <div className="tabla-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando personal...</p>
          </div>
        ) : (
          <table className="tabla-personal">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>DNI</th>
                <th>Proyecto</th>
                <th>Área</th>
                <th>Ciudad</th>
                <th>Observaciones</th>
                <th>Firma</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personalFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="9" className="sin-datos">
                    {busqueda || filtroProyecto || filtroArea 
                      ? '🔍 No se encontraron resultados con los filtros aplicados'
                      : '📋 No hay personal registrado'}
                  </td>
                </tr>
              ) : (
                personalFiltrado.map(p => (
                  <tr key={p.id_personal}>
                    <td>{p.id_personal}</td>
                    <td className="nombre-columna">
                      <span className="avatar">👤</span>
                      {p.nom_ape}
                    </td>
                    <td className="dni-columna">{p.dni}</td>
                    <td>
                      <span className="badge badge-proyecto">
                        {proyectos.find(pr => pr.id_proyecto === p.id_proyecto)?.nombre || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-area">
                        {areas.find(a => a.id_area === p.id_area)?.nombre_area || 'N/A'}
                      </span>
                    </td>
                    <td>{p.ciudad}</td>
                    <td className="observaciones-columna">
                      {p.observaciones || '-'}
                    </td>
                    <td className="firma-columna">
                      {p.firma ? (
                        <img src={p.firma} alt="Firma" className="firma-preview" />
                      ) : (
                        <span className="sin-firma">Sin firma</span>
                      )}
                    </td>
                    <td className="acciones-columna">
                      <button 
                        className="btn-editar"
                        onClick={() => abrirModalEditar(p)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => confirmarEliminar(p.id_personal, p.nom_ape)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Estadísticas */}
      <div className="estadisticas">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Total Personal</span>
            <span className="stat-value">{personal.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Proyectos Activos</span>
            <span className="stat-value">{proyectos.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <span className="stat-label">Áreas</span>
            <span className="stat-value">{areas.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <span className="stat-label">Resultados Filtrados</span>
            <span className="stat-value">{personalFiltrado.length}</span>
          </div>
        </div>
      </div>

      {/* Modal de Formulario */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modoEdicion ? '✏️ Editar Personal' : '➕ Nuevo Personal'}</h3>
              <button className="btn-cerrar-modal" onClick={cerrarModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nom_ape"
                    value={formData.nom_ape}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez García"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>DNI *</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    placeholder="12345678"
                    maxLength="8"
                    pattern="[0-9]{8}"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Proyecto *</label>
                  <select
                    name="id_proyecto"
                    value={formData.id_proyecto}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione proyecto</option>
                    {proyectos.map(p => (
                      <option key={p.id_proyecto} value={p.id_proyecto}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Área *</label>
                  <select
                    name="id_area"
                    value={formData.id_area}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione área</option>
                    {areas.map(a => (
                      <option key={a.id_area} value={a.id_area}>
                        {a.nombre_area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ciudad *</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Ej: Lima"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Firma (Imagen)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.firma && (
                    <img src={formData.firma} alt="Vista previa" className="firma-preview-modal" />
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={loading}>
                  {loading ? '⏳ Guardando...' : (modoEdicion ? '💾 Actualizar' : '💾 Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroPersonal;