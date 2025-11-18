import React, { useState, useEffect } from 'react';
import './RegistroFamilia.css';
import { 
  listarFamiliasNuevas, 
  crearFamiliaNueva, 
  actualizarFamiliaNueva,
  listarSubfamilias,
  crearSubfamilia,
  actualizarSubfamilia,
  obtenerProductosSubfamilia
} from '../../services/familiaAPI';

// ============================================
// COMPONENTE: Toast Notification
// ============================================
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`toast-familia toast-familia-${type}`}>
      <span className="toast-familia-icon">{icons[type]}</span>
      <span className="toast-familia-message">{message}</span>
      <button className="toast-familia-close" onClick={onClose}>×</button>
    </div>
  );
};

// ============================================
// COMPONENTE: Modal de Confirmación
// ============================================
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' }) => {
  return (
    <div className="modal-overlay-familia" onClick={onCancel}>
      <div className="modal-confirm-familia" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-confirm-familia-header ${type}`}>
          <span className="modal-confirm-familia-icon">
            {type === 'warning' ? '⚠️' : type === 'danger' ? '🗑️' : '❓'}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="modal-confirm-familia-body">
          <p>{message}</p>
        </div>
        <div className="modal-confirm-familia-footer">
          <button className="btn-familia-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-familia-confirm btn-familia-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistroFamilia = () => {
  // Estados principales
  const [familias, setFamilias] = useState([]);
  const [subfamilias, setSubfamilias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vistaActual, setVistaActual] = useState('familias'); // 'familias' o 'subfamilias'
  
  // Estados de modales y UI
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalSubfamilia, setModalSubfamilia] = useState(false);
  const [modalProductos, setModalProductos] = useState(false);
  const [productosSubfamilia, setProductosSubfamilia] = useState([]);
  const [subfamiliaActual, setSubfamiliaActual] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Formularios
  const [formulario, setFormulario] = useState({
    nombre_familia: '',
    prefijo_codigo: '',
    descripcion: ''
  });

  const [formularioSubfamilia, setFormularioSubfamilia] = useState({
    id_familia: '',
    nombre_subfamilia: '',
    prefijo_sub: '',
    descripcion: ''
  });

  // Cargar datos al inicio
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [dataFamilias, dataSubfamilias] = await Promise.all([
        listarFamiliasNuevas(),
        listarSubfamilias()
      ]);
      setFamilias(dataFamilias);
      setSubfamilias(dataSubfamilias);
    } catch (error) {
      showToast('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Handlers para Familias
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value.toUpperCase()
    });
  };

  const handleNuevaFamilia = () => {
    setModalAbierto(true);
    setFamiliaSeleccionada(null);
    setFormulario({
      nombre_familia: '',
      prefijo_codigo: '',
      descripcion: ''
    });
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setFamiliaSeleccionada(null);
    setFormulario({
      nombre_familia: '',
      prefijo_codigo: '',
      descripcion: ''
    });
  };

  const handleGuardarFamilia = async () => {
    if (!formulario.nombre_familia || !formulario.prefijo_codigo) {
      showToast('Por favor complete los campos obligatorios', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (familiaSeleccionada) {
        await actualizarFamiliaNueva(familiaSeleccionada.id_familia, formulario);
        showToast('Familia actualizada exitosamente', 'success');
      } else {
        await crearFamiliaNueva(formulario);
        showToast('Familia creada exitosamente', 'success');
      }
      await cargarDatos();
      handleCerrarModal();
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarFamilia = (familia) => {
    setFamiliaSeleccionada(familia);
    setFormulario({
      nombre_familia: familia.nombre_familia,
      prefijo_codigo: familia.prefijo_codigo,
      descripcion: familia.descripcion || ''
    });
    setModalAbierto(true);
  };

  // Handlers para Subfamilias
  const handleInputChangeSubfamilia = (e) => {
    const { name, value } = e.target;
    setFormularioSubfamilia({
      ...formularioSubfamilia,
      [name]: name === 'prefijo_sub' ? value.toUpperCase() : value
    });
  };

  const handleNuevaSubfamilia = () => {
    if (familias.length === 0) {
      showToast('Primero debe crear al menos una familia', 'warning');
      return;
    }
    setModalSubfamilia(true);
    setFormularioSubfamilia({
      id_familia: familias[0]?.id_familia || '',
      nombre_subfamilia: '',
      prefijo_sub: '',
      descripcion: ''
    });
  };

  const handleCerrarModalSubfamilia = () => {
    setModalSubfamilia(false);
    setFormularioSubfamilia({
      id_familia: '',
      nombre_subfamilia: '',
      prefijo_sub: '',
      descripcion: ''
    });
  };

  const handleGuardarSubfamilia = async () => {
    if (!formularioSubfamilia.id_familia || !formularioSubfamilia.nombre_subfamilia || !formularioSubfamilia.prefijo_sub) {
      showToast('Por favor complete todos los campos obligatorios', 'warning');
      return;
    }

    setLoading(true);
    try {
      await crearSubfamilia(formularioSubfamilia);
      showToast('Subfamilia creada exitosamente', 'success');
      await cargarDatos();
      handleCerrarModalSubfamilia();
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredFamilias = familias.filter(fam =>
    fam.nombre_familia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fam.prefijo_codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubfamilias = subfamilias.filter(sub =>
    sub.nombre_subfamilia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.prefijo_sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.familia?.nombre_familia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ver productos de una subfamilia
  const handleVerProductos = async (subfamilia) => {
    setLoading(true);
    setSubfamiliaActual(subfamilia);
    try {
      const response = await obtenerProductosSubfamilia(subfamilia.id_subfamilia);
      setProductosSubfamilia(response.productos || []);
      setModalProductos(true);
    } catch (error) {
      showToast('Error al cargar productos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModalProductos = () => {
    setModalProductos(false);
    setProductosSubfamilia([]);
    setSubfamiliaActual(null);
  };

  const handleEliminar = (id) => {
    const familia = familias.find(f => f.id === id);
    setConfirmModal({
      title: '¿Eliminar familia?',
      message: `¿Está seguro de eliminar la familia "${familia.tipoFamilia}"?\n\nEsta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: () => {
        setFamilias(familias.filter(fam => fam.id !== id));
        showToast(`Familia eliminada: ${familia.tipoFamilia}`, 'success');
        if (familiaSeleccionada?.id === id) {
          setFamiliaSeleccionada(null);
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // Colores para las categorías
  const getCategoriaColor = (prefijo) => {
    const colores = {
      'HERR': '#f39c12',
      'MATE': '#3498db',
      'EQUI': '#2ecc71',
      'SUMI': '#e74c3c',
      'ACFI': '#9b59b6'
    };
    return colores[prefijo] || '#95a5a6';
  };

  return (
    <div className="registro-familia-container-new">
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
        />
      )}

      {/* Header con tabs */}
      <div className="registro-familia-header-new">
        <div className="header-left-familia">
          <span className="header-icon-familia-new">📁</span>
          <div>
            <h1>GESTIÓN DE FAMILIAS Y SUBFAMILIAS</h1>
            <p>Sistema de códigos alfanuméricos para productos</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={vistaActual === 'familias' ? "btn-nueva-familia-new" : "btn-nueva-familia-new btn-secondary"}
            onClick={() => setVistaActual('familias')}
          >
            📁 Familias ({familias.length})
          </button>
          <button 
            className={vistaActual === 'subfamilias' ? "btn-nueva-familia-new" : "btn-nueva-familia-new btn-secondary"}
            onClick={() => setVistaActual('subfamilias')}
          >
            📂 Subfamilias ({subfamilias.length})
          </button>
        </div>
      </div>

      {/* Buscador y botón crear */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div className="search-familia-new" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder={`🔍 Buscar ${vistaActual}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {vistaActual === 'familias' ? (
          <button className="btn-nueva-familia-new" onClick={handleNuevaFamilia} disabled={loading}>
            <span>➕</span> NUEVA FAMILIA
          </button>
        ) : (
          <button className="btn-nueva-familia-new" onClick={handleNuevaSubfamilia} disabled={loading}>
            <span>➕</span> NUEVA SUBFAMILIA
          </button>
        )}
      </div>

      {/* Vista de Familias */}
      {vistaActual === 'familias' && (
        <div className="tabla-familia-container-new">
          <table className="tabla-familia-new">
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE FAMILIA</th>
                <th>CÓDIGO</th>
                <th>DESCRIPCIÓN</th>
                <th>SUBFAMILIAS</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    Cargando...
                  </td>
                </tr>
              ) : filteredFamilias.length > 0 ? (
                filteredFamilias.map((familia) => (
                  <tr key={familia.id_familia}>
                    <td>{familia.id_familia}</td>
                    <td>
                      <span 
                        className="badge-familia-new"
                        style={{ backgroundColor: getCategoriaColor(familia.prefijo_codigo) }}
                      >
                        {familia.nombre_familia}
                      </span>
                    </td>
                    <td><strong>{familia.prefijo_codigo}</strong></td>
                    <td>{familia.descripcion || '-'}</td>
                    <td>{familia.cantidad_subfamilias || 0}</td>
                    <td>
                      <button 
                        className="btn-action-familia-new btn-edit-familia-new"
                        onClick={() => handleEditarFamilia(familia)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    No se encontraron familias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista de Subfamilias */}
      {vistaActual === 'subfamilias' && (
        <div className="tabla-familia-container-new">
          <table className="tabla-familia-new">
            <thead>
              <tr>
                <th>ID</th>
                <th>FAMILIA</th>
                <th>NOMBRE SUBFAMILIA</th>
                <th>CÓDIGO SUB</th>
                <th>CÓDIGO COMPLETO</th>
                <th>PRODUCTOS</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    Cargando...
                  </td>
                </tr>
              ) : filteredSubfamilias.length > 0 ? (
                filteredSubfamilias.map((subfamilia) => (
                  <tr key={subfamilia.id_subfamilia}>
                    <td>{subfamilia.id_subfamilia}</td>
                    <td>
                      <span 
                        className="badge-familia-new"
                        style={{ backgroundColor: '#2ecc71' }}
                      >
                        {subfamilia.familia?.nombre_familia || 'N/A'}
                      </span>
                    </td>
                    <td>{subfamilia.nombre_subfamilia}</td>
                    <td><strong>{subfamilia.prefijo_sub}</strong></td>
                    <td>
                      <span style={{ 
                        color: '#3498db', 
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        fontSize: '13px'
                      }}>
                        {subfamilia.familia?.prefijo_codigo || 'N/A'}-{subfamilia.prefijo_sub}-XXXX
                      </span>
                    </td>
                    <td>
                      <span style={{
                        backgroundColor: subfamilia.cantidad_productos > 0 ? '#27ae60' : '#95a5a6',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {subfamilia.cantidad_productos || 0}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-ver-productos"
                        onClick={() => handleVerProductos(subfamilia)}
                        title="Ver productos"
                        disabled={!subfamilia.cantidad_productos || subfamilia.cantidad_productos === 0}
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    No se encontraron subfamilias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Familia */}
      {modalAbierto && (
        <div className="modal-overlay-familia" onClick={handleCerrarModal}>
          <div className="modal-content-familia" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-familia">
              <h2>{familiaSeleccionada ? '✏️ EDITAR FAMILIA' : '➕ NUEVA FAMILIA'}</h2>
              <button className="btn-cerrar-modal-familia" onClick={handleCerrarModal}>
                ✖
              </button>
            </div>

            <div className="modal-body-familia">
              <div className="form-group-modal-familia">
                <label>📂 NOMBRE DE LA FAMILIA *</label>
                <input
                  type="text"
                  name="nombre_familia"
                  value={formulario.nombre_familia}
                  onChange={handleInputChange}
                  placeholder="Ej: Herramientas, Materiales"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="form-group-modal-familia">
                <label>🔠 CÓDIGO (PREFIJO) *</label>
                <input
                  type="text"
                  name="prefijo_codigo"
                  value={formulario.prefijo_codigo}
                  onChange={handleInputChange}
                  placeholder="Ej: HERR, MATE"
                  maxLength="10"
                  disabled={loading || familiaSeleccionada}
                />
                <span className="hint-text-familia">💡 Código de 3-10 caracteres en mayúsculas</span>
              </div>

              <div className="form-group-modal-familia">
                <label>📝 DESCRIPCIÓN</label>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción opcional de la familia"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="info-box-familia">
                <span className="info-icon-familia">ℹ️</span>
                <div>
                  <strong>Información:</strong>
                  <p>Este código se utilizará como prefijo para los productos de esta familia.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer-familia">
              <button className="btn-cancelar-modal-familia" onClick={handleCerrarModal} disabled={loading}>
                <span>❌</span> CANCELAR
              </button>
              <button 
                className="btn-guardar-modal-familia" 
                onClick={handleGuardarFamilia}
                disabled={loading}
              >
                <span>💾</span> {familiaSeleccionada ? 'ACTUALIZAR' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subfamilia */}
      {modalSubfamilia && (
        <div className="modal-overlay-familia" onClick={handleCerrarModalSubfamilia}>
          <div className="modal-content-familia" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-familia">
              <h2>➕ NUEVA SUBFAMILIA</h2>
              <button className="btn-cerrar-modal-familia" onClick={handleCerrarModalSubfamilia}>
                ✖
              </button>
            </div>

            <div className="modal-body-familia">
              <div className="form-group-modal-familia">
                <label>📁 FAMILIA PRINCIPAL *</label>
                <select
                  name="id_familia"
                  value={formularioSubfamilia.id_familia}
                  onChange={handleInputChangeSubfamilia}
                  disabled={loading}
                >
                  <option value="">Seleccione una familia</option>
                  {familias.map(fam => (
                    <option key={fam.id_familia} value={fam.id_familia}>
                      {fam.nombre_familia} ({fam.prefijo_codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-modal-familia">
                <label>📂 NOMBRE DE LA SUBFAMILIA *</label>
                <input
                  type="text"
                  name="nombre_subfamilia"
                  value={formularioSubfamilia.nombre_subfamilia}
                  onChange={handleInputChangeSubfamilia}
                  placeholder="Ej: Herramientas Manuales"
                  disabled={loading}
                />
              </div>

              <div className="form-group-modal-familia">
                <label>🔠 CÓDIGO SUBFAMILIA *</label>
                <input
                  type="text"
                  name="prefijo_sub"
                  value={formularioSubfamilia.prefijo_sub}
                  onChange={handleInputChangeSubfamilia}
                  placeholder="Ej: MANU, ELEC"
                  maxLength="10"
                  disabled={loading}
                />
                <span className="hint-text-familia">💡 Código de 3-10 caracteres</span>
              </div>

              <div className="form-group-modal-familia">
                <label>📝 DESCRIPCIÓN</label>
                <textarea
                  name="descripcion"
                  value={formularioSubfamilia.descripcion}
                  onChange={handleInputChangeSubfamilia}
                  placeholder="Descripción opcional"
                  rows="3"
                  disabled={loading}
                />
              </div>

              {formularioSubfamilia.id_familia && formularioSubfamilia.prefijo_sub && (
                <div className="info-box-familia" style={{ background: '#e8f4fd' }}>
                  <span className="info-icon-familia">🔍</span>
                  <div>
                    <strong>Vista previa del código:</strong>
                    <p style={{ fontSize: '18px', color: '#3498db', fontWeight: 'bold' }}>
                      {familias.find(f => f.id_familia == formularioSubfamilia.id_familia)?.prefijo_codigo}-{formularioSubfamilia.prefijo_sub}-####
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-familia">
              <button className="btn-cancelar-modal-familia" onClick={handleCerrarModalSubfamilia} disabled={loading}>
                <span>❌</span> CANCELAR
              </button>
              <button 
                className="btn-guardar-modal-familia" 
                onClick={handleGuardarSubfamilia}
                disabled={loading}
              >
                <span>💾</span> GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Productos de Subfamilia */}
      {modalProductos && (
        <div className="modal-overlay-familia" onClick={handleCerrarModalProductos}>
          <div className="modal-content-familia" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-familia">
              <h2>📦 PRODUCTOS - {subfamiliaActual?.nombre_subfamilia}</h2>
              <button className="btn-cerrar-modal-familia" onClick={handleCerrarModalProductos}>
                ✖
              </button>
            </div>

            <div className="modal-body-familia">
              {/* Info de la subfamilia */}
              <div style={{
                background: '#f0f9ff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #3498db'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Familia:</strong> {subfamiliaActual?.familia?.nombre_familia}
                  </div>
                  <div>
                    <strong>Código:</strong> {subfamiliaActual?.familia?.prefijo_codigo}-{subfamiliaActual?.prefijo_sub}
                  </div>
                  <div>
                    <strong>Total:</strong> <span style={{ 
                      backgroundColor: '#27ae60', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}>
                      {productosSubfamilia.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabla de productos */}
              {productosSubfamilia.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="tabla-familia-new">
                    <thead>
                      <tr>
                        <th>CÓDIGO</th>
                        <th>DESCRIPCIÓN</th>
                        <th>UNIDAD</th>
                        <th>CONSUMIBLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosSubfamilia.map((producto, index) => (
                        <tr key={index}>
                          <td>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              color: '#3498db',
                              fontSize: '13px'
                            }}>
                              {producto.codigo_producto}
                            </span>
                          </td>
                          <td>{producto.descripcion}</td>
                          <td>{producto.unidad}</td>
                          <td>
                            <span style={{
                              backgroundColor: producto.consumible === 'SI' ? '#e74c3c' : '#95a5a6',
                              color: 'white',
                              padding: '3px 10px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}>
                              {producto.consumible}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                  <p>No hay productos registrados en esta subfamilia</p>
                </div>
              )}
            </div>

            <div className="modal-footer-familia">
              <button className="btn-cancelar-modal-familia" onClick={handleCerrarModalProductos}>
                <span>✖</span> CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroFamilia;