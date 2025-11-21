import React, { useState, useEffect } from 'react';
import rrhhService from '../../services/rrhh.service';
import './GestionUsuarios.css';

const GestionUsuarios = () => {
  const [accionActual, setAccionActual] = useState('create');
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const [formData, setFormData] = useState({
    tipo_documento: 'DNI',
    documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    rol: 'Trabajador',
    contrasena: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    filtrarUsuarios();
  }, [busqueda, usuarios]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await rrhhService.obtenerTrabajadores();
      if (response.success) {
        setUsuarios(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarUsuarios = () => {
    if (!busqueda.trim()) {
      setUsuariosFiltrados([...usuarios]);
    } else {
      const query = busqueda.toLowerCase();
      setUsuariosFiltrados(
        usuarios.filter(usuario =>
          usuario.nombres_completos.toLowerCase().includes(query) ||
          usuario.documento.includes(query) ||
          usuario.documento_completo.toLowerCase().includes(query) ||
          (usuario.correo && usuario.correo.toLowerCase().includes(query))
        )
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.documento.trim()) {
      errors.documento = 'El documento es requerido';
    }

    if (!formData.nombres.trim()) {
      errors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son requeridos';
    }

    if (modalMode === 'create' && !formData.contrasena.trim()) {
      errors.contrasena = 'La contraseña es requerida';
    }

    if (modalMode === 'create' && formData.contrasena.length < 6) {
      errors.contrasena = 'Mínimo 6 caracteres';
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = 'Correo inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (modalMode === 'create') {
        const response = await rrhhService.crearUsuario({
          tipo_documento: formData.tipo_documento,
          documento: formData.documento,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo || null,
          telefono: formData.telefono || null,
          rol: formData.rol,
          contrasena: formData.contrasena
        });

        if (response.success) {
          mostrarMensaje('Usuario registrado exitosamente', 'success');
          limpiarFormulario();
          setShowModal(false);
          await cargarUsuarios();
        } else {
          mostrarMensaje(response.message || 'Error al registrar usuario', 'error');
        }
      } else {
        const response = await rrhhService.actualizarUsuario(usuarioSeleccionado.id_usuario, {
          tipo_documento: formData.tipo_documento,
          documento: formData.documento,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo || null,
          telefono: formData.telefono || null,
          rol: formData.rol,
          ...(formData.contrasena && { contrasena: formData.contrasena })
        });

        if (response.success) {
          mostrarMensaje('Usuario actualizado exitosamente', 'success');
          limpiarFormulario();
          setShowModal(false);
          await cargarUsuarios();
        } else {
          mostrarMensaje(response.message || 'Error al actualizar usuario', 'error');
        }
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      mostrarMensaje('Error al guardar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearUsuario = () => {
    setModalMode('create');
    limpiarFormulario();
    setShowModal(true);
  };

  const handleEditarUsuario = (usuario) => {
    setModalMode('edit');
    setUsuarioSeleccionado(usuario);
    setFormData({
      tipo_documento: usuario.tipo_documento || 'DNI',
      documento: usuario.documento,
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      rol: usuario.rol?.nombre || 'Trabajador',
      contrasena: ''
    });
    setShowModal(true);
  };

  const handleEliminarUsuario = (usuario) => {
    setUsuarioAEliminar(usuario);
    setShowDeleteConfirm(true);
  };

  const confirmarEliminacion = async () => {
    try {
      setLoading(true);
      const response = await rrhhService.eliminarUsuario(usuarioAEliminar.id_usuario);
      
      if (response.success) {
        mostrarMensaje('Usuario eliminado exitosamente', 'success');
        setShowDeleteConfirm(false);
        setUsuarioAEliminar(null);
        await cargarUsuarios();
      } else {
        mostrarMensaje(response.message || 'Error al eliminar usuario', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      mostrarMensaje('Error al eliminar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      tipo_documento: 'DNI',
      documento: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      rol: 'Trabajador',
      contrasena: ''
    });
    setFormErrors({});
    setUsuarioSeleccionado(null);
  };

  const mostrarMensaje = (mensaje, tipo) => {
    // Implementar notificación toast
    alert(mensaje);
  };

  return (
    <div className="gestion-usuarios-container">
      <div className="gestion-usuarios-header">
        <div className="header-icon-wrapper">
          <div className="header-icon">
            <i className="fas fa-users-cog"></i>
          </div>
        </div>
        <div className="header-text">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema</p>
        </div>
      </div>

      <div className="gestion-content">
        <div className="action-selector-panel">
          <div className="panel-header">
            <i className="fas fa-cog"></i>
            <h3>Seleccionar Acción</h3>
          </div>
          
          <button
            className={`action-button ${accionActual === 'create' ? 'active' : ''}`}
            onClick={() => setAccionActual('create')}
          >
            <div className="action-icon success-gradient">
              <i className="fas fa-user-plus"></i>
            </div>
            <span>Registrar Usuario</span>
            {accionActual === 'create' && <i className="fas fa-check-circle check-icon"></i>}
          </button>

          <button
            className={`action-button ${accionActual === 'edit' ? 'active' : ''}`}
            onClick={() => setAccionActual('edit')}
          >
            <div className="action-icon warning-gradient">
              <i className="fas fa-user-edit"></i>
            </div>
            <span>Editar Usuario</span>
            {accionActual === 'edit' && <i className="fas fa-check-circle check-icon"></i>}
          </button>

          <button
            className={`action-button ${accionActual === 'delete' ? 'active' : ''}`}
            onClick={() => setAccionActual('delete')}
          >
            <div className="action-icon error-gradient">
              <i className="fas fa-user-minus"></i>
            </div>
            <span>Eliminar Usuario</span>
            {accionActual === 'delete' && <i className="fas fa-check-circle check-icon"></i>}
          </button>
        </div>

        <div className="main-content-panel">
          {accionActual === 'create' && (
            <div className="content-card create-card">
              <div className="card-header success-theme">
                <div className="card-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <h3>Registrar Nuevo Usuario</h3>
              </div>
              <div className="card-body">
                <p className="card-description">
                  Complete el formulario para registrar un nuevo usuario en el sistema.
                </p>
                <button className="btn-primary success-btn" onClick={handleCrearUsuario}>
                  <i className="fas fa-plus-circle"></i>
                  Crear Usuario
                </button>
              </div>
            </div>
          )}

          {accionActual === 'edit' && (
            <div className="content-card edit-card">
              <div className="card-header warning-theme">
                <div className="card-icon">
                  <i className="fas fa-user-edit"></i>
                </div>
                <h3>Editar Usuario</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando usuarios...</p>
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-users-slash"></i>
                    <p>No hay usuarios disponibles</p>
                  </div>
                ) : (
                  <>
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        placeholder="Buscar por nombre, documento o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                      {busqueda && (
                        <button className="clear-search" onClick={() => setBusqueda('')}>
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                    
                    {busqueda && (
                      <div className="search-results-info">
                        <i className="fas fa-info-circle"></i>
                        <span>{usuariosFiltrados.length} resultado{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    <div className="usuarios-list">
                      {usuariosFiltrados.length === 0 ? (
                        <div className="empty-state">
                          <i className="fas fa-search-minus"></i>
                          <p>No se encontraron usuarios con ese criterio</p>
                        </div>
                      ) : (
                        usuariosFiltrados.map(usuario => (
                          <div key={usuario.id_usuario} className="usuario-card">
                            <div className="usuario-avatar">
                              <i className={`fas ${usuario.rol?.nombre === 'Trabajador' ? 'fa-user' : 'fa-user-tie'}`}></i>
                            </div>
                            <div className="usuario-info">
                              <h4>{usuario.nombres_completos}</h4>
                              <p className="usuario-documento">{usuario.documento_completo}</p>
                              <p className="usuario-rol">
                                <i className="fas fa-user-tag"></i>
                                {usuario.rol?.nombre || 'Sin rol'}
                              </p>
                              {usuario.correo && (
                                <p className="usuario-correo">
                                  <i className="fas fa-envelope"></i>
                                  {usuario.correo}
                                </p>
                              )}
                            </div>
                            <button 
                              className="btn-action edit-btn"
                              onClick={() => handleEditarUsuario(usuario)}
                            >
                              <i className="fas fa-edit"></i>
                              Editar
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {accionActual === 'delete' && (
            <div className="content-card delete-card">
              <div className="card-header error-theme">
                <div className="card-icon">
                  <i className="fas fa-user-minus"></i>
                </div>
                <h3>Eliminar Usuario</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando usuarios...</p>
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-users-slash"></i>
                    <p>No hay usuarios disponibles</p>
                  </div>
                ) : (
                  <>
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        placeholder="Buscar por nombre, documento o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                      {busqueda && (
                        <button className="clear-search" onClick={() => setBusqueda('')}>
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                    
                    {busqueda && (
                      <div className="search-results-info">
                        <i className="fas fa-info-circle"></i>
                        <span>{usuariosFiltrados.length} resultado{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    <div className="usuarios-list">
                      {usuariosFiltrados.length === 0 ? (
                        <div className="empty-state">
                          <i className="fas fa-search-minus"></i>
                          <p>No se encontraron usuarios con ese criterio</p>
                        </div>
                      ) : (
                        usuariosFiltrados.map(usuario => (
                          <div key={usuario.id_usuario} className="usuario-card">
                            <div className="usuario-avatar">
                              <i className={`fas ${usuario.rol?.nombre === 'Trabajador' ? 'fa-user' : 'fa-user-tie'}`}></i>
                            </div>
                            <div className="usuario-info">
                              <h4>{usuario.nombres_completos}</h4>
                              <p className="usuario-documento">{usuario.documento_completo}</p>
                              <p className="usuario-rol">
                                <i className="fas fa-user-tag"></i>
                                {usuario.rol?.nombre || 'Sin rol'}
                              </p>
                              {usuario.correo && (
                                <p className="usuario-correo">
                                  <i className="fas fa-envelope"></i>
                                  {usuario.correo}
                                </p>
                              )}
                            </div>
                            <button 
                              className="btn-action delete-btn"
                              onClick={() => handleEliminarUsuario(usuario)}
                            >
                              <i className="fas fa-trash-alt"></i>
                              Eliminar
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulario */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className={`fas ${modalMode === 'create' ? 'fa-user-plus' : 'fa-user-edit'}`}></i>
                {modalMode === 'create' ? 'Registrar Usuario' : 'Editar Usuario'}
              </h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="usuario-form">
              <div className="form-row">
                <div className="form-group form-group-small">
                  <label>Tipo Documento</label>
                  <select
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div className="form-group form-group-large">
                  <label>Número de Documento *</label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.documento ? 'error' : ''}`}
                    placeholder="Ej: 12345678"
                  />
                  {formErrors.documento && <span className="error-message">{formErrors.documento}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.nombres ? 'error' : ''}`}
                    placeholder="Nombres completos"
                  />
                  {formErrors.nombres && <span className="error-message">{formErrors.nombres}</span>}
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.apellidos ? 'error' : ''}`}
                    placeholder="Apellidos completos"
                  />
                  {formErrors.apellidos && <span className="error-message">{formErrors.apellidos}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.correo ? 'error' : ''}`}
                    placeholder="correo@ejemplo.com"
                  />
                  {formErrors.correo && <span className="error-message">{formErrors.correo}</span>}
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="999999999"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="Trabajador">Trabajador</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Contraseña {modalMode === 'create' ? '*' : '(dejar vacío para no cambiar)'}</label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  className={`form-control ${formErrors.contrasena ? 'error' : ''}`}
                  placeholder={modalMode === 'create' ? 'Mínimo 6 caracteres' : 'Nueva contraseña'}
                />
                {formErrors.contrasena && <span className="error-message">{formErrors.contrasena}</span>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {modalMode === 'create' ? 'Registrar' : 'Actualizar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Confirmar Eliminación</h2>
            <p>¿Está seguro de que desea eliminar a <strong>{usuarioAEliminar?.nombres_completos}</strong>?</p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="form-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmarEliminacion}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    Eliminar
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

export default GestionUsuarios;
