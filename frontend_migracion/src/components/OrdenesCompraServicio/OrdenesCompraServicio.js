import React, { useState, useEffect, useCallback } from 'react';
import './OrdenesCompraServicio.css';
import * as API from '../../services/ordenesAPI';

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
  
  // Estados principales del formulario (DECLARADOS ANTES DE useEffect)
  const [tipoOrden, setTipoOrden] = useState('compra');
  const [productosAgregados, setProductosAgregados] = useState([]);
  
  // Estados para Información de Orden de Pedido
  const [idOrdenPedido, setIdOrdenPedido] = useState('');
  const [ordenPedidoSeleccionada, setOrdenPedidoSeleccionada] = useState(null);
  
  // Estados para Información de Empresa (readonly cuando hay orden de pedido, editable si no)
  const [razonSocial, setRazonSocial] = useState('');
  const [idEmpresa, setIdEmpresa] = useState(''); // ID de empresa cuando se selecciona manualmente
  const [proyectoAlmacen, setProyectoAlmacen] = useState('');
  const [correlativo, setCorrelativo] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  
  // Estados para Información de Proveedor
  const [proveedor, setProveedor] = useState('');
  const [moneda, setMoneda] = useState('');
  const [infoProveedor, setInfoProveedor] = useState(''); // Información adicional del proveedor
  
  // Estados para Detalles del Servicio
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [fechaRequerida, setFechaRequerida] = useState(new Date().toISOString().split('T')[0]);
  const [destino, setDestino] = useState('');
  
  // Estados para AÑADIR PRODUCTOS manualmente
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [subtotal, setSubtotal] = useState('0.00');
  
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
  
  // Detectar si es compra directa basado en el total
  useEffect(() => {
    const { total } = calcularTotales();
    setEsCompraDirecta(total > 0 && total <= 500);
  }, [calcularTotales]); // Ahora incluye calcularTotales como dependencia
  
  // Calcular subtotal cuando cambian precio o cantidad (para AÑADIR PRODUCTOS)
  useEffect(() => {
    const precio = parseFloat(precioUnitario) || 0;
    const cant = parseFloat(cantidad) || 0;
    setSubtotal((precio * cant).toFixed(2));
  }, [precioUnitario, cantidad]);
  
  // Manejar selección de Orden de Pedido
  const handleOrdenPedidoChange = async (ordenPedidoId) => {
    setIdOrdenPedido(ordenPedidoId);
    
    if (!ordenPedidoId) {
      // Limpiar todo si se deselecciona
      setOrdenPedidoSeleccionada(null);
      setRazonSocial('');
      setIdEmpresa('');
      setProyectoAlmacen('');
      setProductosAgregados([]);
      return;
    }
    
    try {
      // Obtener detalles de la orden de pedido seleccionada
      const ordenData = await API.obtenerOrdenPedido(ordenPedidoId);
      
      setOrdenPedidoSeleccionada(ordenData);
      
      // Auto-completar Razón Social (readonly)
      // El backend devuelve razon_social directamente en el objeto
      setRazonSocial(ordenData.razon_social || 'N/A');
      setIdEmpresa(ordenData.id_empresa);
      
      // Auto-completar Proyecto/Almacén (readonly)
      // El backend devuelve proyecto_nombre y proyecto_bodega directamente
      if (ordenData.proyecto_nombre && ordenData.proyecto_bodega) {
        const proyectoTexto = `${ordenData.proyecto_nombre} - ${ordenData.proyecto_bodega}`;
        setProyectoAlmacen(proyectoTexto);
      } else {
        setProyectoAlmacen('N/A');
      }
      
      // Cargar productos SIN PRECIOS desde los detalles de la orden de pedido
      // El backend devuelve los datos del producto directamente en cada detalle
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
      alert('Error al cargar los detalles de la orden de pedido');
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
      }
    } else {
      setInfoProveedor('');
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
      alert('Por favor complete los campos requeridos: Descripción, Cantidad y Precio Unitario');
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
      alert('❌ Por favor complete los campos de proveedor y moneda');
      return;
    }
    
    // Validar que haya empresa seleccionada (ya sea por orden de pedido o manualmente)
    if (!idOrdenPedido && !idEmpresa) {
      alert('❌ Por favor seleccione una empresa');
      return;
    }
    
    if (productosAgregados.length === 0) {
      alert('❌ No hay productos agregados');
      return;
    }
    
    // Validación: Todos los productos deben tener precio
    const productosSinPrecio = productosAgregados.filter(prod => !prod.precioUnitario || prod.precioUnitario <= 0);
    if (productosSinPrecio.length > 0) {
      alert(`❌ Por favor ingrese precios para todos los productos.\n\nProductos sin precio: ${productosSinPrecio.length}`);
      return;
    }
    
    const { total: totalCalculado } = calcularTotales();
    
    // Detectar si es compra directa (≤ 500) - SOLO SI HAY ORDEN DE PEDIDO
    if (idOrdenPedido && totalCalculado <= 500) {
      // Mostrar confirmación para compra directa
      const confirmar = window.confirm(
        `💰 COMPRA DIRECTA DETECTADA\n\n` +
        `Total: S/. ${totalCalculado.toFixed(2)}\n\n` +
        `⚠️ Como el total es menor o igual a S/. 500.00, esta orden se procesará como COMPRA DIRECTA.\n\n` +
        `Los productos se agregarán directamente al Kardex sin generar Orden de Compra/Servicio.\n\n` +
        `¿Desea continuar?`
      );
      
      if (!confirmar) {
        return;
      }
    } else {
      // Confirmación normal para OC/OS
      const tipoMensaje = idOrdenPedido 
        ? `vinculada a la Orden de Pedido ${ordenPedidoSeleccionada?.correlativo}` 
        : 'sin vincular a Orden de Pedido';
        
      const confirmar = window.confirm(
        `📋 ${tipoOrden === 'compra' ? 'ORDEN DE COMPRA' : 'ORDEN DE SERVICIO'}\n\n` +
        `Total: S/. ${totalCalculado.toFixed(2)}\n\n` +
        `Se generará una ${tipoOrden === 'compra' ? 'Orden de Compra' : 'Orden de Servicio'} ${tipoMensaje}.\n\n` +
        `¿Desea continuar?`
      );
      
      if (!confirmar) {
        return;
      }
    }
    
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
      
      // Mostrar mensaje según el tipo de respuesta
      if (response.tipo === 'COMPRA_DIRECTA') {
        alert(
          `✅ ${response.mensaje}\n\n` +
          `💰 COMPRA DIRECTA PROCESADA\n\n` +
          `Total: S/. ${response.total}\n\n` +
          `Los productos han sido agregados directamente al Kardex sin generar OC/OS.\n\n` +
          `Estado de la Orden de Pedido: ${response.estado_compra}`
        );
      } else {
        alert(
          `✅ ${response.mensaje}\n\n` +
          `Correlativo: ${response.correlativo}\n` +
          `Total: S/. ${response.total}\n\n` +
          (response.estado_compra ? `Estado de la Orden de Pedido: ${response.estado_compra}` : 'Sin vincular a Orden de Pedido')
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
      alert(`❌ Error al guardar: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };
  
  // Mostrar mensaje de carga
  if (loading) {
    return (
      <div className="ordenes-compra-servicio-container">
        <div className="ordenes-header">
          <div className="ordenes-header-icon">🛒</div>
          <h1>ÓRDENES DE COMPRA Y SERVICIOS</h1>
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
      <div className="ordenes-compra-servicio-container">
        <div className="ordenes-header">
          <div className="ordenes-header-icon">🛒</div>
          <h1>ÓRDENES DE COMPRA Y SERVICIOS</h1>
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
    <div className="ordenes-compra-servicio-container">
      <div className="ordenes-header">
        <div className="ordenes-header-icon">🛒</div>
        <h1>ÓRDENES DE COMPRA Y SERVICIOS</h1>
      </div>
      
      <div className="ordenes-content">
        {/* NUEVA SECCIÓN: Selección de Orden de Pedido */}
        <div className="ordenes-card orden-pedido-card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <h3>ORDEN DE PEDIDO</h3>
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
        
        {/* Sección Superior: Información de Empresa y Proveedor */}
        <div className="ordenes-grid-top">
          {/* Información de Empresa (READONLY si hay orden pedido, EDITABLE si no) */}
          <div className="ordenes-card">
            <div className="card-header">
              <span className="card-icon">🏢</span>
              <h3>INFORMACIÓN DE EMPRESA {idOrdenPedido && '(Auto-completado)'}</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Razón Social:</label>
                  {idOrdenPedido ? (
                    // Readonly cuando hay orden de pedido
                    <input 
                      type="text"
                      value={razonSocial} 
                      readOnly
                      className="form-input"
                      placeholder="Seleccione una orden de pedido..."
                      style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    />
                  ) : (
                    // Editable cuando NO hay orden de pedido
                    <select 
                      value={idEmpresa} 
                      onChange={(e) => handleEmpresaChange(e.target.value)}
                      className="form-input"
                    >
                      <option value="">Seleccione empresa...</option>
                      {empresas.map(empresa => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.razonSocial}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-group form-group-small">
                  <label>Correlativo:</label>
                  <input 
                    type="text" 
                    value={correlativo}
                    readOnly
                    className="form-input"
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
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
                      style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Fecha:</label>
                  <input 
                    type="date" 
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Información de Proveedor */}
          <div className="ordenes-card">
            <div className="card-header">
              <span className="card-icon">📦</span>
              <h3>INFORMACIÓN DE PROVEEDOR</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: '2' }}>
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
                <div className="form-group" style={{ flex: '1' }}>
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
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Información del Proveedor:</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Información adicional del proveedor..."
                    value={infoProveedor}
                    readOnly
                    rows="4"
                    style={{ 
                      backgroundColor: '#f0f0f0', 
                      cursor: 'not-allowed',
                      resize: 'none',
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tipo de Orden */}
        <div className="ordenes-card tipo-orden-card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <h3>TIPO DE ORDEN</h3>
          </div>
          <div className="card-body">
            <div className="tipo-orden-options">
              <label className={`tipo-orden-option ${tipoOrden === 'compra' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="tipoOrden" 
                  value="compra"
                  checked={tipoOrden === 'compra'}
                  onChange={(e) => setTipoOrden(e.target.value)}
                />
                <span className="option-icon">🛒</span>
                <span className="option-text">COMPRA</span>
              </label>
              <label className={`tipo-orden-option ${tipoOrden === 'servicio' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="tipoOrden" 
                  value="servicio"
                  checked={tipoOrden === 'servicio'}
                  onChange={(e) => setTipoOrden(e.target.value)}
                />
                <span className="option-icon">🔧</span>
                <span className="option-text">SERVICIO</span>
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
                  <label>Latitud:</label>
                  <input 
                    type="text" 
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    className="form-input"
                    placeholder="Ej: -12.0464"
                  />
                </div>
                <div className="form-group">
                  <label>Longitud:</label>
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
              borderLeft: '4px solid #2196f3'
            }}>
              <strong>💡 Nota:</strong> Use esta sección para agregar productos que no estén en la Orden de Pedido seleccionada.
            </div>
            
            <div className="form-row">
              <div className="form-group form-group-large">
                <label>Descripción:</label>
                <select 
                  value={descripcion} 
                  onChange={(e) => handleDescripcionChange(e.target.value)}
                  className="form-input"
                >
                  <option value="">Seleccione producto...</option>
                  {productos.map(prod => (
                    <option key={prod.codigo} value={prod.descripcion}>
                      {prod.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group form-group-small">
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
                <div className="subtotal-display">S/ {subtotal}</div>
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
                        <td>S/ {producto.subtotal.toFixed(2)}</td>
                        <td>S/ {producto.total.toFixed(2)}</td>
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
                borderLeft: '4px solid #2196f3'
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
                <span className="resumen-valor">S/ {subtotalGeneral.toFixed(2)}</span>
              </div>
              <div className="resumen-row">
                <span className="resumen-label">IGV (18%):</span>
                <span className="resumen-valor">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="resumen-row resumen-total">
                <span className="resumen-label">TOTAL:</span>
                <span className="resumen-valor">S/ {total.toFixed(2)}</span>
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
                          Total ≤ S/. 500.00 - Los productos irán directo al Kardex
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: '5px' }}>📋 ORDEN DE COMPRA/SERVICIO</div>
                        <div style={{ fontWeight: 'normal', fontSize: '12px' }}>
                          Total &gt; S/. 500.00 - Se generará OC/OS normal
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
    </div>
  );
};

export default OrdenesCompraServicio;
