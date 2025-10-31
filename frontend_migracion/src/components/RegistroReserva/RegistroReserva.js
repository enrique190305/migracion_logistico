import React, { useState, useEffect } from 'react';
import './RegistroReserva.css';
import './ModalMensaje.css';
import * as reservasAPI from '../../services/reservasAPI';

const RegistroReserva = () => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para datos del backend
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activas: 0,
    inactivas: 0
  });

  // Estados para modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // Estado para formulario (mantener estado ACTIVO por defecto)
  const [formulario, setFormulario] = useState({
    tipo_reserva: '',
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

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [reservasData, stats] = await Promise.all([
        reservasAPI.obtenerReservas(),
        reservasAPI.obtenerEstadisticas()
      ]);
      
      setReservas(reservasData);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarModalMensaje('error', '❌ Error al Cargar', 'Error al cargar las reservas: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Funciones para modal de mensajes
  const mostrarModalMensaje = (tipo, titulo, mensaje) => {
    setModalMensaje({
      mostrar: true,
      tipo,
      titulo,
      mensaje
    });
  };

  const cerrarModalMensaje = () => {
    setModalMensaje({
      mostrar: false,
      tipo: '',
      titulo: '',
      mensaje: ''
    });
  };

  // Funciones para manejar formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFormulario = () => {
    setFormulario({
      tipo_reserva: '',
      estado: 'ACTIVO'
    });
  };

  const handleNuevaReserva = () => {
    limpiarFormulario();
    setModalNuevo(true);
  };

  const handleGuardarNuevo = async () => {
    // Validaciones
    if (!formulario.tipo_reserva.trim()) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'El tipo de reserva es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await reservasAPI.crearReserva(formulario);
      mostrarModalMensaje('success', '✅ Registro Exitoso', `Reserva "${formulario.tipo_reserva}" registrada correctamente`);
      setModalNuevo(false);
      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      console.error('Error al crear reserva:', error);
      mostrarModalMensaje('error', '❌ Error al Guardar', error.message || 'No se pudo registrar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalVer(true);
  };

  const handleEdit = (reserva) => {
    setReservaSeleccionada(reserva);
    setFormulario({
      tipo_reserva: reserva.tipo_reserva,
      estado: reserva.estado
    });
    setModalEditar(true);
  };

  const handleGuardarEdicion = async () => {
    // Validaciones
    if (!formulario.tipo_reserva.trim()) {
      mostrarModalMensaje('warning', '⚠️ Campo Requerido', 'El tipo de reserva es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await reservasAPI.actualizarReserva(reservaSeleccionada.id_reserva, formulario);
      mostrarModalMensaje('success', '✅ Actualización Exitosa', `Reserva "${formulario.tipo_reserva}" actualizada correctamente`);
      setModalEditar(false);
      limpiarFormulario();
      setReservaSeleccionada(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      mostrarModalMensaje('error', '❌ Error al Actualizar', error.message || 'No se pudo actualizar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    try {
      setLoading(true);
      await reservasAPI.eliminarReserva(reservaSeleccionada.id_reserva);
      mostrarModalMensaje('success', '✅ Eliminación Exitosa', `Reserva "${reservaSeleccionada.tipo_reserva}" eliminada correctamente`);
      setModalEliminar(false);
      setReservaSeleccionada(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      mostrarModalMensaje('error', '❌ Error al Eliminar', error.message || 'No se pudo eliminar la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos
  const filteredData = reservas.filter(reserva => {
    const matchSearch = reserva.tipo_reserva.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       reserva.id_reserva.toString().includes(searchTerm);
    const matchEstado = filtroEstado === 'todos' || reserva.estado === filtroEstado.toUpperCase();
    const matchTipo = filtroTipo === 'todos' || reserva.tipo_reserva === filtroTipo;
    
    return matchSearch && matchEstado && matchTipo;
  });

  // Obtener lista única de tipos para el filtro
  const tiposUnicos = [...new Set(reservas.map(r => r.tipo_reserva))];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="registro-reserva-container">
      {/* Mensaje de carga */}
      {loading && (
        <div className="loading-overlay-reserva">
          <div className="loading-spinner-reserva"></div>
          <p>Cargando...</p>
        </div>
      )}

      {/* Header */}
      <div className="registro-reserva-header">
        <div className="header-title-reserva">
          <span className="header-icon-reserva">📋</span>
          <div>
            <h1>Registro de Reserva</h1>
            <p>Gestión de tipos de reserva</p>
          </div>
        </div>
        <div className="header-actions-reserva">
          <button className="btn-reserva btn-primary-reserva" onClick={handleNuevaReserva}>
            <span>➕</span> Nueva Reserva
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid-reserva">
        <div className="stat-card-reserva">
          <div className="stat-icon-reserva blue-reserva">
            <span>📋</span>
          </div>
          <div className="stat-info-reserva">
            <h3>{estadisticas.total}</h3>
            <p>Total Reservas</p>
          </div>
        </div>
        <div className="stat-card-reserva">
          <div className="stat-icon-reserva green-reserva">
            <span>✅</span>
          </div>
          <div className="stat-info-reserva">
            <h3>{estadisticas.activas}</h3>
            <p>Activas</p>
          </div>
        </div>
        <div className="stat-card-reserva">
          <div className="stat-icon-reserva red-reserva">
            <span>❌</span>
          </div>
          <div className="stat-info-reserva">
            <h3>{estadisticas.inactivas}</h3>
            <p>Inactivas</p>
          </div>
        </div>
        <div className="stat-card-reserva">
          <div className="stat-icon-reserva purple-reserva">
            <span>📊</span>
          </div>
          <div className="stat-info-reserva">
            <h3>{tiposUnicos.length}</h3>
            <p>Tipos Únicos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section-reserva">
        <h2>🔍 Filtros de Búsqueda</h2>
        <div className="filtros-grid-reserva">
          <div className="filtro-group-reserva">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="ID o tipo de reserva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filtro-group-reserva">
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="filtro-group-reserva">
            <label>Tipo de Reserva</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="todos">Todos los tipos</option>
              {tiposUnicos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-section-reserva">
        <div className="tabla-header-reserva">
          <h2>📋 Listado de Reservas ({filteredData.length})</h2>
          <div className="search-box-reserva">
            <input
              type="text"
              placeholder="Búsqueda rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon-reserva">🔍</span>
          </div>
        </div>

        <div className="table-wrapper-reserva">
          <table className="reserva-table-unique">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo Reserva</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((reserva) => (
                  <tr key={reserva.id_reserva}>
                    <td><strong>{reserva.id_reserva}</strong></td>
                    <td><strong>{reserva.tipo_reserva}</strong></td>
                    <td>
                      <span className={`estado-badge-reserva ${reserva.estado.toLowerCase()}-reserva`}>
                        {reserva.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>{reserva.fecha_creacion}</td>
                    <td>
                      <div className="actions-cell-reserva">
                        <button className="btn-icon-reserva btn-view-reserva" onClick={() => handleView(reserva)} title="Ver detalles">
                          👁️
                        </button>
                        <button className="btn-icon-reserva btn-edit-reserva" onClick={() => handleEdit(reserva)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon-reserva btn-delete-reserva" onClick={() => handleDelete(reserva)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="empty-state-reserva">
                      <div className="empty-state-icon-reserva">📋</div>
                      <h3>No se encontraron reservas</h3>
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
          <div className="pagination-reserva">
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

      {/* Modal Nueva Reserva */}
      {modalNuevo && (
        <>
          <div className="modal-overlay-reserva" onClick={() => setModalNuevo(false)}></div>
          <div className="modal-reserva">
            <div className="modal-header-reserva">
              <h2>➕ Nueva Reserva</h2>
              <button className="btn-close-reserva" onClick={() => setModalNuevo(false)}>✖</button>
            </div>
            <div className="modal-body-reserva">
              <div className="form-group-reserva">
                <label>Tipo de Reserva *</label>
                <input
                  type="text"
                  name="tipo_reserva"
                  value={formulario.tipo_reserva}
                  onChange={handleInputChange}
                  placeholder="Ej: EXTERNA, INTERNA, COMERCIAL"
                  maxLength="100"
                />
              </div>
              {/* Campo Estado OCULTO pero enviado al backend */}
              <input type="hidden" name="estado" value={formulario.estado} />
            </div>
            <div className="modal-footer-reserva">
              <button className="btn-secondary-reserva" onClick={() => setModalNuevo(false)}>
                ✕ Cancelar
              </button>
              <button className="btn-primary-reserva" onClick={handleGuardarNuevo}>
                ✓ Guardar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Editar Reserva */}
      {modalEditar && reservaSeleccionada && (
        <>
          <div className="modal-overlay-reserva" onClick={() => setModalEditar(false)}></div>
          <div className="modal-reserva">
            <div className="modal-header-reserva">
              <h2>✏️ Editar Reserva</h2>
              <button className="btn-close-reserva" onClick={() => setModalEditar(false)}>✖</button>
            </div>
            <div className="modal-body-reserva">
              <div className="form-group-reserva">
                <label>Tipo de Reserva *</label>
                <input
                  type="text"
                  name="tipo_reserva"
                  value={formulario.tipo_reserva}
                  onChange={handleInputChange}
                  placeholder="Ej: EXTERNA, INTERNA, COMERCIAL"
                  maxLength="100"
                />
              </div>
              {/* Campo Estado OCULTO pero enviado al backend */}
              <input type="hidden" name="estado" value={formulario.estado} />
            </div>
            <div className="modal-footer-reserva">
              <button className="btn-secondary-reserva" onClick={() => setModalEditar(false)}>
                ✕ Cancelar
              </button>
              <button className="btn-primary-reserva" onClick={handleGuardarEdicion}>
                ✓ Actualizar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Ver Detalles */}
      {modalVer && reservaSeleccionada && (
        <>
          <div className="modal-overlay-reserva" onClick={() => setModalVer(false)}></div>
          <div className="modal-reserva">
            <div className="modal-header-reserva">
              <h2>👁️ Detalles de la Reserva</h2>
              <button className="btn-close-reserva" onClick={() => setModalVer(false)}>✖</button>
            </div>
            <div className="modal-body-reserva">
              <div className="detalle-row-reserva">
                <strong>ID Reserva:</strong>
                <span>{reservaSeleccionada.id_reserva}</span>
              </div>
              <div className="detalle-row-reserva">
                <strong>Tipo de Reserva:</strong>
                <span>{reservaSeleccionada.tipo_reserva}</span>
              </div>
              <div className="detalle-row-reserva">
                <strong>Estado:</strong>
                <span className={`estado-badge-reserva ${reservaSeleccionada.estado.toLowerCase()}-reserva`}>
                  {reservaSeleccionada.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
              <div className="detalle-row-reserva">
                <strong>Fecha de Creación:</strong>
                <span>{reservaSeleccionada.fecha_creacion}</span>
              </div>
            </div>
            <div className="modal-footer-reserva">
              <button className="btn-success-reserva" onClick={() => setModalVer(false)}>
                ✓ Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Confirmar Eliminar */}
      {modalEliminar && reservaSeleccionada && (
        <>
          <div className="modal-overlay-reserva" onClick={() => setModalEliminar(false)}></div>
          <div className="modal-reserva modal-reserva-small">
            <div className="modal-header-reserva modal-header-danger">
              <h2>🗑️ Confirmar Eliminación</h2>
              <button className="btn-close-reserva" onClick={() => setModalEliminar(false)}>✖</button>
            </div>
            <div className="modal-body-reserva">
              <p style={{ textAlign: 'center', marginBottom: '15px' }}>
                ¿Está seguro que desea eliminar la reserva:
              </p>
              <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#e53e3e' }}>
                "{reservaSeleccionada.tipo_reserva}"?
              </p>
              <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#666' }}>
                Esta acción cambiará el estado a INACTIVO.
              </p>
            </div>
            <div className="modal-footer-reserva">
              <button className="btn-secondary-reserva" onClick={() => setModalEliminar(false)}>
                ✕ Cancelar
              </button>
              <button className="btn-danger-reserva" onClick={confirmarEliminar}>
                ✓ Eliminar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Mensajes */}
      {modalMensaje.mostrar && (
        <>
          <div className="modal-overlay-reserva" onClick={cerrarModalMensaje}></div>
          <div className={`modal-mensaje-reserva modal-mensaje-${modalMensaje.tipo}`}>
            <div className="modal-mensaje-header">
              <div className="modal-mensaje-icono">
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
                className={`btn-mensaje-reserva btn-mensaje-${modalMensaje.tipo}`}
                onClick={cerrarModalMensaje}
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

export default RegistroReserva;