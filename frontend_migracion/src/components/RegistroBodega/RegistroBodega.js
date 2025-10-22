import React, { useState } from 'react';
import './RegistroBodega.css';

const RegistroBodega = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCiudad, setFiltroCiudad] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Datos estáticos de bodegas
  const bodegasData = [
    {
      bodega_no: 1,
      bodega: 'LIMA',
      ciudad: 'LIMA',
      nombre_regional: 'LIMA',
      estado: 'Activo',
      nombre_control: 'Ortiz Pérez Wilson Alejandro',
      fecha_control: '2021-06-22'
    },
    {
      bodega_no: 2,
      bodega: 'PIURA',
      ciudad: 'PIURA',
      nombre_regional: 'PIURA',
      estado: 'Activo',
      nombre_control: 'CAHUANA PRADO ANGEL CESAR',
      fecha_control: '2024-01-26'
    },
    {
      bodega_no: 3,
      bodega: 'AREQUIPA',
      ciudad: 'AREQUIPA',
      nombre_regional: 'AREQUIPA',
      estado: 'Activo',
      nombre_control: 'RODRIGUEZ TORRES MARIA',
      fecha_control: '2023-05-15'
    },
    {
      bodega_no: 4,
      bodega: 'CUSCO',
      ciudad: 'CUSCO',
      nombre_regional: 'CUSCO',
      estado: 'Activo',
      nombre_control: 'QUISPE FLORES JUAN CARLOS',
      fecha_control: '2023-08-10'
    },
    {
      bodega_no: 5,
      bodega: 'TRUJILLO',
      ciudad: 'TRUJILLO',
      nombre_regional: 'LA LIBERTAD',
      estado: 'Activo',
      nombre_control: 'MENDEZ CASTRO ROSA ELENA',
      fecha_control: '2023-11-22'
    },
    {
      bodega_no: 6,
      bodega: 'CHICLAYO',
      ciudad: 'CHICLAYO',
      nombre_regional: 'LAMBAYEQUE',
      estado: 'Inactivo',
      nombre_control: 'SOTO REYES PATRICIA',
      fecha_control: '2022-09-18'
    },
    {
      bodega_no: 7,
      bodega: 'HUANCAYO',
      ciudad: 'HUANCAYO',
      nombre_regional: 'JUNIN',
      estado: 'Activo',
      nombre_control: 'VEGA TORRES MIGUEL ANGEL',
      fecha_control: '2023-12-05'
    },
    {
      bodega_no: 8,
      bodega: 'ICA',
      ciudad: 'ICA',
      nombre_regional: 'ICA',
      estado: 'Activo',
      nombre_control: 'GOMEZ SILVA CARMEN LUCIA',
      fecha_control: '2024-02-14'
    },
    {
      bodega_no: 9,
      bodega: 'TACNA',
      ciudad: 'TACNA',
      nombre_regional: 'TACNA',
      estado: 'Activo',
      nombre_control: 'PAREDES RAMOS JORGE LUIS',
      fecha_control: '2023-07-30'
    },
    {
      bodega_no: 10,
      bodega: 'PUNO',
      ciudad: 'PUNO',
      nombre_regional: 'PUNO',
      estado: 'Inactivo',
      nombre_control: 'MAMANI CONDORI ALBERTO',
      fecha_control: '2022-12-20'
    },
    {
      bodega_no: 11,
      bodega: 'AYACUCHO',
      ciudad: 'AYACUCHO',
      nombre_regional: 'AYACUCHO',
      estado: 'Activo',
      nombre_control: 'HUAMAN QUISPE SOFIA',
      fecha_control: '2024-01-08'
    },
    {
      bodega_no: 12,
      bodega: 'CAJAMARCA',
      ciudad: 'CAJAMARCA',
      nombre_regional: 'CAJAMARCA',
      estado: 'Activo',
      nombre_control: 'VASQUEZ DIAZ PEDRO JOSE',
      fecha_control: '2023-10-12'
    }
  ];

  // Filtrar datos
  const filteredData = bodegasData.filter(bodega => {
    const matchSearch = bodega.bodega.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       bodega.bodega_no.toString().includes(searchTerm) ||
                       bodega.nombre_control.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || bodega.estado === filtroEstado;
    const matchCiudad = filtroCiudad === 'todos' || bodega.ciudad === filtroCiudad;
    
    return matchSearch && matchEstado && matchCiudad;
  });

  // Calcular estadísticas
  const totalBodegas = bodegasData.length;
  const bodegasActivas = bodegasData.filter(b => b.estado === 'Activo').length;
  const bodegasInactivas = bodegasData.filter(b => b.estado === 'Inactivo').length;
  const regionalesUnicas = [...new Set(bodegasData.map(b => b.nombre_regional))].length;

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNuevaBodega = () => {
    alert('🏢 Nueva Bodega\n\nAquí se abrirá el formulario para registrar una nueva bodega.');
  };

  const handleExportar = () => {
    alert('📊 Exportando datos...\n\nSe generará un archivo Excel con el listado de bodegas.');
  };

  const handleEdit = (bodega) => {
    alert(`✏️ Editar Bodega\n\nEditando: ${bodega.bodega}\nBodega No.: ${bodega.bodega_no}\nCiudad: ${bodega.ciudad}`);
  };

  const handleDelete = (bodega) => {
    if (window.confirm(`¿Está seguro de eliminar la bodega "${bodega.bodega}"?`)) {
      alert(`🗑️ Bodega eliminada: ${bodega.bodega}`);
    }
  };

  const handleView = (bodega) => {
    alert(`👁️ Detalles de la Bodega\n\nBodega No.: ${bodega.bodega_no}\nBodega: ${bodega.bodega}\nCiudad: ${bodega.ciudad}\nNombre de Regional: ${bodega.nombre_regional}\nEstado: ${bodega.estado}\nNombre Control: ${bodega.nombre_control}\nFecha Control: ${bodega.fecha_control}`);
  };

  return (
    <div className="registro-bodega-container">
      {/* Header */}
      <div className="registro-bodega-header">
        <div className="header-title">
          <span className="header-icon">🏢</span>
          <div>
            <h1>Registro de Bodega</h1>
            <p>Gestión y control de bodegas por regional</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleNuevaBodega}>
            <span>➕</span> Nueva Bodega
          </button>
          <button className="btn btn-secondary" onClick={handleExportar}>
            <span>📊</span> Exportar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <span>🏢</span>
          </div>
          <div className="stat-info">
            <h3>{totalBodegas}</h3>
            <p>Total Bodegas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <span>✅</span>
          </div>
          <div className="stat-info">
            <h3>{bodegasActivas}</h3>
            <p>Activas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <span>❌</span>
          </div>
          <div className="stat-info">
            <h3>{bodegasInactivas}</h3>
            <p>Inactivas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <span>📍</span>
          </div>
          <div className="stat-info">
            <h3>{regionalesUnicas}</h3>
            <p>Regionales</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h2>🔍 Filtros de Búsqueda</h2>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Bodega, número o control..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Ciudad</label>
            <select value={filtroCiudad} onChange={(e) => setFiltroCiudad(e.target.value)}>
              <option value="todos">Todas las ciudades</option>
              <option value="LIMA">Lima</option>
              <option value="PIURA">Piura</option>
              <option value="AREQUIPA">Arequipa</option>
              <option value="CUSCO">Cusco</option>
              <option value="TRUJILLO">Trujillo</option>
              <option value="CHICLAYO">Chiclayo</option>
              <option value="HUANCAYO">Huancayo</option>
              <option value="ICA">Ica</option>
              <option value="TACNA">Tacna</option>
              <option value="PUNO">Puno</option>
              <option value="AYACUCHO">Ayacucho</option>
              <option value="CAJAMARCA">Cajamarca</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-section">
        <div className="tabla-header">
          <h2>🏢 Listado de Bodegas ({filteredData.length})</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Búsqueda rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="bodega-table">
            <thead>
              <tr>
                <th>Bodega No.</th>
                <th>Bodega</th>
                <th>Ciudad</th>
                <th>Nombre de Regional</th>
                <th>Estado</th>
                <th>Nombre Control</th>
                <th>Fecha Control</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((bodega) => (
                  <tr key={bodega.bodega_no}>
                    <td><strong>{bodega.bodega_no}</strong></td>
                    <td><strong>{bodega.bodega}</strong></td>
                    <td>{bodega.ciudad}</td>
                    <td>{bodega.nombre_regional}</td>
                    <td>
                      <span className={`estado-badge ${bodega.estado.toLowerCase()}`}>
                        {bodega.estado === 'Activo' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>{bodega.nombre_control}</td>
                    <td>{bodega.fecha_control}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon btn-view" onClick={() => handleView(bodega)} title="Ver detalles">
                          👁️
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(bodega)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(bodega)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🏢</div>
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
          <div className="pagination">
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
    </div>
  );
};

export default RegistroBodega;