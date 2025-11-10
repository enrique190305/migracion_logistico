import React, { useState, useEffect } from 'react';
import './EditarProveedor.css';
import * as proveedorAPI from '../../services/proveedorAPI';

// ============================================
// COMPONENTE: Toast Notification
// ============================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
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
    <div className={`toast-editar toast-editar-${type}`}>
      <span className="toast-editar-icon">{icons[type]}</span>
      <span className="toast-editar-message">{message}</span>
      <button className="toast-editar-close" onClick={onClose}>×</button>
    </div>
  );
};

// ============================================
// COMPONENTE: Modal de Confirmación
// ============================================
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  return (
    <div className="modal-overlay-editar" onClick={onCancel}>
      <div className="modal-confirm-editar" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-confirm-editar-header ${type}`}>
          <span className="modal-confirm-editar-icon">
            {type === 'danger' ? '🗑️' : type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="modal-confirm-editar-body">
          <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
        </div>
        <div className="modal-confirm-editar-footer">
          <button className="btn-editar-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-editar-confirm btn-editar-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditarProveedor = () => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [panelMinimizado, setPanelMinimizado] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para Toast y Modal
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [formulario, setFormulario] = useState({
    proveedor: '',
    ruc: '',
    direccion: '',
    contacto: '',
    telefono: '',
    email: '',
    formaPago: '',
    servicios: ''
  });

  // Función para mostrar toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Cargar proveedores al montar el componente
  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await proveedorAPI.obtenerProveedores();
      
      if (response.success) {
        setProveedores(response.data);
      } else {
        showToast('Error al cargar proveedores', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProveedorClick = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setFormulario({
      proveedor: proveedor.proveedor,
      ruc: proveedor.ruc,
      direccion: proveedor.direccion || '',
      contacto: proveedor.contacto || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      formaPago: proveedor.formaPago || '',
      servicios: proveedor.servicios || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleActualizar = async () => {
    if (!proveedorSeleccionado) {
      showToast('Por favor seleccione un proveedor de la lista', 'warning');
      return;
    }

    if (!formulario.proveedor || !formulario.ruc) {
      showToast('Por favor complete los campos obligatorios (Proveedor y RUC)', 'warning');
      return;
    }

    if (formulario.ruc.length !== 11 || !/^\d+$/.test(formulario.ruc)) {
      showToast('El RUC debe tener 11 dígitos numéricos', 'warning');
      return;
    }

    if (formulario.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      showToast('Por favor ingrese un email válido', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const response = await proveedorAPI.actualizarProveedor(proveedorSeleccionado.id, {
        nombre: formulario.proveedor,
        ruc: formulario.ruc,
        direccion: formulario.direccion,
        contacto: formulario.contacto,
        celular: formulario.telefono,
        correo: formulario.email,
        forma_pago: formulario.formaPago,
        servicio: formulario.servicios
      });
      
      if (response.success) {
        showToast(`Proveedor actualizado correctamente: ${formulario.proveedor}`, 'success');
        await cargarProveedores(); // Recargar lista
        
        // Actualizar el proveedor seleccionado con los nuevos datos
        const proveedorActualizado = proveedores.find(p => p.id === proveedorSeleccionado.id);
        if (proveedorActualizado) {
          setProveedorSeleccionado({
            ...proveedorActualizado,
            proveedor: formulario.proveedor,
            direccion: formulario.direccion,
            contacto: formulario.contacto,
            telefono: formulario.telefono,
            email: formulario.email,
            formaPago: formulario.formaPago,
            servicios: formulario.servicios
          });
        }
      } else {
        showToast(`Error: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al actualizar el proveedor: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefrescar = async () => {
    if (!proveedorSeleccionado) {
      showToast('Seleccione un proveedor primero', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await proveedorAPI.obtenerProveedorPorId(proveedorSeleccionado.id);
      
      if (response.success) {
        const proveedorActualizado = response.data;
        setFormulario({
          proveedor: proveedorActualizado.proveedor,
          ruc: proveedorActualizado.ruc,
          direccion: proveedorActualizado.direccion || '',
          contacto: proveedorActualizado.contacto || '',
          telefono: proveedorActualizado.telefono || '',
          email: proveedorActualizado.email || '',
          formaPago: proveedorActualizado.formaPago || '',
          servicios: proveedorActualizado.servicios || ''
        });
        showToast('Datos refrescados desde la base de datos', 'success');
      } else {
        showToast('Error al refrescar datos', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al refrescar datos del proveedor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormulario({
      proveedor: '',
      ruc: '',
      direccion: '',
      contacto: '',
      telefono: '',
      email: '',
      formaPago: '',
      servicios: ''
    });
    setProveedorSeleccionado(null);
  };

  const handleEliminar = async () => {
    if (!proveedorSeleccionado) {
      showToast('Por favor seleccione un proveedor de la lista', 'warning');
      return;
    }

    setConfirmModal({
      title: 'Eliminar Proveedor',
      message: `¿Está seguro de eliminar el proveedor "${proveedorSeleccionado.proveedor}"?\n\nEsta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setConfirmModal(null);
        
        try {
          setLoading(true);
          const response = await proveedorAPI.eliminarProveedor(proveedorSeleccionado.id);
          
          if (response.success) {
            showToast(`Proveedor eliminado: ${proveedorSeleccionado.proveedor}`, 'success');
            await cargarProveedores(); // Recargar lista
            handleLimpiar();
          } else {
            showToast(`Error: ${response.message}`, 'error');
          }
        } catch (error) {
          console.error('Error:', error);
          showToast('Error al eliminar el proveedor', 'error');
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const filteredProveedores = proveedores.filter(prov =>
    prov.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prov.ruc.includes(searchTerm) ||
    (prov.contacto && prov.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && proveedores.length === 0) {
    return (
      <div className="editar-proveedor-container">
        <div className="loading-container-editar-prov">
          <div className="spinner-editar-prov"></div>
          <p>Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-proveedor-container">
      {/* Header */}
      <div className="editar-proveedor-header">
        <div className="header-icon-title-editar-prov">
          <span className="header-icon-editar-prov">⚙️</span>
          <div>
            <h1>EDITAR PROVEEDORES</h1>
            <p>Seleccione un proveedor para editar su información</p>
          </div>
        </div>
      </div>

      {/* PANEL HORIZONTAL - DATOS DEL PROVEEDOR */}
      <div className={`datos-proveedor-horizontal-editar-prov ${panelMinimizado ? 'minimizado' : ''}`}>
        <div className="datos-header-horizontal-editar-prov">
          <h2>✏️ DATOS DEL PROVEEDOR</h2>
          <button 
            className="btn-minimizar-editar-prov"
            onClick={() => setPanelMinimizado(!panelMinimizado)}
            title={panelMinimizado ? "Maximizar panel" : "Minimizar panel"}
          >
            {panelMinimizado ? '➕' : '➖'}
          </button>
        </div>

        {!panelMinimizado && (
          <>
            <div className="datos-grid-horizontal-editar-prov">
              <div className="dato-field-editar-prov">
                <label>🏢 PROVEEDOR *</label>
                <input
                  type="text"
                  name="proveedor"
                  value={formulario.proveedor}
                  onChange={handleInputChange}
                  placeholder="Seleccione un proveedor de la lista"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📋 RUC (NO EDITABLE)</label>
                <input
                  type="text"
                  value={formulario.ruc}
                  disabled
                  className="input-disabled-editar-prov"
                  placeholder="RUC del proveedor"
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📍 DIRECCIÓN</label>
                <textarea
                  name="direccion"
                  value={formulario.direccion}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Dirección completa"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>👤 NOMBRE CONTACTO</label>
                <input
                  type="text"
                  name="contacto"
                  value={formulario.contacto}
                  onChange={handleInputChange}
                  placeholder="Nombre del contacto"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📞 TELÉFONO</label>
                <input
                  type="text"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📧 EMAIL</label>
                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>💳 FORMA DE PAGO</label>
                <input
                  type="text"
                  name="formaPago"
                  value={formulario.formaPago}
                  onChange={handleInputChange}
                  placeholder="Forma de pago"
                  disabled={!proveedorSeleccionado}
                  className={!proveedorSeleccionado ? '' : ''}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>🛠️ SERVICIOS</label>
                <input
                  type="text"
                  name="servicios"
                  value={formulario.servicios}
                  onChange={handleInputChange}
                  placeholder="Servicios que ofrece"
                  disabled={!proveedorSeleccionado}
                />
              </div>
            </div>

            <div className="datos-footer-horizontal-editar-prov">
              <button 
                className="btn-actualizar-editar-prov" 
                onClick={handleActualizar}
                disabled={!proveedorSeleccionado || loading}
              >
                <span>✅</span> {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
              </button>
              <button 
                className="btn-refrescar-editar-prov" 
                onClick={handleRefrescar}
                disabled={!proveedorSeleccionado || loading}
              >
                <span>🔄</span> REFRESCAR
              </button>
              <button 
                className="btn-limpiar-editar-prov" 
                onClick={handleLimpiar}
                disabled={loading}
              >
                <span>🗑️</span> LIMPIAR
              </button>
              <button 
                className="btn-eliminar-editar-prov" 
                onClick={handleEliminar}
                disabled={!proveedorSeleccionado || loading}
              >
                <span>❌</span> ELIMINAR
              </button>
            </div>
          </>
        )}
      </div>

      {/* LISTA DE PROVEEDORES */}
      <div className="lista-proveedores-section-editar-prov">
        <div className="lista-header-editar-prov">
          <h2>📋 LISTA DE PROVEEDORES</h2>
        </div>

        <div className="search-proveedor-editar-prov">
          <input
            type="text"
            placeholder="Buscar por nombre, RUC o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon-editar-prov">🔍</span>
        </div>

        <div className="tabla-proveedores-wrapper-editar-prov">
          <table className="tabla-proveedores-editar-prov">
            <thead>
              <tr>
                <th>ID</th>
                <th>PROVEEDOR</th>
                <th>RUC</th>
                <th>DIRECCIÓN</th>
                <th>CONTACTO</th>
                <th>TELÉFONO</th>
                <th>EMAIL</th>
                <th>FORMA PAGO</th>
                <th>SERVICIOS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProveedores.length > 0 ? (
                filteredProveedores.map((proveedor) => (
                  <tr
                    key={proveedor.id}
                    className={proveedorSeleccionado?.id === proveedor.id ? 'selected-editar-prov' : ''}
                    onClick={() => handleProveedorClick(proveedor)}
                  >
                    <td>{proveedor.id}</td>
                    <td><strong>{proveedor.proveedor}</strong></td>
                    <td>{proveedor.ruc}</td>
                    <td>{proveedor.direccion || '-'}</td>
                    <td>{proveedor.contacto || '-'}</td>
                    <td>{proveedor.telefono || '-'}</td>
                    <td className="email-cell-editar-prov">{proveedor.email || '-'}</td>
                    <td>{proveedor.formaPago || '-'}</td>
                    <td>{proveedor.servicios || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty-message-editar-prov">
                    <div className="empty-state-editar-prov">
                      <span className="empty-icon-editar-prov">📋</span>
                      <p>No se encontraron proveedores</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}

      {/* Modal de Confirmación */}
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
    </div>
  );
};

export default EditarProveedor;