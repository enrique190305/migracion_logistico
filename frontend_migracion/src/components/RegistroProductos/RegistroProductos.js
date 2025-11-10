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
    consumible: 'NO',
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
          consumible: formulario.consumible,
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
          consumible: formulario.consumible,
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
      consumible: 'NO',
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
      consumible: producto.consumible || 'NO',
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
        <div className="header-title-productos">
          <span className="header-icon-productos">📦</span>
          <div>
            <h1>REGISTRO DE PRODUCTOS</h1>
            <p>Gestión del catálogo de productos</p>
          </div>
        </div>
        <div className="header-actions-productos">
          <button className="btn-productos btn-primary-productos" onClick={handleNuevoProducto} disabled={loading}>
            <span>➕</span> Nuevo Producto
          </button>
          <button className="btn-productos btn-secondary-productos" onClick={handleExportar}>
            <span>📊</span> Exportar
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert-error-productos">
          <span>❌</span> {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="stats-container-productos">
        <div className="stat-card-productos">
          <div className="stat-icon-productos">📦</div>
          <div className="stat-content-productos">
            <div className="stat-value-productos">{loading ? '...' : totalProductos}</div>
            <div className="stat-label-productos">Total Productos</div>
          </div>
        </div>
        <div className="stat-card-productos">
          <div className="stat-icon-productos">📁</div>
          <div className="stat-content-productos">
            <div className="stat-value-productos">{loading ? '...' : tiposUnicos}</div>
            <div className="stat-label-productos">Tipos de Productos</div>
          </div>
        </div>
        <div className="stat-card-productos">
          <div className="stat-icon-productos">📏</div>
          <div className="stat-content-productos">
            <div className="stat-value-productos">{loading ? '...' : unidadesUnicas}</div>
            <div className="stat-label-productos">Unidades de Medida</div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filters-container-productos">
        <div className="filter-group-productos">
          <label>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="filter-group-productos">
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

        <div className="filter-group-productos">
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

        <button 
          className="btn-limpiar-filtros-productos" 
          onClick={handleLimpiarFiltros}
          disabled={loading || (searchTerm === '' && filtroTipo === 'todos' && filtroUnidad === 'todos')}
          title="Limpiar filtros"
        >
          🗑️ Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div className="table-container-productos">
        <div className="tabla-header-productos">
          <h2>📦 Catálogo de Productos ({productos.length})</h2>
          <div className="search-box-productos">
            <input
              type="text"
              placeholder="Búsqueda rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <span className="search-icon-productos">🔍</span>
          </div>
        </div>

        <div className="table-wrapper-productos">
          {loading && productos.length === 0 ? (
            <div className="loading-state-productos">
              <p>⏳ Cargando productos...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="empty-state-productos">
              <span className="empty-icon-productos">📦</span>
              <h3>No hay productos registrados</h3>
              <span className="empty-hint-productos">Haga clic en "Nuevo Producto" para comenzar</span>
            </div>
          ) : (
            <table className="productos-table-unique">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  <th>Consumible</th>
                  <th>Observaciones</th>
                  <th className="text-center-productos">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((producto) => (
                  <tr key={producto.codigo_producto}>
                    <td><strong>{producto.codigo_producto}</strong></td>
                    <td>
                      <span className={`badge-productos ${producto.tipo_producto.toLowerCase()}-productos`}>
                        {producto.tipo_producto_nombre || producto.tipo_producto}
                      </span>
                    </td>
                    <td>{producto.descripcion}</td>
                    <td className="text-center-productos">{producto.unidad}</td>
                    <td className="text-center-productos">
                      <span className={`badge-productos ${producto.consumible === 'SI' ? 'consumible-si-productos' : 'consumible-no-productos'}`}>
                        {producto.consumible || 'NO'}
                      </span>
                    </td>
                    <td className="observaciones-cell-productos">{producto.observacion || '-'}</td>
                    <td>
                      <div className="action-buttons-productos">
                        <button className="btn-action-productos btn-view-productos" onClick={() => handleView(producto)} title="Ver detalles">
                          👁️
                        </button>
                        <button className="btn-action-productos btn-edit-productos" onClick={() => handleEdit(producto)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-action-productos btn-delete-productos" onClick={() => handleDelete(producto)} title="Eliminar">
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
          <div className="pagination-productos">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn-productos"
            >
              ◀ Anterior
            </button>
            
            <div className="pagination-info-productos">
              Página {currentPage} de {totalPages} ({productos.length} productos)
            </div>
            
            <button 
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn-productos"
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {mostrarModal && (
        <>
          <div className="modal-overlay-productos" onClick={() => !loadingModal && setMostrarModal(false)}></div>
          <div className="modal-container-productos">
            <div className="modal-header-productos">
              <h2>{modoEdicion ? '✏️ Editar Producto' : '📝 Nuevo Producto'}</h2>
              <button 
                className="btn-close-productos" 
                onClick={() => !loadingModal && setMostrarModal(false)}
                disabled={loadingModal}
              >
                ✖
              </button>
            </div>
            
            <div className="modal-body-productos">
              <div className="form-group-productos">
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

              <div className="form-group-productos">
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

              <div className="form-group-row-productos">
                <div className="form-group-productos">
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
                        className="btn-productos btn-secondary-productos"
                        onClick={handleGenerarCodigo}
                        disabled={loadingModal}
                        title="Generar código automático"
                      >
                        🔄
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group-productos">
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

              <div className="form-group-productos">
                <label>� ¿Es Consumible?: *</label>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="consumible"
                      value="SI"
                      checked={formulario.consumible === 'SI'}
                      onChange={handleInputChange}
                      disabled={loadingModal}
                      style={{ marginRight: '5px' }}
                    />
                    <span>SÍ</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="consumible"
                      value="NO"
                      checked={formulario.consumible === 'NO'}
                      onChange={handleInputChange}
                      disabled={loadingModal}
                      style={{ marginRight: '5px' }}
                    />
                    <span>NO</span>
                  </label>
                </div>
              </div>

              <div className="form-group-productos">
                <label>�📋 Observaciones:</label>
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

            <div className="modal-footer-productos">
              <button 
                className="btn-productos btn-cancel-productos" 
                onClick={() => !loadingModal && setMostrarModal(false)}
                disabled={loadingModal}
              >
                ✖ Cancelar
              </button>
              <button 
                className="btn-productos btn-success-productos" 
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
          <div className="modal-overlay-productos" onClick={() => setModalExito({ mostrar: false, titulo: '', mensaje: '' })}></div>
          <div className="modal-exito-productos">
            <div className="modal-exito-header-productos">
              <h2>{modalExito.titulo}</h2>
            </div>
            <div className="modal-exito-body-productos">
              <div className="modal-exito-icon-productos">✅</div>
              <p style={{ whiteSpace: 'pre-line' }}>{modalExito.mensaje}</p>
            </div>
            <div className="modal-exito-footer-productos">
              <button 
                className="btn-productos btn-success-productos" 
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
          <div className="modal-overlay-productos"></div>
          <div className="modal-confirmacion-productos">
            <div className="modal-confirmacion-header-productos">
              <h2>⚠️ ADVERTENCIA</h2>
            </div>
            <div className="modal-confirmacion-body-productos">
              <p><strong>¿Está seguro de eliminar el producto?</strong></p>
              <div className="detalle-confirmacion-productos">
                <p><strong>Código:</strong> {modalConfirmacion.producto?.codigo_producto}</p>
                <p><strong>Descripción:</strong> {modalConfirmacion.producto?.descripcion}</p>
              </div>
              <p className="advertencia-texto-productos">Esta acción NO se puede deshacer.</p>
            </div>
            <div className="modal-confirmacion-footer-productos">
              <button 
                className="btn-productos btn-cancel-productos" 
                onClick={() => setModalConfirmacion({ mostrar: false, producto: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn-productos btn-danger-productos" 
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
          <div className="modal-overlay-productos" onClick={() => setModalDetalle({ mostrar: false, producto: null })}></div>
          <div className="modal-detalle-productos">
            <div className="modal-detalle-header-productos">
              <h2>👁️ Detalles del Producto</h2>
              <button 
                className="btn-close-productos" 
                onClick={() => setModalDetalle({ mostrar: false, producto: null })}
              >
                ✖
              </button>
            </div>
            <div className="modal-detalle-body-productos">
              <div className="detalle-item-productos">
                <label>Código:</label>
                <span>{modalDetalle.producto.codigo_producto}</span>
              </div>
              <div className="detalle-item-productos">
                <label>Tipo:</label>
                <span>{modalDetalle.producto.tipo_producto_nombre || modalDetalle.producto.tipo_producto}</span>
              </div>
              <div className="detalle-item-productos">
                <label>Descripción:</label>
                <span>{modalDetalle.producto.descripcion}</span>
              </div>
              <div className="detalle-item-productos">
                <label>Unidad:</label>
                <span>{modalDetalle.producto.unidad}</span>
              </div>
              <div className="detalle-item-productos">
                <label>Observación:</label>
                <span>{modalDetalle.producto.observacion || 'Sin observaciones'}</span>
              </div>
            </div>
            <div className="modal-detalle-footer-productos">
              <button 
                className="btn-productos btn-primary-productos" 
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