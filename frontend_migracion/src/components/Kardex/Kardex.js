import React, { useState, useEffect } from 'react';
import './Kardex.css';

const Kardex = () => {
  // Estados
  const [activeTab, setActiveTab] = useState('inventario'); // 'inventario' o 'historial'
  const [searchInventario, setSearchInventario] = useState('');
  const [searchHistorial, setSearchHistorial] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [statusMessage, setStatusMessage] = useState('');

  // Datos estáticos de inventario
  const inventarioData = [
    {
      id: 1,
      proyecto: 'COMPRA INSUMOS ESPEC...',
      codigo: 'SUG-0016',
      descripcion: 'ADAPTADOR RACORD 2" R/MACHO',
      unidad: 'UND',
      cantidad: 5,
      precioUnitario: 145.00,
      precioTotal: 725.00,
      moneda: 'PEN'
    },
    {
      id: 2,
      proyecto: 'CONSTRUCCIÓN PLAZA',
      codigo: 'CEM-0021',
      descripcion: 'CEMENTO PORTLAND TIPO I X 42.5KG',
      unidad: 'BOLSA',
      cantidad: 150,
      precioUnitario: 25.50,
      precioTotal: 3825.00,
      moneda: 'PEN'
    },
    {
      id: 3,
      proyecto: 'SERVICIO PLOMERÍA',
      codigo: 'TUB-0045',
      descripcion: 'TUBERÍA PVC 2" X 5M',
      unidad: 'UND',
      cantidad: 8,
      precioUnitario: 32.00,
      precioTotal: 256.00,
      moneda: 'PEN'
    }
  ];

  // Datos estáticos de historial
  const historialData = [
    {
      id: 1,
      fecha: '13/09/2025',
      tipo: 'SALIDA',
      codigo: 'SUM-0032',
      descripcion: 'ANCLAJE ...',
      unidad: 'UND',
      cantidad: 5.00,
      proyecto: 'CONSTRU...',
      documento: 'NS-004',
      observaciones: 'Salida de ...'
    },
    {
      id: 2,
      fecha: '13/09/2025',
      tipo: 'SALIDA',
      codigo: 'SUM-0032',
      descripcion: 'ANCLAJE ...',
      unidad: 'UND',
      cantidad: 5.00,
      proyecto: 'SERVICIO ...',
      documento: 'NT-004',
      observaciones: 'Traslado a...'
    }
  ];

  // Filtrar inventario
  const filteredInventario = inventarioData.filter(item => {
    const term = searchInventario.toLowerCase();
    return (
      item.proyecto.toLowerCase().includes(term) ||
      item.codigo.toLowerCase().includes(term) ||
      item.descripcion.toLowerCase().includes(term)
    );
  });

  // Filtrar historial
  const filteredHistorial = historialData.filter(item => {
    const term = searchHistorial.toLowerCase();
    return (
      item.codigo.toLowerCase().includes(term) ||
      item.descripcion.toLowerCase().includes(term) ||
      item.documento.toLowerCase().includes(term) ||
      item.proyecto.toLowerCase().includes(term)
    );
  });

  // Formatear moneda
  const formatCurrency = (value, moneda) => {
    const symbol = moneda === 'USD' ? '$' : 'S/';
    return `${symbol} ${value.toFixed(2)}`;
  };

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFechaInicio(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFechaFin(new Date().toISOString().split('T')[0]);
    showTemporaryMessage('✅ Filtros limpiados correctamente');
  };

  // Mensaje temporal
  const showTemporaryMessage = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Estadísticas
  const statsInventario = {
    totalProductos: filteredInventario.length,
    valorTotal: filteredInventario.reduce((sum, item) => sum + item.precioTotal, 0),
    productoMayorValor: filteredInventario.length > 0 ? filteredInventario[0].descripcion : 'N/A'
  };

  const statsHistorial = {
    totalMovimientos: filteredHistorial.length,
    ingresos: filteredHistorial.filter(item => item.tipo === 'INGRESO').length,
    salidas: filteredHistorial.filter(item => item.tipo === 'SALIDA').length
  };

  return (
    <div className="kardex-container">
      {/* Header */}
      <div className="kardex-header">
        <div className="header-icon">
          <span className="icon-kardex">📊</span>
        </div>
        <div className="header-content">
          <h1 className="header-title">KARDEX - CONTROL DE INVENTARIO</h1>
          <p className="header-subtitle">Consulte inventario actual y movimientos de productos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="kardex-tabs">
        <button 
          className={`tab-button ${activeTab === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventario')}
        >
          <span className="tab-icon">📦</span>
          INVENTARIO ACTUAL
        </button>
        <button 
          className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          <span className="tab-icon">📜</span>
          HISTORIAL DE MOVIMIENTOS
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Inventario Actual */}
        {activeTab === 'inventario' && (
          <div className="inventario-section">
            {/* Stats Panel */}
            <div className="stats-panel">
              <p className="stats-text">
                📊 {statsInventario.totalProductos} productos en stock | 
                💰 Valor total: {formatCurrency(statsInventario.valorTotal, 'PEN')} | 
                📈 Productos con mayor valor: {statsInventario.productoMayorValor}
              </p>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text"
                  placeholder="Código / Descripción / Doc / Proyecto"
                  value={searchInventario}
                  onChange={(e) => setSearchInventario(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="table-wrapper">
              <div className="table-container">
                <table className="kardex-table">
                  <thead>
                    <tr>
                      <th>Proyecto</th>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Unidad</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Precio Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventario.map((item) => (
                      <tr key={item.id} className={item.cantidad < 10 ? 'row-warning' : ''}>
                        <td>{item.proyecto}</td>
                        <td>{item.codigo}</td>
                        <td>{item.descripcion}</td>
                        <td>{item.unidad}</td>
                        <td className={`cantidad ${item.cantidad < 10 ? 'low-stock' : item.cantidad > 100 ? 'high-stock' : ''}`}>
                          {item.cantidad}
                        </td>
                        <td className="text-right">{formatCurrency(item.precioUnitario, item.moneda)}</td>
                        <td className="text-right">{formatCurrency(item.precioTotal, item.moneda)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="export-buttons">
              <button className="export-btn excel-btn">
                <span className="btn-icon">📊</span>
                Excel
              </button>
              <button className="export-btn pdf-btn">
                <span className="btn-icon">📄</span>
                PDF
              </button>
              <button className="export-btn csv-btn">
                <span className="btn-icon">📋</span>
                CSV
              </button>
            </div>
          </div>
        )}

        {/* Historial de Movimientos */}
        {activeTab === 'historial' && (
          <div className="historial-section">
            {/* Stats Panel */}
            <div className="stats-panel">
              <p className="stats-text">
                📈 {statsHistorial.totalMovimientos} movimientos | 
                ⬆️ {statsHistorial.ingresos} ingresos | 
                ⬇️ {statsHistorial.salidas} salidas | 
                📅 Período: {new Date(fechaInicio).toLocaleDateString()} - {new Date(fechaFin).toLocaleDateString()}
              </p>
            </div>

            {/* Filters */}
            <div className="filters-container">
              <div className="filter-group">
                <label className="filter-label">
                  <span className="label-icon">📅</span>
                  FECHA INICIO
                </label>
                <input 
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <span className="label-icon">📅</span>
                  FECHA FIN
                </label>
                <input 
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="filter-actions">
                <button className="filter-btn primary-btn">
                  <span className="btn-icon">🔍</span>
                  FILTRAR
                </button>
                <button className="filter-btn secondary-btn" onClick={handleLimpiarFiltros}>
                  <span className="btn-icon">🧹</span>
                  LIMPIAR
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text"
                  placeholder="Código / Descripción / Doc / Proyecto"
                  value={searchHistorial}
                  onChange={(e) => setSearchHistorial(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="table-wrapper">
              <div className="table-container">
                <table className="kardex-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Unidad</th>
                      <th>Cantidad</th>
                      <th>Proyecto</th>
                      <th>Documento</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistorial.map((item) => (
                      <tr key={item.id}>
                        <td>{item.fecha}</td>
                        <td>
                          <span className={`tipo-badge ${item.tipo.toLowerCase()}`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td>{item.codigo}</td>
                        <td>{item.descripcion}</td>
                        <td>{item.unidad}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.proyecto}</td>
                        <td>{item.documento}</td>
                        <td>{item.observaciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="export-buttons">
              <button className="export-btn excel-btn">
                <span className="btn-icon">📊</span>
                Excel
              </button>
              <button className="export-btn pdf-btn">
                <span className="btn-icon">📄</span>
                PDF
              </button>
              <button className="export-btn csv-btn">
                <span className="btn-icon">📋</span>
                CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="kardex-footer">
        <div className="footer-stats">
          <span>📦 1 productos en stock</span>
          <span>💰 Valor total: S/ 483.33</span>
          <span>📈 Productos con mayor valor: ADAPTADOR RACORD 2" R/MACHO</span>
          <span>🟢 Sistema operativo</span>
        </div>
        {statusMessage && (
          <div className="status-message success">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kardex;