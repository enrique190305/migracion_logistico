import React, { useState, useEffect } from 'react';
import './RegistroReserva.css';
import * as reservasAPI from '../../services/reservasAPI';

const RegistroReserva = () => {
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
      alert('Error al cargar las reservas: ' + (error.message || 'Error desconocido'));
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

  const handleNuevaReserva = () => {
    alert('📋 Nueva Reserva\n\nAquí se abrirá el formulario para registrar un nuevo tipo de reserva.');
  };

  const handleExportar = () => {
    alert('📊 Exportando datos...\n\nSe generará un archivo Excel con el listado de reservas.');
  };

  const handleEdit = (reserva) => {
    alert(`✏️ Editar Reserva\n\nEditando: ${reserva.tipo_reserva}\nTipo Reserva #: ${reserva.id_reserva}`);
  };

  const handleDelete = (reserva) => {
    if (window.confirm(`¿Está seguro de eliminar la reserva "${reserva.tipo_reserva}"?`)) {
      alert(`🗑️ Reserva eliminada: ${reserva.tipo_reserva}`);
    }
  };

  const handleView = (reserva) => {
    alert(`👁️ Detalles de la Reserva\n\nTipo Reserva #: ${reserva.id_reserva}\nNombre Tipo Reserva: ${reserva.tipo_reserva}\nEstado: ${reserva.estado}\nFecha Creación: ${reserva.fecha_creacion}`);
  };

  return (
    <div className="registro-reserva-container">
      {/* Mensaje de carga */}
      {loading && <div className="mensaje-info">⏳ Cargando datos...</div>}

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
            <h3>{estadisticas.total}</h3>
            <p>Total Reservas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <span>✅</span>
          </div>
          <div className="stat-info">
            <h3>{estadisticas.activas}</h3>
            <p>Activas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <span>❌</span>
          </div>
          <div className="stat-info">
            <h3>{estadisticas.inactivas}</h3>
            <p>Inactivas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <span>📊</span>
          </div>
          <div className="stat-info">
            <h3>{tiposUnicos.length}</h3>
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
              placeholder="ID o tipo de reserva..."
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
                      <span className={`estado-badge ${reserva.estado.toLowerCase()}`}>
                        {reserva.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>{reserva.fecha_creacion}</td>
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
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px' }}>
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