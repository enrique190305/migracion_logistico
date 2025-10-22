import React, { useState } from 'react';
import './RegistroProductos.css';

const RegistroProductos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroUnidad, setFiltroUnidad] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const itemsPerPage = 10;

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    tipo_producto: '',
    descripcion: '',
    codigo_generado: '',
    unidad_medida: '',
    observaciones: ''
  });

  // Datos estáticos de productos
  const productosData = [
    {
      id: 1,
      tipo_producto: 'Herramientas',
      descripcion: 'Taladro Percutor 800W',
      codigo_generado: 'PROD-001-2024',
      unidad_medida: 'Unidad',
      observaciones: 'Incluye maletín y accesorios'
    },
    {
      id: 2,
      tipo_producto: 'Materiales',
      descripcion: 'Cemento Portland Tipo I',
      codigo_generado: 'PROD-002-2024',
      unidad_medida: 'Bolsa',
      observaciones: 'Bolsa de 42.5 kg'
    },
    {
      id: 3,
      tipo_producto: 'Equipos',
      descripcion: 'Laptop HP Core i7 16GB RAM',
      codigo_generado: 'PROD-003-2024',
      unidad_medida: 'Unidad',
      observaciones: 'Incluye licencia Windows 11'
    },
    {
      id: 4,
      tipo_producto: 'Herramientas',
      descripcion: 'Sierra Circular 1400W',
      codigo_generado: 'PROD-004-2024',
      unidad_medida: 'Unidad',
      observaciones: 'Disco de corte incluido'
    },
    {
      id: 5,
      tipo_producto: 'Materiales',
      descripcion: 'Varilla de Construcción 1/2"',
      codigo_generado: 'PROD-005-2024',
      unidad_medida: 'Metro',
      observaciones: 'Longitud estándar 9 metros'
    },
    {
      id: 6,
      tipo_producto: 'Suministros',
      descripcion: 'Resma Papel Bond A4',
      codigo_generado: 'PROD-006-2024',
      unidad_medida: 'Resma',
      observaciones: '500 hojas por resma'
    },
    {
      id: 7,
      tipo_producto: 'Equipos',
      descripcion: 'Impresora Multifuncional Láser',
      codigo_generado: 'PROD-007-2024',
      unidad_medida: 'Unidad',
      observaciones: 'Imprime, escanea y copia'
    },
    {
      id: 8,
      tipo_producto: 'Herramientas',
      descripcion: 'Juego de Llaves Mixtas 12 Pzs',
      codigo_generado: 'PROD-008-2024',
      unidad_medida: 'Juego',
      observaciones: 'Tamaños de 8mm a 19mm'
    },
    {
      id: 9,
      tipo_producto: 'Materiales',
      descripcion: 'Pintura Látex Blanco 5 Galones',
      codigo_generado: 'PROD-009-2024',
      unidad_medida: 'Galón',
      observaciones: 'Rendimiento 40 m²/galón'
    },
    {
      id: 10,
      tipo_producto: 'Suministros',
      descripcion: 'Tóner HP LaserJet Negro',
      codigo_generado: 'PROD-010-2024',
      unidad_medida: 'Unidad',
      observaciones: 'Compatible con serie P1102'
    },
    {
      id: 11,
      tipo_producto: 'Equipos',
      descripcion: 'Proyector Multimedia 3000 Lúmenes',
      codigo_generado: 'PROD-011-2024',
      unidad_medida: 'Unidad',
      observaciones: 'Resolución Full HD'
    },
    {
      id: 12,
      tipo_producto: 'Herramientas',
      descripcion: 'Amoladora Angular 4 1/2"',
      codigo_generado: 'PROD-012-2024',
      unidad_medida: 'Unidad',
      observaciones: '900W - Incluye disco de corte'
    }
  ];

  // Filtrar datos
  const filteredData = productosData.filter(producto => {
    const matchSearch = producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.codigo_generado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.tipo_producto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || producto.tipo_producto === filtroTipo;
    const matchUnidad = filtroUnidad === 'todos' || producto.unidad_medida === filtroUnidad;
    
    return matchSearch && matchTipo && matchUnidad;
  });

  // Calcular estadísticas
  const totalProductos = productosData.length;
  const tiposUnicos = [...new Set(productosData.map(p => p.tipo_producto))].length;
  const unidadesUnicas = [...new Set(productosData.map(p => p.unidad_medida))].length;

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleRegistrar = () => {
    if (!formulario.tipo_producto || !formulario.descripcion) {
      alert('⚠️ Por favor complete los campos obligatorios (Tipo de Producto y Descripción)');
      return;
    }

    const codigo = formulario.codigo_generado || `PROD-${String(productosData.length + 1).padStart(3, '0')}-2024`;
    
    alert(`✅ Producto Registrado\n\nTipo: ${formulario.tipo_producto}\nDescripción: ${formulario.descripcion}\nCódigo: ${codigo}\nUnidad: ${formulario.unidad_medida || 'No especificada'}\nObservaciones: ${formulario.observaciones || 'Sin observaciones'}`);
    
    handleLimpiar();
    setMostrarModal(false);
  };

  const handleLimpiar = () => {
    setFormulario({
      tipo_producto: '',
      descripcion: '',
      codigo_generado: '',
      unidad_medida: '',
      observaciones: ''
    });
  };

  const handleNuevoProducto = () => {
    handleLimpiar();
    setMostrarModal(true);
  };

  const handleExportar = () => {
    alert('📊 Exportando datos...\n\nSe generará un archivo Excel con el listado de productos.');
  };

  const handleEdit = (producto) => {
    setFormulario({
      tipo_producto: producto.tipo_producto,
      descripcion: producto.descripcion,
      codigo_generado: producto.codigo_generado,
      unidad_medida: producto.unidad_medida,
      observaciones: producto.observaciones
    });
    setMostrarModal(true);
  };

  const handleDelete = (producto) => {
    if (window.confirm(`¿Está seguro de eliminar el producto "${producto.descripcion}"?`)) {
      alert(`🗑️ Producto eliminado: ${producto.descripcion}`);
    }
  };

  const handleView = (producto) => {
    alert(`👁️ Detalles del Producto\n\nTipo: ${producto.tipo_producto}\nDescripción: ${producto.descripcion}\nCódigo: ${producto.codigo_generado}\nUnidad de Medida: ${producto.unidad_medida}\nObservaciones: ${producto.observaciones}`);
  };

  return (
    <div className="registro-productos-container">
      {/* Header */}
      <div className="registro-productos-header">
        <div className="header-title">
          <span className="header-icon">📦</span>
          <div>
            <h1>REGISTRO DE PRODUCTOS</h1>
            <p>Gestión del catálogo de productos</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleNuevoProducto}>
            <span>➕</span> Nuevo Producto
          </button>
          <button className="btn btn-secondary" onClick={handleExportar}>
            <span>📊</span> Exportar
          </button>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <>
          <div className="modal-overlay" onClick={() => setMostrarModal(false)}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h2>📝 Nuevo Producto</h2>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>✖</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>📁 Tipo de Producto: *</label>
                <select
                  name="tipo_producto"
                  value={formulario.tipo_producto}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione un tipo...</option>
                  <option value="Herramientas">Herramientas</option>
                  <option value="Materiales">Materiales</option>
                  <option value="Equipos">Equipos</option>
                  <option value="Suministros">Suministros</option>
                </select>
              </div>

              <div className="form-group">
                <label>📝 Descripción: *</label>
                <input
                  type="text"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ingrese la descripción del producto..."
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>🔢 Código Generado:</label>
                  <input
                    type="text"
                    name="codigo_generado"
                    value={formulario.codigo_generado}
                    onChange={handleInputChange}
                    placeholder="Se generará automáticamente"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>📏 Unidad de Medida:</label>
                  <select
                    name="unidad_medida"
                    value={formulario.unidad_medida}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione una unidad...</option>
                    <option value="Unidad">Unidad</option>
                    <option value="Bolsa">Bolsa</option>
                    <option value="Metro">Metro</option>
                    <option value="Resma">Resma</option>
                    <option value="Galón">Galón</option>
                    <option value="Juego">Juego</option>
                    <option value="Kilogramo">Kilogramo</option>
                    <option value="Litro">Litro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>💬 Observaciones:</label>
                <textarea
                  name="observaciones"
                  value={formulario.observaciones}
                  onChange={handleInputChange}
                  placeholder="Ingrese observaciones adicionales..."
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-success" onClick={handleRegistrar}>
                <span>✅</span> REGISTRAR
              </button>
              <button className="btn btn-cancel" onClick={handleLimpiar}>
                <span>🔄</span> LIMPIAR
              </button>
            </div>
          </div>
        </>
      )}

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <span>📦</span>
          </div>
          <div className="stat-info">
            <h3>{totalProductos}</h3>
            <p>Total Productos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <span>📁</span>
          </div>
          <div className="stat-info">
            <h3>{tiposUnicos}</h3>
            <p>Tipos de Producto</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <span>📏</span>
          </div>
          <div className="stat-info">
            <h3>{unidadesUnicas}</h3>
            <p>Unidades de Medida</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <span>🔍</span>
          </div>
          <div className="stat-info">
            <h3>{filteredData.length}</h3>
            <p>Resultados Filtrados</p>
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
              placeholder="Descripción, código o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Tipo de Producto</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="todos">Todos los tipos</option>
              <option value="Herramientas">Herramientas</option>
              <option value="Materiales">Materiales</option>
              <option value="Equipos">Equipos</option>
              <option value="Suministros">Suministros</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Unidad de Medida</label>
            <select value={filtroUnidad} onChange={(e) => setFiltroUnidad(e.target.value)}>
              <option value="todos">Todas las unidades</option>
              <option value="Unidad">Unidad</option>
              <option value="Bolsa">Bolsa</option>
              <option value="Metro">Metro</option>
              <option value="Resma">Resma</option>
              <option value="Galón">Galón</option>
              <option value="Juego">Juego</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-section">
        <div className="tabla-header">
          <h2>📦 Listado de Productos ({filteredData.length})</h2>
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
          <table className="productos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de Producto</th>
                <th>Descripción</th>
                <th>Código Generado</th>
                <th>Unidad de Medida</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((producto) => (
                  <tr key={producto.id}>
                    <td><strong>{producto.id}</strong></td>
                    <td>
                      <span className={`tipo-badge ${producto.tipo_producto.toLowerCase()}`}>
                        {producto.tipo_producto}
                      </span>
                    </td>
                    <td><strong>{producto.descripcion}</strong></td>
                    <td>{producto.codigo_generado}</td>
                    <td>{producto.unidad_medida}</td>
                    <td className="observaciones-cell">{producto.observaciones}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon btn-view" onClick={() => handleView(producto)} title="Ver detalles">
                          👁️
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(producto)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(producto)} title="Eliminar">
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
                      <div className="empty-state-icon">📦</div>
                      <h3>No se encontraron productos</h3>
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

export default RegistroProductos;