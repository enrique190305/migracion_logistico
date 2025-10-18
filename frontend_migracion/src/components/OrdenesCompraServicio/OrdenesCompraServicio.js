import React, { useState, useEffect } from 'react';
import './OrdenesCompraServicio.css';
import * as API from '../../services/ordenesAPI';

const OrdenesCompraServicio = () => {
  // Estados para datos de catálogos (se llenan desde la API)
  const [empresas, setEmpresas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [monedas, setMonedas] = useState([]);
  
  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  
  // Estados principales del formulario (DECLARADOS ANTES DE useEffect)
  const [tipoOrden, setTipoOrden] = useState('compra');
  const [productosAgregados, setProductosAgregados] = useState([]);
  
  // Estados para Información de Empresa
  const [razonSocial, setRazonSocial] = useState('');
  const [correlativo, setCorrelativo] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  
  // Estados para Información de Proveedor
  const [proveedor, setProveedor] = useState('');
  const [moneda, setMoneda] = useState('');
  const [infoProveedor, setInfoProveedor] = useState(''); // Información adicional del proveedor
  
  // Estados para Detalles del Producto
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [subtotal, setSubtotal] = useState('0.00');
  
  // Estados para Detalles del Servicio
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [fechaRequerida, setFechaRequerida] = useState(new Date().toISOString().split('T')[0]);
  const [destino, setDestino] = useState('');
  
  // ============ useEffect HOOKS (DESPUÉS DE TODAS LAS DECLARACIONES) ============
  
  // Cargar datos iniciales desde la API
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar todos los datos en paralelo
        const [
          empresasData,
          proveedoresData,
          productosData,
          monedasData,
        ] = await Promise.all([
          API.obtenerEmpresas(),
          API.obtenerProveedores(),
          API.obtenerProductos(),
          API.obtenerMonedas(),
        ]);
        
        setEmpresas(empresasData);
        setProveedores(proveedoresData);
        setProductos(productosData);
        setServicios(productosData); // Los servicios también son productos
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
  
  // Calcular subtotal cuando cambian precio o cantidad
  useEffect(() => {
    const precio = parseFloat(precioUnitario) || 0;
    const cant = parseFloat(cantidad) || 0;
    setSubtotal((precio * cant).toFixed(2));
  }, [precioUnitario, cantidad]);
  
  // Calcular totales
  const calcularTotales = () => {
    const subtotalGeneral = productosAgregados.reduce((acc, prod) => acc + parseFloat(prod.total), 0);
    const igv = subtotalGeneral * 0.18;
    const total = subtotalGeneral + igv;
    return { subtotalGeneral, igv, total };
  };
  
  const { subtotalGeneral, igv, total } = calcularTotales();
  
  const handleInsertarProducto = () => {
    if (!descripcion || !cantidad || !precioUnitario) {
      alert('Por favor complete los campos requeridos');
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
      total: parseFloat(subtotal)
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
  
  // Manejar cambio de descripción del producto
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
  
  // Buscar producto por código (YA NO SE USA, pero lo dejamos por si acaso)
  const handleBuscarProducto = async (codigoProducto) => {
    if (!codigoProducto) return;
    
    try {
      const producto = await API.obtenerProductoPorCodigo(codigoProducto);
      setDescripcion(producto.descripcion);
      setUnidadMedida(producto.unidad);
      // El precio se debe ingresar manualmente ya que la tabla PRODUCTO no tiene precio
    } catch (err) {
      console.error('Error al buscar producto:', err);
      alert('Producto no encontrado');
    }
  };
  
  const handleGuardar = async () => {
    if (!razonSocial || !proveedor || !moneda) {
      alert('Por favor complete todos los campos de empresa y proveedor');
      return;
    }
    
    if (productosAgregados.length === 0) {
      alert('Debe agregar al menos un producto o servicio');
      return;
    }
    
    // VALIDACIÓN: Monto mínimo de 500
    const { total: totalCalculado } = calcularTotales();
    if (totalCalculado < 500) {
      alert('❌ ERROR: El total de la orden debe ser mayor o igual a S/. 500.00\n\n' +
            `Total actual: S/. ${totalCalculado.toFixed(2)}\n` +
            `Faltan: S/. ${(500 - totalCalculado).toFixed(2)}`);
      return;
    }
    
    setGuardando(true);
    
    try {
      let response;
      
      if (tipoOrden === 'compra') {
        // Preparar datos para Orden de Compra
        const ordenData = {
          correlativo,
          id_empresa: parseInt(razonSocial),
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
        
        response = await API.guardarOrdenCompra(ordenData);
      } else {
        // Preparar datos para Orden de Servicio
        const ordenData = {
          correlativo,
          id_empresa: parseInt(razonSocial),
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
        
        response = await API.guardarOrdenServicio(ordenData);
      }
      
      alert(`✅ ${response.mensaje}\nCorrelativo: ${response.correlativo}`);
      
      // Limpiar formulario después de guardar
      setProductosAgregados([]);
      setRazonSocial('');
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
            Por favor espere mientras se cargan empresas, proveedores y productos
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

  return (
    <div className="ordenes-compra-servicio-container">
      <div className="ordenes-header">
        <div className="ordenes-header-icon">🛒</div>
        <h1>ÓRDENES DE COMPRA Y SERVICIOS</h1>
      </div>
      
      <div className="ordenes-content">
        {/* Sección Superior: Información de Empresa y Proveedor */}
        <div className="ordenes-grid-top">
          {/* Información de Empresa */}
          <div className="ordenes-card">
            <div className="card-header">
              <span className="card-icon">🏢</span>
              <h3>INFORMACIÓN DE EMPRESA</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Razón Social:</label>
                  <select 
                    value={razonSocial} 
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccione...</option>
                    {empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.razonSocial}
                      </option>
                    ))}
                  </select>
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
        
        {/* Sección Media: Detalles del Producto/Servicio */}
        <div className="ordenes-grid-middle">
          {tipoOrden === 'compra' ? (
            // Detalles del Producto
            <div className="ordenes-card">
              <div className="card-header">
                <span className="card-icon">📦</span>
                <h3>DETALLES DEL PRODUCTO (Buscar por Descripción)</h3>
              </div>
              <div className="card-body">
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
                </div>
              </div>
            </div>
          ) : (
            // Detalles del Servicio
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
                <div className="form-row">
                  <div className="form-group form-group-large">
                    <label>Descripción:</label>
                    <select 
                      value={descripcion} 
                      onChange={(e) => handleDescripcionChange(e.target.value)}
                      className="form-input"
                    >
                      <option value="">Seleccione servicio...</option>
                      {servicios.map(serv => (
                        <option key={serv.codigo} value={serv.descripcion}>
                          {serv.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
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
                  <div className="form-group subtotal-group">
                    <label>Subtotal:</label>
                    <div className="subtotal-display">S/ {subtotal}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabla de Productos/Servicios Agregados */}
        <div className="ordenes-card">
          <div className="card-header">
            <span className="card-icon">📊</span>
            <h3>PRODUCTOS/SERVICIOS AGREGADOS</h3>
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
                    <th>P. UNIT.</th>
                    <th>SUBTOTAL</th>
                    <th>TOTAL</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {productosAgregados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="tabla-vacia">
                        No hay productos o servicios agregados
                      </td>
                    </tr>
                  ) : (
                    productosAgregados.map((producto) => (
                      <tr key={producto.id}>
                        <td>{producto.codigo}</td>
                        <td>{producto.descripcion}</td>
                        <td>{producto.cantidad}</td>
                        <td>{producto.unidad}</td>
                        <td>S/ {producto.precioUnitario.toFixed(2)}</td>
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
          </div>
        </div>
        
        {/* Sección Inferior: Botones y Resumen */}
        <div className="ordenes-grid-bottom">
          <div className="ordenes-actions">
            <button className="btn-insertar" onClick={handleInsertarProducto}>
              <span className="btn-icon">➕</span>
              INSERTAR
            </button>
            <button 
              className="btn-guardar" 
              onClick={handleGuardar}
              disabled={guardando}
              style={{
                opacity: guardando ? 0.6 : 1,
                cursor: guardando ? 'not-allowed' : 'pointer'
              }}
            >
              <span className="btn-icon">{guardando ? '⏳' : '💾'}</span>
              {guardando ? 'GUARDANDO...' : 'GUARDAR'}
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
              {/* Indicador de monto mínimo */}
              {total > 0 && (
                <div 
                  className="resumen-row" 
                  style={{ 
                    marginTop: '10px', 
                    padding: '8px', 
                    backgroundColor: total >= 500 ? '#d4edda' : '#f8d7da',
                    borderRadius: '5px',
                    borderLeft: `4px solid ${total >= 500 ? '#28a745' : '#dc3545'}`
                  }}
                >
                  <span style={{ 
                    fontSize: '12px', 
                    color: total >= 500 ? '#155724' : '#721c24',
                    fontWeight: 'bold'
                  }}>
                    {total >= 500 ? (
                      <>✅ Monto mínimo alcanzado (S/. 500.00)</>
                    ) : (
                      <>⚠️ Falta S/. {(500 - total).toFixed(2)} para el mínimo</>
                    )}
                  </span>
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
