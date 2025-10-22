import React, { useState } from 'react';
import './RegistroReserva.css';

const RegistroReserva = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Datos estáticos de reservas
  const reservasData = [
    {
      tipo_reserva_id: 1,
      nombre_tipo_reserva: 'ADMINISTRATIVO',
      estado: 'Activo',
      cedula_control: '1048847902',
      nombre_control: 'Ortiz Pérez Wilson Alejandro',
      fecha_control: '2021-06-25'
    },
    {
      tipo_reserva_id: 2,
      nombre_tipo_reserva: 'INTERNA',
      estado: 'Activo',
      cedula_control: '1048847902',
      nombre_control: 'Ortiz Pérez Wilson Alejandro',
      fecha_control: '2021-06-25'
    },
    {
      tipo_reserva_id: 3,
      nombre_tipo_reserva: 'EXTERNA',
      estado: 'Activo',
      cedula_control: '1048847902',
      nombre_control: 'Ortiz Pérez Wilson Alejandro',
      fecha_control: '2021-06-25'
    },
    {
      tipo_reserva_id: 4,
      nombre_tipo_reserva: 'COMERCIAL',
      estado: 'Activo',
      cedula_control: '1048847902',
      nombre_control: 'Ortiz Pérez Wilson Alejandro',
      fecha_control: '2021-06-25'
    },
    {
      tipo_reserva_id: 5,
      nombre_tipo_reserva: 'EQUIPOS USADOS Y EN DESUSO',
      estado: 'Activo',
      cedula_control: '43870910',
      nombre_control: 'PAJARES MENDOZA QUIMIDEZ',
      fecha_control: '2022-03-15'
    },
    {
      tipo_reserva_id: 6,
      nombre_tipo_reserva: 'PROYECTO SIGMA',
      estado: 'Activo',
      cedula_control: '48042206',
      nombre_control: 'CAMPOS TUESTA SIXTO',
      fecha_control: '2023-04-24'
    },
    {
      tipo_reserva_id: 7,
      nombre_tipo_reserva: 'OPERACIONES',
      estado: 'Activo',
      cedula_control: '1023456789',
      nombre_control: 'RODRIGUEZ MARTINEZ CARLOS',
      fecha_control: '2023-08-10'
    },
    {
      tipo_reserva_id: 8,
      nombre_tipo_reserva: 'MANTENIMIENTO',
      estado: 'Activo',
      cedula_control: '1034567890',
      nombre_control: 'FERNANDEZ LOPEZ ANA MARIA',
      fecha_control: '2023-09-15'
    },
    {
      tipo_reserva_id: 9,
      nombre_tipo_reserva: 'LOGISTICA',
      estado: 'Inactivo',
      cedula_control: '1045678901',
      nombre_control: 'TORRES SILVA PEDRO JOSE',
      fecha_control: '2022-12-20'
    },
    {
      tipo_reserva_id: 10,
      nombre_tipo_reserva: 'PRODUCCION',
      estado: 'Activo',
      cedula_control: '1056789012',
      nombre_control: 'GUTIERREZ RAMIREZ LUIS',
      fecha_control: '2024-01-05'
    },
    {
      tipo_reserva_id: 11,
      nombre_tipo_reserva: 'DESARROLLO',
      estado: 'Activo',
      cedula_control: '1067890123',
      nombre_control: 'SANCHEZ VARGAS ROBERTO',
      fecha_control: '2023-11-18'
    },
    {
      tipo_reserva_id: 12,
      nombre_tipo_reserva: 'CALIDAD',
      estado: 'Activo',
      cedula_control: '1078901234',
      nombre_control: 'MEDINA CASTRO JORGE',
      fecha_control: '2023-10-22'
    }
  ];

  // Filtrar datos
  const filteredData = reservasData.filter(reserva => {
    const matchSearch = reserva.nombre_tipo_reserva.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       reserva.tipo_reserva_id.toString().includes(searchTerm) ||
                       reserva.nombre_control.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       reserva.cedula_control.includes(searchTerm);
    const matchEstado = filtroEstado === 'todos' || reserva.estado === filtroEstado;
    const matchTipo = filtroTipo === 'todos' || reserva.nombre_tipo_reserva === filtroTipo;
    
    return matchSearch && matchEstado && matchTipo;
  });

  // Calcular estadísticas
  const totalReservas = reservasData.length;
  const reservasActivas = reservasData.filter(r => r.estado === 'Activo').length;
  const reservasInactivas = reservasData.filter(r => r.estado === 'Inactivo').length;
  const tiposUnicos = [...new Set(reservasData.map(r => r.nombre_tipo_reserva))].length;

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNuevaReserva = () => {
    alert('📋 Nueva Reserva\n\nAquí se abrirá el formulario para registrar un nuevo tipo de reserva.');
  };

  const handleExportar = () => {
    alert('📊 Exportando datos...\n\nSe generará un archivo Excel con el listado de reservas.');
  };

  const handleEdit = (reserva) => {
    alert(`✏️ Editar Reserva\n\nEditando: ${reserva.nombre_tipo_reserva}\nTipo Reserva #: ${reserva.tipo_reserva_id}`);
  };

  const handleDelete = (reserva) => {
    if (window.confirm(`¿Está seguro de eliminar la reserva "${reserva.nombre_tipo_reserva}"?`)) {
      alert(`🗑️ Reserva eliminada: ${reserva.nombre_tipo_reserva}`);
    }
  };

  const handleView = (reserva) => {
    alert(`👁️ Detalles de la Reserva\n\nTipo Reserva #: ${reserva.tipo_reserva_id}\nNombre Tipo Reserva: ${reserva.nombre_tipo_reserva}\nEstado: ${reserva.estado}\nCédula Control: ${reserva.cedula_control}\nNombre Control: ${reserva.nombre_control}\nFecha Control: ${reserva.fecha_control}`);
  };

  return (
    <div className="registro-reserva-container">
      {/* Header */}
      <div className="registro-reserva-header">
        <div className="header-title">
          <span className="header-icon">📋</span>
          <div>
            <h1>Registro de Reserva</h1>
            <p>Gestión de tipos de reserva</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleNuevaReserva}>
            <span>➕</span> Nueva Reserva
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
            <span>📋</span>
          </div>
          <div className="stat-info">
            <h3>{totalReservas}</h3>
            <p>Total Reservas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <span>✅</span>
          </div>
          <div className="stat-info">
            <h3>{reservasActivas}</h3>
            <p>Activas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <span>❌</span>
          </div>
          <div className="stat-info">
            <h3>{reservasInactivas}</h3>
            <p>Inactivas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <span>📊</span>
          </div>
          <div className="stat-info">
            <h3>{tiposUnicos}</h3>
            <p>Tipos Únicos</p>
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
              placeholder="Tipo, cédula o control..."
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
            <label>Tipo de Reserva</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="todos">Todos los tipos</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
              <option value="INTERNA">Interna</option>
              <option value="EXTERNA">Externa</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="EQUIPOS USADOS Y EN DESUSO">Equipos Usados y en Desuso</option>
              <option value="PROYECTO SIGMA">Proyecto Sigma</option>
              <option value="OPERACIONES">Operaciones</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="LOGISTICA">Logística</option>
              <option value="PRODUCCION">Producción</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-section">
        <div className="tabla-header">
          <h2>📋 Listado de Reservas ({filteredData.length})</h2>
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
          <table className="reserva-table">
            <thead>
              <tr>
                <th>Tipo Reserva #</th>
                <th>Nombre Tipo Reserva</th>
                <th>Estado</th>
                <th>Cédula Control</th>
                <th>Nombre Control</th>
                <th>Fecha Control</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((reserva) => (
                  <tr key={reserva.tipo_reserva_id}>
                    <td><strong>{reserva.tipo_reserva_id}</strong></td>
                    <td><strong>{reserva.nombre_tipo_reserva}</strong></td>
                    <td>
                      <span className={`estado-badge ${reserva.estado.toLowerCase()}`}>
                        {reserva.estado === 'Activo' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>{reserva.cedula_control}</td>
                    <td>{reserva.nombre_control}</td>
                    <td>{reserva.fecha_control}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon btn-view" onClick={() => handleView(reserva)} title="Ver detalles">
                          👁️
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(reserva)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(reserva)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
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

export default RegistroReserva;