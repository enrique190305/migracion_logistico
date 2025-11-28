import React, { useState, useEffect, useCallback, useRef } from 'react';
import './OrdenesCompraServicio.css';
import * as API from '../../services/ordenesAPI';
import Notificacion from './Notificacion';
import Confirmacion from './Confirmacion';

const OrdenesCompraServicio = () => {
  // Estados para datos de catálogos (se llenan desde la API)
  const [ordenesPedidoPendientes, setOrdenesPedidoPendientes] = useState([]);
  const [empresas, setEmpresas] = useState([]); // NECESARIO para selección manual
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]); // NECESARIO para "AÑADIR PRODUCTOS"
  const [monedas, setMonedas] = useState([]);
  
  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para notificaciones personalizadas
  const [notificacion, setNotificacion] = useState(null);
  
  // Estado para confirmaciones personalizadas
  const [confirmacion, setConfirmacion] = useState(null);
  
  // Estados principales del formulario (DECLARADOS ANTES DE useEffect)
  const [tipoOrden, setTipoOrden] = useState('compra');
  const [productosAgregados, setProductosAgregados] = useState([]);
  
  // Estados para Información de Orden de Pedido
  const [idOrdenPedido, setIdOrdenPedido] = useState('');
  const [ordenPedidoSeleccionada, setOrdenPedidoSeleccionada] = useState(null);
  const [bodegaOrdenPedido, setBodegaOrdenPedido] = useState(''); // Bodega de la OP
  const [bodegaUbicacion, setBodegaUbicacion] = useState(''); // Ubicación de la bodega
  
  // Estados para Información de Empresa (readonly cuando hay orden de pedido, editable si no)
  const [razonSocial, setRazonSocial] = useState('');
  const [idEmpresa, setIdEmpresa] = useState(''); // ID de empresa cuando se selecciona manualmente
  const [proyectoAlmacen, setProyectoAlmacen] = useState('');
  const [correlativo, setCorrelativo] = useState('');
  const obtenerFechaLocal = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [fecha, setFecha] = useState(obtenerFechaLocal());
  
  // Estados para Información de Proveedor
  const [proveedor, setProveedor] = useState('');
  const [moneda, setMoneda] = useState('');
  const [infoProveedor, setInfoProveedor] = useState(''); // Información adicional del proveedor
  const [showModalProveedor, setShowModalProveedor] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  
  // Estados para Detalles del Servicio
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [latitudDestino, setLatitudDestino] = useState('');
  const [longitudDestino, setLongitudDestino] = useState('');
  const [fechaRequerida, setFechaRequerida] = useState(obtenerFechaLocal());
  const [destino, setDestino] = useState('');
  
  // Estados para AÑADIR PRODUCTOS manualmente
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [subtotal, setSubtotal] = useState('0.00');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false);
  
  // Estado para detectar compra directa
  const [esCompraDirecta, setEsCompraDirecta] = useState(false);
  
  // ============ useEffect HOOKS (DESPUÉS DE TODAS LAS DECLARACIONES) ============
  
  // Cargar datos iniciales desde la API
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar todos los datos en paralelo
        const [
          ordenesPedidoData,
          empresasData,
          proveedoresData,
          productosData,
          monedasData,
        ] = await Promise.all([
          API.obtenerOrdenesPedidoPendientes(),
          API.obtenerEmpresas(),
          API.obtenerProveedores(),
          API.obtenerProductos(),
          API.obtenerMonedas(),
        ]);
        
        setOrdenesPedidoPendientes(ordenesPedidoData);
        setEmpresas(empresasData);
        setProveedores(proveedoresData);
        setProductos(productosData);
        setMonedas(monedasData);
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, verifique que el servidor Laravel esté ejecutándose.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);
  
  // Cargar correlativo cuando cambia el tipo de orden
  useEffect(() => {
    const cargarCorrelativo = async () => {
      try {
        if (tipoOrden === 'compra') {
          const data = await API.obtenerSiguienteCorrelativoOC();
          setCorrelativo(data.correlativo);
        } else {
          const data = await API.obtenerSiguienteCorrelativoOS();
          setCorrelativo(data.correlativo);
        }
      } catch (err) {
        console.error('Error al cargar correlativo:', err);
      }
    };
    
    cargarCorrelativo();
  }, [tipoOrden]);
  
  // Calcular totales (DEBE estar ANTES del useEffect que lo usa)
  const calcularTotales = useCallback(() => {
    const subtotalGeneral = productosAgregados.reduce((acc, prod) => acc + parseFloat(prod.total || 0), 0);
    const igv = subtotalGeneral * 0.18;
    const total = subtotalGeneral + igv;
    return { subtotalGeneral, igv, total };
  }, [productosAgregados]);
  
  // Detectar si es compra directa basado en el total Y si tiene orden de pedido
  useEffect(() => {
    const { total } = calcularTotales();
    // Solo es compra directa si tiene orden de pedido vinculada Y el total <= 500
    setEsCompraDirecta(total > 0 && total <= 500 && idOrdenPedido !== '');
  }, [calcularTotales, idOrdenPedido]); // Incluye idOrdenPedido como dependencia
  
  // Calcular subtotal cuando cambian precio o cantidad (para AÑADIR PRODUCTOS)
  useEffect(() => {
    const precio = parseFloat(precioUnitario) || 0;
    const cant = parseFloat(cantidad) || 0;
    setSubtotal((precio * cant).toFixed(2));
  }, [precioUnitario, cantidad]);
  
  // Cerrar lista de productos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el clic fue en el input o en el dropdown
      const clickedInput = event.target.closest('input[placeholder="Seleccione producto..."]');
      const clickedDropdown = event.target.closest('.productos-dropdown');
      
      if (mostrarListaProductos && !clickedInput && !clickedDropdown) {
        setMostrarListaProductos(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mostrarListaProductos]);
  
  // Sincronizar busquedaProducto con descripcion seleccionada
  useEffect(() => {
    if (descripcion && !busquedaProducto) {
      setBusquedaProducto(descripcion);
    }
  }, [descripcion, busquedaProducto]);
  
  // ============ FUNCIONES HELPER ============
  
  /**
   * Mostrar notificación personalizada
   */
  const mostrarNotificacion = (tipo, titulo, mensaje, detalles = [], onAction = null, actionLabel = null) => {
    setNotificacion({
      tipo,
      titulo,
      mensaje,
      detalles,
      onAction,
      actionLabel
    });
  };

  /**
   * Cerrar notificación
   */
  const cerrarNotificacion = () => {
    setNotificacion(null);
  };
  
  /**
   * Mostrar confirmación personalizada
   */
  const mostrarConfirmacion = (tipo, titulo, mensaje, detalles, onConfirm) => {
    setConfirmacion({
      tipo,
      titulo,
      mensaje,
      detalles,
      onConfirm
    });
  };
  
  /**
   * Cerrar confirmación
   */
  const cerrarConfirmacion = () => {
    setConfirmacion(null);
  };
  
  /**
   * Obtener el símbolo de moneda según el ID de moneda seleccionado
   */
  const obtenerSimboloMoneda = () => {
    if (!moneda) return 'S/'; // Por defecto SOLES
    
    const monedaSeleccionada = monedas.find(m => m.id === parseInt(moneda));
    return monedaSeleccionada?.simbolo || 'S/';
  };
  
  // ============ MANEJADORES DE EVENTOS ============
  
  // Manejar selección de Orden de Pedido
  const handleOrdenPedidoChange = async (ordenPedidoId) => {
    setIdOrdenPedido(ordenPedidoId);
    
    if (!ordenPedidoId) {
      // Limpiar todo si se deselecciona
      setOrdenPedidoSeleccionada(null);
      setRazonSocial('');
      setIdEmpresa('');
      setProyectoAlmacen('');
      setBodegaOrdenPedido('');
      setBodegaUbicacion('');
      setProductosAgregados([]);
      return;
    }
    
    try {
      // Obtener detalles de la orden de pedido seleccionada
      const ordenData = await API.obtenerOrdenPedido(ordenPedidoId);
      
      setOrdenPedidoSeleccionada(ordenData);
      
      // Auto-completar Razón Social (readonly)
      setRazonSocial(ordenData.razon_social || 'N/A');
      setIdEmpresa(ordenData.id_empresa);
      
      // Auto-completar Bodega (NUEVO)
      if (ordenData.bodega_nombre) {
        setBodegaOrdenPedido(ordenData.bodega_nombre);
        setBodegaUbicacion(ordenData.bodega_ubicacion || '');
      } else {
        setBodegaOrdenPedido('N/A');
        setBodegaUbicacion('');
      }
      
      // Auto-completar Proyecto/Almacén (readonly) - Mantener por compatibilidad
      if (ordenData.proyecto_nombre && ordenData.proyecto_bodega) {
        const proyectoTexto = `${ordenData.proyecto_nombre} - ${ordenData.proyecto_bodega}`;
        setProyectoAlmacen(proyectoTexto);
      } else {
        setProyectoAlmacen('N/A');
      }
      
      // Cargar productos SIN PRECIOS desde los detalles de la orden de pedido
      const productosDesdeOrden = ordenData.detalles?.map((detalle, index) => ({
        id: Date.now() + index,
        codigo: detalle.codigo_producto || 'N/A',
        descripcion: detalle.descripcion || 'Sin descripción',
        cantidad: parseFloat(detalle.cantidad_solicitada) || 0,
        unidad: detalle.unidad_medida || 'UND',
        precioUnitario: 0, // SIN PRECIO - el usuario debe ingresarlo
        subtotal: 0,
        total: 0,
        editable: true // Marcar como editable para que el usuario pueda modificar precio
      })) || [];
      
      setProductosAgregados(productosDesdeOrden);
      
    } catch (err) {
      console.error('Error al cargar orden de pedido:', err);
      mostrarNotificacion(
        'error',
        'Error al Cargar Orden de Pedido',
        'No se pudieron obtener los detalles de la orden de pedido seleccionada.',
        [
          { label: 'Error', valor: err.message || 'Error desconocido' }
        ]
      );
      setIdOrdenPedido('');
    }
  };
  
  // Manejar selección manual de empresa (cuando NO hay orden de pedido)
  const handleEmpresaChange = (empresaId) => {
    setIdEmpresa(empresaId);
    
    if (empresaId) {
      const empresaSeleccionada = empresas.find(e => e.id === parseInt(empresaId));
      if (empresaSeleccionada) {
        setRazonSocial(empresaSeleccionada.razonSocial);
      }
    } else {
      setRazonSocial('');
    }
  };
  
  // Actualizar precio unitario de un producto agregado
  const handleActualizarPrecio = (id, nuevoPrecio) => {
    setProductosAgregados(prevProductos => 
      prevProductos.map(prod => {
        if (prod.id === id) {
          const precio = parseFloat(nuevoPrecio) || 0;
          const cantidad = parseFloat(prod.cantidad) || 0;
          const subtotal = precio * cantidad;
          return {
            ...prod,
            precioUnitario: precio,
            subtotal: subtotal,
            total: subtotal
          };
        }
        return prod;
      })
    );
  };
  
  const handleEliminarProducto = (id) => {
    setProductosAgregados(productosAgregados.filter(prod => prod.id !== id));
  };
  
  // Manejar cambio de proveedor y cargar detalles
  const handleProveedorChange = async (proveedorId) => {
    setProveedor(proveedorId);
    
    if (proveedorId) {
      try {
        const detalleProveedor = await API.obtenerDetalleProveedor(proveedorId);
        
        // Guardar el proveedor seleccionado completo
        setProveedorSeleccionado(detalleProveedor);
        
        // Construir la información del proveedor
        const info = `RUC: ${detalleProveedor.ruc || 'N/A'}
Dirección: ${detalleProveedor.direccion || 'N/A'}
Contacto: ${detalleProveedor.contacto || 'N/A'}
Celular: ${detalleProveedor.celular || 'N/A'}
Correo: ${detalleProveedor.correo || 'N/A'}
Forma de pago: ${detalleProveedor.formaPago || 'N/A'}`;
        
        setInfoProveedor(info);
      } catch (err) {
        console.error('Error al obtener detalle del proveedor:', err);
        setInfoProveedor('');
        setProveedorSeleccionado(null);
      }
    } else {
      setInfoProveedor('');
      setProveedorSeleccionado(null);
    }
  };
  
  // Manejar cambio de descripción del producto (para AÑADIR PRODUCTOS)
  const handleDescripcionChange = (descripcionSeleccionada) => {
    setDescripcion(descripcionSeleccionada);
    
    if (descripcionSeleccionada) {
      // Buscar el producto en el array de productos
      const productoEncontrado = productos.find(p => p.descripcion === descripcionSeleccionada);
      
      if (productoEncontrado) {
        setCodigo(productoEncontrado.codigo);
        setUnidadMedida(productoEncontrado.unidad);
      }
    } else {
      // Limpiar campos si no hay descripción seleccionada
      setCodigo('');
      setUnidadMedida('');
    }
  };
  
  // Insertar producto manualmente (AÑADIR PRODUCTOS)
  const handleInsertarProducto = () => {
    if (!descripcion || !cantidad || !precioUnitario) {
      mostrarNotificacion(
        'warning',
        'Campos Incompletos',
        'Por favor complete todos los campos requeridos para agregar el producto.',
        [
          { label: 'Descripción', valor: descripcion || '❌ Falta completar' },
          { label: 'Cantidad', valor: cantidad || '❌ Falta completar' },
          { label: 'Precio Unitario', valor: precioUnitario || '❌ Falta completar' }
        ]
      );
      return;
    }
    
    const nuevoProducto = {
      id: Date.now(),
      codigo,
      descripcion,
      cantidad: parseFloat(cantidad),
      unidad: unidadMedida,
      precioUnitario: parseFloat(precioUnitario),
      subtotal: parseFloat(subtotal),
      total: parseFloat(subtotal),
      esManual: true // Marcar que fue agregado manualmente
    };
    
    setProductosAgregados([...productosAgregados, nuevoProducto]);
    
    // Limpiar campos
    setDescripcion('');
    setCodigo('');
    setPrecioUnitario('');
    setUnidadMedida('');
    setCantidad('');
    setSubtotal('0.00');
  };
  

  
  const handleGuardar = async () => {
    // Validación básica
    if (!proveedor || !moneda) {
      mostrarNotificacion(
        'warning',
        'Campos Requeridos',
        'Debe completar los campos de proveedor y moneda antes de guardar.',
        [
          { label: 'Proveedor', valor: proveedor ? '✓ Seleccionado' : '❌ No seleccionado' },
          { label: 'Moneda', valor: moneda ? '✓ Seleccionada' : '❌ No seleccionada' }
        ]
      );
      return;
    }
    
    // Validar que haya empresa seleccionada (ya sea por orden de pedido o manualmente)
    if (!idOrdenPedido && !idEmpresa) {
      mostrarNotificacion(
        'warning',
        'Empresa No Seleccionada',
        'Debe seleccionar una empresa antes de guardar la orden.',
        [
          { label: 'Orden de Pedido', valor: idOrdenPedido || '❌ No vinculada' },
          { label: 'Empresa Manual', valor: idEmpresa || '❌ No seleccionada' }
        ]
      );
      return;
    }
    
    if (productosAgregados.length === 0) {
      mostrarNotificacion(
        'warning',
        'Sin Productos',
        'No hay productos agregados a la orden. Debe agregar al menos un producto.',
        []
      );
      return;
    }
    
    // Validación: Todos los productos deben tener precio
    const productosSinPrecio = productosAgregados.filter(prod => !prod.precioUnitario || prod.precioUnitario <= 0);
    if (productosSinPrecio.length > 0) {
      mostrarNotificacion(
        'error',
        'Productos Sin Precio',
        'Todos los productos deben tener un precio unitario válido antes de guardar.',
        [
          { label: 'Total de productos', valor: productosAgregados.length },
          { label: 'Productos sin precio', valor: productosSinPrecio.length },
          { label: 'Acción requerida', valor: 'Ingrese precios para todos los productos' }
        ]
      );
      return;
    }
    
    const { total: totalCalculado } = calcularTotales();
    const simboloMoneda = obtenerSimboloMoneda();
    
    // Detectar si el total es menor a 500
    if (totalCalculado < 500) {
      // Mostrar notificación indicando que debe ir a Ingreso Directo
      mostrarNotificacion(
        'warning',
        '⚠️ MONTO INSUFICIENTE PARA OC/OS',
        `El total de ${simboloMoneda} ${totalCalculado.toFixed(2)} es menor a ${simboloMoneda} 500.00. No se puede generar una Orden de Compra o Servicio con este monto.`,
        [
          { label: '💵 Total actual', valor: `${simboloMoneda} ${totalCalculado.toFixed(2)}` },
          { label: '� Mínimo requerido', valor: `${simboloMoneda} 500.00` },
          { label: '📍 Solución', valor: 'Ingreso Directo de Materiales' },
          { label: '✅ Acción', valor: 'Ir a: Gestión de Materiales > Ingreso de Materiales > Nuevo Ingreso Directo' }
        ],
        () => {
          // Botón de acción: Redirigir a Ingreso de Materiales con tab 'directo'
          cerrarNotificacion();
          // Disparar evento para cambiar de módulo y abrir directamente el tab de Ingreso Directo
          window.dispatchEvent(new CustomEvent('cambiarModulo', { 
            detail: { 
              modulo: 'ingreso-materiales',
              tab: 'directo'
            }
          }));
        },
        'Ir a Ingreso Directo'
      );
      return;
    } else if (idOrdenPedido && totalCalculado >= 500 && totalCalculado <= 600) {
      // Opcional: Advertencia para montos entre 500-600 (cerca del límite)
      mostrarConfirmacion(
        'info',
        'MONTO CERCANO AL LÍMITE',
        `El total es ${simboloMoneda} ${totalCalculado.toFixed(2)}. Está cerca del límite mínimo de ${simboloMoneda} 500.00 para OC/OS.`,
        [
          { label: '� Total', valor: `${simboloMoneda} ${totalCalculado.toFixed(2)}` },
          { label: '📋 Orden de Pedido', valor: ordenPedidoSeleccionada?.correlativo || '' },
          { label: '✅ Estado', valor: 'Monto válido para OC/OS' }
        ],
        () => {
          cerrarConfirmacion();
          procesarGuardadoOrden();
        }
      );
      return;
    } else {
      // Confirmación normal para OC/OS
      const tipoMensaje = idOrdenPedido 
        ? `vinculada a la Orden de Pedido ${ordenPedidoSeleccionada?.correlativo}` 
        : 'sin vincular a Orden de Pedido';
        
      mostrarConfirmacion(
        'info',
        `📋 ${tipoOrden === 'compra' ? 'ORDEN DE COMPRA' : 'ORDEN DE SERVICIO'}`,
        `Se generará una ${tipoOrden === 'compra' ? 'Orden de Compra' : 'Orden de Servicio'} ${tipoMensaje}.`,
        [
          { label: '💵 Total', valor: `${simboloMoneda} ${totalCalculado.toFixed(2)}` },
          { label: '📋 Correlativo', valor: correlativo },
          { label: '🏢 Empresa', valor: razonSocial || 'No especificada' },
          { label: '👤 Proveedor', valor: proveedores.find(p => p.id === parseInt(proveedor))?.nombre || '' },
          { label: '📦 Productos/Servicios', valor: productosAgregados.length }
        ],
        () => {
          cerrarConfirmacion();
          procesarGuardadoOrden();
        }
      );
      return;
    }
  };
  
  /**
   * Procesar el guardado de la orden (se ejecuta después de confirmar)
   */
  const procesarGuardadoOrden = async () => {
    setGuardando(true);
    
    try {
      let response;
      
      // Determinar el ID de empresa a usar
      const empresaId = idOrdenPedido ? ordenPedidoSeleccionada?.id_empresa : parseInt(idEmpresa);
      
      if (tipoOrden === 'compra') {
        // Preparar datos para Orden de Compra
        const ordenData = {
          correlativo,
          id_empresa: empresaId,
          id_proveedor: parseInt(proveedor),
          id_moneda: parseInt(moneda),
          fecha_oc: fecha,
          fecha_requerida: fechaRequerida,
          igv: parseFloat(igv.toFixed(2)),
          total_general: parseFloat(total.toFixed(2)),
          detalles: productosAgregados.map(prod => ({
            codigo_producto: prod.codigo,
            cantidad: parseInt(prod.cantidad),
            precio_unitario: parseFloat(prod.precioUnitario),
            subtotal: parseFloat(prod.subtotal),
            total: parseFloat(prod.total)
          }))
        };
        
        // Solo agregar id_orden_pedido si existe
        if (idOrdenPedido) {
          ordenData.id_orden_pedido = parseInt(idOrdenPedido);
        }
        
        response = await API.guardarOrdenCompra(ordenData);
      } else {
        // Preparar datos para Orden de Servicio
        const ordenData = {
          correlativo,
          id_empresa: empresaId,
          id_proveedor: parseInt(proveedor),
          id_moneda: parseInt(moneda),
          fecha_servicio: fecha,
          fecha_requerida: fechaRequerida,
          contacto: null,
          celular: null,
          correo: null,
          destino,
          latitud,
          longitud,
          latitud_destino: latitudDestino,
          longitud_destino: longitudDestino,
          igv: parseFloat(igv.toFixed(2)),
          total_general: parseFloat(total.toFixed(2)),
          detalles: productosAgregados.map(serv => ({
            codigo_servicio: serv.codigo,
            descripcion: serv.descripcion,
            cantidad: parseInt(serv.cantidad),
            unidad: serv.unidad,
            precio_unitario: parseFloat(serv.precioUnitario),
            subtotal: parseFloat(serv.subtotal),
            total: parseFloat(serv.total)
          }))
        };
        
        // Solo agregar id_orden_pedido si existe
        if (idOrdenPedido) {
          ordenData.id_orden_pedido = parseInt(idOrdenPedido);
        }
        
        response = await API.guardarOrdenServicio(ordenData);
      }
      
      // Obtener símbolo de moneda para los mensajes
      const simboloMoneda = obtenerSimboloMoneda();
      
      // Mostrar mensaje según el tipo de respuesta
      if (response.tipo === 'COMPRA_DIRECTA') {
        mostrarNotificacion(
          'success',
          '✓ Compra Directa Procesada',
          'Los productos han sido registrados exitosamente en el Kardex.',
          [
            { label: '📦 Productos registrados', valor: response.productos_registrados || productosAgregados.length },
            { label: '🏢 Proyecto', valor: response.proyecto || 'Sin proyecto' },
            { label: '📄 Documento', valor: response.documento || correlativo },
            { label: '💵 Total', valor: `${simboloMoneda} ${response.total}` },
            { label: '📋 Estado OP', valor: 'COMPLETADO' },
            { label: 'ℹ️ Nota', valor: 'Montos ≤ S/ 500 van directo al Kardex' }
          ]
        );
      } else {
        // Descargar PDF automáticamente cuando se guarda OC/OS
        try {
          if (tipoOrden === 'compra' && response.id) {
            console.log('📄 Descargando PDF de Orden de Compra...');
            await API.descargarPDFOrdenCompra(response.id);
          } else if (tipoOrden === 'servicio' && response.id) {
            console.log('📄 Descargando PDF de Orden de Servicio...');
            await API.descargarPDFOrdenServicio(response.id);
          }
        } catch (pdfError) {
          console.error('Error al descargar PDF:', pdfError);
          // No interrumpir el flujo si falla el PDF
        }
        
        mostrarNotificacion(
          'success',
          '✓ Orden Guardada Exitosamente',
          response.mensaje || 'La orden se ha creado correctamente.',
          [
            { label: '📋 Correlativo', valor: response.correlativo },
            { label: '💵 Total', valor: `${simboloMoneda} ${response.total}` },
            { label: '📦 Tipo', valor: tipoOrden === 'compra' ? 'Orden de Compra' : 'Orden de Servicio' },
            { label: '📄 PDF', valor: 'Descargado automáticamente' },
            ...(response.estado_compra ? [{ label: '🔄 Estado OP', valor: response.estado_compra }] : [])
          ]
        );
      }
      
      // Limpiar formulario después de guardar
      setIdOrdenPedido('');
      setOrdenPedidoSeleccionada(null);
      setProductosAgregados([]);
      setRazonSocial('');
      setIdEmpresa('');
      setProyectoAlmacen('');
      setProveedor('');
      setMoneda('');
      setInfoProveedor('');
      setDestino('');
      setLatitud('');
      setLongitud('');
      setLatitudDestino('');
      setLongitudDestino('');
      
      // Recargar correlativo
      if (tipoOrden === 'compra') {
        const data = await API.obtenerSiguienteCorrelativoOC();
        setCorrelativo(data.correlativo);
      } else {
        const data = await API.obtenerSiguienteCorrelativoOS();
        setCorrelativo(data.correlativo);
      }
      
      // Recargar órdenes de pedido pendientes
      const ordenesPedidoData = await API.obtenerOrdenesPedidoPendientes();
      setOrdenesPedidoPendientes(ordenesPedidoData);
      
    } catch (err) {
      console.error('Error al guardar orden:', err);
      mostrarNotificacion(
        'error',
        'Error al Guardar Orden',
        'Ocurrió un error al intentar guardar la orden. Por favor intente nuevamente.',
        [
          { label: '❌ Error', valor: err.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Verifique los datos e intente de nuevo' }
        ]
      );
    } finally {
      setGuardando(false);
    }
  };
  
  // Mostrar mensaje de carga
  if (loading) {
    return (
      <div className="ordenes-compra-servicio-container" style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div className="ordenes-header" style={{
          background: 'linear-gradient(135deg, #64B2FC 0%, #3A7FE8 50%, #1846DD 100%)',
          padding: '25px 40px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '5px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: 'white',
            margin: '0',
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>Órdenes de Compra/Servicio</h1>
          <p style={{
            color: 'white',
            margin: '0',
            fontSize: '14px',
            opacity: '0.9',
            fontWeight: '400'
          }}>Gestión y administración</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>
          <div style={{ marginBottom: '20px' }}>⏳ Cargando datos...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Por favor espere mientras se cargan las órdenes de pedido pendientes
          </div>
        </div>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="ordenes-compra-servicio-container" style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div className="ordenes-header" style={{
          background: 'linear-gradient(135deg, #64B2FC 0%, #3A7FE8 50%, #1846DD 100%)',
          padding: '25px 40px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '5px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: 'white',
            margin: '0',
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>Órdenes de Compra/Servicio</h1>
          <p style={{
            color: 'white',
            margin: '0',
            fontSize: '14px',
            opacity: '0.9',
            fontWeight: '400'
          }}>Gestión y administración</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ color: '#e74c3c', fontSize: '18px', marginBottom: '20px' }}>
            ❌ {error}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Asegúrese de que:
            <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '10px' }}>
              <li>El servidor Laravel está ejecutándose (php artisan serve)</li>
              <li>La URL de la API es correcta (http://localhost:8000)</li>
              <li>CORS está configurado correctamente</li>
              <li>Las migraciones de base de datos se ejecutaron correctamente</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Ejecutar calcularTotales para obtener los valores
  const { subtotalGeneral, igv, total } = calcularTotales();

  return (
    <div className="ordenes-compra-servicio-container" style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="ordenes-header" style={{
        background: 'linear-gradient(135deg, #64B2FC 0%, #3A7FE8 50%, #1846DD 100%)',
        padding: '25px 40px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '5px',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: 'white',
          margin: '0',
          fontSize: '28px',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>Órdenes de Compra/Servicio</h1>
        <p style={{
          color: 'white',
          margin: '0',
          fontSize: '14px',
          opacity: '0.9',
          fontWeight: '400'
        }}>Gestión y administración</p>
      </div>
      
      <div className="ordenes-content" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* NUEVA SECCIÓN: Selección de Orden de Pedido */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div className="ordenes-card orden-pedido-card" style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, #60ABFA 0%, #1643DC 100%)',
              padding: '15px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span className="card-icon" style={{ fontSize: '24px', color: 'white' }}>📋</span>
              <h3 style={{
                color: 'white',
                margin: '0',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>ORDEN DE PEDIDO</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: '1' }}>
                  <label>Orden de Pedido (Pendientes):</label>
                  <select 
                    value={idOrdenPedido} 
                    onChange={(e) => handleOrdenPedidoChange(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccione una orden de pedido...</option>
                    {ordenesPedidoPendientes.map(orden => (
                      <option key={orden.id_orden_pedido} value={orden.id_orden_pedido}>
                        {orden.correlativo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {ordenesPedidoPendientes.length === 0 && (
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#fff3cd', 
                  borderLeft: '4px solid #ffc107',
                  marginTop: '10px',
                  borderRadius: '5px'
                }}>
                  <strong>⚠️ No hay Órdenes de Pedido pendientes</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    Debe crear una Orden de Pedido con estado "PENDIENTE" antes de generar OC/OS.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NUEVA SECCIÓN: Información de Bodega de la Orden de Pedido */}
          {idOrdenPedido && bodegaOrdenPedido && (
            <div className="ordenes-card" style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <div className="card-header" style={{
                background: 'linear-gradient(135deg, #60ABFA 0%, #1643DC 100%)',
                padding: '15px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span className="card-icon" style={{ fontSize: '24px', color: 'white' }}>🏪</span>
                <h3 style={{
                  color: 'white',
                  margin: '0',
                  fontSize: '16px',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>BODEGA DE LA ORDEN</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#333',
                    marginBottom: '8px',
                    display: 'block'
                  }}>Bodega:</label>
                  <div style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1643DC'
                  }}>
                    {bodegaOrdenPedido}
                  </div>
                </div>
                
                {bodegaUbicacion && (
                  <div>
                    <label style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#333',
                      marginBottom: '8px',
                      display: 'block'
                    }}>Ubicación:</label>
                    <div style={{
                      padding: '10px',
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      📍 {bodegaUbicacion}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Sección Superior: Información de Empresa y Proveedor */}
        <div className="ordenes-grid-top" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Información de Empresa (READONLY si hay orden pedido, EDITABLE si no) */}
          <div className="ordenes-card" style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, #60ABFA 0%, #1643DC 100%)',
              padding: '15px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span className="card-icon" style={{ fontSize: '24px', color: 'white' }}>🏢</span>
              <h3 style={{
                color: 'white',
                margin: '0',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>INFORMACIÓN DE EMPRESA</h3>
              <span style={{
                marginLeft: 'auto',
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontWeight: '500'
              }}>🔒 Solo lectura</span>
            </div>
            <div className="card-body" style={{ padding: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Razón Social:</label>
                  <input 
                    type="text"
                    value={razonSocial} 
                    readOnly
                    className="form-input"
                    placeholder="Se autorellena desde Orden de Pedido"
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#495057' }}
                    title="Este campo se autorellena y no puede ser modificado"
                  />
                </div>
                <div className="form-group form-group-small">
                  <label>Correlativo:</label>
                  <input 
                    type="text" 
                    value={correlativo}
                    readOnly
                    className="form-input"
                    placeholder="Auto"
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#495057' }}
                    title="Este campo se autorellena automáticamente"
                  />
                </div>
              </div>
              <div className="form-row">
                {idOrdenPedido && (
                  <div className="form-group">
                    <label>Proyecto / Almacén:</label>
                    <input 
                      type="text"
                      value={proyectoAlmacen} 
                      readOnly
                      className="form-input"
                      placeholder="Seleccione una orden de pedido..."
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#495057' }}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Fecha:</label>
                  <input 
                    type="date" 
                    value={fecha}
                    readOnly
                    className="form-input"
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#495057' }}
                    title="La fecha se establece automáticamente al momento de la creación"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Información de Proveedor */}
          <div className="ordenes-card" style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, #60ABFA 0%, #1643DC 100%)',
              padding: '15px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
            <span className="card-icon" style={{ fontSize: '24px', color: 'white' }}>📦</span>
              <h3 style={{
                color: 'white',
                margin: '0',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>INFORMACIÓN DE PROVEEDOR</h3>
            </div>
            <div className="card-body" style={{ padding: '20px' }}>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Proveedor:</label>
                  <select 
                    value={proveedor} 
                    onChange={(e) => handleProveedorChange(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccione...</option>
                    {proveedores.map(prov => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Moneda:</label>
                  <select 
                    value={moneda} 
                    onChange={(e) => setMoneda(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccione...</option>
                    {monedas.map(mon => (
                      <option key={mon.id} value={mon.id}>
                        {mon.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <button 
                    className="btn-ver-proveedor"
                    onClick={() => setShowModalProveedor(true)}
                    disabled={!proveedor}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: proveedor ? '#60ABFA' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: proveedor ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
                    }}
                  >
                    👁️ Ver Información del Proveedor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tipo de Orden */}
        <div className="ordenes-card tipo-orden-card" style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div className="card-header" style={{
            background: 'linear-gradient(135deg, #64B2FC 0%, #3A7FE8 100%)',
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span className="card-icon" style={{ fontSize: '24px', color: 'white' }}>📋</span>
            <h3 style={{
              color: 'white',
              margin: '0',
              fontSize: '16px',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>TIPO DE ORDEN</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div className="tipo-orden-options" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              padding: '10px 0'
            }}>
              <label className={`tipo-orden-option ${tipoOrden === 'compra' ? 'active' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                padding: '40px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: tipoOrden === 'compra' ? 'linear-gradient(135deg, #60ABFA 0%, #1643DC 100%)' : 'white',
                minHeight: '100px',
                transition: 'all 0.3s ease',
                boxShadow: tipoOrden === 'compra' ? '0 4px 12px rgba(96, 171, 250, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}>
                <input 
                  type="radio" 
                  name="tipoOrden" 
                  value="compra"
                  checked={tipoOrden === 'compra'}
                  onChange={(e) => setTipoOrden(e.target.value)}
                  style={{ display: 'none' }}
                />
                <span className="option-text" style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: tipoOrden === 'compra' ? 'white' : '#4A5568',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>COMPRA</span>
              </label>
              <label className={`tipo-orden-option ${tipoOrden === 'servicio' ? 'active' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                padding: '40px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: tipoOrden === 'servicio' ? 'linear-gradient(135deg, #60ABFA 0%, #1643DC 100%)' : 'white',
                minHeight: '100px',
                transition: 'all 0.3s ease',
                boxShadow: tipoOrden === 'servicio' ? '0 4px 12px rgba(96, 171, 250, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}>
                <input 
                  type="radio" 
                  name="tipoOrden" 
                  value="servicio"
                  checked={tipoOrden === 'servicio'}
                  onChange={(e) => setTipoOrden(e.target.value)}
                  style={{ display: 'none' }}
                />
                <span className="option-text" style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: tipoOrden === 'servicio' ? 'white' : '#4A5568',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>SERVICIO</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Sección Media: Detalles del Servicio (solo si es servicio) */}
        {tipoOrden === 'servicio' && (
          <div className="ordenes-card">
            <div className="card-header">
              <span className="card-icon">🔧</span>
              <h3>DETALLES DEL SERVICIO</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Latitud Origen:</label>
                  <input 
                    type="text" 
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    className="form-input"
                    placeholder="Ej: -12.0464"
                  />
                </div>
                <div className="form-group">
                  <label>Longitud Origen:</label>
                  <input 
                    type="text" 
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                    className="form-input"
                    placeholder="Ej: -77.0428"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitud Destino:</label>
                  <input 
                    type="text" 
                    value={latitudDestino}
                    onChange={(e) => setLatitudDestino(e.target.value)}
                    className="form-input"
                    placeholder="Ej: -12.1234"
                  />
                </div>
                <div className="form-group">
                  <label>Longitud Destino:</label>
                  <input 
                    type="text" 
                    value={longitudDestino}
                    onChange={(e) => setLongitudDestino(e.target.value)}
                    className="form-input"
                    placeholder="Ej: -77.5678"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Requerida:</label>
                  <input 
                    type="date" 
                    value={fechaRequerida}
                    onChange={(e) => setFechaRequerida(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Destino:</label>
                  <input 
                    type="text" 
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="form-input"
                    placeholder="Ubicación de destino"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* NUEVA SECCIÓN: AÑADIR PRODUCTOS (para productos olvidados) */}
        <div className="ordenes-card">
          <div className="card-header">
            <span className="card-icon">➕</span>
            <h3>AÑADIR PRODUCTOS</h3>
          </div>
          <div className="card-body">
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: '#e7f3ff', 
              borderRadius: '5px',
              borderLeft: '4px solid #60ABFA'
            }}>
              <strong>💡 Nota:</strong> Use esta sección para agregar productos que no estén en la Orden de Pedido seleccionada.
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{ flex: '3' }}>
                <label>Descripción:</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setDescripcion(''); // Limpiar selección al escribir
                      setMostrarListaProductos(true);
                    }}
                    onFocus={() => setMostrarListaProductos(true)}
                    onClick={() => setMostrarListaProductos(!mostrarListaProductos)}
                    className="form-input"
                    placeholder="Seleccione producto..."
                    autoComplete="off"
                    style={{
                      width: '100%',
                      paddingRight: '30px',
                      cursor: 'pointer'
                    }}
                  />
                  <span 
                    onClick={() => setMostrarListaProductos(!mostrarListaProductos)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                  
                      color: '#666',
                      userSelect: 'none'
                    }}
                  >▼</span>
                  
                  {/* Lista desplegable con posicionamiento absoluto */}
                  {mostrarListaProductos && (
                    <div className="productos-dropdown" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '350px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '2px solid #60ABFA',
                      borderRadius: '8px',
                      zIndex: 9999,
                      boxShadow: '0 8px 32px rgba(96, 171, 250, 0.3)',
                      marginTop: '8px'
                    }}>
                      {productos
                        .filter(prod => {
                          const searchTerm = busquedaProducto.toLowerCase();
                          return prod.descripcion.toLowerCase().includes(searchTerm) ||
                                 prod.codigo.toLowerCase().includes(searchTerm);
                        })
                        .slice(0, 15)
                        .map(prod => (
                          <div
                            key={prod.codigo}
                            onClick={() => {
                              handleDescripcionChange(prod.descripcion);
                              setBusquedaProducto(prod.descripcion);
                              setMostrarListaProductos(false);
                            }}
                            style={{
                              padding: '12px 15px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#e7f3ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <strong style={{ color: '#60ABFA', fontSize: '13px' }}>
                                {prod.codigo}
                              </strong>
                              <span style={{ 
                                fontSize: '11px', 
                                color: '#999',
                                backgroundColor: '#f5f5f5',
                                padding: '2px 8px',
                                borderRadius: '10px'
                              }}>
                                {prod.unidad}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#333' }}>
                              {prod.descripcion}
                            </div>
                          </div>
                        ))
                      }
                      {productos.filter(prod => {
                        const searchTerm = busquedaProducto.toLowerCase();
                        return prod.descripcion.toLowerCase().includes(searchTerm) ||
                               prod.codigo.toLowerCase().includes(searchTerm);
                      }).length === 0 && (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center',
                          color: '#999' 
                        }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                          <div>No se encontraron productos</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Intente con otro término de búsqueda
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group" style={{ flex: '1' }}>
                <label>U. Medida:</label>
                <input 
                  type="text" 
                  value={unidadMedida}
                  readOnly
                  className="form-input"
                  placeholder="Ej: KG, UND"
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Código:</label>
                <input 
                  type="text" 
                  value={codigo}
                  readOnly
                  className="form-input"
                  placeholder="Ej: FIT-0001"
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label>Precio U.:</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(e.target.value)}
                  className="form-input"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Cantidad:</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="form-input"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group subtotal-group">
                <label>Subtotal:</label>
                <div className="subtotal-display">{obtenerSimboloMoneda()} {subtotal}</div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn-insertar" onClick={handleInsertarProducto}>
                  <span className="btn-icon">➕</span>
                  INSERTAR PRODUCTO
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabla de Productos/Servicios Agregados (CON PRECIOS EDITABLES) */}
        <div className="ordenes-card">
          <div className="card-header">
            <span className="card-icon">📊</span>
            <h3>PRODUCTOS/SERVICIOS AGREGADOS (Ingrese Precios)</h3>
          </div>
          <div className="card-body">
            <div className="tabla-productos-container">
              <table className="tabla-productos">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>DESCRIPCIÓN</th>
                    <th>CANTIDAD</th>
                    <th>UNIDAD</th>
                    <th>P. UNIT. (Editable)</th>
                    <th>SUBTOTAL</th>
                    <th>TOTAL</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {productosAgregados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="tabla-vacia">
                        Seleccione una Orden de Pedido para cargar productos
                      </td>
                    </tr>
                  ) : (
                    productosAgregados.map((producto) => (
                      <tr key={producto.id}>
                        <td>{producto.codigo}</td>
                        <td>{producto.descripcion}</td>
                        <td>{producto.cantidad}</td>
                        <td>{producto.unidad}</td>
                        <td>
                          <input 
                            type="number"
                            step="0.01"
                            value={producto.precioUnitario}
                            onChange={(e) => handleActualizarPrecio(producto.id, e.target.value)}
                            className="form-input"
                            placeholder="0.00"
                            style={{
                              width: '100px',
                              padding: '5px',
                              textAlign: 'right',
                              backgroundColor: producto.precioUnitario > 0 ? '#d4edda' : '#fff3cd'
                            }}
                          />
                        </td>
                        <td>{obtenerSimboloMoneda()} {producto.subtotal.toFixed(2)}</td>
                        <td>{obtenerSimboloMoneda()} {producto.total.toFixed(2)}</td>
                        <td>
                          <button 
                            className="btn-eliminar"
                            onClick={() => handleEliminarProducto(producto.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {productosAgregados.length > 0 && (
              <div style={{ 
                marginTop: '15px', 
                padding: '12px', 
                backgroundColor: '#e7f3ff', 
                borderRadius: '5px',
                borderLeft: '4px solid #60ABFA'
              }}>
                <strong>💡 Instrucciones:</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                  Los productos se cargaron automáticamente desde la Orden de Pedido. 
                  Por favor ingrese el <strong>Precio Unitario</strong> para cada producto.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sección Inferior: Botones y Resumen */}
        <div className="ordenes-grid-bottom">
          <div className="ordenes-actions">
            <button 
              className="btn-guardar" 
              onClick={handleGuardar}
              disabled={guardando}
              style={{
                opacity: guardando ? 0.6 : 1,
                cursor: guardando ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              <span className="btn-icon">{guardando ? '⏳' : '💾'}</span>
              {guardando ? 'GUARDANDO...' : (esCompraDirecta && idOrdenPedido ? 'PROCESAR COMPRA DIRECTA' : 'GUARDAR OC/OS')}
            </button>
          </div>
          
          <div className="ordenes-card resumen-card">
            <div className="card-header">
              <span className="card-icon">💰</span>
              <h3>RESUMEN FINANCIERO</h3>
            </div>
            <div className="card-body">
              <div className="resumen-row">
                <span className="resumen-label">Subtotal:</span>
                <span className="resumen-valor">{obtenerSimboloMoneda()} {subtotalGeneral.toFixed(2)}</span>
              </div>
              <div className="resumen-row">
                <span className="resumen-label">IGV (18%):</span>
                <span className="resumen-valor">{obtenerSimboloMoneda()} {igv.toFixed(2)}</span>
              </div>
              <div className="resumen-row resumen-total">
                <span className="resumen-label">TOTAL:</span>
                <span className="resumen-valor">{obtenerSimboloMoneda()} {total.toFixed(2)}</span>
              </div>
              
              {/* Indicador de tipo de compra */}
              {total > 0 && (
                <div 
                  className="resumen-row" 
                  style={{ 
                    marginTop: '15px', 
                    padding: '12px', 
                    backgroundColor: esCompraDirecta ? '#fff3cd' : '#d4edda',
                    borderRadius: '5px',
                    borderLeft: `4px solid ${esCompraDirecta ? '#ffc107' : '#28a745'}`
                  }}
                >
                  <div style={{ 
                    fontSize: '13px', 
                    color: esCompraDirecta ? '#856404' : '#155724',
                    fontWeight: 'bold'
                  }}>
                    {esCompraDirecta ? (
                      <>
                        <div style={{ marginBottom: '5px' }}>💰 COMPRA DIRECTA</div>
                        <div style={{ fontWeight: 'normal', fontSize: '12px' }}>
                          Total ≤ {obtenerSimboloMoneda()} 500.00 + Orden de Pedido vinculada<br/>
                          → Los productos irán directo al KARDEX sin generar OC/OS
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: '5px' }}>📋 ORDEN DE COMPRA/SERVICIO</div>
                        <div style={{ fontWeight: 'normal', fontSize: '12px' }}>
                          {total > 500 ? 
                            `Total > ${obtenerSimboloMoneda()} 500.00 - Se generará OC/OS normal` :
                            `Seleccione una Orden de Pedido o el total debe ser > ${obtenerSimboloMoneda()} 500.00`
                          }
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Información del Proveedor */}
      {showModalProveedor && proveedorSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowModalProveedor(false)}>
          <div className="modal-content modal-detalle" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Información del Proveedor</h2>
              <button className="modal-close" onClick={() => setShowModalProveedor(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="proveedor-info-grid">
                <div className="info-item">
                  <strong>NOMBRE/RAZÓN SOCIAL:</strong>
                  <span>{proveedorSeleccionado.nombre || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>RUC:</strong>
                  <span>{proveedorSeleccionado.ruc || 'N/A'}</span>
                </div>
                <div className="info-item full-width">
                  <strong>DIRECCIÓN:</strong>
                  <span>{proveedorSeleccionado.direccion || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>CONTACTO:</strong>
                  <span>{proveedorSeleccionado.contacto || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>CELULAR:</strong>
                  <span>{proveedorSeleccionado.celular || 'N/A'}</span>
                </div>
                <div className="info-item full-width">
                  <strong>CORREO:</strong>
                  <span>{proveedorSeleccionado.correo || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>FORMA DE PAGO:</strong>
                  <span>{proveedorSeleccionado.formaPago || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>SERVICIO:</strong>
                  <span>{proveedorSeleccionado.servicio || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>BANCO:</strong>
                  <span>{proveedorSeleccionado.banco || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>NÚMERO DE CUENTA:</strong>
                  <span>{proveedorSeleccionado.numeroCuenta || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cerrar" onClick={() => setShowModalProveedor(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente de Notificación */}
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          detalles={notificacion.detalles}
          onClose={cerrarNotificacion}
          onAction={notificacion.onAction}
          actionLabel={notificacion.actionLabel}
        />
      )}
      
      {/* Componente de Confirmación */}
      {confirmacion && (
        <Confirmacion
          tipo={confirmacion.tipo}
          titulo={confirmacion.titulo}
          mensaje={confirmacion.mensaje}
          detalles={confirmacion.detalles}
          onConfirm={confirmacion.onConfirm}
          onCancel={cerrarConfirmacion}
        />
      )}
    </div>
  );
};

export default OrdenesCompraServicio;
