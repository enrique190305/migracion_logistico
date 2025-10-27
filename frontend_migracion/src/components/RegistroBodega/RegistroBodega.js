import React, { useState, useEffect } from 'react';
import './RegistroBodega.css';
import './ModalMensaje.css';
import * as bodegasAPI from '../../services/bodegasAPI';

const RegistroBodega = () => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para datos del backend
  const [bodegas, setBodegas] = useState([]);
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
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState(null);

  // Estado para formulario
  const [formulario, setFormulario] = useState({
    nombre: '',
    ubicacion: '',
    id_empresa: '',
    estado: 'ACTIVO'
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

  // Función para mostrar modal de mensaje
  const mostrarModalMensaje = (tipo, titulo, mensaje) => {
    setModalMensaje({
      mostrar: true,
      tipo,
      titulo,
      mensaje
    });
  };

  // Función para cerrar modal de mensaje
  const cerrarModalMensaje = () => {
    setModalMensaje({
      mostrar: false,
      tipo: '',
      titulo: '',
      mensaje: ''
    });
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [bodegasData, stats] = await Promise.all([
        bodegasAPI.obtenerBodegas(),
        bodegasAPI.obtenerEstadisticas()
      ]);
      
      setBodegas(bodegasData);
      setEstadisticas(stats);

      // Extraer empresas únicas
      const empresasUnicas = Array.from(
        new Set(bodegasData.map(b => JSON.stringify({ 
          id: b.empresa.id_empresa, 
          nombre: b.empresa.razon_social 
        })))
      ).map(e => JSON.parse(e));
      
      setEmpresas(empresasUnicas);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarModalMensaje('error', '❌ Error de Carga', 'No se pudieron cargar las bodegas. Verifique que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos
  const filteredData = bodegas.filter(bodega => {
    const matchSearch = bodega.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       bodega.id_bodega.toString().includes(searchTerm) ||
                       bodega.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       bodega.empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || bodega.estado === filtroEstado.toUpperCase();
    const matchEmpresa = filtroEmpresa === 'todos' || bodega.empresa.razon_social === filtroEmpresa;
    
    return matchSearch && matchEstado && matchEmpresa;
  });

  // Obtener lista única de empresas para el filtro
  const empresasUnicas = [...new Set(bodegas.map(b => b.empresa.razon_social))];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handlers de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: '',
      ubicacion: '',
      id_empresa: '',
      estado: 'ACTIVO'
    });
  };

  // Handlers de modales
  const handleNuevaBodega = () => {
    limpiarFormulario();
    setModalNuevo(true);
  };

  const handleGuardarNuevo = async () => {
    // Validaciones
    if (!formulario.nombre.trim()) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'El nombre de la bodega es obligatorio');
      return;
    }

    if (!formulario.ubicacion.trim()) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'La ubicación es obligatoria');
      return;
    }

    if (!formulario.id_empresa) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'Debe seleccionar una empresa');
      return;
    }

    try {
      setLoading(true);
      await bodegasAPI.crearBodega(formulario);
      mostrarModalMensaje('success', '✅ Registro Exitoso', `Bodega "${formulario.nombre}" registrada correctamente`);
      setModalNuevo(false);
      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      console.error('Error al crear bodega:', error);
      mostrarModalMensaje('error', '❌ Error al Guardar', error.message || 'No se pudo registrar la bodega');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (bodega) => {
    setBodegaSeleccionada(bodega);
    setModalVer(true);
  };

  const handleEdit = (bodega) => {
    setBodegaSeleccionada(bodega);
    setFormulario({
      nombre: bodega.nombre,
      ubicacion: bodega.ubicacion,
      id_empresa: bodega.empresa.id_empresa,
      estado: bodega.estado
    });
    setModalEditar(true);
  };

  const handleGuardarEdicion = async () => {
    // Validaciones
    if (!formulario.nombre.trim()) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'El nombre de la bodega es obligatorio');
      return;
    }

    if (!formulario.ubicacion.trim()) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'La ubicación es obligatoria');
      return;
    }

    if (!formulario.id_empresa) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'Debe seleccionar una empresa');
      return;
    }

    try {
      setLoading(true);
      await bodegasAPI.actualizarBodega(bodegaSeleccionada.id_bodega, formulario);
      mostrarModalMensaje('success', '✅ Actualización Exitosa', `Bodega "${formulario.nombre}" actualizada correctamente`);
      setModalEditar(false);
      limpiarFormulario();
      setBodegaSeleccionada(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al actualizar bodega:', error);
      mostrarModalMensaje('error', '❌ Error al Actualizar', error.message || 'No se pudo actualizar la bodega');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (bodega) => {
    setBodegaSeleccionada(bodega);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    try {
      setLoading(true);
      await bodegasAPI.eliminarBodega(bodegaSeleccionada.id_bodega);
      mostrarModalMensaje('success', '✅ Eliminación Exitosa', `Bodega "${bodegaSeleccionada.nombre}" eliminada correctamente`);
      setModalEliminar(false);
      setBodegaSeleccionada(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar bodega:', error);
      mostrarModalMensaje('error', '❌ Error al Eliminar', error.message || 'No se pudo eliminar la bodega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-bodega-container">
      {/* Mensaje de carga */}
      {loading && (
        <div className="loading-overlay-bodega">
          <div className="loading-spinner-bodega"></div>
          <p>Cargando...</p>
        </div>
      )}

      {/* Header */}
      <div className="registro-bodega-header">
        <div className="header-title-bodega">
          <span className="header-icon-bodega">🏢</span>
          <div>
            <h1>Registro de Bodega</h1>
            <p>Gestión y control de bodegas por empresa</p>
          </div>
        </div>
        <div className="header-actions-bodega">
          <button className="btn-bodega btn-primary-bodega" onClick={handleNuevaBodega}>
            <span>➕</span> Nueva Bodega
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid-bodega">
        <div className="stat-card-bodega">
          <div className="stat-icon-bodega blue-bodega">
            <span>🏢</span>
          </div>
          <div className="stat-info-bodega">
            <h3>{estadisticas.total}</h3>
            <p>Total Bodegas</p>
          </div>
        </div>
        <div className="stat-card-bodega">
          <div className="stat-icon-bodega green-bodega">
            <span>✅</span>
          </div>
          <div className="stat-info-bodega">
            <h3>{estadisticas.activas}</h3>
            <p>Activas</p>
          </div>
        </div>
        <div className="stat-card-bodega">
          <div className="stat-icon-bodega red-bodega">
            <span>❌</span>
          </div>
          <div className="stat-info-bodega">
            <h3>{estadisticas.inactivas}</h3>
            <p>Inactivas</p>
          </div>
        </div>
        <div className="stat-card-bodega">
          <div className="stat-icon-bodega purple-bodega">
            <span>🏢</span>
          </div>
          <div className="stat-info-bodega">
            <h3>{empresasUnicas.length}</h3>
            <p>Empresas</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section-bodega">
        <h2>🔍 Filtros de Búsqueda</h2>
        <div className="filtros-grid-bodega">
          <div className="filtro-group-bodega">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Bodega, ubicación o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filtro-group-bodega">
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="filtro-group-bodega">
            <label>Empresa</label>
            <select value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
              <option value="todos">Todas las empresas</option>
              {empresasUnicas.map((empresa, index) => (
                <option key={index} value={empresa}>{empresa}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-section-bodega">
        <div className="tabla-header-bodega">
          <h2>🏢 Listado de Bodegas ({filteredData.length})</h2>
          <div className="search-box-bodega">
            <input
              type="text"
              placeholder="Búsqueda rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon-bodega">🔍</span>
          </div>
        </div>

        <div className="table-wrapper-bodega">
          <table className="bodega-table-unique">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Bodega</th>
                <th>Ubicación</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((bodega) => (
                  <tr key={bodega.id_bodega}>
                    <td><strong>{bodega.id_bodega}</strong></td>
                    <td><strong>{bodega.nombre}</strong></td>
                    <td>{bodega.ubicacion}</td>
                    <td>{bodega.empresa.razon_social}</td>
                    <td>
                      <span className={`estado-badge-bodega ${bodega.estado.toLowerCase()}-bodega`}>
                        {bodega.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>{bodega.fecha_creacion}</td>
                    <td>
                      <div className="actions-cell-bodega">
                        <button className="btn-icon-bodega btn-view-bodega" onClick={() => handleView(bodega)} title="Ver detalles">
                          👁️
                        </button>
                        <button className="btn-icon-bodega btn-edit-bodega" onClick={() => handleEdit(bodega)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon-bodega btn-delete-bodega" onClick={() => handleDelete(bodega)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="empty-state-bodega">
                      <div className="empty-state-icon-bodega">🏢</div>
                      <h3>No se encontraron bodegas</h3>
                      <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredData.length > itemsPerPage && (
          <div className="pagination-bodega">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* MODAL: NUEVA BODEGA */}
      {modalNuevo && (
        <>
          <div className="modal-overlay-bodega" onClick={() => setModalNuevo(false)}></div>
          <div className="modal-bodega">
            <div className="modal-header-bodega">
              <h2>➕ Nueva Bodega</h2>
              <button className="btn-close-bodega" onClick={() => setModalNuevo(false)}>✖</button>
            </div>
            <div className="modal-body-bodega">
              <div className="form-group-bodega">
                <label>Nombre de la Bodega *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Bodega Principal Lima"
                />
              </div>
              <div className="form-group-bodega">
                <label>Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formulario.ubicacion}
                  onChange={handleInputChange}
                  placeholder="Ej: Lima, Callao, Ica, etc."
                />
              </div>
              <div className="form-group-bodega">
                <label>Empresa *</label>
                <select
                  name="id_empresa"
                  value={formulario.id_empresa}
                  onChange={handleInputChange}
                >
                  <option value="">-- Seleccione una empresa --</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-bodega">
                <label>Estado</label>
                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer-bodega">
              <button className="btn-secondary-bodega" onClick={() => setModalNuevo(false)}>
                ✕ Cancelar
              </button>
              <button className="btn-primary-bodega" onClick={handleGuardarNuevo}>
                ✓ Guardar
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: EDITAR BODEGA */}
      {modalEditar && bodegaSeleccionada && (
        <>
          <div className="modal-overlay-bodega" onClick={() => setModalEditar(false)}></div>
          <div className="modal-bodega">
            <div className="modal-header-bodega">
              <h2>✏️ Editar Bodega</h2>
              <button className="btn-close-bodega" onClick={() => setModalEditar(false)}>✖</button>
            </div>
            <div className="modal-body-bodega">
              <div className="form-group-bodega">
                <label>Nombre de la Bodega *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Bodega Principal Lima"
                />
              </div>
              <div className="form-group-bodega">
                <label>Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formulario.ubicacion}
                  onChange={handleInputChange}
                  placeholder="Ej: Lima, Callao, Ica, etc."
                />
              </div>
              <div className="form-group-bodega">
                <label>Empresa *</label>
                <select
                  name="id_empresa"
                  value={formulario.id_empresa}
                  onChange={handleInputChange}
                >
                  <option value="">-- Seleccione una empresa --</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-bodega">
                <label>Estado</label>
                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer-bodega">
              <button className="btn-secondary-bodega" onClick={() => setModalEditar(false)}>
                ✕ Cancelar
              </button>
              <button className="btn-primary-bodega" onClick={handleGuardarEdicion}>
                ✓ Actualizar
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: VER DETALLES */}
      {modalVer && bodegaSeleccionada && (
        <>
          <div className="modal-overlay-bodega" onClick={() => setModalVer(false)}></div>
          <div className="modal-bodega">
            <div className="modal-header-bodega">
              <h2>👁️ Detalles de la Bodega</h2>
              <button className="btn-close-bodega" onClick={() => setModalVer(false)}>✖</button>
            </div>
            <div className="modal-body-bodega">
              <div className="detalle-row-bodega">
                <strong>ID Bodega:</strong>
                <span>{bodegaSeleccionada.id_bodega}</span>
              </div>
              <div className="detalle-row-bodega">
                <strong>Nombre:</strong>
                <span>{bodegaSeleccionada.nombre}</span>
              </div>
              <div className="detalle-row-bodega">
                <strong>Ubicación:</strong>
                <span>{bodegaSeleccionada.ubicacion}</span>
              </div>
              <div className="detalle-row-bodega">
                <strong>Empresa:</strong>
                <span>{bodegaSeleccionada.empresa.razon_social}</span>
              </div>
              <div className="detalle-row-bodega">
                <strong>Estado:</strong>
                <span className={`estado-badge-bodega ${bodegaSeleccionada.estado.toLowerCase()}-bodega`}>
                  {bodegaSeleccionada.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
              <div className="detalle-row-bodega">
                <strong>Fecha de Creación:</strong>
                <span>{bodegaSeleccionada.fecha_creacion}</span>
              </div>
            </div>
            <div className="modal-footer-bodega">
              <button className="btn-success-bodega" onClick={() => setModalVer(false)}>
                ✓ Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: CONFIRMAR ELIMINAR */}
      {modalEliminar && bodegaSeleccionada && (
        <>
          <div className="modal-overlay-bodega" onClick={() => setModalEliminar(false)}></div>
          <div className="modal-bodega modal-bodega-small">
            <div className="modal-header-bodega modal-header-danger">
              <h2>🗑️ Confirmar Eliminación</h2>
              <button className="btn-close-bodega" onClick={() => setModalEliminar(false)}>✖</button>
            </div>
            <div className="modal-body-bodega">
              <p style={{ textAlign: 'center', fontSize: '16px', margin: '20px 0' }}>
                ¿Está seguro que desea eliminar la bodega:
              </p>
              <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
                "{bodegaSeleccionada.nombre}"?
              </p>
              <p style={{ textAlign: 'center', fontSize: '14px', color: '#999', marginTop: '15px' }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer-bodega">
              <button className="btn-secondary-bodega" onClick={() => setModalEliminar(false)}>
                ✕ Cancelar
              </button>
              <button className="btn-danger-bodega" onClick={confirmarEliminar}>
                ✓ Eliminar
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE MENSAJES */}
      {modalMensaje.mostrar && (
        <>
          <div className="modal-overlay-bodega" onClick={cerrarModalMensaje}></div>
          <div className={`modal-mensaje-bodega modal-mensaje-${modalMensaje.tipo}`}>
            <div className="modal-mensaje-header">
              <div className={`modal-mensaje-icono modal-mensaje-icono-${modalMensaje.tipo}`}>
                {modalMensaje.tipo === 'success' && '✅'}
                {modalMensaje.tipo === 'error' && '❌'}
                {modalMensaje.tipo === 'warning' && '⚠️'}
                {modalMensaje.tipo === 'info' && 'ℹ️'}
              </div>
              <h3>{modalMensaje.titulo}</h3>
            </div>
            <div className="modal-mensaje-body">
              <p style={{ whiteSpace: 'pre-line' }}>{modalMensaje.mensaje}</p>
            </div>
            <div className="modal-mensaje-footer">
              <button 
                onClick={cerrarModalMensaje} 
                className={`btn-mensaje-bodega btn-mensaje-${modalMensaje.tipo}`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegistroBodega;