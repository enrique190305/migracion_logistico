import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Aprobacion.css';

// ✅ CAMBIAR de 5000 a 8000
const API_BASE_URL = 'http://localhost:8000/api';

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

  const token = localStorage.getItem('token');

  // Cargar órdenes de compra
  const fetchOrdenesCompra = async () => {
    try {
      console.log('🔍 Cargando órdenes de compra...');
      const response = await axios.get(`${API_BASE_URL}/aprobacion/ordenes-compra`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      const response = await axios.get(`${API_BASE_URL}/aprobacion/ordenes-servicio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
        ? `${API_BASE_URL}/aprobacion/ordenes-compra/${id}/detalles`
        : `${API_BASE_URL}/aprobacion/ordenes-servicio/${id}/detalles`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

    const confirmacion = window.confirm('¿Está seguro que desea aprobar esta orden?');
    if (!confirmacion) return;

    try {
      const id = activeTab === 'compra' ? selectedOrden.id_oc : selectedOrden.id_os;
      const endpoint = activeTab === 'compra'
        ? `${API_BASE_URL}/aprobacion/ordenes-compra/${id}/estado`
        : `${API_BASE_URL}/aprobacion/ordenes-servicio/${id}/estado`;
      
      console.log('🔄 Aprobando orden:', endpoint);
      
      await axios.put(
        endpoint,
        { estado: 'APROBADO' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Orden aprobada correctamente');
      setShowModal(false);
      
      if (activeTab === 'compra') {
        await fetchOrdenesCompra();
      } else {
        await fetchOrdenesServicio();
      }
    } catch (err) {
      console.error('❌ Error al aprobar orden:', err.response || err);
      alert('❌ Error al aprobar la orden: ' + (err.response?.data?.message || err.message));
    }
  };

  // Rechazar orden
  const rechazarOrden = async () => {
    if (!selectedOrden) return;

    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo || motivo.trim() === '') {
      alert('Debe ingresar un motivo para rechazar la orden');
      return;
    }

    try {
      const id = activeTab === 'compra' ? selectedOrden.id_oc : selectedOrden.id_os;
      const endpoint = activeTab === 'compra'
        ? `${API_BASE_URL}/aprobacion/ordenes-compra/${id}/estado`
        : `${API_BASE_URL}/aprobacion/ordenes-servicio/${id}/estado`;
      
      console.log('🔄 Rechazando orden:', endpoint);
      
      await axios.put(
        endpoint,
        { 
          estado: 'RECHAZADO',
          observaciones: motivo 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Orden rechazada correctamente');
      setShowModal(false);
      
      if (activeTab === 'compra') {
        await fetchOrdenesCompra();
      } else {
        await fetchOrdenesServicio();
      }
    } catch (err) {
      console.error('❌ Error al rechazar orden:', err.response || err);
      alert('❌ Error al rechazar la orden: ' + (err.response?.data?.message || err.message));
    }
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">📊</span>
                <div>
                  <h2>Detalle de la Orden: {activeTab === 'compra' ? selectedOrden.codigo_oc : selectedOrden.codigo_os} - {activeTab === 'compra' ? 'OC' : 'OS'}</h2>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {loadingDetalles ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Cargando detalles de la orden...</p>
                </div>
              ) : detallesOrden.length > 0 ? (
                <div className="detalle-items">
                  <table className="detalle-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Unidad</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallesOrden.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.codigo_producto || item.codigo_servicio}</td>
                          <td>{item.descripcion}</td>
                          <td>{item.unidad}</td>
                          <td>{item.cantidad}</td>
                          <td>{formatCurrency(item.precio_unitario, selectedOrden.moneda)}</td>
                          <td>{formatCurrency(item.subtotal, selectedOrden.moneda)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="modal-loading">
                  <p>No hay detalles disponibles para esta orden</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <h3 className="actions-title">
                <span className="actions-icon">⚡</span>
                Acciones de Verificación
              </h3>
              <div className="action-buttons">
                <button className="btn-confirmar" onClick={aprobarOrden}>
                  ✅ Confirmar/Aprobar
                </button>
                <button className="btn-rechazar" onClick={rechazarOrden}>
                  ✕ Rechazar
                </button>
              </div>
            </div>

            <div className="modal-footer-info">
              <span className="footer-icon">📊</span>
              Sistema de verificación activo | Órdenes cargadas: {ordenesFiltradas.length} | 
              Última actualización: {new Date().toLocaleString('es-PE')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprobacion;