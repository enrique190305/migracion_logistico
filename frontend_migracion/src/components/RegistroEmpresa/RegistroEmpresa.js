import React, { useState, useEffect } from 'react';
import './RegistroEmpresa.css';
import * as empresasAPI from '../../services/empresasAPI';

const RegistroEmpresa = () => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para datos del backend
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activas: 0,
    inactivas: 0
  });

  // Estados de modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  // Estado para formulario
  const [formulario, setFormulario] = useState({
    razon_social: '',
    ruc: '',
    nombre_comercial: '',
    estado_contribuyente: 'ACTIVO',
    domicilio_fiscal: '',
    actividades_economicas: ''
  });

  // Estado para modal de mensajes
  const [modalMensaje, setModalMensaje] = useState({
    mostrar: false,
    tipo: '',
    titulo: '',
    mensaje: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar datos desde el backend
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const empresasData = await empresasAPI.obtenerEmpresas();
      setEmpresas(empresasData);
      calcularEstadisticas(empresasData);
    } catch (error) {
      mostrarModalMensaje('error', 'Error', 'No se pudieron cargar las empresas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = (data) => {
    const total = data.length;
    const activas = data.filter(e => e.estado_contribuyente === 'ACTIVO').length;
    const inactivas = total - activas;
    
    setEstadisticas({ total, activas, inactivas });
  };

  // Funciones para modal de mensajes
  const mostrarModalMensaje = (tipo, titulo, mensaje) => {
    setModalMensaje({ mostrar: true, tipo, titulo, mensaje });
  };

  const cerrarModalMensaje = () => {
    setModalMensaje({ mostrar: false, tipo: '', titulo: '', mensaje: '' });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  // Validar RUC (11 dígitos numéricos)
  const validarRUC = (ruc) => {
    if (!ruc) return true; // RUC es opcional
    const rucRegex = /^\d{11}$/;
    return rucRegex.test(ruc);
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormulario({
      razon_social: '',
      ruc: '',
      nombre_comercial: '',
      estado_contribuyente: 'ACTIVO',
      domicilio_fiscal: '',
      actividades_economicas: ''
    });
  };

  // Abrir modal para nueva empresa
  const abrirModalNuevo = () => {
    limpiarFormulario();
    setModalNuevo(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setFormulario({
      razon_social: empresa.razon_social,
      ruc: empresa.ruc || '',
      nombre_comercial: empresa.nombre_comercial || '',
      estado_contribuyente: empresa.estado_contribuyente || 'ACTIVO',
      domicilio_fiscal: empresa.domicilio_fiscal || '',
      actividades_economicas: empresa.actividades_economicas || ''
    });
    setModalEditar(true);
  };

  // Abrir modal para ver detalles
  const abrirModalVer = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setModalVer(true);
  };

  // Abrir modal para eliminar
  const abrirModalEliminar = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setModalEliminar(true);
  };

  // Crear nueva empresa
  const handleCrearEmpresa = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formulario.razon_social.trim()) {
      mostrarModalMensaje('warning', 'Advertencia', 'La razón social es obligatoria');
      return;
    }

    if (formulario.ruc && !validarRUC(formulario.ruc)) {
      mostrarModalMensaje('warning', 'Advertencia', 'El RUC debe tener 11 dígitos numéricos');
      return;
    }

    setLoading(true);
    try {
      await empresasAPI.crearEmpresa(formulario);
      mostrarModalMensaje('success', 'Éxito', 'Empresa creada exitosamente');
      setModalNuevo(false);
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      const mensaje = error.message || 'Error al crear la empresa';
      mostrarModalMensaje('error', 'Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar empresa
  const handleActualizarEmpresa = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formulario.razon_social.trim()) {
      mostrarModalMensaje('warning', 'Advertencia', 'La razón social es obligatoria');
      return;
    }

    if (formulario.ruc && !validarRUC(formulario.ruc)) {
      mostrarModalMensaje('warning', 'Advertencia', 'El RUC debe tener 11 dígitos numéricos');
      return;
    }

    setLoading(true);
    try {
      await empresasAPI.actualizarEmpresa(empresaSeleccionada.id_empresa, formulario);
      mostrarModalMensaje('success', 'Éxito', 'Empresa actualizada exitosamente');
      setModalEditar(false);
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      const mensaje = error.message || 'Error al actualizar la empresa';
      mostrarModalMensaje('error', 'Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar empresa
  const handleEliminarEmpresa = async () => {
    setLoading(true);
    try {
      await empresasAPI.eliminarEmpresa(empresaSeleccionada.id_empresa);
      mostrarModalMensaje('success', 'Éxito', 'Empresa eliminada exitosamente');
      setModalEliminar(false);
      cargarDatos();
    } catch (error) {
      const mensaje = error.message || 'Error al eliminar la empresa. Puede que tenga órdenes asociadas.';
      mostrarModalMensaje('error', 'Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empresas
  const empresasFiltradas = empresas.filter(empresa => {
    const matchBusqueda = empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (empresa.ruc && empresa.ruc.includes(searchTerm)) ||
                          (empresa.nombre_comercial && empresa.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchEstado = filtroEstado === 'todos' || empresa.estado_contribuyente === filtroEstado;
    
    return matchBusqueda && matchEstado;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const empresasActuales = empresasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(empresasFiltradas.length / itemsPerPage);

  return (
    <div className="registro-empresa-container">
      {/* Header */}
      <div className="header-section">
        <div className="titulo-seccion">
          <h2>📋 Registro de Empresas</h2>
          <p className="subtitulo">Gestiona la información de las empresas del sistema</p>
        </div>
        <button className="btn-nuevo" onClick={abrirModalNuevo}>
          ➕ Nueva Empresa
        </button>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-container">
        <div className="estadistica-card">
          <div className="estadistica-icono">📊</div>
          <div className="estadistica-info">
            <span className="estadistica-numero">{estadisticas.total}</span>
            <span className="estadistica-label">Total</span>
          </div>
        </div>
        <div className="estadistica-card activas">
          <div className="estadistica-icono">✅</div>
          <div className="estadistica-info">
            <span className="estadistica-numero">{estadisticas.activas}</span>
            <span className="estadistica-label">Activas</span>
          </div>
        </div>
        <div className="estadistica-card inactivas">
          <div className="estadistica-icono">⚠️</div>
          <div className="estadistica-info">
            <span className="estadistica-numero">{estadisticas.inactivas}</span>
            <span className="estadistica-label">Inactivas</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-busqueda">
          <span className="icono-busqueda">🔍</span>
          <input
            type="text"
            placeholder="Buscar por razón social, RUC o nombre comercial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filtro-estado">
          <label>Estado:</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
        <table className="tabla-empresas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Razón Social</th>
              <th>RUC</th>
              <th>Nombre Comercial</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresasActuales.length === 0 ? (
              <tr>
                <td colSpan="7" className="texto-vacio">
                  No se encontraron empresas
                </td>
              </tr>
            ) : (
              empresasActuales.map((empresa) => (
                <tr key={empresa.id_empresa}>
                  <td>{empresa.id_empresa}</td>
                  <td className="celda-importante">{empresa.razon_social}</td>
                  <td>{empresa.ruc || '-'}</td>
                  <td>{empresa.nombre_comercial || '-'}</td>
                  <td>
                    <span className={`badge-estado ${empresa.estado_contribuyente === 'ACTIVO' ? 'activo' : 'inactivo'}`}>
                      {empresa.estado_contribuyente || 'ACTIVO'}
                    </span>
                  </td>
                  <td>{empresa.fecha_creacion ? new Date(empresa.fecha_creacion).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="acciones-grupo">
                      <button className="btn-accion ver" onClick={() => abrirModalVer(empresa)} title="Ver detalles">
                        👁️
                      </button>
                      <button className="btn-accion editar" onClick={() => abrirModalEditar(empresa)} title="Editar">
                        ✏️
                      </button>
                      <button className="btn-accion eliminar" onClick={() => abrirModalEliminar(empresa)} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="paginacion">
          <button
            className="btn-paginacion"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>
          <span className="info-paginacion">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="btn-paginacion"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal Nueva Empresa */}
      {modalNuevo && (
        <div className="modal-overlay">
          <div className="modal-contenido modal-form">
            <div className="modal-header">
              <h3>➕ Nueva Empresa</h3>
              <button className="btn-cerrar" onClick={() => setModalNuevo(false)}>✕</button>
            </div>
            <form onSubmit={handleCrearEmpresa}>
              <div className="form-grupo">
                <label>Razón Social <span className="obligatorio">*</span></label>
                <input
                  type="text"
                  name="razon_social"
                  value={formulario.razon_social}
                  onChange={handleInputChange}
                  placeholder="Ingrese la razón social"
                  required
                />
              </div>

              <div className="form-grupo">
                <label>RUC</label>
                <input
                  type="text"
                  name="ruc"
                  value={formulario.ruc}
                  onChange={handleInputChange}
                  placeholder="Ingrese el RUC (11 dígitos)"
                  maxLength="11"
                />
              </div>

              <div className="form-grupo">
                <label>Nombre Comercial</label>
                <input
                  type="text"
                  name="nombre_comercial"
                  value={formulario.nombre_comercial}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre comercial"
                />
              </div>

              <div className="form-grupo">
                <label>Estado Contribuyente <span className="obligatorio">*</span></label>
                <select
                  name="estado_contribuyente"
                  value={formulario.estado_contribuyente}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div className="form-grupo">
                <label>Domicilio Fiscal</label>
                <textarea
                  name="domicilio_fiscal"
                  value={formulario.domicilio_fiscal}
                  onChange={handleInputChange}
                  placeholder="Ingrese el domicilio fiscal"
                  rows="3"
                />
              </div>

              <div className="form-grupo">
                <label>Actividades Económicas</label>
                <textarea
                  name="actividades_economicas"
                  value={formulario.actividades_economicas}
                  onChange={handleInputChange}
                  placeholder="Ingrese las actividades económicas"
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={() => setModalNuevo(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Empresa */}
      {modalEditar && empresaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-contenido modal-form">
            <div className="modal-header">
              <h3>✏️ Editar Empresa</h3>
              <button className="btn-cerrar" onClick={() => setModalEditar(false)}>✕</button>
            </div>
            <form onSubmit={handleActualizarEmpresa}>
              <div className="form-grupo">
                <label>Razón Social <span className="obligatorio">*</span></label>
                <input
                  type="text"
                  name="razon_social"
                  value={formulario.razon_social}
                  onChange={handleInputChange}
                  placeholder="Ingrese la razón social"
                  required
                />
              </div>

              <div className="form-grupo">
                <label>RUC</label>
                <input
                  type="text"
                  name="ruc"
                  value={formulario.ruc}
                  onChange={handleInputChange}
                  placeholder="Ingrese el RUC (11 dígitos)"
                  maxLength="11"
                />
              </div>

              <div className="form-grupo">
                <label>Nombre Comercial</label>
                <input
                  type="text"
                  name="nombre_comercial"
                  value={formulario.nombre_comercial}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre comercial"
                />
              </div>

              <div className="form-grupo">
                <label>Estado Contribuyente <span className="obligatorio">*</span></label>
                <select
                  name="estado_contribuyente"
                  value={formulario.estado_contribuyente}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div className="form-grupo">
                <label>Domicilio Fiscal</label>
                <textarea
                  name="domicilio_fiscal"
                  value={formulario.domicilio_fiscal}
                  onChange={handleInputChange}
                  placeholder="Ingrese el domicilio fiscal"
                  rows="3"
                />
              </div>

              <div className="form-grupo">
                <label>Actividades Económicas</label>
                <textarea
                  name="actividades_economicas"
                  value={formulario.actividades_economicas}
                  onChange={handleInputChange}
                  placeholder="Ingrese las actividades económicas"
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={() => setModalEditar(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {modalVer && empresaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-contenido modal-detalles">
            <div className="modal-header">
              <h3>👁️ Detalles de la Empresa</h3>
              <button className="btn-cerrar" onClick={() => setModalVer(false)}>✕</button>
            </div>
            <div className="detalles-grid">
              <div className="detalle-item">
                <label>ID:</label>
                <span>{empresaSeleccionada.id_empresa}</span>
              </div>
              <div className="detalle-item">
                <label>Razón Social:</label>
                <span className="valor-importante">{empresaSeleccionada.razon_social}</span>
              </div>
              <div className="detalle-item">
                <label>RUC:</label>
                <span>{empresaSeleccionada.ruc || '-'}</span>
              </div>
              <div className="detalle-item">
                <label>Nombre Comercial:</label>
                <span>{empresaSeleccionada.nombre_comercial || '-'}</span>
              </div>
              <div className="detalle-item">
                <label>Estado Contribuyente:</label>
                <span className={`badge-estado ${empresaSeleccionada.estado_contribuyente === 'ACTIVO' ? 'activo' : 'inactivo'}`}>
                  {empresaSeleccionada.estado_contribuyente || 'ACTIVO'}
                </span>
              </div>
              <div className="detalle-item">
                <label>Fecha Creación:</label>
                <span>{empresaSeleccionada.fecha_creacion ? new Date(empresaSeleccionada.fecha_creacion).toLocaleString() : '-'}</span>
              </div>
              <div className="detalle-item detalle-completo">
                <label>Domicilio Fiscal:</label>
                <span>{empresaSeleccionada.domicilio_fiscal || '-'}</span>
              </div>
              <div className="detalle-item detalle-completo">
                <label>Actividades Económicas:</label>
                <span>{empresaSeleccionada.actividades_economicas || '-'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cerrar-modal" onClick={() => setModalVer(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && empresaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-contenido modal-eliminar">
            <div className="modal-header">
              <h3>🗑️ Eliminar Empresa</h3>
              <button className="btn-cerrar" onClick={() => setModalEliminar(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="icono-advertencia">⚠️</div>
              <p>¿Está seguro de que desea eliminar la empresa:</p>
              <p className="nombre-empresa">"{empresaSeleccionada.razon_social}"?</p>
              <p className="texto-advertencia">
                Esta acción no se puede deshacer. La empresa solo puede eliminarse si no tiene órdenes asociadas.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalEliminar(false)}>
                Cancelar
              </button>
              <button className="btn-eliminar" onClick={handleEliminarEmpresa}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mensajes */}
      {modalMensaje.mostrar && (
        <div className="modal-overlay">
          <div className={`modal-mensaje modal-mensaje-${modalMensaje.tipo}`}>
            <div className="modal-mensaje-icono">
              {modalMensaje.tipo === 'success' && '✅'}
              {modalMensaje.tipo === 'error' && '❌'}
              {modalMensaje.tipo === 'warning' && '⚠️'}
              {modalMensaje.tipo === 'info' && 'ℹ️'}
            </div>
            <h3>{modalMensaje.titulo}</h3>
            <p>{modalMensaje.mensaje}</p>
            <button className={`btn-mensaje-${modalMensaje.tipo}`} onClick={cerrarModalMensaje}>
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Procesando...</p>
        </div>
      )}
    </div>
  );
};

export default RegistroEmpresa;
