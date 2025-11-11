import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/authService';
import './Aprobacion.css';
import ModalDetalle from './ModalDetalle';

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
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

// ============================================
// COMPONENTE: Modal de Confirmación
// ============================================
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-confirm-header ${type}`}>
          <span className="modal-confirm-icon">
            {type === 'warning' ? '⚠️' : type === 'danger' ? '🗑️' : '❓'}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="modal-confirm-body">
          <p>{message}</p>
        </div>
        <div className="modal-confirm-footer">
          <button className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-confirm btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: Modal de Input (para motivo de rechazo)
// ============================================
const InputModal = ({ title, message, placeholder, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (inputValue.trim() === '') {
      return;
    }
    onConfirm(inputValue);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-input" onClick={(e) => e.stopPropagation()}>
        <div className="modal-input-header">
          <span className="modal-input-icon">✍️</span>
          <h3>{title}</h3>
        </div>
        <div className="modal-input-body">
          {message && <p className="modal-input-message">{message}</p>}
          <textarea
            className="modal-input-textarea"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows="4"
            autoFocus
          />
          {inputValue.trim() === '' && (
            <span className="modal-input-hint">* Campo obligatorio</span>
          )}
        </div>
        <div className="modal-input-footer">
          <button className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className="btn-confirm btn-primary" 
            onClick={handleConfirm}
            disabled={inputValue.trim() === ''}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Aprobacion = () => {
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [ordenesServicio, setOrdenesServicio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('compra');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detallesOrden, setDetallesOrden] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // Estados para Toast y Modals
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [inputModal, setInputModal] = useState(null);

  // Función para mostrar toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Cargar órdenes de compra
  const fetchOrdenesCompra = async () => {
    try {
      console.log('🔍 Cargando órdenes de compra...');
      const response = await apiClient.get('/aprobacion/ordenes-compra');
      
      console.log('✅ Órdenes de compra cargadas:', response.data);
      setOrdenesCompra(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar órdenes de compra:', err.response || err);
      setOrdenesCompra([]);
    }
  };

  // Cargar órdenes de servicio
  const fetchOrdenesServicio = async () => {
    try {
      console.log('🔍 Cargando órdenes de servicio...');
      const response = await apiClient.get('/aprobacion/ordenes-servicio');
      
      console.log('✅ Órdenes de servicio cargadas:', response.data);
      setOrdenesServicio(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar órdenes de servicio:', err.response || err);
      setOrdenesServicio([]);
    }
  };

  // Cargar detalles
  const fetchDetalleOrden = async (id, tipo) => {
    setLoadingDetalles(true);
    try {
      console.log(`🔍 Cargando detalles de ${tipo} ID:`, id);
      const endpoint = tipo === 'compra' 
        ? `/aprobacion/ordenes-compra/${id}/detalles`
        : `/aprobacion/ordenes-servicio/${id}/detalles`;
      
      const response = await apiClient.get(endpoint);
      
      console.log('✅ Detalles cargados:', response.data);
      setDetallesOrden(response.data || []);
    } catch (err) {
      console.error('❌ Error al cargar detalles:', err.response || err);
      setDetallesOrden([]);
    } finally {
      setLoadingDetalles(false);
    }
  };

  // Ver detalles
  const verDetalles = async (orden) => {
    setSelectedOrden(orden);
    setShowModal(true);
    
    const id = activeTab === 'compra' ? orden.id_oc : orden.id_os;
    await fetchDetalleOrden(id, activeTab);
  };

  // Aprobar orden
  const aprobarOrden = async () => {
    if (!selectedOrden) return;

    setConfirmModal({
      title: '¿Aprobar esta orden?',
      message: `¿Está seguro que desea aprobar la orden ${activeTab === 'compra' ? selectedOrden.codigo_oc : selectedOrden.codigo_os}?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(null);
        
        try {
          const id = activeTab === 'compra' ? selectedOrden.id_oc : selectedOrden.id_os;
          const endpoint = activeTab === 'compra'
            ? `/aprobacion/ordenes-compra/${id}/estado`
            : `/aprobacion/ordenes-servicio/${id}/estado`;
          
          console.log('🔄 Aprobando orden:', endpoint);
          
          await apiClient.put(endpoint, { estado: 'APROBADO' });
          
          showToast('Orden aprobada correctamente', 'success');
          setShowModal(false);
          
          if (activeTab === 'compra') {
            await fetchOrdenesCompra();
          } else {
            await fetchOrdenesServicio();
          }
        } catch (err) {
          console.error('❌ Error al aprobar orden:', err.response || err);
          showToast('Error al aprobar la orden: ' + (err.response?.data?.message || err.message), 'error');
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // Rechazar orden
  const rechazarOrden = async () => {
    if (!selectedOrden) return;

    setInputModal({
      title: 'Rechazar Orden',
      message: `Ingrese el motivo del rechazo para la orden ${activeTab === 'compra' ? selectedOrden.codigo_oc : selectedOrden.codigo_os}:`,
      placeholder: 'Describa el motivo del rechazo...',
      onConfirm: async (motivo) => {
        setInputModal(null);
        
        try {
          const id = activeTab === 'compra' ? selectedOrden.id_oc : selectedOrden.id_os;
          const endpoint = activeTab === 'compra'
            ? `/aprobacion/ordenes-compra/${id}/estado`
            : `/aprobacion/ordenes-servicio/${id}/estado`;
          
          console.log('🔄 Rechazando orden:', endpoint);
          
          await apiClient.put(
            endpoint,
            { 
              estado: 'RECHAZADO',
              observaciones: motivo 
            }
          );
          
          showToast('Orden rechazada correctamente', 'success');
          setShowModal(false);
          
          if (activeTab === 'compra') {
            await fetchOrdenesCompra();
          } else {
            await fetchOrdenesServicio();
          }
        } catch (err) {
          console.error('❌ Error al rechazar orden:', err.response || err);
          showToast('Error al rechazar la orden: ' + (err.response?.data?.message || err.message), 'error');
        }
      },
      onCancel: () => setInputModal(null)
    });
  };

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('🚀 Iniciando carga de datos...');
        await Promise.all([fetchOrdenesCompra(), fetchOrdenesServicio()]);
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cambiar de tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setError(null);
  };

  // Filtrar órdenes
  const ordenesActuales = activeTab === 'compra' ? ordenesCompra : ordenesServicio;
  const ordenesFiltradas = ordenesActuales.filter(orden => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    const codigo = activeTab === 'compra' ? orden.codigo_oc : orden.codigo_os;
    const proveedor = orden.razon_social || '';
    const empresa = orden.empresa || '';
    
    return (
      codigo?.toLowerCase().includes(term) ||
      proveedor.toLowerCase().includes(term) ||
      empresa.toLowerCase().includes(term) ||
      orden.proyecto?.toLowerCase().includes(term)
    );
  });

  // Formatear moneda
  const formatCurrency = (value, moneda) => {
    if (!value) return 'S/ 0.00';
    const symbol = moneda === 'USD' || moneda === 'DÓLARES' ? '$' : 'S/';
    return `${symbol} ${parseFloat(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ✅ CALCULAR TOTAL DE LOS DETALLES
  const calcularTotalDetalles = () => {
    return detallesOrden.reduce((total, item) => {
      const subtotal = parseFloat(item.subtotal) || 0;
      return total + subtotal;
    }, 0);
  };

  return (
    <div className="aprobacion-container">
      <div className="aprobacion-header">
        <div className="header-icon">
          <span className="icon-aprobacion">✅</span>
        </div>
        <div className="header-content">
          <h1 className="header-title">Aprobación de Órdenes</h1>
          <p className="header-subtitle">Gestión y administración</p>
        </div>
      </div>

      <div className="aprobacion-tabs">
        <button 
          className={`tab-button ${activeTab === 'compra' ? 'active' : ''}`}
          onClick={() => handleTabChange('compra')}
        >
          <span className="tab-icon">🛒</span>
          Órdenes de Compra
          {ordenesCompra.length > 0 && (
            <span className="tab-badge">{ordenesCompra.length}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'servicio' ? 'active' : ''}`}
          onClick={() => handleTabChange('servicio')}
        >
          <span className="tab-icon">🔧</span>
          Órdenes de Servicio
          {ordenesServicio.length > 0 && (
            <span className="tab-badge">{ordenesServicio.length}</span>
          )}
        </button>
      </div>

      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text"
            placeholder="Buscar por código, proveedor o proyecto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando órdenes...</p>
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>No hay órdenes pendientes de aprobación</h3>
          <p>Todas las órdenes han sido procesadas</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="ordenes-table">
            <thead>
              <tr>
                <th>TIPO</th>
                <th>CORRELATIVO</th>
                <th>EMPRESA</th>
                <th>PROVEEDOR</th>
                <th>FECHA</th>
                <th>FECHA REQUERIDA</th>
                <th>MONEDA</th>
                <th>TOTAL</th>
                <th>ESTADO</th>
                <th>USUARIO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id_oc || orden.id_os}>
                  <td>{activeTab === 'compra' ? 'OC' : 'OS'}</td>
                  <td>{activeTab === 'compra' ? orden.codigo_oc : orden.codigo_os}</td>
                  <td>{orden.empresa || 'N/A'}</td>
                  <td>{orden.razon_social || 'N/A'}</td>
                  <td>{formatDate(orden.fecha_creacion)}</td>
                  <td>{formatDate(orden.fecha_requerida)}</td>
                  <td>{orden.moneda || 'PEN'}</td>
                  <td>{formatCurrency(orden.total, orden.moneda)}</td>
                  <td>
                    <span className="estado-badge pendiente">
                      {orden.estado || 'PENDIENTE'}
                    </span>
                  </td>
                  <td>{orden.usuario_creacion || 'admin'}</td>
                  <td>
                    <button 
                      className="btn-ver-detalle"
                      onClick={() => verDetalles(orden)}
                    >
                      👁️ Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedOrden && (
        <ModalDetalle
          selectedOrden={{
            ...selectedOrden,
            numero_orden: activeTab === 'compra' ? selectedOrden.codigo_oc : selectedOrden.codigo_os,
            tipo_orden: activeTab === 'compra' ? 'OC' : 'OS'
          }}
          detallesOrden={detallesOrden}
          loadingDetalles={loadingDetalles}
          onClose={() => setShowModal(false)}
          onAprobar={aprobarOrden}
          onRechazar={rechazarOrden}
          formatCurrency={formatCurrency}
          calcularTotalDetalles={calcularTotalDetalles}
        />
      )}

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
          confirmText="Sí, aprobar"
          cancelText="Cancelar"
        />
      )}

      {/* Modal de Input */}
      {inputModal && (
        <InputModal
          title={inputModal.title}
          message={inputModal.message}
          placeholder={inputModal.placeholder}
          onConfirm={inputModal.onConfirm}
          onCancel={inputModal.onCancel}
          confirmText="Rechazar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default Aprobacion;