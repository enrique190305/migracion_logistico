import React, { useState, useEffect } from 'react';
import './SalidaMateriales.css';
import salidaMaterialesAPI from '../../services/salidaMaterialesAPI';

const SalidaMateriales = () => {
  // ============================================
  // ESTADOS
  // ============================================

  // Estados de UI
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tabActivo, setTabActivo] = useState('nueva'); // 'nueva' o 'historial'

  // Estados del formulario principal
  const [numeroSalida, setNumeroSalida] = useState('');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState('');
  const [fechaSalida, setFechaSalida] = useState(new Date().toISOString().split('T')[0]);
  const [dniTrabajador, setDniTrabajador] = useState('');
  const [areaTrabajador, setAreaTrabajador] = useState('');

  // Estados para agregar productos
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [descripcionProducto, setDescripcionProducto] = useState('');
  const [codigoProducto, setCodigoProducto] = useState('');
  const [unidadProducto, setUnidadProducto] = useState('');
  const [stockDisponible, setStockDisponible] = useState('');
  const [cantidadSalida, setCantidadSalida] = useState('');
  const [observacionProducto, setObservacionProducto] = useState('');

  // Estados de catálogos
  const [proyectos, setProyectos] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  // Estado de productos agregados (tabla)
  const [productosAgregados, setProductosAgregados] = useState([]);

  // Estados para historial
  const [historialSalidas, setHistorialSalidas] = useState([]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [proyectoFiltro, setProyectoFiltro] = useState('');

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (tabActivo === 'historial') {
      cargarHistorial();
    }
  }, [tabActivo]);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);

      // Cargar proyectos
      const respProyectos = await salidaMaterialesAPI.listarProyectos();
      if (respProyectos.success) {
        setProyectos(respProyectos.data);
      }

      // Cargar trabajadores
      const respTrabajadores = await salidaMaterialesAPI.listarTrabajadores();
      if (respTrabajadores.success) {
        setTrabajadores(respTrabajadores.data);
      }

      // Generar número de salida
      const respNumero = await salidaMaterialesAPI.generarNumeroSalida();
      if (respNumero.success) {
        setNumeroSalida(respNumero.numero_salida);
      }

    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      mostrarMensaje('error', 'Error al cargar los datos iniciales');
    } finally {
      setCargando(false);
    }
  };

  const cargarProductosPorProyecto = async (nombreProyecto) => {
    if (!nombreProyecto) {
      setProductosDisponibles([]);
      return;
    }

    try {
      setCargando(true);
      const response = await salidaMaterialesAPI.obtenerProductosPorProyecto(nombreProyecto);
      
      if (response.success) {
        setProductosDisponibles(response.data);
        
        if (response.data.length === 0) {
          mostrarMensaje('warning', `El proyecto "${nombreProyecto}" no tiene productos con stock disponible`);
        }
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      mostrarMensaje('error', 'Error al cargar productos del proyecto');
      setProductosDisponibles([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      setCargando(true);

      const filtros = {};
      if (fechaDesde) filtros.fecha_desde = fechaDesde;
      if (fechaHasta) filtros.fecha_hasta = fechaHasta;
      if (proyectoFiltro) filtros.proyecto = proyectoFiltro;

      const response = await salidaMaterialesAPI.obtenerHistorial(filtros);
      
      if (response.success) {
        setHistorialSalidas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      mostrarMensaje('error', 'Error al cargar el historial de salidas');
    } finally {
      setCargando(false);
    }
  };

  // ============================================
  // MANEJADORES DE EVENTOS
  // ============================================

  const handleSeleccionProyecto = async (nombreProyecto) => {
    setProyectoSeleccionado(nombreProyecto);
    
    // Limpiar productos
    setProductosDisponibles([]);
    setProductoSeleccionado('');
    setDescripcionProducto('');
    setCodigoProducto('');
    setUnidadProducto('');
    setStockDisponible('');
    
    if (nombreProyecto) {
      await cargarProductosPorProyecto(nombreProyecto);
    }
  };

  const handleSeleccionTrabajador = (idTrabajador) => {
    setTrabajadorSeleccionado(idTrabajador);
    
    if (idTrabajador) {
      const trabajador = trabajadores.find(t => t.id_personal === parseInt(idTrabajador));
      if (trabajador) {
        setDniTrabajador(trabajador.dni || '');
        setAreaTrabajador(trabajador.area || '');
      }
    } else {
      setDniTrabajador('');
      setAreaTrabajador('');
    }
  };

  const handleSeleccionProducto = (descripcion) => {
    setProductoSeleccionado(descripcion);
    
    if (descripcion) {
      const producto = productosDisponibles.find(p => p.descripcion === descripcion);
      if (producto) {
        setDescripcionProducto(producto.descripcion);
        setCodigoProducto(producto.codigo_producto);
        setUnidadProducto(producto.unidad);
        setStockDisponible(producto.stock_actual);
      }
    } else {
      setDescripcionProducto('');
      setCodigoProducto('');
      setUnidadProducto('');
      setStockDisponible('');
    }
  };

  const handleAgregarProducto = () => {
    // Validaciones
    if (!proyectoSeleccionado) {
      mostrarMensaje('error', '❌ Debe seleccionar un proyecto');
      return;
    }

    if (!productoSeleccionado) {
      mostrarMensaje('error', '❌ Debe seleccionar un producto');
      return;
    }

    if (!cantidadSalida || parseFloat(cantidadSalida) <= 0) {
      mostrarMensaje('error', '❌ La cantidad debe ser mayor a cero');
      return;
    }

    const cantidad = parseFloat(cantidadSalida);
    const stock = parseFloat(stockDisponible);

    if (cantidad > stock) {
      mostrarMensaje('error', `❌ Stock insuficiente. Disponible: ${stock}`);
      return;
    }

    // Verificar si el producto ya fue agregado
    const yaExiste = productosAgregados.some(p => p.codigo_producto === codigoProducto);
    if (yaExiste) {
      mostrarMensaje('warning', '⚠️ El producto ya fue agregado. Puede editar su cantidad en la tabla.');
      return;
    }

    // Agregar producto
    const nuevoProducto = {
      codigo_producto: codigoProducto,
      descripcion: descripcionProducto,
      cantidad: cantidad,
      unidad: unidadProducto,
      observaciones: observacionProducto
    };

    setProductosAgregados([...productosAgregados, nuevoProducto]);

    // Limpiar campos
    setProductoSeleccionado('');
    setDescripcionProducto('');
    setCodigoProducto('');
    setUnidadProducto('');
    setStockDisponible('');
    setCantidadSalida('');
    setObservacionProducto('');

    mostrarMensaje('success', '✅ Producto agregado correctamente');
  };

  const handleEliminarProducto = (codigoProducto) => {
    setProductosAgregados(productosAgregados.filter(p => p.codigo_producto !== codigoProducto));
    mostrarMensaje('info', 'ℹ️ Producto eliminado');
  };

  const handleGuardarSalida = async () => {
    // Validaciones
    if (!proyectoSeleccionado) {
      mostrarMensaje('error', '❌ Debe seleccionar un proyecto');
      return;
    }

    if (!trabajadorSeleccionado) {
      mostrarMensaje('error', '❌ Debe seleccionar un trabajador');
      return;
    }

    if (productosAgregados.length === 0) {
      mostrarMensaje('error', '❌ Debe agregar al menos un producto');
      return;
    }

    if (!fechaSalida) {
      mostrarMensaje('error', '❌ Debe ingresar la fecha de salida');
      return;
    }

    // Preparar datos
    const datosSalida = {
      numero_salida: numeroSalida,
      proyecto_almacen: proyectoSeleccionado,
      id_personal: parseInt(trabajadorSeleccionado),
      fecha_salida: fechaSalida,
      observaciones: '',
      productos: productosAgregados
    };

    try {
      setCargando(true);
      const response = await salidaMaterialesAPI.guardarSalida(datosSalida);

      if (response.success) {
        mostrarMensaje('success', `✅ ${response.message}`);
        
        // Generar PDF automáticamente
        try {
          await salidaMaterialesAPI.generarPDF(numeroSalida);
          mostrarMensaje('success', '📄 PDF generado y descargado exitosamente');
        } catch (pdfError) {
          console.error('Error al generar PDF:', pdfError);
          mostrarMensaje('warning', '⚠️ Salida guardada pero hubo un error al generar el PDF');
        }
        
        limpiarFormulario();

        // Regenerar número de salida
        const respNumero = await salidaMaterialesAPI.generarNumeroSalida();
        if (respNumero.success) {
          setNumeroSalida(respNumero.numero_salida);
        }
      } else {
        mostrarMensaje('error', `❌ ${response.message}`);
      }
    } catch (error) {
      console.error('Error al guardar salida:', error);
      mostrarMensaje('error', '❌ Error al guardar la salida de materiales');
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setProyectoSeleccionado('');
    setTrabajadorSeleccionado('');
    setDniTrabajador('');
    setAreaTrabajador('');
    setFechaSalida(new Date().toISOString().split('T')[0]);
    setProductoSeleccionado('');
    setDescripcionProducto('');
    setCodigoProducto('');
    setUnidadProducto('');
    setStockDisponible('');
    setCantidadSalida('');
    setObservacionProducto('');
    setProductosAgregados([]);
    setProductosDisponibles([]);
  };

  const handleLimpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setProyectoFiltro('');
    cargarHistorial();
  };

  const handleDescargarPDF = async (numeroSalida) => {
    try {
      setCargando(true);
      await salidaMaterialesAPI.generarPDF(numeroSalida);
      mostrarMensaje('success', `📄 PDF de ${numeroSalida} descargado exitosamente`);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      mostrarMensaje('error', '❌ Error al generar el PDF');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="salida-materiales-container">
      
      {/* ENCABEZADO */}
      <div className="salida-header">
        <span className="salida-icon">📦</span>
        <div>
          <h1 className="salida-title">Salida de Materiales</h1>
          <p className="salida-subtitle">Gestión de salidas de materiales a proyectos y trabajadores</p>
        </div>
      </div>

      {/* MENSAJE DE NOTIFICACIÓN */}
      {mensaje.texto && (
        <div className={`salida-mensaje salida-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* TABS PRINCIPALES */}
      <div className="salida-tabs">
        <button
          className={`salida-tab ${tabActivo === 'nueva' ? 'activo' : ''}`}
          onClick={() => setTabActivo('nueva')}
        >
          📝 Nueva Salida
        </button>
        <button
          className={`salida-tab ${tabActivo === 'historial' ? 'activo' : ''}`}
          onClick={() => setTabActivo('historial')}
        >
          📋 Historial de Salidas
        </button>
      </div>

      {/* CONTENIDO SEGÚN TAB ACTIVO */}
      <div className="salida-content">
        {tabActivo === 'nueva' && renderNuevaSalida()}
        {tabActivo === 'historial' && renderHistorial()}
      </div>

      {/* LOADER */}
      {cargando && (
        <div className="salida-loader">
          <div className="salida-spinner"></div>
          <p>Cargando...</p>
        </div>
      )}

    </div>
  );

  // ============================================
  // FUNCIONES DE RENDERIZADO
  // ============================================

  function renderNuevaSalida() {
    return (
      <div className="nueva-salida-form">
        
        {/* CARD 1: INFORMACIÓN GENERAL */}
        <div className="salida-card">
          <div className="salida-card-header">
            <span className="salida-icon">📋</span>
            <h3 className="salida-card-title">Información General</h3>
          </div>
          <div className="salida-card-body">
            
            <div className="salida-form-row">
              
              {/* N° Salida */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  🔢 N° Salida
                </label>
                <input
                  type="text"
                  className="salida-form-input"
                  value={numeroSalida}
                  disabled
                  style={{ fontWeight: '700', color: '#667eea' }}
                />
              </div>

              {/* Fecha */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  📅 Fecha de Salida *
                </label>
                <input
                  type="date"
                  className="salida-form-input"
                  value={fechaSalida}
                  onChange={(e) => setFechaSalida(e.target.value)}
                />
              </div>

              {/* Proyecto */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  🏭 Proyecto *
                </label>
                <select
                  className="salida-form-select"
                  value={proyectoSeleccionado}
                  onChange={(e) => handleSeleccionProyecto(e.target.value)}
                >
                  <option value="">-- Seleccione proyecto --</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id_proyecto} value={proyecto.nombre_proyecto}>
                      {proyecto.nombre_proyecto}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="salida-form-row" style={{ marginTop: '15px' }}>
              
              {/* Trabajador */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  👤 Trabajador *
                </label>
                <select
                  className="salida-form-select"
                  value={trabajadorSeleccionado}
                  onChange={(e) => handleSeleccionTrabajador(e.target.value)}
                >
                  <option value="">-- Seleccione trabajador --</option>
                  {trabajadores.map((trabajador) => (
                    <option key={trabajador.id_personal} value={trabajador.id_personal}>
                      {trabajador.nom_ape}
                    </option>
                  ))}
                </select>
              </div>

              {/* DNI */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  🆔 DNI
                </label>
                <input
                  type="text"
                  className="salida-form-input"
                  value={dniTrabajador}
                  disabled
                />
              </div>

              {/* Área */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  📂 Área
                </label>
                <input
                  type="text"
                  className="salida-form-input"
                  value={areaTrabajador}
                  disabled
                />
              </div>

            </div>

          </div>
        </div>

        {/* CARD 2: DETALLE DEL MATERIAL */}
        <div className="salida-card">
          <div className="salida-card-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <span className="salida-icon">🔍</span>
            <h3 className="salida-card-title">Detalle del Material (Buscar por Descripción)</h3>
          </div>
          <div className="salida-card-body">
            
            <div className="salida-form-row">
              
              {/* Descripción (Producto) */}
              <div className="salida-form-group" style={{ gridColumn: '1 / 3' }}>
                <label className="salida-form-label">
                  📝 Descripción del Producto
                </label>
                <select
                  className="salida-form-select"
                  value={productoSeleccionado}
                  onChange={(e) => handleSeleccionProducto(e.target.value)}
                  disabled={!proyectoSeleccionado}
                >
                  <option value="">-- Seleccione producto --</option>
                  {productosDisponibles.map((producto, index) => (
                    <option key={index} value={producto.descripcion}>
                      {producto.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Código */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  🏷️ Código
                </label>
                <input
                  type="text"
                  className="salida-form-input"
                  value={codigoProducto}
                  disabled
                />
              </div>

            </div>

            <div className="salida-form-row" style={{ marginTop: '15px' }}>
              
              {/* Cantidad */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  🔢 Cantidad
                </label>
                <input
                  type="number"
                  className="salida-form-input"
                  value={cantidadSalida}
                  onChange={(e) => setCantidadSalida(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Unidad */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  📏 Unidad
                </label>
                <input
                  type="text"
                  className="salida-form-input"
                  value={unidadProducto}
                  disabled
                />
              </div>

              {/* Stock Disponible */}
              <div className="salida-form-group">
                <label className="salida-form-label">
                  📊 Stock Disponible
                </label>
                <input
                  type="text"
                  className="salida-form-input"
                  value={stockDisponible}
                  disabled
                  style={{ 
                    fontWeight: '700',
                    color: parseFloat(stockDisponible) > 10 ? '#27ae60' : parseFloat(stockDisponible) > 0 ? '#f39c12' : '#e74c3c'
                  }}
                />
              </div>

            </div>

            <div className="salida-form-row" style={{ marginTop: '15px' }}>
              
              {/* Observaciones */}
              <div className="salida-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="salida-form-label">
                  📝 Observaciones
                </label>
                <textarea
                  className="salida-form-textarea"
                  value={observacionProducto}
                  onChange={(e) => setObservacionProducto(e.target.value)}
                  placeholder="Ingrese observaciones sobre la salida del material..."
                  rows="2"
                />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                className="salida-btn salida-btn-success"
                onClick={handleAgregarProducto}
              >
                <span className="salida-btn-icon">➕</span>
                Agregar Material
              </button>
            </div>

          </div>
        </div>

        {/* CARD 3: MATERIALES A ENTREGAR */}
        <div className="salida-card">
          <div className="salida-card-header" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <span className="salida-icon">📦</span>
            <h3 className="salida-card-title">Materiales a Entregar</h3>
          </div>
          <div className="salida-card-body">
            
            {productosAgregados.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="salida-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Observación</th>
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
                          {producto.cantidad}
                        </td>
                        <td style={{ textAlign: 'center' }}>{producto.unidad}</td>
                        <td>{producto.observaciones || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="salida-table-btn salida-table-btn-eliminar"
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
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
                📦 No hay materiales agregados
              </div>
            )}

          </div>
        </div>

        {/* CARD 4: ACCIONES */}
        <div className="salida-card">
          <div className="salida-card-body">
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              
              <button
                className="salida-btn salida-btn-secondary"
                onClick={limpiarFormulario}
                disabled={cargando}
              >
                <span className="salida-btn-icon">🔄</span>
                Limpiar Formulario
              </button>

              <button
                className="salida-btn salida-btn-success"
                onClick={handleGuardarSalida}
                disabled={cargando || productosAgregados.length === 0}
              >
                <span className="salida-btn-icon">💾</span>
                Guardar y Generar PDF
              </button>

            </div>
          </div>
        </div>

      </div>
    );
  }

  function renderHistorial() {
    return (
      <div className="historial-container">
        
        {/* FILTROS */}
        <div className="salida-card">
          <div className="salida-card-header">
            <span className="salida-icon">🔍</span>
            <h3 className="salida-card-title">Filtros de Búsqueda</h3>
          </div>
          <div className="salida-card-body">
            
            <div className="salida-form-row">
              
              <div className="salida-form-group">
                <label className="salida-form-label">📅 Fecha Desde</label>
                <input
                  type="date"
                  className="salida-form-input"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>

              <div className="salida-form-group">
                <label className="salida-form-label">📅 Fecha Hasta</label>
                <input
                  type="date"
                  className="salida-form-input"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>

              <div className="salida-form-group">
                <label className="salida-form-label">🏭 Proyecto</label>
                <select
                  className="salida-form-select"
                  value={proyectoFiltro}
                  onChange={(e) => setProyectoFiltro(e.target.value)}
                >
                  <option value="">Todos los proyectos</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id_proyecto} value={proyecto.nombre_proyecto}>
                      {proyecto.nombre_proyecto}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
              <button
                className="salida-btn salida-btn-secondary"
                onClick={handleLimpiarFiltros}
              >
                <span className="salida-btn-icon">🔄</span>
                Limpiar
              </button>
              <button
                className="salida-btn salida-btn-primary"
                onClick={cargarHistorial}
              >
                <span className="salida-btn-icon">🔍</span>
                Buscar
              </button>
            </div>

          </div>
        </div>

        {/* TABLA DE HISTORIAL */}
        <div className="salida-card">
          <div className="salida-card-header">
            <span className="salida-icon">📋</span>
            <h3 className="salida-card-title">
              Historial de Salidas
              {historialSalidas.length > 0 && (
                <span className="tab-badge">{historialSalidas.length}</span>
              )}
            </h3>
          </div>
          <div className="salida-card-body">
            
            {historialSalidas.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="salida-table">
                  <thead>
                    <tr>
                      <th>N° Salida</th>
                      <th>Fecha</th>
                      <th>Proyecto</th>
                      <th>Trabajador</th>
                      <th>Usuario Registro</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialSalidas.map((salida, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: '600', color: '#667eea' }}>
                          {salida.numero_salida}
                        </td>
                        <td>{new Date(salida.fecha_salida).toLocaleDateString('es-ES')}</td>
                        <td>{salida.proyecto_almacen}</td>
                        <td>{salida.trabajador}</td>
                        <td>{salida.usuario_registro}</td>
                        <td>{new Date(salida.fecha_registro).toLocaleString('es-ES')}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="salida-table-btn salida-table-btn-pdf"
                            onClick={() => handleDescargarPDF(salida.numero_salida)}
                            title="Descargar PDF"
                          >
                            📄 PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
                📭 No hay registros de salidas
              </div>
            )}

          </div>
        </div>

      </div>
    );
  }
};

export default SalidaMateriales;
