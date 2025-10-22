import React, { useState, useEffect } from 'react';
import './RegistroBodega.css';
import * as bodegasAPI from '../../services/bodegasAPI';

const RegistroBodega = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para datos del backend
  const [bodegas, setBodegas] = useState([]);
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
      const [bodegasData, stats] = await Promise.all([
        bodegasAPI.obtenerBodegas(),
        bodegasAPI.obtenerEstadisticas()
      ]);
      
      setBodegas(bodegasData);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar las bodegas: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos
  const filteredData = bodegas.filter(bodega => {
    const matchSearch = bodega.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       bodega.id_bodega.toString().includes(searchTerm) ||
                       bodega.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       bodega.empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || bodega.estado === filtroEstado.toUpperCase();
    const matchEmpresa = filtroEmpresa === 'todos' || bodega.empresa.razon_social === filtroEmpresa;
    
    return matchSearch && matchEstado && matchEmpresa;
  });

  // Obtener lista única de empresas para el filtro
  const empresasUnicas = [...new Set(bodegas.map(b => b.empresa.razon_social))];

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
    alert(`✏️ Editar Bodega\n\nEditando: ${bodega.nombre}\nBodega No.: ${bodega.id_bodega}\nUbicación: ${bodega.ubicacion}\nEmpresa: ${bodega.empresa.razon_social}`);
  };

  const handleDelete = (bodega) => {
    if (window.confirm(`¿Está seguro de eliminar la bodega "${bodega.nombre}"?`)) {
      alert(`🗑️ Bodega eliminada: ${bodega.nombre}`);
    }
  };

  const handleView = (bodega) => {
    alert(`👁️ Detalles de la Bodega\n\nBodega No.: ${bodega.id_bodega}\nNombre: ${bodega.nombre}\nUbicación: ${bodega.ubicacion}\nEmpresa: ${bodega.empresa.razon_social}\nEstado: ${bodega.estado}\nFecha Creación: ${bodega.fecha_creacion}`);
  };

  return (
    <div className="registro-bodega-container">
      {/* Mensaje de carga */}
      {loading && <div className="mensaje-info">⏳ Cargando datos...</div>}

      {/* Header */}
      <div className="registro-bodega-header">
        <div className="header-title">
          <span className="header-icon">🏢</span>
          <div>
            <h1>Registro de Bodega</h1>
            <p>Gestión y control de bodegas por empresa</p>
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
            <h3>{estadisticas.total}</h3>
            <p>Total Bodegas</p>
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
            <span>🏢</span>
          </div>
          <div className="stat-info">
            <h3>{empresasUnicas.length}</h3>
            <p>Empresas</p>
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
              placeholder="Bodega, ubicación o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Empresa</label>
            <select value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
              <option value="todos">Todas las empresas</option>
              {empresasUnicas.map((empresa, index) => (
                <option key={index} value={empresa}>{empresa}</option>
              ))}
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
                <th>ID</th>
                <th>Nombre Bodega</th>
                <th>Ubicación</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((bodega) => (
                  <tr key={bodega.id_bodega}>
                    <td><strong>{bodega.id_bodega}</strong></td>
                    <td><strong>{bodega.nombre}</strong></td>
                    <td>{bodega.ubicacion}</td>
                    <td>{bodega.empresa.razon_social}</td>
                    <td>
                      <span className={`estado-badge ${bodega.estado.toLowerCase()}`}>
                        {bodega.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>{bodega.fecha_creacion}</td>
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
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