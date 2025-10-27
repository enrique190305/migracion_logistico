import React, { useState, useEffect } from 'react';
import './TrasladoMateriales.css';
import trasladoMaterialesAPI from '../../services/trasladoMaterialesAPI';

const TrasladoMateriales = () => {
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  
  // Información del Traslado
  const [numeroTraslado, setNumeroTraslado] = useState('NT-003');
  const [proyectoOrigen, setProyectoOrigen] = useState('');
  const [proyectoDestino, setProyectoDestino] = useState('');
  const [fechaTraslado, setFechaTraslado] = useState(new Date().toISOString().split('T')[0]);
  const [observacionesGenerales, setObservacionesGenerales] = useState('');

  // Detalle del Producto
  const [descripcionSeleccionada, setDescripcionSeleccionada] = useState('');
  const [codigoProducto, setCodigoProducto] = useState('');
  const [cantidadTraslado, setCantidadTraslado] = useState('');
  const [unidad, setUnidad] = useState('');
  const [stockDisponible, setStockDisponible] = useState('');
  const [observacionProducto, setObservacionProducto] = useState('');

  // Productos Agregados
  const [productosATraslador, setProductosATraslador] = useState([]);

  // Catálogos
  const [proyectos, setProyectos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [descripcionesProductos, setDescripcionesProductos] = useState([]);

  // Estados de control
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // ============================================
  // EFECTOS INICIALES
  // ============================================

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (proyectoOrigen) {
      cargarProductosDelProyecto(proyectoOrigen);
    } else {
      setDescripcionesProductos([]);
      limpiarDetalleProducto();
    }
  }, [proyectoOrigen]);

  useEffect(() => {
    if (descripcionSeleccionada) {
      cargarInfoProducto(descripcionSeleccionada);
    } else {
      limpiarDetalleProducto();
    }
  }, [descripcionSeleccionada]);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);

      // Cargar proyectos
      const respProyectos = await trasladoMaterialesAPI.listarProyectos();
      if (respProyectos.success) {
        setProyectos(respProyectos.data);
      } else {
        mostrarMensaje('error', respProyectos.message);
      }

      // Generar número de traslado
      const respNumero = await trasladoMaterialesAPI.generarNumeroTraslado();
      if (respNumero.success) {
        setNumeroTraslado(respNumero.numero_traslado);
      } else {
        mostrarMensaje('error', respNumero.message);
      }

    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      mostrarMensaje('error', 'Error al cargar los datos iniciales');
    } finally {
      setCargando(false);
    }
  };

  const cargarProductosDelProyecto = async (idProyecto) => {
    try {
      setCargando(true);

      // Llamar al API para obtener productos con stock
      const respProductos = await trasladoMaterialesAPI.obtenerProductosConStock(idProyecto);
      
      if (respProductos.success && respProductos.data.length > 0) {
        // Formatear productos
        const productosFormateados = respProductos.data.map(p => ({
          codigo: p.codigo_producto,
          descripcion: p.descripcion,
          unidad: p.unidad,
          stock: parseFloat(p.stock_disponible)
        }));

        setProductos(productosFormateados);
        setDescripcionesProductos(productosFormateados.map(p => p.descripcion));
      } else {
        setProductos([]);
        setDescripcionesProductos([]);
        if (!respProductos.success) {
          mostrarMensaje('warning', 'No hay productos con stock en este proyecto');
        }
      }

    } catch (error) {
      console.error('Error al cargar productos:', error);
      mostrarMensaje('error', 'Error al cargar los productos del proyecto');
    } finally {
      setCargando(false);
    }
  };

  const cargarInfoProducto = (descripcion) => {
    const producto = productos.find(p => p.descripcion === descripcion);
    if (producto) {
      setCodigoProducto(producto.codigo);
      setUnidad(producto.unidad);
      setStockDisponible(producto.stock);
      setCantidadTraslado('');
    }
  };

  // ============================================
  // MANEJADORES DE EVENTOS
  // ============================================

  const handleAgregarProducto = () => {
    // Validaciones
    if (!descripcionSeleccionada) {
      mostrarMensaje('error', '❌ Debe seleccionar un producto');
      return;
    }

    if (!cantidadTraslado || parseFloat(cantidadTraslado) <= 0) {
      mostrarMensaje('error', '❌ La cantidad debe ser mayor a cero');
      return;
    }

    const cantidad = parseFloat(cantidadTraslado);
    const stock = parseFloat(stockDisponible);

    if (cantidad > stock) {
      mostrarMensaje('error', '❌ La cantidad excede el stock disponible');
      return;
    }

    // Verificar si el producto ya fue agregado
    const yaExiste = productosATraslador.some(p => p.codigo === codigoProducto);
    if (yaExiste) {
      mostrarMensaje('warning', '⚠️ Este producto ya fue agregado. Puede modificar su cantidad en la tabla.');
      return;
    }

    // Agregar producto
    const nuevoProducto = {
      codigo: codigoProducto,
      descripcion: descripcionSeleccionada,
      cantidad: cantidad,
      unidad: unidad,
      stock: stock,
      observaciones: observacionProducto
    };

    setProductosATraslador([...productosATraslador, nuevoProducto]);
    
    // Limpiar campos
    limpiarDetalleProducto();
    setDescripcionSeleccionada('');
    
    mostrarMensaje('success', '✅ Producto agregado correctamente');
  };

  const handleEliminarProducto = (codigo) => {
    setProductosATraslador(productosATraslador.filter(p => p.codigo !== codigo));
    mostrarMensaje('info', 'ℹ️ Producto eliminado');
  };

  const handleActualizarCantidad = (codigo, nuevaCantidad) => {
    const cantidad = parseFloat(nuevaCantidad);
    if (isNaN(cantidad) || cantidad < 0) return;

    const producto = productosATraslador.find(p => p.codigo === codigo);
    if (producto && cantidad > producto.stock) {
      mostrarMensaje('warning', '⚠️ La cantidad excede el stock disponible');
      return;
    }

    setProductosATraslador(productosATraslador.map(p => 
      p.codigo === codigo 
        ? { ...p, cantidad: cantidad }
        : p
    ));
  };

  const handleActualizarObservacion = (codigo, nuevaObservacion) => {
    setProductosATraslador(productosATraslador.map(p => 
      p.codigo === codigo 
        ? { ...p, observaciones: nuevaObservacion }
        : p
    ));
  };

  const handleLimpiar = () => {
    if (window.confirm('¿Está seguro que desea limpiar el formulario?')) {
      setProyectoOrigen('');
      setProyectoDestino('');
      setFechaTraslado(new Date().toISOString().split('T')[0]);
      setObservacionesGenerales('');
      setProductosATraslador([]);
      limpiarDetalleProducto();
      setDescripcionSeleccionada('');
      mostrarMensaje('info', 'ℹ️ Formulario limpiado');
    }
  };

  const handleGuardarYGenerarPDF = async () => {
    // Validaciones
    if (!proyectoOrigen) {
      mostrarMensaje('error', '❌ Debe seleccionar un proyecto de origen');
      return;
    }

    if (!proyectoDestino) {
      mostrarMensaje('error', '❌ Debe seleccionar un proyecto de destino');
      return;
    }

    if (proyectoOrigen === proyectoDestino) {
      mostrarMensaje('error', '❌ El proyecto de origen y destino no pueden ser el mismo');
      return;
    }

    if (productosATraslador.length === 0) {
      mostrarMensaje('error', '❌ Debe agregar al menos un producto');
      return;
    }

    try {
      setCargando(true);

      // Buscar nombres de los proyectos
      const proyectoOrigenObj = proyectos.find(p => p.id === parseInt(proyectoOrigen));
      const proyectoDestinoObj = proyectos.find(p => p.id === parseInt(proyectoDestino));

      if (!proyectoOrigenObj || !proyectoDestinoObj) {
        mostrarMensaje('error', '❌ Error al identificar los proyectos');
        return;
      }

      // Preparar datos del traslado
      const datosTraslado = {
        numero_traslado: numeroTraslado,
        proyecto_origen: proyectoOrigenObj.nombre_proyecto,
        proyecto_destino: proyectoDestinoObj.nombre_proyecto,
        fecha_traslado: fechaTraslado,
        usuario: localStorage.getItem('userName') || 'Usuario',
        observaciones: observacionesGenerales || '',
        productos: productosATraslador.map(p => ({
          codigo_producto: p.codigo,
          descripcion: p.descripcion,
          cantidad: parseInt(p.cantidad),
          unidad: p.unidad,
          observaciones: p.observaciones || ''
        }))
      };

      // Llamar al API para guardar
      const response = await trasladoMaterialesAPI.guardarTraslado(datosTraslado);

      if (response.success) {
        mostrarMensaje('success', `✅ ${response.message}`);

        // Generar PDF automáticamente después de guardar
        const pdfResponse = await trasladoMaterialesAPI.generarPDF(response.data.id_traslado);
        
        if (pdfResponse.success) {
          mostrarMensaje('success', '📄 PDF generado y descargado correctamente');
        }

        // Limpiar formulario después de guardar
        setTimeout(() => {
          handleLimpiar();
          cargarDatosIniciales();
        }, 2000);

      } else {
        mostrarMensaje('error', `❌ ${response.message}`);
        
        // Mostrar errores de validación si existen
        if (response.errors) {
          console.error('Errores de validación:', response.errors);
        }
      }

    } catch (error) {
      console.error('Error al guardar traslado:', error);
      mostrarMensaje('error', '❌ Error al guardar el traslado');
    } finally {
      setCargando(false);
    }
  };

  const limpiarDetalleProducto = () => {
    setCodigoProducto('');
    setCantidadTraslado('');
    setUnidad('');
    setStockDisponible('');
    setObservacionProducto('');
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="traslado-materiales-container">
      {/* ENCABEZADO */}
      <div className="traslado-header">
        <span className="traslado-icon">🚚</span>
        <div>
          <h1 className="traslado-title">Traslado de Materiales</h1>
          <p className="traslado-subtitle">Gestiona el traslado de materiales entre proyectos</p>
        </div>
      </div>

      {/* MENSAJE DE NOTIFICACIÓN */}
      {mensaje.texto && (
        <div className={`traslado-mensaje traslado-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* SECCIÓN 1: INFORMACIÓN DEL TRASLADO */}
      <div className="traslado-card">
        <div className="traslado-card-header">
          <span className="traslado-icon">📋</span>
          <h3 className="traslado-card-title">Información del Traslado</h3>
        </div>
        <div className="traslado-card-body">
          <div className="traslado-form-row">
            
            {/* Proyecto Origen */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                🏭 Proyecto Origen *
              </label>
              <select
                className="traslado-form-select"
                value={proyectoOrigen}
                onChange={(e) => setProyectoOrigen(e.target.value)}
              >
                <option value="">-- Seleccione proyecto origen --</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre_proyecto}
                  </option>
                ))}
              </select>
            </div>

            {/* Número de Traslado */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                🔢 N° Traslado
              </label>
              <input
                type="text"
                className="traslado-form-input traslado-numero-input"
                value={numeroTraslado}
                disabled
              />
            </div>

          </div>

          <div className="traslado-form-row" style={{ marginTop: '15px' }}>
            
            {/* Proyecto Destino */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                🎯 Proyecto Destino *
              </label>
              <select
                className="traslado-form-select"
                value={proyectoDestino}
                onChange={(e) => setProyectoDestino(e.target.value)}
              >
                <option value="">-- Seleccione proyecto destino --</option>
                {proyectos
                  .filter(p => p.id !== parseInt(proyectoOrigen))
                  .map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre_proyecto}
                    </option>
                  ))}
              </select>
            </div>

            {/* Fecha Traslado */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                📅 Fecha Traslado *
              </label>
              <input
                type="date"
                className="traslado-form-input"
                value={fechaTraslado}
                onChange={(e) => setFechaTraslado(e.target.value)}
              />
            </div>

          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DETALLE DEL PRODUCTO */}
      <div className="traslado-card">
        <div className="traslado-card-header" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <span className="traslado-icon">📦</span>
          <h3 className="traslado-card-title">Detalle del Producto</h3>
        </div>
        <div className="traslado-card-body">
          
          {!proyectoOrigen && (
            <div className="traslado-warning-box">
              ⚠️ Primero debe seleccionar un proyecto de origen para ver los productos disponibles
            </div>
          )}

          {proyectoOrigen && (
            <>
              <div className="traslado-form-row">
                
                {/* Descripción */}
                <div className="traslado-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="traslado-form-label">
                    📝 Descripción *
                  </label>
                  <select
                    className="traslado-form-select"
                    value={descripcionSeleccionada}
                    onChange={(e) => setDescripcionSeleccionada(e.target.value)}
                  >
                    <option value="">-- Seleccione un producto --</option>
                    {descripcionesProductos.map((desc, index) => (
                      <option key={index} value={desc}>
                        {desc}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="traslado-form-row" style={{ marginTop: '15px' }}>
                
                {/* Código */}
                <div className="traslado-form-group">
                  <label className="traslado-form-label">
                    🔍 Código
                  </label>
                  <input
                    type="text"
                    className="traslado-form-input"
                    value={codigoProducto}
                    disabled
                    style={{ fontWeight: '600', color: '#667eea' }}
                  />
                </div>

                {/* Cantidad */}
                <div className="traslado-form-group">
                  <label className="traslado-form-label">
                    🔢 Cantidad *
                  </label>
                  <input
                    type="number"
                    className="traslado-form-input"
                    value={cantidadTraslado}
                    onChange={(e) => setCantidadTraslado(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={stockDisponible}
                    disabled={!descripcionSeleccionada}
                  />
                </div>

                {/* Unidad */}
                <div className="traslado-form-group">
                  <label className="traslado-form-label">
                    📏 Unidad
                  </label>
                  <input
                    type="text"
                    className="traslado-form-input"
                    value={unidad}
                    disabled
                  />
                </div>

                {/* Stock */}
                <div className="traslado-form-group">
                  <label className="traslado-form-label">
                    📊 Stock
                  </label>
                  <input
                    type="text"
                    className="traslado-form-input"
                    value={stockDisponible}
                    disabled
                    style={{ fontWeight: '700', color: '#27ae60' }}
                  />
                </div>

              </div>

              <div className="traslado-form-row" style={{ marginTop: '15px' }}>
                
                {/* Observaciones */}
                <div className="traslado-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="traslado-form-label">
                    💬 Observaciones
                  </label>
                  <textarea
                    className="traslado-form-textarea"
                    value={observacionProducto}
                    onChange={(e) => setObservacionProducto(e.target.value)}
                    placeholder="Ingrese observaciones adicionales sobre el traslado..."
                    rows="2"
                    disabled={!descripcionSeleccionada}
                  />
                </div>

              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="traslado-btn traslado-btn-success"
                  onClick={handleAgregarProducto}
                  disabled={!descripcionSeleccionada || !cantidadTraslado}
                >
                  <span className="traslado-btn-icon">➕</span>
                  Agregar Producto
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* SECCIÓN 3: PRODUCTOS A TRASLADAR */}
      <div className="traslado-card">
        <div className="traslado-card-header" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <span className="traslado-icon">📋</span>
          <h3 className="traslado-card-title">
            Productos a Trasladar 
            {productosATraslador.length > 0 && (
              <span className="traslado-badge">{productosATraslador.length}</span>
            )}
          </h3>
        </div>
        <div className="traslado-card-body">
          
          {productosATraslador.length === 0 ? (
            <div className="traslado-empty-state">
              <span style={{ fontSize: '64px', marginBottom: '20px' }}>📦</span>
              <p style={{ fontSize: '18px', color: '#999', margin: 0 }}>
                No hay productos agregados para trasladar
              </p>
              <p style={{ fontSize: '14px', color: '#bbb', marginTop: '10px' }}>
                Agregue productos usando el formulario de arriba
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="traslado-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Stock</th>
                    <th>Observaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosATraslador.map((producto, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '600', color: '#667eea' }}>
                        {producto.codigo}
                      </td>
                      <td>{producto.descripcion}</td>
                      <td>
                        <input
                          type="number"
                          className="traslado-table-input"
                          value={producto.cantidad}
                          onChange={(e) => handleActualizarCantidad(producto.codigo, e.target.value)}
                          step="0.01"
                          min="0"
                          max={producto.stock}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>{producto.unidad}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#27ae60' }}>
                        {producto.stock}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="traslado-table-input"
                          value={producto.observaciones || ''}
                          onChange={(e) => handleActualizarObservacion(producto.codigo, e.target.value)}
                          placeholder="Sin observaciones"
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="traslado-table-btn traslado-table-btn-eliminar"
                          onClick={() => handleEliminarProducto(producto.codigo)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* SECCIÓN 4: OBSERVACIONES GENERALES */}
      <div className="traslado-card">
        <div className="traslado-card-header" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <span className="traslado-icon">💬</span>
          <h3 className="traslado-card-title">Observaciones</h3>
        </div>
        <div className="traslado-card-body">
          <textarea
            className="traslado-form-textarea"
            value={observacionesGenerales}
            onChange={(e) => setObservacionesGenerales(e.target.value)}
            placeholder="Ingrese observaciones adicionales sobre el traslado..."
            rows="3"
          />
        </div>
      </div>

      {/* SECCIÓN 5: ACCIONES FINALES */}
      <div className="traslado-card">
        <div className="traslado-card-body">
          <div className="traslado-actions">
            
            <button
              className="traslado-btn traslado-btn-danger"
              onClick={handleLimpiar}
              disabled={cargando}
            >
              <span className="traslado-btn-icon">🗑️</span>
              Eliminar Selección
            </button>

            <button
              className="traslado-btn traslado-btn-success"
              onClick={handleGuardarYGenerarPDF}
              disabled={cargando || productosATraslador.length === 0}
            >
              <span className="traslado-btn-icon">💾</span>
              Guardar y Generar PDF
            </button>

          </div>
        </div>
      </div>

      {/* LOADER */}
      {cargando && (
        <div className="traslado-loader">
          <div className="spinner"></div>
          <p>Procesando...</p>
        </div>
      )}
    </div>
  );
};

export default TrasladoMateriales;
