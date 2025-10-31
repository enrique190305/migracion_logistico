import React, { useState, useEffect } from 'react';
import './TrasladoMateriales.css';
import trasladoMaterialesAPI from '../../services/trasladoMaterialesAPI';
import { obtenerReservasParaTraslado } from '../../services/bodegasAPI';
import { obtenerProductosConStockReserva, verificarDisponibilidad } from '../../services/stockAPI';

const TrasladoMateriales = () => {
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  
  // Información del Traslado
  const [numeroTraslado, setNumeroTraslado] = useState('NT-003');
  const [reservaOrigen, setReservaOrigen] = useState('');           // CAMBIADO de proyectoOrigen
  const [reservaDestino, setReservaDestino] = useState('');         // CAMBIADO de proyectoDestino
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
  const [reservas, setReservas] = useState([]);                     // CAMBIADO de proyectos
  const [productos, setProductos] = useState([]);
  const [descripcionesProductos, setDescripcionesProductos] = useState([]);

  // Estados de control
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estados para combobox de búsqueda de productos
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [dropdownAbiertoProducto, setDropdownAbiertoProducto] = useState(false);
  const [dropdownPositionProducto, setDropdownPositionProducto] = useState({});

  // ============================================
  // EFECTOS INICIALES
  // ============================================

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (reservaOrigen) {
      cargarProductosDeLaReserva(reservaOrigen);  // CAMBIADO
    } else {
      setDescripcionesProductos([]);
      limpiarDetalleProducto();
    }
  }, [reservaOrigen]);  // CAMBIADO

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

      // CAMBIADO: Cargar reservas en lugar de proyectos
      const respReservas = await obtenerReservasParaTraslado();
      if (respReservas.success) {
        setReservas(respReservas.data || []);
      } else {
        mostrarMensaje('error', respReservas.message || 'Error al cargar reservas');
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

  // NUEVO: Cargar productos de una reserva
  const cargarProductosDeLaReserva = async (idReserva) => {
    try {
      setCargando(true);

      // Llamar al API para obtener productos con stock en la reserva
      const respProductos = await obtenerProductosConStockReserva(idReserva);
      
      if (respProductos.success && respProductos.data.length > 0) {
        // Formatear productos
        const productosFormateados = respProductos.data.map(p => ({
          codigo: p.codigo_producto,
          descripcion: p.descripcion,
          unidad: p.unidad,
          stock: parseFloat(p.stock_disponible || 0)
        }));

        setProductos(productosFormateados);
        setDescripcionesProductos(productosFormateados.map(p => p.descripcion));
      } else {
        setProductos([]);
        setDescripcionesProductos([]);
        if (!respProductos.success) {
          mostrarMensaje('warning', 'No hay productos con stock en esta reserva');
        }
      }

    } catch (error) {
      console.error('Error al cargar productos de la reserva:', error);
      mostrarMensaje('error', 'Error al cargar los productos de la reserva');
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
    setBusquedaProducto('');
    setDropdownAbiertoProducto(false);
    
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
      setReservaOrigen('');      // CAMBIADO
      setReservaDestino('');     // CAMBIADO
      setFechaTraslado(new Date().toISOString().split('T')[0]);
      setObservacionesGenerales('');
      setProductosATraslador([]);
      limpiarDetalleProducto();
      setDescripcionSeleccionada('');
      setBusquedaProducto('');
      setDropdownAbiertoProducto(false);
      mostrarMensaje('info', 'ℹ️ Formulario limpiado');
    }
  };

  const handleGuardarYGenerarPDF = async () => {
    // Validaciones
    if (!reservaOrigen) {
      mostrarMensaje('error', '❌ Debe seleccionar una reserva de origen');
      return;
    }

    if (!reservaDestino) {
      mostrarMensaje('error', '❌ Debe seleccionar una reserva de destino');
      return;
    }

    if (reservaOrigen === reservaDestino) {
      mostrarMensaje('error', '❌ La reserva de origen y destino no pueden ser la misma');
      return;
    }

    if (productosATraslador.length === 0) {
      mostrarMensaje('error', '❌ Debe agregar al menos un producto');
      return;
    }

    // NUEVO: Validar stock disponible antes de guardar
    for (const producto of productosATraslador) {
      try {
        const validacion = await verificarDisponibilidad(
          parseInt(reservaOrigen),
          producto.codigo,
          parseFloat(producto.cantidad)
        );

        if (!validacion.disponible) {
          mostrarMensaje('error', 
            `❌ Stock insuficiente para ${producto.descripcion}. ` +
            `Disponible: ${validacion.cantidad_disponible}, Solicitado: ${producto.cantidad}`
          );
          return;
        }
      } catch (error) {
        console.error('Error validando stock:', error);
        mostrarMensaje('error', `❌ Error al validar stock de ${producto.descripcion}`);
        return;
      }
    }

    try {
      setCargando(true);

      // Preparar datos del traslado (NUEVO FORMATO)
      const datosTraslado = {
        numero_traslado: numeroTraslado,
        reserva_origen: parseInt(reservaOrigen),         // CAMBIADO
        reserva_destino: parseInt(reservaDestino),       // CAMBIADO
        fecha_traslado: fechaTraslado,
        usuario: localStorage.getItem('userName') || 'Usuario',
        observaciones: observacionesGenerales || '',
        productos: productosATraslador.map(p => ({
          codigo_producto: p.codigo,
          cantidad: parseFloat(p.cantidad),              // CAMBIADO a float
          observaciones: p.observaciones || ''
        }))
      };

      // Llamar al NUEVO endpoint para traslados con reservas
      const response = await trasladoMaterialesAPI.guardarTrasladoConReservas(datosTraslado);

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
  // FUNCIONES PARA COMBOBOX DE BÚSQUEDA
  // ============================================

  const handleBusquedaProductoChange = (valor) => {
    setBusquedaProducto(valor);
    setDropdownAbiertoProducto(true);

    if (!valor) {
      setDescripcionSeleccionada('');
      limpiarDetalleProducto();
    }
  };

  const handleProductoSelect = (descripcion) => {
    setDescripcionSeleccionada(descripcion);
    setBusquedaProducto(descripcion);
    setDropdownAbiertoProducto(false);
  };

  const filtrarProductos = () => {
    const busqueda = (busquedaProducto || '').toLowerCase();
    if (!busqueda) return descripcionesProductos;
    
    return descripcionesProductos.filter(desc => 
      desc.toLowerCase().includes(busqueda)
    );
  };

  const handleBusquedaFocus = (event) => {
    const rect = event.target.getBoundingClientRect();
    setDropdownPositionProducto({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    });
    setDropdownAbiertoProducto(true);
  };

  const toggleDropdownProducto = (event) => {
    const input = event.target.closest('.combobox-input-wrapper').querySelector('.input-busqueda-producto');
    const rect = input.getBoundingClientRect();
    
    setDropdownPositionProducto({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    });
    
    setDropdownAbiertoProducto(!dropdownAbiertoProducto);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.producto-combobox') && 
          !event.target.closest('.dropdown-productos-fixed')) {
        setDropdownAbiertoProducto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            
            {/* Reserva Origen (CAMBIADO) */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                📍 Reserva Origen *
              </label>
              <select
                className="traslado-form-select"
                value={reservaOrigen}
                onChange={(e) => setReservaOrigen(e.target.value)}
              >
                <option value="">-- Seleccione reserva origen --</option>
                {reservas.map((reserva, index) => (
                  <option key={`origen-${reserva.id_bodega}-${reserva.id_reserva}-${index}`} value={reserva.id_reserva}>
                    {reserva.nombre_completo}
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
            
            {/* Reserva Destino (CAMBIADO) */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                🎯 Reserva Destino *
              </label>
              <select
                className="traslado-form-select"
                value={reservaDestino}
                onChange={(e) => setReservaDestino(e.target.value)}
              >
                <option value="">-- Seleccione reserva destino --</option>
                {reservas
                  .filter(r => r.id_reserva !== parseInt(reservaOrigen))
                  .map((reserva, index) => (
                    <option key={`destino-${reserva.id_bodega}-${reserva.id_reserva}-${index}`} value={reserva.id_reserva}>
                      {reserva.nombre_completo}
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
          
          {!reservaOrigen && (
            <div className="traslado-warning-box">
              ⚠️ Primero debe seleccionar una reserva de origen para ver los productos disponibles
            </div>
          )}

          {reservaOrigen && (
            <>
              <div className="traslado-form-row">
                
                {/* Descripción */}
                <div className="traslado-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="traslado-form-label">
                    📝 Descripción *
                  </label>
                  <div className="producto-combobox">
                    <div className="combobox-input-wrapper">
                      <input
                        type="text"
                        value={busquedaProducto}
                        onChange={(e) => handleBusquedaProductoChange(e.target.value)}
                        onFocus={(e) => handleBusquedaFocus(e)}
                        placeholder="Seleccione o busque un producto..."
                        className="input-busqueda-producto traslado-form-input"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="btn-dropdown-toggle"
                        onClick={(e) => toggleDropdownProducto(e)}
                        tabIndex="-1"
                      >
                        <span className={`dropdown-arrow ${dropdownAbiertoProducto ? 'open' : ''}`}>▼</span>
                      </button>
                    </div>
                  </div>
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

      {/* Dropdown de productos (renderizado fuera con position fixed) */}
      {dropdownAbiertoProducto && dropdownPositionProducto.top && (
        <div 
          className="dropdown-productos-fixed"
          style={{
            top: `${dropdownPositionProducto.top}px`,
            left: `${dropdownPositionProducto.left}px`,
            width: `${dropdownPositionProducto.width}px`
          }}
        >
          {filtrarProductos().length > 0 ? (
            filtrarProductos().map((desc, index) => (
              <div
                key={index}
                className="dropdown-item"
                onClick={() => handleProductoSelect(desc)}
              >
                <div className="dropdown-item-desc">{desc}</div>
              </div>
            ))
          ) : (
            <div className="dropdown-item-vacio">
              {busquedaProducto ? '🔍 No se encontraron productos' : '📦 Comience a escribir para buscar'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrasladoMateriales;
