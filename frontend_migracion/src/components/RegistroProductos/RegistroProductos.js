import React, { useState, useEffect } from 'react';
import './RegistroProductos.css';
import {
  listarProductos,
  obtenerFamilias,
  obtenerUnidades,
  obtenerEstadisticas,
  generarCodigo,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from '../../services/productosAPI';

const RegistroProductos = () => {
  // Estados de datos
  const [productos, setProductos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroUnidad, setFiltroUnidad] = useState('todos');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estados de UI
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [error, setError] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  
  // Estados para modales de confirmación y éxito
  const [modalExito, setModalExito] = useState({ mostrar: false, titulo: '', mensaje: '' });
  const [modalConfirmacion, setModalConfirmacion] = useState({ mostrar: false, producto: null });
  const [modalDetalle, setModalDetalle] = useState({ mostrar: false, producto: null });

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    tipo_producto: '',
    descripcion: '',
    codigo_producto: '',
    unidad: '',
    observacion: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Aplicar filtros cuando cambien (con debounce para search)
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarProductos();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, filtroTipo, filtroUnidad]);

  /**
   * Cargar datos iniciales
   */
  const cargarDatosIniciales = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        cargarProductos(),
        cargarFamilias(),
        cargarUnidades(),
        cargarEstadisticas()
      ]);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      setError('Error al cargar los datos. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar productos con filtros
   */
  const cargarProductos = async () => {
    try {
      const filtros = {
        search: searchTerm,
        tipo_producto: filtroTipo !== 'todos' ? filtroTipo : undefined,
        unidad: filtroUnidad !== 'todos' ? filtroUnidad : undefined
      };
      
      console.log('📋 Cargando productos con filtros:', filtros);
      const data = await listarProductos(filtros);
      console.log('✅ Productos cargados:', data);
      setProductos(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setProductos([]);
    }
  };

  /**
   * Cargar familias/tipos de producto
   */
  const cargarFamilias = async () => {
    try {
      const data = await obtenerFamilias();
      console.log('📁 Familias cargadas:', data);
      setFamilias(data);
    } catch (err) {
      console.error('Error al cargar familias:', err);
      setFamilias([]);
    }
  };

  /**
   * Cargar unidades de medida
   */
  const cargarUnidades = async () => {
    try {
      const data = await obtenerUnidades();
      console.log('📏 Unidades cargadas:', data);
      setUnidades(data);
    } catch (err) {
      console.error('Error al cargar unidades:', err);
      setUnidades([]);
    }
  };

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = async () => {
    try {
      const data = await obtenerEstadisticas();
      console.log('📊 Estadísticas cargadas:', data);
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  /**
   * Generar código automático
   */
  const handleGenerarCodigo = async () => {
    try {
      const codigo = await generarCodigo(formulario.tipo_producto);
      console.log('🔢 Código generado:', codigo);
      setFormulario({ ...formulario, codigo_producto: codigo });
    } catch (err) {
      console.error('Error al generar código:', err);
      alert('❌ Error al generar código automático');
    }
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  /**
   * Registrar o actualizar producto
   */
  const handleRegistrar = async () => {
    // Validaciones
    if (!formulario.tipo_producto || !formulario.descripcion || !formulario.codigo_producto || !formulario.unidad) {
      setError('Por favor complete todos los campos obligatorios');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoadingModal(true);

    try {
      if (modoEdicion) {
        // Actualizar producto existente
        const result = await actualizarProducto(productoEditando, {
          tipo_producto: formulario.tipo_producto,
          descripcion: formulario.descripcion,
          unidad: formulario.unidad,
          observacion: formulario.observacion
        });
        
        console.log('✅ Producto actualizado:', result);
        
        // Mostrar modal de éxito
        setModalExito({
          mostrar: true,
          titulo: '✅ Producto Actualizado',
          mensaje: `Código: ${formulario.codigo_producto}\nDescripción: ${formulario.descripcion}`
        });
      } else {
        // Crear nuevo producto
        const result = await crearProducto({
          codigo_producto: formulario.codigo_producto,
          tipo_producto: formulario.tipo_producto,
          descripcion: formulario.descripcion,
          unidad: formulario.unidad,
          observacion: formulario.observacion
        });
        
        console.log('✅ Producto creado:', result);
        
        // Mostrar modal de éxito
        setModalExito({
          mostrar: true,
          titulo: '✅ Producto Registrado Exitosamente',
          mensaje: `Código: ${formulario.codigo_producto}\nDescripción: ${formulario.descripcion}`
        });
      }
      
      // Recargar datos
      await cargarProductos();
      await cargarEstadisticas();
      
      handleLimpiar();
      setMostrarModal(false);
      
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError(`Error al ${modoEdicion ? 'actualizar' : 'registrar'} producto: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingModal(false);
    }
  };

  /**
   * Limpiar formulario
   */
  const handleLimpiar = () => {
    setFormulario({
      tipo_producto: '',
      descripcion: '',
      codigo_producto: '',
      unidad: '',
      observacion: ''
    });
    setModoEdicion(false);
    setProductoEditando(null);
  };

  /**
   * Abrir modal para nuevo producto
   */
  const handleNuevoProducto = async () => {
    handleLimpiar();
    setMostrarModal(true);
    
    // Generar código automáticamente
    try {
      const codigo = await generarCodigo();
      setFormulario(prev => ({ ...prev, codigo_producto: codigo }));
    } catch (err) {
      console.error('Error al generar código:', err);
    }
  };

  /**
   * Editar producto
   */
  const handleEdit = (producto) => {
    console.log('✏️ Editando producto:', producto);
    setFormulario({
      tipo_producto: producto.tipo_producto,
      descripcion: producto.descripcion,
      codigo_producto: producto.codigo_producto,
      unidad: producto.unidad,
      observacion: producto.observacion || ''
    });
    setModoEdicion(true);
    setProductoEditando(producto.codigo_producto);
    setMostrarModal(true);
  };

  /**
   * Eliminar producto
   */
  const handleDelete = (producto) => {
    setModalConfirmacion({
      mostrar: true,
      producto: producto
    });
  };

  /**
   * Confirmar eliminación
   */
  const confirmarEliminacion = async () => {
    const producto = modalConfirmacion.producto;
    setModalConfirmacion({ mostrar: false, producto: null });
    setLoading(true);

    try {
      const result = await eliminarProducto(producto.codigo_producto);
      console.log('✅ Producto eliminado:', result);
      
      // Mostrar modal de éxito
      setModalExito({
        mostrar: true,
        titulo: '✅ Producto Eliminado',
        mensaje: `Código: ${producto.codigo_producto}\nDescripción: ${producto.descripcion}`
      });
      
      // Recargar datos
      await cargarProductos();
      await cargarEstadisticas();
      
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(`Error al eliminar producto: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exportar datos (placeholder)
   */
  const handleExportar = () => {
    setModalExito({
      mostrar: true,
      titulo: '📊 Función de Exportación',
      mensaje: 'Esta funcionalidad estará disponible próximamente.'
    });
  };

  /**
   * Limpiar todos los filtros
   */
  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setFiltroTipo('todos');
    setFiltroUnidad('todos');
  };

  /**
   * Ver detalles del producto
   */
  const handleView = (producto) => {
    setModalDetalle({
      mostrar: true,
      producto: producto
    });
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productos.length / itemsPerPage);

  // Calcular estadísticas locales
  const totalProductos = estadisticas?.total_productos || productos.length;
  const tiposUnicos = estadisticas?.total_familias || familias.length;
  const unidadesUnicas = unidades.length;

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
          <button className="btn btn-primary" onClick={handleNuevoProducto} disabled={loading}>
            <span>➕</span> Nuevo Producto
          </button>
          <button className="btn btn-secondary" onClick={handleExportar}>
            <span>📊</span> Exportar
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert-error">
          <span>❌</span> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{loading ? '...' : totalProductos}</div>
            <div className="stat-label">Total Productos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-value">{loading ? '...' : tiposUnicos}</div>
            <div className="stat-label">Tipos de Productos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📏</div>
          <div className="stat-content">
            <div className="stat-value">{loading ? '...' : unidadesUnicas}</div>
            <div className="stat-label">Unidades de Medida</div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filters-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="filter-group">
          <label>📁 Tipo:</label>
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            disabled={loading}
          >
            <option value="todos">Todos los tipos</option>
            {familias.map((familia) => (
              <option key={familia.tipo_producto} value={familia.tipo_producto}>
                {familia.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>📏 Unidad:</label>
          <select 
            value={filtroUnidad} 
            onChange={(e) => setFiltroUnidad(e.target.value)}
            disabled={loading}
          >
            <option value="todos">Todas las unidades</option>
            {unidades.map((unidad, index) => (
              <option key={index} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label style={{opacity: 0}}>.</label>
          <button 
            className="btn-limpiar-filtros" 
            onClick={handleLimpiarFiltros}
            disabled={loading}
            title="Limpiar filtros"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        {loading && productos.length === 0 ? (
          <div className="loading-state">
            <p>⏳ Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>No hay productos registrados</p>
            <span className="empty-hint">Haga clic en "Nuevo Producto" para comenzar</span>
          </div>
        ) : (
          <table className="productos-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((producto) => (
                <tr key={producto.codigo_producto}>
                  <td><strong>{producto.codigo_producto}</strong></td>
                  <td>
                    <span className="badge">{producto.tipo_producto_nombre || producto.tipo_producto}</span>
                  </td>
                  <td>{producto.descripcion}</td>
                  <td className="text-center">{producto.unidad}</td>
                  <td>{producto.observacion || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-view" onClick={() => handleView(producto)} title="Ver detalles">
                        👁️
                      </button>
                      <button className="btn-action btn-edit" onClick={() => handleEdit(producto)} title="Editar">
                        ✏️
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(producto)} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {productos.length > itemsPerPage && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ◀ Anterior
          </button>
          
          <div className="pagination-info">
            Página {currentPage} de {totalPages} ({productos.length} productos)
          </div>
          
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Siguiente ▶
          </button>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <>
          <div className="modal-overlay" onClick={() => !loadingModal && setMostrarModal(false)}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h2>{modoEdicion ? '✏️ Editar Producto' : '📝 Nuevo Producto'}</h2>
              <button 
                className="btn-close" 
                onClick={() => !loadingModal && setMostrarModal(false)}
                disabled={loadingModal}
              >
                ✖
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>📁 Tipo de Producto: *</label>
                <select
                  name="tipo_producto"
                  value={formulario.tipo_producto}
                  onChange={handleInputChange}
                  required
                  disabled={loadingModal}
                >
                  <option value="">Seleccione un tipo...</option>
                  {familias.map((familia) => (
                    <option key={familia.tipo_producto} value={familia.tipo_producto}>
                      {familia.descripcion}
                    </option>
                  ))}
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
                  disabled={loadingModal}
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>🔢 Código: *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      name="codigo_producto"
                      value={formulario.codigo_producto}
                      onChange={handleInputChange}
                      placeholder="Código del producto"
                      required
                      disabled={modoEdicion || loadingModal}
                    />
                    {!modoEdicion && (
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleGenerarCodigo}
                        disabled={loadingModal}
                        title="Generar código automático"
                      >
                        🔄
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>📏 Unidad de Medida: *</label>
                  <select
                    name="unidad"
                    value={formulario.unidad}
                    onChange={handleInputChange}
                    required
                    disabled={loadingModal}
                  >
                    <option value="">Seleccione una unidad...</option>
                    {unidades.map((unidad, index) => (
                      <option key={index} value={unidad}>
                        {unidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>📋 Observaciones:</label>
                <textarea
                  name="observacion"
                  value={formulario.observacion}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales (opcional)..."
                  rows="3"
                  disabled={loadingModal}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => !loadingModal && setMostrarModal(false)}
                disabled={loadingModal}
              >
                ✖ Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleRegistrar}
                disabled={loadingModal}
              >
                {loadingModal ? '⏳ Guardando...' : (modoEdicion ? '💾 Actualizar' : '✅ Registrar')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Éxito */}
      {modalExito.mostrar && (
        <>
          <div className="modal-overlay" onClick={() => setModalExito({ mostrar: false, titulo: '', mensaje: '' })}></div>
          <div className="modal-exito">
            <div className="modal-exito-header">
              <h2>{modalExito.titulo}</h2>
            </div>
            <div className="modal-exito-body">
              <div className="modal-exito-icon">✅</div>
              <p style={{ whiteSpace: 'pre-line' }}>{modalExito.mensaje}</p>
            </div>
            <div className="modal-exito-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => setModalExito({ mostrar: false, titulo: '', mensaje: '' })}
              >
                Aceptar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {modalConfirmacion.mostrar && (
        <>
          <div className="modal-overlay"></div>
          <div className="modal-confirmacion">
            <div className="modal-confirmacion-header">
              <h2>⚠️ ADVERTENCIA</h2>
            </div>
            <div className="modal-confirmacion-body">
              <p><strong>¿Está seguro de eliminar el producto?</strong></p>
              <div className="detalle-confirmacion">
                <p><strong>Código:</strong> {modalConfirmacion.producto?.codigo_producto}</p>
                <p><strong>Descripción:</strong> {modalConfirmacion.producto?.descripcion}</p>
              </div>
              <p className="advertencia-texto">Esta acción NO se puede deshacer.</p>
            </div>
            <div className="modal-confirmacion-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setModalConfirmacion({ mostrar: false, producto: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmarEliminacion}
              >
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalle del Producto */}
      {modalDetalle.mostrar && modalDetalle.producto && (
        <>
          <div className="modal-overlay" onClick={() => setModalDetalle({ mostrar: false, producto: null })}></div>
          <div className="modal-detalle">
            <div className="modal-detalle-header">
              <h2>👁️ Detalles del Producto</h2>
              <button 
                className="btn-close" 
                onClick={() => setModalDetalle({ mostrar: false, producto: null })}
              >
                ✖
              </button>
            </div>
            <div className="modal-detalle-body">
              <div className="detalle-item">
                <label>Código:</label>
                <span>{modalDetalle.producto.codigo_producto}</span>
              </div>
              <div className="detalle-item">
                <label>Tipo:</label>
                <span>{modalDetalle.producto.tipo_producto_nombre || modalDetalle.producto.tipo_producto}</span>
              </div>
              <div className="detalle-item">
                <label>Descripción:</label>
                <span>{modalDetalle.producto.descripcion}</span>
              </div>
              <div className="detalle-item">
                <label>Unidad:</label>
                <span>{modalDetalle.producto.unidad}</span>
              </div>
              <div className="detalle-item">
                <label>Observación:</label>
                <span>{modalDetalle.producto.observacion || 'Sin observaciones'}</span>
              </div>
            </div>
            <div className="modal-detalle-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => setModalDetalle({ mostrar: false, producto: null })}
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegistroProductos;