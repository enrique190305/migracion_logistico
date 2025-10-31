import React, { useState, useEffect } from 'react';
import './StockBodegas.css';
import { obtenerBodegas, obtenerReservasPorBodega } from '../../services/bodegasAPI';
import { obtenerStockPorBodega, obtenerStockPorReserva } from '../../services/stockAPI';

const StockBodegas = () => {
  // ============================================
  // ESTADOS
  // ============================================
  
  const [vistaActiva, setVistaActiva] = useState('bodega'); // 'bodega' o 'reserva'
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState('');
  
  // Catálogos
  const [bodegas, setBodegas] = useState([]);
  const [reservas, setReservas] = useState([]);
  
  // Datos de stock
  const [stockData, setStockData] = useState([]);
  const [resumen, setResumen] = useState({
    total_productos: 0,
    cantidad_total: 0
  });
  
  // Búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('descripcion'); // 'descripcion', 'stock', 'codigo'
  
  // Estados de control
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    cargarBodegas();
  }, []);

  useEffect(() => {
    if (bodegaSeleccionada && vistaActiva === 'bodega') {
      cargarStockBodega(bodegaSeleccionada);
    }
  }, [bodegaSeleccionada, vistaActiva]);

  useEffect(() => {
    if (bodegaSeleccionada) {
      cargarReservas(bodegaSeleccionada);
    } else {
      setReservas([]);
      setReservaSeleccionada('');
    }
  }, [bodegaSeleccionada]);

  useEffect(() => {
    if (reservaSeleccionada && vistaActiva === 'reserva') {
      cargarStockReserva(reservaSeleccionada);
    }
  }, [reservaSeleccionada, vistaActiva]);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  const cargarBodegas = async () => {
    try {
      const response = await obtenerBodegas();
      if (response.success) {
        setBodegas(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar bodegas:', error);
      mostrarMensaje('error', 'Error al cargar las bodegas');
    }
  };

  const cargarReservas = async (idBodega) => {
    try {
      const response = await obtenerReservasPorBodega(idBodega);
      if (response.success) {
        setReservas(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setReservas([]);
    }
  };

  const cargarStockBodega = async (idBodega) => {
    try {
      setCargando(true);
      const response = await obtenerStockPorBodega(idBodega);
      
      if (response.success) {
        setStockData(response.stock || []);
        setResumen({
          total_productos: response.total_productos || 0,
          cantidad_total: response.cantidad_total || 0
        });
        mostrarMensaje('success', `✅ Stock cargado: ${response.total_productos || 0} productos`);
      } else {
        setStockData([]);
        mostrarMensaje('warning', 'No hay stock en esta bodega');
      }
    } catch (error) {
      console.error('Error al cargar stock de bodega:', error);
      mostrarMensaje('error', 'Error al cargar el stock');
      setStockData([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarStockReserva = async (idReserva) => {
    try {
      setCargando(true);
      const response = await obtenerStockPorReserva(idReserva);
      
      if (response.success) {
        setStockData(response.stock || []);
        setResumen({
          total_productos: response.total_productos || 0,
          cantidad_total: response.cantidad_total || 0
        });
        mostrarMensaje('success', `✅ Stock cargado: ${response.total_productos || 0} productos`);
      } else {
        setStockData([]);
        mostrarMensaje('warning', 'No hay stock en esta reserva');
      }
    } catch (error) {
      console.error('Error al cargar stock de reserva:', error);
      mostrarMensaje('error', 'Error al cargar el stock');
      setStockData([]);
    } finally {
      setCargando(false);
    }
  };

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
  };

  const handleCambiarVista = (vista) => {
    setVistaActiva(vista);
    setStockData([]);
    setBusqueda('');
  };

  const handleLimpiar = () => {
    setBodegaSeleccionada('');
    setReservaSeleccionada('');
    setStockData([]);
    setBusqueda('');
    setResumen({ total_productos: 0, cantidad_total: 0 });
    mostrarMensaje('info', 'Filtros limpiados');
  };

  // Filtrar y ordenar productos
  const productosFiltrados = stockData
    .filter(item => {
      if (!busqueda) return true;
      const producto = item.producto || {};
      const searchLower = busqueda.toLowerCase();
      return (
        item.codigo_producto?.toLowerCase().includes(searchLower) ||
        producto.descripcion?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case 'descripcion':
          return (a.producto?.descripcion || '').localeCompare(b.producto?.descripcion || '');
        case 'stock':
          return (b.cantidad_disponible || 0) - (a.cantidad_disponible || 0);
        case 'codigo':
          return (a.codigo_producto || '').localeCompare(b.codigo_producto || '');
        default:
          return 0;
      }
    });

  const exportarExcel = () => {
    if (stockData.length === 0) {
      mostrarMensaje('warning', 'No hay datos para exportar');
      return;
    }

    // Crear CSV simple
    const headers = ['Código', 'Descripción', 'Unidad', 'Stock Disponible', 'Stock Reservado', 'Ubicación'];
    const rows = productosFiltrados.map(item => {
      const ubicacion = vistaActiva === 'bodega' 
        ? item.reserva?.nombre_reserva || ''
        : item.bodega?.nombre_bodega || '';
      
      return [
        item.codigo_producto,
        item.producto?.descripcion || '',
        item.producto?.unidad || '',
        item.cantidad_disponible || 0,
        item.cantidad_reservada || 0,
        ubicacion
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_${vistaActiva}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensaje('success', '✅ Archivo exportado correctamente');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="stock-bodegas-container">
      
      {/* Header */}
      <div className="stock-bodegas-header">
        <div className="stock-bodegas-title">
          <h2>📦 Stock de Bodegas</h2>
          <p className="stock-bodegas-subtitle">Consulta de inventario por bodega o reserva</p>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div className={`stock-mensaje stock-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Tabs de Vista */}
      <div className="stock-tabs">
        <button
          className={`stock-tab ${vistaActiva === 'bodega' ? 'active' : ''}`}
          onClick={() => handleCambiarVista('bodega')}
        >
          🏪 Por Bodega
        </button>
        <button
          className={`stock-tab ${vistaActiva === 'reserva' ? 'active' : ''}`}
          onClick={() => handleCambiarVista('reserva')}
        >
          📍 Por Reserva
        </button>
      </div>

      {/* Filtros */}
      <div className="stock-filtros-card">
        <div className="stock-filtros-row">
          
          {/* Bodega */}
          <div className="stock-filtro-group">
            <label className="stock-filtro-label">
              🏪 Bodega *
            </label>
            <select
              className="stock-filtro-select"
              value={bodegaSeleccionada}
              onChange={(e) => setBodegaSeleccionada(e.target.value)}
            >
              <option value="">-- Seleccione bodega --</option>
              {bodegas.map((bodega) => (
                <option key={bodega.id_bodega} value={bodega.id_bodega}>
                  {bodega.nombre_bodega}
                </option>
              ))}
            </select>
          </div>

          {/* Reserva (solo si vista es 'reserva') */}
          {vistaActiva === 'reserva' && (
            <div className="stock-filtro-group">
              <label className="stock-filtro-label">
                📍 Reserva *
              </label>
              <select
                className="stock-filtro-select"
                value={reservaSeleccionada}
                onChange={(e) => setReservaSeleccionada(e.target.value)}
                disabled={!bodegaSeleccionada}
              >
                <option value="">
                  {bodegaSeleccionada ? '-- Seleccione reserva --' : '-- Primero seleccione bodega --'}
                </option>
                {reservas.map((reserva) => (
                  <option key={reserva.id_reserva} value={reserva.id_reserva}>
                    {reserva.nombre_reserva}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Búsqueda */}
          <div className="stock-filtro-group">
            <label className="stock-filtro-label">
              🔍 Buscar Producto
            </label>
            <input
              type="text"
              className="stock-filtro-input"
              placeholder="Código o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Ordenamiento */}
          <div className="stock-filtro-group">
            <label className="stock-filtro-label">
              📊 Ordenar por
            </label>
            <select
              className="stock-filtro-select"
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
            >
              <option value="descripcion">Descripción</option>
              <option value="stock">Stock (Mayor a Menor)</option>
              <option value="codigo">Código</option>
            </select>
          </div>

          {/* Botones */}
          <div className="stock-filtro-buttons">
            <button
              className="stock-btn stock-btn-limpiar"
              onClick={handleLimpiar}
              title="Limpiar filtros"
            >
              🗑️ Limpiar
            </button>
            <button
              className="stock-btn stock-btn-exportar"
              onClick={exportarExcel}
              disabled={stockData.length === 0}
              title="Exportar a CSV"
            >
              📥 Exportar
            </button>
          </div>

        </div>
      </div>

      {/* Resumen */}
      {stockData.length > 0 && (
        <div className="stock-resumen">
          <div className="stock-resumen-item">
            <span className="stock-resumen-label">📦 Total Productos:</span>
            <span className="stock-resumen-valor">{resumen.total_productos}</span>
          </div>
          <div className="stock-resumen-item">
            <span className="stock-resumen-label">📊 Cantidad Total:</span>
            <span className="stock-resumen-valor">{parseFloat(resumen.cantidad_total || 0).toFixed(2)}</span>
          </div>
          <div className="stock-resumen-item">
            <span className="stock-resumen-label">🔍 Resultados Filtrados:</span>
            <span className="stock-resumen-valor">{productosFiltrados.length}</span>
          </div>
        </div>
      )}

      {/* Tabla de Stock */}
      <div className="stock-tabla-card">
        {cargando ? (
          <div className="stock-cargando">
            <div className="stock-spinner"></div>
            <p>Cargando stock...</p>
          </div>
        ) : stockData.length === 0 ? (
          <div className="stock-vacio">
            <p>📭 No hay stock disponible</p>
            <small>
              {vistaActiva === 'bodega' 
                ? 'Seleccione una bodega para ver el stock'
                : 'Seleccione una bodega y reserva para ver el stock'}
            </small>
          </div>
        ) : (
          <div className="stock-tabla-wrapper">
            <table className="stock-tabla">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  {vistaActiva === 'bodega' && <th>Reserva</th>}
                  <th>Stock Disponible</th>
                  <th>Stock Reservado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((item, index) => (
                  <tr key={index}>
                    <td className="stock-codigo">{item.codigo_producto}</td>
                    <td className="stock-descripcion">{item.producto?.descripcion || 'N/A'}</td>
                    <td className="stock-unidad">{item.producto?.unidad || 'N/A'}</td>
                    {vistaActiva === 'bodega' && (
                      <td className="stock-reserva">{item.reserva?.nombre_reserva || 'N/A'}</td>
                    )}
                    <td className="stock-cantidad stock-disponible">
                      {parseFloat(item.cantidad_disponible || 0).toFixed(2)}
                    </td>
                    <td className="stock-cantidad stock-reservado">
                      {parseFloat(item.cantidad_reservada || 0).toFixed(2)}
                    </td>
                    <td className="stock-cantidad stock-total">
                      {(parseFloat(item.cantidad_disponible || 0) + parseFloat(item.cantidad_reservada || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StockBodegas;
