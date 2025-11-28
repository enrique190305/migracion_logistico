import React, { useState, useEffect } from 'react';
import './TrasladoMateriales.css';
import trasladoMaterialesAPI from '../../services/trasladoMaterialesAPI';
import { obtenerReservasParaTraslado } from '../../services/bodegasAPI';
import { obtenerProductosConStockReserva, verificarDisponibilidad } from '../../services/stockAPI';

// ============================================
// COMPONENTE: Modal de Confirmación
// ============================================
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' }) => {
  return (
    <div className="modal-overlay-traslado" onClick={onCancel}>
      <div className="modal-confirm-traslado" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-confirm-traslado-header ${type}`}>
          <span className="modal-confirm-traslado-icon">
            {type === 'warning' ? '⚠️' : type === 'danger' ? '🗑️' : '❓'}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="modal-confirm-traslado-body">
          <p>{message}</p>
        </div>
        <div className="modal-confirm-traslado-footer">
          <button className="btn-traslado-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-traslado-confirm btn-traslado-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const TrasladoMateriales = () => {
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  
  // Información del Traslado
  const [numeroTraslado, setNumeroTraslado] = useState('NT-003');
  const [bodegaOrigen, setBodegaOrigen] = useState('');             // ✨ NUEVO
  const [reservaOrigen, setReservaOrigen] = useState('');
  const [bodegaDestino, setBodegaDestino] = useState('');           // ✨ NUEVO
  const [reservaDestino, setReservaDestino] = useState('');
  const obtenerFechaLocal = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [fechaTraslado, setFechaTraslado] = useState(obtenerFechaLocal());
  const [observacionesGenerales, setObservacionesGenerales] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

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
  const [bodegas, setBodegas] = useState([]);                       // ✨ NUEVO: Lista de bodegas con reservas
  const [reservasOrigen, setReservasOrigen] = useState([]);         // ✨ NUEVO: Reservas de bodega origen
  const [reservasDestino, setReservasDestino] = useState([]);       // ✨ NUEVO: Reservas de bodega destino
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

  // ✨ NUEVO: Cargar productos cuando cambia bodega + reserva origen
  useEffect(() => {
    if (bodegaOrigen && reservaOrigen) {
      cargarProductosDisponibles(bodegaOrigen, reservaOrigen);
    } else {
      setDescripcionesProductos([]);
      limpiarDetalleProducto();
    }
  }, [bodegaOrigen, reservaOrigen]);

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

      // ✨ NUEVO: Cargar bodegas con reservas
      const respBodegas = await trasladoMaterialesAPI.obtenerBodegasConReservas();
      if (respBodegas.success) {
        setBodegas(respBodegas.data || []);
      } else {
        mostrarMensaje('error', respBodegas.message || 'Error al cargar bodegas');
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

  // ✨ NUEVO: Cargar productos disponibles por bodega + reserva
  const cargarProductosDisponibles = async (idBodega, idReserva) => {
    try {
      setCargando(true);

      const respProductos = await trasladoMaterialesAPI.obtenerProductosDisponibles(idBodega, idReserva);
      
      if (!respProductos.success) {
        setProductos([]);
        setDescripcionesProductos([]);
        mostrarMensaje('warning', respProductos.message || 'No hay productos disponibles');
        return;
      }

      if (respProductos.data && respProductos.data.length > 0) {
        const productosFormateados = respProductos.data.map(p => ({
          codigo: p.codigo_producto,
          descripcion: p.descripcion,
          unidad: p.unidad,
          stock: parseFloat(p.stock_disponible || 0)
        }));

        setProductos(productosFormateados);
        setDescripcionesProductos(productosFormateados.map(p => p.descripcion));
        mostrarMensaje('success', `Se encontraron ${productosFormateados.length} productos disponibles`);
      } else {
        setProductos([]);
        setDescripcionesProductos([]);
        mostrarMensaje('warning', 'No hay productos con stock en esta bodega/reserva');
      }

    } catch (error) {
      console.error('Error al cargar productos:', error);
      mostrarMensaje('error', 'Error al cargar los productos disponibles');
      setProductos([]);
      setDescripcionesProductos([]);
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

  // ✨ NUEVO: Manejar cambio de bodega origen
  const handleBodegaOrigenChange = (e) => {
    const idBodega = e.target.value;
    setBodegaOrigen(idBodega);
    setReservaOrigen('');
    setProductos([]);
    setDescripcionesProductos([]);
    limpiarDetalleProducto();
    
    // Cargar reservas de esta bodega
    const bodega = bodegas.find(b => b.id_bodega === parseInt(idBodega));
    setReservasOrigen(bodega?.reservas || []);
  };

  // ✨ NUEVO: Manejar cambio de bodega destino
  const handleBodegaDestinoChange = (e) => {
    const idBodega = e.target.value;
    setBodegaDestino(idBodega);
    setReservaDestino('');
    
    // Cargar reservas de esta bodega
    const bodega = bodegas.find(b => b.id_bodega === parseInt(idBodega));
    setReservasDestino(bodega?.reservas || []);
  };

  // ✨ NUEVO: Validar que destino sea diferente a origen
  const handleReservaDestinoChange = (e) => {
    const idReserva = e.target.value;
    
    // Validar que no sea igual al origen
    if (bodegaOrigen === bodegaDestino && reservaOrigen === idReserva) {
      mostrarMensaje('error', '❌ La bodega/reserva destino debe ser diferente al origen');
      setReservaDestino('');
      return;
    }
    
    setReservaDestino(idReserva);
  };

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
    setConfirmModal({
      title: '¿Limpiar formulario?',
      message: '¿Está seguro que desea limpiar el formulario? Se perderán todos los datos ingresados.',
      type: 'warning',
      onConfirm: () => {
        setBodegaOrigen('');              // ✨ NUEVO
        setReservaOrigen('');
        setBodegaDestino('');             // ✨ NUEVO
        setReservaDestino('');
        setReservasOrigen([]);            // ✨ NUEVO
        setReservasDestino([]);           // ✨ NUEVO
        setFechaTraslado(obtenerFechaLocal());
        setObservacionesGenerales('');
        setProductosATraslador([]);
        limpiarDetalleProducto();
        setDescripcionSeleccionada('');
        setBusquedaProducto('');
        setDropdownAbiertoProducto(false);
        mostrarMensaje('info', 'ℹ️ Formulario limpiado');
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleGuardarYGenerarPDF = async () => {
    // Validaciones
    if (!bodegaOrigen) {
      mostrarMensaje('error', '❌ Debe seleccionar una bodega de origen');
      return;
    }

    if (!reservaOrigen) {
      mostrarMensaje('error', '❌ Debe seleccionar una reserva de origen');
      return;
    }

    if (!bodegaDestino) {
      mostrarMensaje('error', '❌ Debe seleccionar una bodega de destino');
      return;
    }

    if (!reservaDestino) {
      mostrarMensaje('error', '❌ Debe seleccionar una reserva de destino');
      return;
    }

    // ✨ Validar que origen y destino sean diferentes
    if (bodegaOrigen === bodegaDestino && reservaOrigen === reservaDestino) {
      mostrarMensaje('error', '❌ La bodega/reserva de origen y destino deben ser diferentes');
      return;
    }

    if (productosATraslador.length === 0) {
      mostrarMensaje('error', '❌ Debe agregar al menos un producto');
      return;
    }

    try {
      setCargando(true);

      // ✨ NUEVO: Preparar datos con bodegas + reservas
      const datosTraslado = {
        numero_traslado: numeroTraslado,
        id_bodega_origen: parseInt(bodegaOrigen),
        id_reserva_origen: parseInt(reservaOrigen),
        id_bodega_destino: parseInt(bodegaDestino),
        id_reserva_destino: parseInt(reservaDestino),
        fecha_traslado: fechaTraslado,
        usuario: localStorage.getItem('userName') || 'Usuario',
        observaciones: observacionesGenerales || '',
        productos: productosATraslador.map(p => ({
          codigo_producto: p.codigo,
          cantidad: parseFloat(p.cantidad),
          observaciones: p.observaciones || ''
        }))
      };

      // ✨ NUEVO: Llamar al nuevo endpoint para traslados entre bodegas
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
            
            {/* ✨ NUEVO: Bodega Origen */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                🏢 Bodega Origen *
              </label>
              <select
                className="traslado-form-select"
                value={bodegaOrigen}
                onChange={handleBodegaOrigenChange}
                disabled={cargando}
              >
                <option value="">-- Seleccione bodega origen --</option>
                {bodegas.map((bodega) => (
                  <option key={`bodega-origen-${bodega.id_bodega}`} value={bodega.id_bodega}>
                    {bodega.nombre_bodega} {bodega.ubicacion && `- ${bodega.ubicacion}`}
                  </option>
                ))}
              </select>
            </div>

            {/* ✨ NUEVO: Reserva Origen */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                � Reserva Origen *
              </label>
              <select
                className="traslado-form-select"
                value={reservaOrigen}
                onChange={(e) => setReservaOrigen(e.target.value)}
                disabled={!bodegaOrigen || cargando}
              >
                <option value="">-- Seleccione reserva origen --</option>
                {reservasOrigen.map((reserva) => (
                  <option key={`reserva-origen-${reserva.id_reserva}`} value={reserva.id_reserva}>
                    {reserva.tipo_reserva}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="traslado-form-row" style={{ marginTop: '15px' }}>
            
            {/* ✨ NUEVO: Bodega Destino */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                � Bodega Destino *
              </label>
              <select
                className="traslado-form-select"
                value={bodegaDestino}
                onChange={handleBodegaDestinoChange}
                disabled={cargando}
              >
                <option value="">-- Seleccione bodega destino --</option>
                {bodegas.map((bodega) => (
                  <option key={`bodega-destino-${bodega.id_bodega}`} value={bodega.id_bodega}>
                    {bodega.nombre_bodega} {bodega.ubicacion && `- ${bodega.ubicacion}`}
                  </option>
                ))}
              </select>
            </div>
            
            {/* ✨ NUEVO: Reserva Destino */}
            <div className="traslado-form-group">
              <label className="traslado-form-label">
                🎯 Reserva Destino *
              </label>
              <select
                className="traslado-form-select"
                value={reservaDestino}
                onChange={handleReservaDestinoChange}
                disabled={!bodegaDestino || cargando}
              >
                <option value="">-- Seleccione reserva destino --</option>
                {reservasDestino.map((reserva) => (
                  <option key={`reserva-destino-${reserva.id_reserva}`} value={reserva.id_reserva}>
                    {reserva.tipo_reserva}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="traslado-form-row" style={{ marginTop: '15px' }}>

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
        <div className="traslado-card-header" style={{ background: 'linear-gradient(135deg, #64B2FC 0%, #3A7FE8 50%, #1846DD 100%)' }}>
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
        <div className="traslado-card-header" style={{ background: 'linear-gradient(135deg, #64B2FC 0%, #3A7FE8 50%, #1846DD 100%)' }}>
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
        <div className="traslado-card-header" style={{ background: 'linear-gradient(135deg, #64B2FC 0%, #3A7FE8 50%, #1846DD 100%)' }}>
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

      {/* Modal de Confirmación */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          confirmText="Sí, limpiar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default TrasladoMateriales;
