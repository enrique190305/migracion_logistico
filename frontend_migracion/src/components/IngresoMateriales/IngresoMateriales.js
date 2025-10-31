import React, { useState, useEffect } from 'react';
import './IngresoMateriales.css';
import ingresoMaterialesAPI from '../../services/ingresoMaterialesAPI';

const IngresoMateriales = () => {
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  
  // Tab activo principal
  const [tabActivo, setTabActivo] = useState('nuevo');
  
  // Sub-tab para historial (OC, OS, ID)
  const [tabHistorial, setTabHistorial] = useState('oc');

  // Estados para Nuevo Ingreso (OC/OS)
  const [numeroIngreso, setNumeroIngreso] = useState('');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0]);
  const [proveedor, setProveedor] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [estado, setEstado] = useState('');
  const [proyectoAlmacen, setProyectoAlmacen] = useState('');
  const [numGuia, setNumGuia] = useState('');
  const [factura, setFactura] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados para Ingreso Directo (sin OC/OS)
  const [numeroIngresoDirecto, setNumeroIngresoDirecto] = useState('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [proveedorDirecto, setProveedorDirecto] = useState('');
  const [moneda, setMoneda] = useState('');
  const [proyectoAlmacenDirecto, setProyectoAlmacenDirecto] = useState('');
  const [fechaIngresoDirecto, setFechaIngresoDirecto] = useState(new Date().toISOString().split('T')[0]);
  const [numGuiaDirecto, setNumGuiaDirecto] = useState('');
  const [facturaDirecto, setFacturaDirecto] = useState('');
  const [observacionesDirecto, setObservacionesDirecto] = useState('');
  const [productosDirectos, setProductosDirectos] = useState([]);

  // Estados para productos (usado en ambos modos)
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadIngresar, setCantidadIngresar] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [observacionProducto, setObservacionProducto] = useState('');
  const [productosAgregados, setProductosAgregados] = useState([]);

  // Catálogos
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [proyectosAlmacen, setProyectosAlmacen] = useState([]);
  const [productos, setProductos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [monedas, setMonedas] = useState([]);

  // Estados para historial
  const [historialIngresos, setHistorialIngresos] = useState([]);
  const [historialServicios, setHistorialServicios] = useState([]);
  const [historialDirectos, setHistorialDirectos] = useState([]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Estados de carga y mensajes
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
    if (tabActivo === 'historial') {
      cargarHistoriales();
    }
  }, [tabActivo]);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      
      const respOrdenes = await ingresoMaterialesAPI.listarOrdenesPendientes();
      if (respOrdenes.success) {
        setOrdenesPendientes(respOrdenes.data);
      }

      const respProyectos = await ingresoMaterialesAPI.listarProyectosAlmacen();
      if (respProyectos.success) {
        setProyectosAlmacen(respProyectos.data);
      }

      const respProductos = await ingresoMaterialesAPI.listarProductos();
      if (respProductos.success) {
        setProductos(respProductos.data);
      }

      const respEmpresas = await ingresoMaterialesAPI.listarEmpresas();
      if (respEmpresas.success) {
        setEmpresas(respEmpresas.data);
      }

      const respProveedores = await ingresoMaterialesAPI.listarProveedores();
      if (respProveedores.success) {
        setProveedores(respProveedores.data);
      }

      const respMonedas = await ingresoMaterialesAPI.listarMonedas();
      if (respMonedas.success) {
        setMonedas(respMonedas.data);
      }

      const respNumero = await ingresoMaterialesAPI.generarNumeroIngreso();
      if (respNumero.success) {
        setNumeroIngreso(respNumero.data.numero_ingreso);
        setNumeroIngresoDirecto(respNumero.data.numero_ingreso);
      }

    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      mostrarMensaje('error', 'Error al cargar los datos iniciales');
    } finally {
      setCargando(false);
    }
  };

  const cargarHistoriales = async () => {
    try {
      setCargando(true);

      const filtros = {};
      if (fechaDesde) filtros.fecha_desde = fechaDesde;
      if (fechaHasta) filtros.fecha_hasta = fechaHasta;

      const respIngresos = await ingresoMaterialesAPI.obtenerHistorialIngresos(filtros);
      if (respIngresos.success) {
        setHistorialIngresos(respIngresos.data);
      }

      const respServicios = await ingresoMaterialesAPI.obtenerHistorialServicios(filtros);
      if (respServicios.success) {
        setHistorialServicios(respServicios.data);
      }

      const respDirectos = await ingresoMaterialesAPI.obtenerHistorialDirectos(filtros);
      if (respDirectos.success) {
        setHistorialDirectos(respDirectos.data);
      }

    } catch (error) {
      console.error('Error al cargar historiales:', error);
      mostrarMensaje('error', 'Error al cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  // ============================================
  // MANEJADORES DE EVENTOS
  // ============================================

  const handleSeleccionOrden = async (correlativo) => {
    if (!correlativo) {
      limpiarFormulario();
      return;
    }

    try {
      setCargando(true);
      setOrdenSeleccionada(correlativo);

      const respInfo = await ingresoMaterialesAPI.obtenerInfoOrden(correlativo);
      if (respInfo.success) {
        const orden = respInfo.data;
        setProveedor(orden.proveedor);
        setRazonSocial(orden.razon_social);
        setEstado(orden.estado);
        setFechaIngreso(orden.fecha);
      }

    } catch (error) {
      console.error('Error al obtener información de la orden:', error);
      mostrarMensaje('error', 'Error al cargar la información de la orden');
    } finally {
      setCargando(false);
    }
  };

  const handlePrecargarProductos = async () => {
    if (!ordenSeleccionada) {
      mostrarMensaje('warning', 'Seleccione una orden primero');
      return;
    }

    try {
      setCargando(true);

      const respProductos = await ingresoMaterialesAPI.precargarProductos(ordenSeleccionada);
      if (respProductos.success && respProductos.data.length > 0) {
        const nuevosProductos = respProductos.data.map(p => ({
          codigo_producto: p.codigo_producto,
          descripcion: p.descripcion,
          cantidad_pendiente: p.saldo,
          cantidad_ingresar: p.saldo,
          unidad: p.unidad,
          observaciones: ''
        }));
        
        setProductosAgregados(nuevosProductos);
        mostrarMensaje('success', `Se precargaron ${nuevosProductos.length} productos con saldo pendiente`);
      } else {
        mostrarMensaje('info', 'No hay productos pendientes en esta orden');
      }

    } catch (error) {
      console.error('Error al precargar productos:', error);
      mostrarMensaje('error', 'Error al precargar los productos');
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || !cantidadIngresar) {
      mostrarMensaje('warning', 'Complete los campos del producto');
      return;
    }

    const producto = productos.find(p => p.codigo_producto === productoSeleccionado);
    if (!producto) {
      mostrarMensaje('error', 'Producto no encontrado');
      return;
    }

    const cantidad = parseFloat(cantidadIngresar);
    if (isNaN(cantidad) || cantidad <= 0) {
      mostrarMensaje('error', 'La cantidad debe ser mayor a 0');
      return;
    }

    const existe = productosAgregados.find(p => p.codigo_producto === productoSeleccionado);
    if (existe) {
      mostrarMensaje('warning', 'Este producto ya fue agregado');
      return;
    }

    const nuevoProducto = {
      codigo_producto: producto.codigo_producto,
      descripcion: producto.descripcion,
      cantidad_pendiente: cantidad,
      cantidad_ingresar: cantidad,
      unidad: producto.unidad,
      observaciones: observacionProducto
    };

    setProductosAgregados([...productosAgregados, nuevoProducto]);
    
    setProductoSeleccionado('');
    setCantidadIngresar('');
    setObservacionProducto('');
    
    mostrarMensaje('success', 'Producto agregado correctamente');
  };

  const handleEliminarProducto = (codigo) => {
    setProductosAgregados(productosAgregados.filter(p => p.codigo_producto !== codigo));
    mostrarMensaje('info', 'Producto eliminado');
  };

  const handleActualizarCantidad = (codigo, nuevaCantidad) => {
    const cantidad = parseFloat(nuevaCantidad);
    if (isNaN(cantidad) || cantidad < 0) return;

    setProductosAgregados(productosAgregados.map(p => 
      p.codigo_producto === codigo 
        ? { ...p, cantidad_ingresar: cantidad }
        : p
    ));
  };

  const handleGuardarIngreso = async () => {
    if (!ordenSeleccionada) {
      mostrarMensaje('error', 'Seleccione una orden');
      return;
    }

    if (!proyectoAlmacen) {
      mostrarMensaje('error', 'Seleccione un proyecto almacén');
      return;
    }

    if (productosAgregados.length === 0) {
      mostrarMensaje('error', 'Debe agregar al menos un producto');
      return;
    }

    for (const prod of productosAgregados) {
      if (prod.cantidad_ingresar <= 0) {
        mostrarMensaje('error', `La cantidad del producto ${prod.codigo_producto} debe ser mayor a 0`);
        return;
      }
      if (prod.cantidad_ingresar > prod.cantidad_pendiente) {
        mostrarMensaje('error', `La cantidad del producto ${prod.codigo_producto} excede el saldo pendiente`);
        return;
      }
    }

    try {
      setCargando(true);

      const datos = {
        correlativo: ordenSeleccionada,
        proyecto_almacen: proyectoAlmacen,
        fecha_ingreso: fechaIngreso,
        num_guia: numGuia,
        factura: factura,
        observaciones: observaciones,
        usuario: localStorage.getItem('userName') || 'Usuario',
        productos: productosAgregados.map(p => ({
          codigo_producto: p.codigo_producto,
          cantidad_ingresar: p.cantidad_ingresar,
          observaciones: p.observaciones || ''
        }))
      };

      const response = await ingresoMaterialesAPI.guardarIngreso(datos);
      
      if (response.success) {
        mostrarMensaje('success', '✅ Ingreso guardado correctamente');
        
        // Descargar PDF automáticamente
        try {
          const idIngreso = response.data?.id_ingreso;
          if (idIngreso) {
            const pdfResponse = await fetch(`http://localhost:8000/api/ingreso-materiales/${idIngreso}/pdf`);
            if (pdfResponse.ok) {
              const blob = await pdfResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Ingreso_Material_${idIngreso}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }
          }
        } catch (pdfError) {
          console.error('Error al generar PDF:', pdfError);
          // No mostrar error al usuario, el ingreso se guardó correctamente
        }
        
        limpiarFormulario();
        await cargarDatosIniciales();
      } else {
        mostrarMensaje('error', response.message || 'Error al guardar el ingreso');
      }

    } catch (error) {
      console.error('Error al guardar ingreso:', error);
      const mensajeError = error.response?.data?.message || 'Error al guardar el ingreso';
      mostrarMensaje('error', mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setOrdenSeleccionada('');
    setProveedor('');
    setRazonSocial('');
    setEstado('');
    setProyectoAlmacen('');
    setNumGuia('');
    setFactura('');
    setObservaciones('');
    setProductoSeleccionado('');
    setCantidadIngresar('');
    setObservacionProducto('');
    setProductosAgregados([]);
    setFechaIngreso(new Date().toISOString().split('T')[0]);
    setBusquedaProducto('');
    setDropdownAbiertoProducto(false);
  };

  const handleLimpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    cargarHistoriales();
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
      setProductoSeleccionado('');
    }
  };

  const handleProductoSelect = (codigoProducto) => {
    const producto = productos.find(p => p.codigo_producto === codigoProducto);
    if (producto) {
      setProductoSeleccionado(codigoProducto);
      setBusquedaProducto(producto.descripcion);
      setDropdownAbiertoProducto(false);
    }
  };

  const filtrarProductos = () => {
    const busqueda = (busquedaProducto || '').toLowerCase();
    if (!busqueda) return productos;
    
    return productos.filter(prod => 
      prod.descripcion.toLowerCase().includes(busqueda) ||
      prod.codigo_producto.toLowerCase().includes(busqueda)
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
  // FUNCIÓN RENDER: NUEVO INGRESO (OC/OS)
  // ============================================

  const renderNuevoIngreso = () => {
    return (
      <div className="nuevo-ingreso-form">
        
        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
        <div className="ingreso-card">
          <div className="ingreso-card-header">
            <span className="ingreso-icon">📋</span>
            <h3 className="ingreso-card-title">Información General del Ingreso</h3>
          </div>
          <div className="ingreso-card-body">
            <div className="ingreso-form-row">
              
              {/* Número de Ingreso */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🔢 N° Ingreso
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={numeroIngreso}
                  disabled
                  style={{ fontWeight: '700', color: '#667eea' }}
                />
              </div>

              {/* Selección de Orden */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📄 Seleccionar Orden (OC/OS) *
                </label>
                <select
                  className="ingreso-form-select"
                  value={ordenSeleccionada}
                  onChange={(e) => handleSeleccionOrden(e.target.value)}
                >
                  <option value="">-- Seleccione una orden --</option>
                  {ordenesPendientes.map((orden, index) => (
                    <option key={index} value={orden.correlativo}>
                      {orden.correlativo} ({orden.tipo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📅 Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  className="ingreso-form-input"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                />
              </div>

            </div>

            {ordenSeleccionada && (
              <div className="ingreso-form-row" style={{ marginTop: '15px' }}>
                
                {/* Proveedor */}
                <div className="ingreso-form-group">
                  <label className="ingreso-form-label">
                    👤 Proveedor
                  </label>
                  <input
                    type="text"
                    className="ingreso-form-input"
                    value={proveedor}
                    disabled
                  />
                </div>

                {/* Razón Social */}
                <div className="ingreso-form-group">
                  <label className="ingreso-form-label">
                    🏢 Razón Social
                  </label>
                  <input
                    type="text"
                    className="ingreso-form-input"
                    value={razonSocial}
                    disabled
                  />
                </div>

                {/* Estado */}
                <div className="ingreso-form-group">
                  <label className="ingreso-form-label">
                    📊 Estado
                  </label>
                  <input
                    type="text"
                    className="ingreso-form-input"
                    value={estado}
                    disabled
                    style={{ fontWeight: '600', color: '#f2994a' }}
                  />
                </div>

              </div>
            )}

            <div className="ingreso-form-row" style={{ marginTop: '15px' }}>
              
              {/* Proyecto Almacén */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🏭 Proyecto Almacén *
                </label>
                <select
                  className="ingreso-form-select"
                  value={proyectoAlmacen}
                  onChange={(e) => setProyectoAlmacen(e.target.value)}
                >
                  <option value="">-- Seleccione proyecto --</option>
                  {proyectosAlmacen.map((proyecto, index) => (
                    <option key={index} value={proyecto.nombre_proyecto}>
                      {proyecto.nombre_proyecto}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guía */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📦 N° Guía de Remisión
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={numGuia}
                  onChange={(e) => setNumGuia(e.target.value)}
                  placeholder=""
                />
              </div>

              {/* Factura */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🧾 N° Factura
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={factura}
                  onChange={(e) => setFactura(e.target.value)}
                  placeholder=""
                />
              </div>

            </div>

            <div className="ingreso-form-row" style={{ marginTop: '15px' }}>
              
              {/* Observaciones */}
              <div className="ingreso-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="ingreso-form-label">
                  📝 Observaciones
                </label>
                <textarea
                  className="ingreso-form-textarea"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Escriba observaciones adicionales..."
                  rows="3"
                />
              </div>

            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PRODUCTOS */}
        <div className="ingreso-card">
          <div className="ingreso-card-header">
            <span className="ingreso-icon">📦</span>
            <h3 className="ingreso-card-title">Productos a Ingresar</h3>
          </div>
          <div className="ingreso-card-body">
            
            {/* Botón Precargar */}
            {ordenSeleccionada && (
              <div style={{ marginBottom: '20px' }}>
                <button
                  className="ingreso-btn ingreso-btn-warning"
                  onClick={handlePrecargarProductos}
                  disabled={cargando}
                >
                  <span className="ingreso-btn-icon">⚡</span>
                  Precargar Productos con Saldo Pendiente
                </button>
              </div>
            )}

            {/* Formulario para agregar productos */}
            <div className="ingreso-form-row">
              
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🔍 Producto
                </label>
                <div className="producto-combobox">
                  <div className="combobox-input-wrapper">
                    <input
                      type="text"
                      value={busquedaProducto}
                      onChange={(e) => handleBusquedaProductoChange(e.target.value)}
                      onFocus={(e) => handleBusquedaFocus(e)}
                      placeholder="Seleccione o busque un producto..."
                      className="input-busqueda-producto ingreso-form-input"
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

              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🔢 Cantidad
                </label>
                <input
                  type="number"
                  className="ingreso-form-input"
                  value={cantidadIngresar}
                  onChange={(e) => setCantidadIngresar(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📝 Observación
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={observacionProducto}
                  onChange={(e) => setObservacionProducto(e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <div className="ingreso-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="ingreso-btn ingreso-btn-success"
                  onClick={handleAgregarProducto}
                  style={{ width: '100%' }}
                >
                  <span className="ingreso-btn-icon">➕</span>
                  Agregar
                </button>
              </div>

            </div>

            {/* Tabla de productos agregados */}
            {productosAgregados.length > 0 ? (
              <div style={{ marginTop: '25px', overflowX: 'auto' }}>
                <table className="ingreso-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad Pendiente</th>
                      <th>Cantidad a Ingresar</th>
                      <th>Unidad</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosAgregados.map((producto, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: '600', color: '#667eea' }}>
                          {producto.codigo_producto}
                        </td>
                        <td>{producto.descripcion}</td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>
                          {producto.cantidad_pendiente}
                        </td>
                        <td>
                          <input
                            type="number"
                            className="ingreso-table-input"
                            value={producto.cantidad_ingresar}
                            onChange={(e) => handleActualizarCantidad(producto.codigo_producto, e.target.value)}
                            step="0.01"
                            min="0"
                            max={producto.cantidad_pendiente}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>{producto.unidad}</td>
                        <td>{producto.observaciones || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="ingreso-table-btn ingreso-table-btn-eliminar"
                            onClick={() => handleEliminarProducto(producto.codigo_producto)}
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px', marginTop: '20px' }}>
                📦 No hay productos agregados
              </div>
            )}

          </div>
        </div>

        {/* SECCIÓN 3: ACCIONES */}
        <div className="ingreso-card">
          <div className="ingreso-card-body">
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              
              <button
                className="ingreso-btn ingreso-btn-secondary"
                onClick={limpiarFormulario}
                disabled={cargando}
              >
                <span className="ingreso-btn-icon">🔄</span>
                Limpiar
              </button>

              <button
                className="ingreso-btn ingreso-btn-success"
                onClick={handleGuardarIngreso}
                disabled={cargando || productosAgregados.length === 0}
              >
                <span className="ingreso-btn-icon">💾</span>
                Guardar Ingreso
              </button>

            </div>
          </div>
        </div>

      </div>
    );
  };

  // ============================================
  // FUNCIÓN RENDER: INGRESO DIRECTO (SIN OC/OS)
  // ============================================

  const renderIngresoDirecto = () => {
    
    // Funciones auxiliares para cálculos
    const calcularSubtotal = (producto) => {
      const cantidad = parseFloat(producto.cantidad_ingresar) || 0;
      const precio = parseFloat(producto.precio_unitario) || 0;
      return cantidad * precio;
    };

    const calcularTotalGeneral = () => {
      return productosDirectos.reduce((total, prod) => total + calcularSubtotal(prod), 0);
    };

    const handleAgregarProductoDirecto = () => {
      // Validaciones
      if (!productoSeleccionado) {
        mostrarMensaje('error', '❌ Debe seleccionar un producto');
        return;
      }
      if (!cantidadIngresar || parseFloat(cantidadIngresar) <= 0) {
        mostrarMensaje('error', '❌ La cantidad debe ser mayor a cero');
        return;
      }
      if (!precioUnitario || parseFloat(precioUnitario) <= 0) {
        mostrarMensaje('error', '❌ El precio unitario debe ser mayor a cero');
        return;
      }

      // Buscar info del producto
      const productoInfo = productos.find(p => p.codigo_producto === productoSeleccionado);
      if (!productoInfo) {
        mostrarMensaje('error', '❌ Producto no encontrado');
        return;
      }

      // Verificar si ya existe en la lista
      const yaExiste = productosDirectos.some(p => p.codigo_producto === productoSeleccionado);
      if (yaExiste) {
        mostrarMensaje('warning', '⚠️ El producto ya fue agregado. Puede modificar su cantidad en la tabla.');
        return;
      }

      // Agregar producto
      const nuevoProducto = {
        codigo_producto: productoSeleccionado,
        descripcion: productoInfo.descripcion,
        cantidad_ingresar: cantidadIngresar,
        unidad: productoInfo.unidad,
        precio_unitario: precioUnitario,
        observaciones: observacionProducto
      };

      setProductosDirectos([...productosDirectos, nuevoProducto]);
      
      // Limpiar campos
      setProductoSeleccionado('');
      setCantidadIngresar('');
      setPrecioUnitario('');
      setObservacionProducto('');
      
      mostrarMensaje('success', '✅ Producto agregado correctamente');
    };

    const handleEliminarProductoDirecto = (codigo) => {
      setProductosDirectos(productosDirectos.filter(p => p.codigo_producto !== codigo));
      mostrarMensaje('info', 'ℹ️ Producto eliminado');
    };

    const handleActualizarCantidadDirecto = (codigo, nuevaCantidad) => {
      setProductosDirectos(productosDirectos.map(p => 
        p.codigo_producto === codigo 
          ? { ...p, cantidad_ingresar: nuevaCantidad }
          : p
      ));
    };

    const handleActualizarPrecioDirecto = (codigo, nuevoPrecio) => {
      setProductosDirectos(productosDirectos.map(p => 
        p.codigo_producto === codigo 
          ? { ...p, precio_unitario: nuevoPrecio }
          : p
      ));
    };

    const handleGuardarIngresoDirecto = async () => {
      // Validaciones
      if (!empresaSeleccionada) {
        mostrarMensaje('error', '❌ Debe seleccionar una empresa');
        return;
      }
      if (!proveedorDirecto) {
        mostrarMensaje('error', '❌ Debe seleccionar un proveedor');
        return;
      }
      if (!moneda) {
        mostrarMensaje('error', '❌ Debe seleccionar una moneda');
        return;
      }
      if (!proyectoAlmacenDirecto) {
        mostrarMensaje('error', '❌ Debe seleccionar un proyecto almacén');
        return;
      }
      if (!fechaIngresoDirecto) {
        mostrarMensaje('error', '❌ Debe ingresar la fecha');
        return;
      }
      if (productosDirectos.length === 0) {
        mostrarMensaje('error', '❌ Debe agregar al menos un producto');
        return;
      }

      // Preparar datos
      const datosIngreso = {
        numero_ingreso: numeroIngresoDirecto,
        id_empresa: empresaSeleccionada,
        id_proveedor: proveedorDirecto,
        moneda: moneda,
        proyecto_almacen: proyectoAlmacenDirecto,
        fecha_ingreso: fechaIngresoDirecto,
        total: calcularTotalGeneral(),
        num_guia: numGuiaDirecto,
        factura: facturaDirecto,
        observaciones: observacionesDirecto,
        productos: productosDirectos.map(p => ({
          codigo_producto: p.codigo_producto,
          cantidad: p.cantidad_ingresar,
          precio_unitario: p.precio_unitario,
          observaciones: p.observaciones
        }))
      };

      try {
        setCargando(true);
        const response = await ingresoMaterialesAPI.guardarIngresoDirecto(datosIngreso);
        
        if (response.success) {
          mostrarMensaje('success', `✅ ${response.message}`);
          limpiarFormularioDirecto();
          
          // Recargar número de ingreso
          const respNumero = await ingresoMaterialesAPI.generarNumeroIngreso();
          if (respNumero.success) {
            setNumeroIngresoDirecto(respNumero.numero_ingreso);
          }
        } else {
          mostrarMensaje('error', `❌ ${response.message}`);
        }
      } catch (error) {
        console.error('Error al guardar ingreso directo:', error);
        mostrarMensaje('error', '❌ Error al guardar el ingreso directo');
      } finally {
        setCargando(false);
      }
    };

    const limpiarFormularioDirecto = () => {
      setEmpresaSeleccionada('');
      setProveedorDirecto('');
      setMoneda('');
      setProyectoAlmacenDirecto('');
      setFechaIngresoDirecto(new Date().toISOString().split('T')[0]);
      setNumGuiaDirecto('');
      setFacturaDirecto('');
      setObservacionesDirecto('');
      setProductoSeleccionado('');
      setCantidadIngresar('');
      setPrecioUnitario('');
      setObservacionProducto('');
      setProductosDirectos([]);
    };

    return (
      <div className="ingreso-directo-form">
        
        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
        <div className="ingreso-card">
          <div className="ingreso-card-header" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <span className="ingreso-icon">📥</span>
            <h3 className="ingreso-card-title">Información del Ingreso Directo</h3>
          </div>
          <div className="ingreso-card-body">
            <div className="ingreso-form-row">
              
              {/* Número de Ingreso */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🔢 N° Ingreso
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={numeroIngresoDirecto}
                  disabled
                  style={{ fontWeight: '700', color: '#f5576c' }}
                />
              </div>

              {/* Empresa */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🏢 Empresa *
                </label>
                <select
                  className="ingreso-form-select"
                  value={empresaSeleccionada}
                  onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                >
                  <option value="">-- Seleccione empresa --</option>
                  {empresas.map((empresa, index) => (
                    <option key={index} value={empresa.id_empresa}>
                      {empresa.nombre_empresa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proveedor */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  👤 Proveedor *
                </label>
                <select
                  className="ingreso-form-select"
                  value={proveedorDirecto}
                  onChange={(e) => setProveedorDirecto(e.target.value)}
                >
                  <option value="">-- Seleccione proveedor --</option>
                  {proveedores.map((prov, index) => (
                    <option key={index} value={prov.id_proveedor}>
                      {prov.razon_social}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="ingreso-form-row" style={{ marginTop: '15px' }}>
              
              {/* Moneda */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  💰 Moneda *
                </label>
                <select
                  className="ingreso-form-select"
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                >
                  <option value="">-- Seleccione moneda --</option>
                  {monedas.map((mon, index) => (
                    <option key={index} value={mon.codigo}>
                      {mon.codigo} - {mon.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proyecto Almacén */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🏭 Proyecto Almacén *
                </label>
                <select
                  className="ingreso-form-select"
                  value={proyectoAlmacenDirecto}
                  onChange={(e) => setProyectoAlmacenDirecto(e.target.value)}
                >
                  <option value="">-- Seleccione proyecto --</option>
                  {proyectosAlmacen.map((proyecto, index) => (
                    <option key={index} value={proyecto.nombre_proyecto}>
                      {proyecto.nombre_proyecto}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📅 Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  className="ingreso-form-input"
                  value={fechaIngresoDirecto}
                  onChange={(e) => setFechaIngresoDirecto(e.target.value)}
                />
              </div>

            </div>

            <div className="ingreso-form-row" style={{ marginTop: '15px' }}>
              
              {/* Guía */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📦 N° Guía de Remisión
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={numGuiaDirecto}
                  onChange={(e) => setNumGuiaDirecto(e.target.value)}
                  placeholder=""
                />
              </div>

              {/* Factura */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🧾 N° Factura
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={facturaDirecto}
                  onChange={(e) => setFacturaDirecto(e.target.value)}
                  placeholder=""
                />
              </div>

              {/* Observaciones */}
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📝 Observaciones
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={observacionesDirecto}
                  onChange={(e) => setObservacionesDirecto(e.target.value)}
                  placeholder="Opcional"
                />
              </div>

            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PRODUCTOS */}
        <div className="ingreso-card">
          <div className="ingreso-card-header" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <span className="ingreso-icon">📦</span>
            <h3 className="ingreso-card-title">Productos a Ingresar</h3>
          </div>
          <div className="ingreso-card-body">
            
            {/* Formulario para agregar productos */}
            <div className="ingreso-form-row">
              
              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🔍 Producto
                </label>
                <select
                  className="ingreso-form-select"
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                >
                  <option value="">-- Seleccione producto --</option>
                  {productos.map((producto, index) => (
                    <option key={index} value={producto.codigo_producto}>
                      {producto.codigo_producto} - {producto.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  🔢 Cantidad
                </label>
                <input
                  type="number"
                  className="ingreso-form-input"
                  value={cantidadIngresar}
                  onChange={(e) => setCantidadIngresar(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  💵 Precio Unitario
                </label>
                <input
                  type="number"
                  className="ingreso-form-input"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="ingreso-form-group">
                <label className="ingreso-form-label">
                  📝 Observación
                </label>
                <input
                  type="text"
                  className="ingreso-form-input"
                  value={observacionProducto}
                  onChange={(e) => setObservacionProducto(e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <div className="ingreso-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="ingreso-btn ingreso-btn-success"
                  onClick={handleAgregarProductoDirecto}
                  style={{ width: '100%' }}
                >
                  <span className="ingreso-btn-icon">➕</span>
                  Agregar
                </button>
              </div>

            </div>

            {/* Tabla de productos agregados */}
            {productosDirectos.length > 0 ? (
              <div style={{ marginTop: '25px', overflowX: 'auto' }}>
                <table className="ingreso-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosDirectos.map((producto, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: '600', color: '#f5576c' }}>
                          {producto.codigo_producto}
                        </td>
                        <td>{producto.descripcion}</td>
                        <td>
                          <input
                            type="number"
                            className="ingreso-table-input"
                            value={producto.cantidad_ingresar}
                            onChange={(e) => handleActualizarCantidadDirecto(producto.codigo_producto, e.target.value)}
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>{producto.unidad}</td>
                        <td>
                          <input
                            type="number"
                            className="ingreso-table-input"
                            value={producto.precio_unitario}
                            onChange={(e) => handleActualizarPrecioDirecto(producto.codigo_producto, e.target.value)}
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: '#27ae60' }}>
                          {calcularSubtotal(producto).toFixed(2)}
                        </td>
                        <td>{producto.observaciones || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="ingreso-table-btn ingreso-table-btn-eliminar"
                            onClick={() => handleEliminarProductoDirecto(producto.codigo_producto)}
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f0f0f0', fontWeight: '700', fontSize: '16px' }}>
                      <td colSpan="5" style={{ textAlign: 'right', padding: '15px' }}>
                        TOTAL GENERAL ({moneda || 'N/A'}):
                      </td>
                      <td style={{ textAlign: 'right', color: '#27ae60', fontSize: '18px', padding: '15px' }}>
                        {calcularTotalGeneral().toFixed(2)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px', marginTop: '20px' }}>
                📦 No hay productos agregados
              </div>
            )}

          </div>
        </div>

        {/* SECCIÓN 3: ACCIONES */}
        <div className="ingreso-card">
          <div className="ingreso-card-body">
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              
              <button
                className="ingreso-btn ingreso-btn-secondary"
                onClick={limpiarFormularioDirecto}
                disabled={cargando}
              >
                <span className="ingreso-btn-icon">🔄</span>
                Limpiar
              </button>

              <button
                className="ingreso-btn ingreso-btn-success"
                onClick={handleGuardarIngresoDirecto}
                disabled={cargando || productosDirectos.length === 0}
              >
                <span className="ingreso-btn-icon">💾</span>
                Guardar Ingreso Directo
              </button>

            </div>
          </div>
        </div>

      </div>
    );
  };

  // ============================================
  // RENDERIZADO PRINCIPAL
  // ============================================

  return (
    <div className="ingreso-materiales-container">
      {/* ENCABEZADO */}
      <div className="ingreso-header">
        <span className="ingreso-icon">📦</span>
        <div>
          <h1 className="ingreso-title">Gestión de Ingresos de Materiales</h1>
          <p className="ingreso-subtitle">Registra ingresos de OC y conformidades de OS</p>
        </div>
      </div>

      {/* MENSAJE DE NOTIFICACIÓN */}
      {mensaje.texto && (
        <div className={`ingreso-mensaje ingreso-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* TABS */}
      <div className="ingreso-tabs">
        <button
          className={`ingreso-tab ${tabActivo === 'nuevo' ? 'activo' : ''}`}
          onClick={() => setTabActivo('nuevo')}
        >
          📝 Nuevo Ingreso (OC/OS)
        </button>
        <button
          className={`ingreso-tab ${tabActivo === 'directo' ? 'activo' : ''}`}
          onClick={() => setTabActivo('directo')}
        >
          📥 Nuevo Ingreso Directo
        </button>
      </div>

      {/* CONTENIDO SEGÚN TAB ACTIVO */}
      <div className="ingreso-content">
        {tabActivo === 'nuevo' && renderNuevoIngreso()}
        
        {tabActivo === 'directo' && renderIngresoDirecto()}
      </div>

      {/* LOADER */}
      {cargando && (
        <div className="ingreso-loader">
          <div className="spinner"></div>
          <p>Cargando...</p>
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
            filtrarProductos().map(prod => (
              <div
                key={prod.codigo_producto}
                className="dropdown-item"
                onClick={() => handleProductoSelect(prod.codigo_producto)}
              >
                <div className="dropdown-item-desc">{prod.descripcion}</div>
                <div className="dropdown-item-codigo">Código: {prod.codigo_producto}</div>
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

export default IngresoMateriales;
