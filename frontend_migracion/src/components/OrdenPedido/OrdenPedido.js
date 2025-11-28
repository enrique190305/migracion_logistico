import React, { useState, useEffect } from 'react';
import './OrdenPedido.css';
import {
  obtenerEmpresas,
  obtenerBodegasPorEmpresa,
  obtenerProductos,
  obtenerCorrelativo,
  guardarOrdenPedido
} from '../../services/pedidosAPI';
import Notificacion from './Notificacion';

const OrdenPedido = () => {
  // Estados para catálogos
  const [empresas, setEmpresas] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [productos, setProductos] = useState([]);

  // Estados para formulario
  const [correlativo, setCorrelativo] = useState('');
  const [idEmpresa, setIdEmpresa] = useState('');
  const [idBodega, setIdBodega] = useState('');
  const [fechaPedido, setFechaPedido] = useState('');
  const [observacionGeneral, setObservacionGeneral] = useState('');

  // Estados para detalle de productos
  const [detalles, setDetalles] = useState([{
    id: 1,
    codigoProducto: '',
    descripcion: '',
    unidadMedida: '',
    cantidadSolicitada: '',
    observacion: ''
  }]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  
  // Estado para notificaciones personalizadas
  const [notificacion, setNotificacion] = useState(null);

  // Estados para búsqueda de productos
  const [busquedaProducto, setBusquedaProducto] = useState({});
  const [dropdownAbierto, setDropdownAbierto] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState({});

  /**
   * Mostrar notificación personalizada
   */
  const mostrarNotificacion = (tipo, titulo, mensaje, detalles = []) => {
    setNotificacion({
      tipo,
      titulo,
      mensaje,
      detalles
    });
  };

  /**
   * Cerrar notificación
   */
  const cerrarNotificacion = () => {
    setNotificacion(null);
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [empresasData, productosData, correlativoData] = await Promise.all([
        obtenerEmpresas(),
        obtenerProductos(),
        obtenerCorrelativo()
      ]);

      setEmpresas(empresasData);
      setProductos(productosData);
      setCorrelativo(correlativoData);
      
      // Fecha actual por defecto (zona horaria local)
      const hoy = new Date();
      const fechaLocal = hoy.getFullYear() + '-' + 
                        String(hoy.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(hoy.getDate()).padStart(2, '0');
      setFechaPedido(fechaLocal);

    } catch (err) {
      mostrarNotificacion(
        'error',
        'Error al Cargar Datos',
        'No se pudieron cargar los datos iniciales del formulario.',
        [
          { label: '❌ Error', valor: err.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Por favor recargue la página' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de empresa
  const handleEmpresaChange = async (e) => {
    const empresaId = e.target.value;
    setIdEmpresa(empresaId);
    setIdBodega(''); // Limpiar bodega seleccionada
    setBodegas([]); // Limpiar lista de bodegas

    if (empresaId) {
      try {
        const bodegasData = await obtenerBodegasPorEmpresa(empresaId);
        setBodegas(bodegasData);
      } catch (err) {
        mostrarNotificacion(
          'error',
          'Error al Cargar Bodegas',
          'No se pudieron cargar las bodegas de la empresa seleccionada.',
          [
            { label: '❌ Error', valor: err.message || 'Error desconocido' },
            { label: '🏢 Empresa', valor: empresas.find(e => e.id_empresa === parseInt(empresaId))?.razon_social || '' }
          ]
        );
      }
    }
  };

  // Manejar cambio de producto en detalle
  const handleProductoChange = (index, codigoProducto) => {
    const producto = productos.find(p => p.codigo_producto === codigoProducto);
    
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      codigoProducto: codigoProducto,
      descripcion: producto ? producto.descripcion : '',
      unidadMedida: producto ? producto.unidad : ''
    };
    setDetalles(nuevosDetalles);

    // Actualizar búsqueda con la descripción del producto seleccionado
    setBusquedaProducto({
      ...busquedaProducto,
      [index]: producto ? producto.descripcion : ''
    });

    // Cerrar el dropdown
    setDropdownAbierto({
      ...dropdownAbierto,
      [index]: false
    });
  };

  // Manejar búsqueda de productos
  const handleBusquedaChange = (index, valor) => {
    setBusquedaProducto({
      ...busquedaProducto,
      [index]: valor
    });

    // Abrir dropdown siempre que haya cambio
    setDropdownAbierto({
      ...dropdownAbierto,
      [index]: true
    });

    // Si se borra el texto, limpiar la selección
    if (!valor) {
      const nuevosDetalles = [...detalles];
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        codigoProducto: '',
        descripcion: '',
        unidadMedida: ''
      };
      setDetalles(nuevosDetalles);
    }
  };

  // Filtrar productos según búsqueda
  const filtrarProductos = (index) => {
    const busqueda = (busquedaProducto[index] || '').toLowerCase();
    if (!busqueda) return productos;
    
    return productos.filter(prod => 
      prod.descripcion.toLowerCase().includes(busqueda) ||
      prod.codigo_producto.toLowerCase().includes(busqueda)
    );
  };

  // Manejar foco en búsqueda
  const handleBusquedaFocus = (index, event) => {
    const rect = event.target.getBoundingClientRect();
    setDropdownPosition({
      ...dropdownPosition,
      [index]: {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      }
    });
    setDropdownAbierto({
      ...dropdownAbierto,
      [index]: true
    });
  };

  // Toggle dropdown (abrir/cerrar al hacer clic en el botón)
  const toggleDropdown = (index, event) => {
    const input = event.target.closest('.combobox-input-wrapper').querySelector('.input-busqueda-producto');
    const rect = input.getBoundingClientRect();
    
    setDropdownPosition({
      ...dropdownPosition,
      [index]: {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      }
    });
    
    setDropdownAbierto({
      ...dropdownAbierto,
      [index]: !dropdownAbierto[index]
    });
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.producto-combobox') && 
          !event.target.closest('.dropdown-productos-fixed')) {
        setDropdownAbierto({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar campo de detalle
  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][field] = value;
    setDetalles(nuevosDetalles);
  };

  // Agregar nueva línea de detalle
  const agregarDetalle = () => {
    const nuevoId = detalles.length + 1;
    setDetalles([...detalles, {
      id: nuevoId,
      codigoProducto: '',
      descripcion: '',
      unidadMedida: '',
      cantidadSolicitada: '',
      observacion: ''
    }]);
    // Inicializar búsqueda vacía para la nueva fila
    setBusquedaProducto({
      ...busquedaProducto,
      [detalles.length]: ''
    });
  };

  // Eliminar línea de detalle
  const eliminarDetalle = (index) => {
    if (detalles.length > 1) {
      setDetalles(detalles.filter((_, i) => i !== index));
      
      // Limpiar búsqueda y dropdown de la fila eliminada
      const nuevaBusqueda = { ...busquedaProducto };
      const nuevoDropdown = { ...dropdownAbierto };
      delete nuevaBusqueda[index];
      delete nuevoDropdown[index];
      setBusquedaProducto(nuevaBusqueda);
      setDropdownAbierto(nuevoDropdown);
    }
  };

  // Limpiar formulario
  const limpiarFormulario = async () => {
    setIdEmpresa('');
    setIdBodega('');
    setBodegas([]);
    setObservacionGeneral('');
    setDetalles([{
      id: 1,
      codigoProducto: '',
      descripcion: '',
      unidadMedida: '',
      cantidadSolicitada: '',
      observacion: ''
    }]);
    
    // Limpiar búsquedas y dropdowns
    setBusquedaProducto({});
    setDropdownAbierto({});

    // Fecha actual (zona horaria local)
    const hoy = new Date();
    const fechaLocal = hoy.getFullYear() + '-' + 
                      String(hoy.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(hoy.getDate()).padStart(2, '0');
    setFechaPedido(fechaLocal);

    try {
      const nuevoCorrelativo = await obtenerCorrelativo();
      setCorrelativo(nuevoCorrelativo);
    } catch (err) {
      mostrarNotificacion(
        'error',
        'Error al Obtener Correlativo',
        'No se pudo obtener el nuevo correlativo.',
        [
          { label: '❌ Error', valor: err.message || 'Error desconocido' }
        ]
      );
    }
  };

  // Guardar orden de pedido
  const handleGuardar = async () => {
    try {
      // Validaciones
      if (!idEmpresa) {
        mostrarNotificacion(
          'warning',
          'Empresa Requerida',
          'Debe seleccionar una empresa antes de continuar.',
          [
            { label: '⚠️ Campo faltante', valor: 'Razón Social (Empresa)' },
            { label: '📋 Acción', valor: 'Seleccione una empresa de la lista' }
          ]
        );
        return;
      }
      if (!idBodega) {
        mostrarNotificacion(
          'warning',
          'Bodega Requerida',
          'Debe seleccionar una bodega antes de continuar.',
          [
            { label: '⚠️ Campo faltante', valor: 'Bodega' },
            { label: '🏢 Empresa', valor: empresas.find(e => e.id_empresa === parseInt(idEmpresa))?.razon_social || '' },
            { label: '📋 Acción', valor: 'Seleccione una bodega de la lista' }
          ]
        );
        return;
      }
      if (!fechaPedido) {
        mostrarNotificacion(
          'warning',
          'Fecha Requerida',
          'Debe ingresar la fecha del pedido.',
          [
            { label: '⚠️ Campo faltante', valor: 'Fecha de Creación' },
            { label: '📋 Acción', valor: 'Ingrese una fecha válida' }
          ]
        );
        return;
      }

      // Validar detalles
      const detallesValidos = detalles.filter(d => d.codigoProducto && d.cantidadSolicitada > 0);
      if (detallesValidos.length === 0) {
        mostrarNotificacion(
          'warning',
          'Productos Requeridos',
          'Debe agregar al menos un producto con cantidad mayor a cero.',
          [
            { label: '⚠️ Problema', valor: 'No hay productos válidos' },
            { label: '📦 Total de líneas', valor: detalles.length },
            { label: '✓ Líneas válidas', valor: '0' },
            { label: '📋 Acción', valor: 'Agregue productos y especifique cantidades' }
          ]
        );
        return;
      }

      setLoading(true);

      // Preparar datos
      const ordenData = {
        correlativo,
        id_empresa: parseInt(idEmpresa),
        id_bodega: parseInt(idBodega),
        fecha_pedido: fechaPedido,
        observacion: observacionGeneral || null,
        detalles: detallesValidos.map(d => ({
          codigo_producto: d.codigoProducto,
          cantidad_solicitada: parseFloat(d.cantidadSolicitada),
          observacion: d.observacion || null
        }))
      };

      await guardarOrdenPedido(ordenData);
      
      // Obtener datos para la notificación
      const empresaSeleccionada = empresas.find(e => e.id_empresa === parseInt(idEmpresa));
      const bodegaSeleccionada = bodegas.find(b => b.id_bodega === parseInt(idBodega));
      
      mostrarNotificacion(
        'success',
        'Orden de Pedido Guardada',
        'La orden de pedido se ha registrado exitosamente en el sistema.',
        [
          { label: '📋 Correlativo', valor: correlativo },
          { label: '🏢 Empresa', valor: empresaSeleccionada?.razon_social || '' },
          { label: '📍 Bodega', valor: bodegaSeleccionada?.nombre || '' },
          { label: '📦 Productos', valor: detallesValidos.length },
          { label: '📅 Fecha', valor: new Date(fechaPedido).toLocaleDateString('es-PE') },
          { label: '✅ Estado', valor: 'PENDIENTE' }
        ]
      );
      
      setTimeout(() => {
        limpiarFormulario();
        cerrarNotificacion();
      }, 4000);

    } catch (err) {
      mostrarNotificacion(
        'error',
        'Error al Guardar Orden',
        'Ocurrió un error al intentar guardar la orden de pedido.',
        [
          { label: '❌ Error', valor: err.message || 'Error desconocido' },
          { label: '📋 Correlativo', valor: correlativo },
          { label: '🔧 Acción', valor: 'Verifique los datos e intente nuevamente' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orden-pedido-container">
      <div className="orden-pedido-header">
        <h2>📋 Orden de Pedido</h2>
        <p className="orden-pedido-subtitle">Solicitud de productos para proyectos</p>
      </div>

      {/* Mensaje de carga */}
      {loading && <div className="mensaje-info">⏳ Cargando...</div>}

      {/* Formulario Principal */}
      <div className="orden-pedido-form">
        
        {/* Sección de Cabecera */}
        <div className="seccion">
          <h3 className="seccion-titulo">📄 Información General</h3>
          
          <div className="form-grid">
            {/* Correlativo */}
            <div className="form-group">
              <label>Correlativo</label>
              <input
                type="text"
                value={correlativo}
                readOnly
                className="input-readonly"
              />
            </div>

            {/* Fecha */}
            <div className="form-group">
              <label>Fecha de Creación *</label>
              <input
                type="date"
                value={fechaPedido}
                onChange={(e) => setFechaPedido(e.target.value)}
                required
              />
            </div>

            {/* Razón Social */}
            <div className="form-group full-width">
              <label>Razón Social (Empresa) *</label>
              <select
                value={idEmpresa}
                onChange={handleEmpresaChange}
                required
              >
                <option value="">-- Seleccione una empresa --</option>
                {empresas.map(empresa => (
                  <option key={empresa.id_empresa} value={empresa.id_empresa}>
                    {empresa.razon_social} {empresa.ruc ? `- RUC: ${empresa.ruc}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Bodega */}
            <div className="form-group full-width">
              <label>Bodega *</label>
              <select
                value={idBodega}
                onChange={(e) => setIdBodega(e.target.value)}
                disabled={!idEmpresa}
                required
              >
                <option value="">-- Seleccione una bodega --</option>
                {bodegas.map(bodega => (
                  <option key={bodega.id_bodega} value={bodega.id_bodega}>
                    {bodega.nombre} 
                    {bodega.ubicacion ? ` - ${bodega.ubicacion}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sección de Productos */}
        <div className="seccion">
          <div className="seccion-header">
            <h3 className="seccion-titulo">🛒 Productos Solicitados</h3>
            <button className="btn-agregar" onClick={agregarDetalle}>
              ➕ Agregar Producto
            </button>
          </div>

          <div className="tabla-container">
            <table className="tabla-productos">
              <thead>
                <tr>
                  <th style={{width: '30%'}}>Producto *</th>
                  <th style={{width: '15%'}}>Código</th>
                  <th style={{width: '10%'}}>U. Medida</th>
                  <th style={{width: '15%'}}>Cantidad *</th>
                  <th style={{width: '25%'}}>Observaciones</th>
                  <th style={{width: '5%'}}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => (
                  <tr key={detalle.id}>
                    {/* Producto */}
                    <td>
                      <div className="producto-combobox">
                        <div className="combobox-input-wrapper">
                          <input
                            type="text"
                            value={busquedaProducto[index] || ''}
                            onChange={(e) => handleBusquedaChange(index, e.target.value)}
                            onFocus={(e) => handleBusquedaFocus(index, e)}
                            placeholder="Seleccione o busque un producto..."
                            className="input-busqueda-producto"
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            className="btn-dropdown-toggle"
                            onClick={(e) => toggleDropdown(index, e)}
                            tabIndex="-1"
                          >
                            <span className={`dropdown-arrow ${dropdownAbierto[index] ? 'open' : ''}`}>▼</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Código (autocompleta) */}
                    <td>
                      <input
                        type="text"
                        value={detalle.codigoProducto}
                        readOnly
                        className="input-readonly-small"
                      />
                    </td>

                    {/* U. Medida (autocompleta) */}
                    <td>
                      <input
                        type="text"
                        value={detalle.unidadMedida}
                        readOnly
                        className="input-readonly-small"
                      />
                    </td>

                    {/* Cantidad */}
                    <td>
                      <input
                        type="number"
                        value={detalle.cantidadSolicitada}
                        onChange={(e) => handleDetalleChange(index, 'cantidadSolicitada', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </td>

                    {/* Observaciones */}
                    <td>
                      <input
                        type="text"
                        value={detalle.observacion}
                        onChange={(e) => handleDetalleChange(index, 'observacion', e.target.value)}
                        placeholder="Opcional"
                      />
                    </td>

                    {/* Eliminar */}
                    <td>
                      <button
                        className="btn-eliminar-fila"
                        onClick={() => eliminarDetalle(index)}
                        disabled={detalles.length === 1}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observaciones Generales */}
        <div className="seccion">
          <h3 className="seccion-titulo">📝 Observaciones Generales</h3>
          <textarea
            value={observacionGeneral}
            onChange={(e) => setObservacionGeneral(e.target.value)}
            placeholder="Ingrese observaciones generales de la orden de pedido (opcional)"
            rows="4"
            className="textarea-observaciones"
          />
        </div>

        {/* Botones de acción */}
        <div className="acciones-footer">
          <button 
            className="btn-limpiar"
            onClick={limpiarFormulario}
            disabled={loading}
          >
            🔄 Limpiar
          </button>
          <button 
            className="btn-guardar"
            onClick={handleGuardar}
            disabled={loading}
          >
            💾 Guardar Orden de Pedido
          </button>
        </div>
      </div>
      
      {/* Componente de Notificación */}
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          detalles={notificacion.detalles}
          onClose={cerrarNotificacion}
        />
      )}

      {/* Dropdown de productos (renderizado fuera de la tabla) */}
      {Object.keys(dropdownAbierto).map(index => 
        dropdownAbierto[index] && dropdownPosition[index] && (
          <div 
            key={`dropdown-${index}`}
            className="dropdown-productos-fixed"
            style={{
              top: `${dropdownPosition[index].top}px`,
              left: `${dropdownPosition[index].left}px`,
              width: `${dropdownPosition[index].width}px`
            }}
          >
            {filtrarProductos(parseInt(index)).length > 0 ? (
              filtrarProductos(parseInt(index)).map(prod => (
                <div
                  key={prod.codigo_producto}
                  className="dropdown-item"
                  onClick={() => handleProductoChange(parseInt(index), prod.codigo_producto)}
                >
                  <div className="dropdown-item-desc">{prod.descripcion}</div>
                  <div className="dropdown-item-codigo">Código: {prod.codigo_producto}</div>
                </div>
              ))
            ) : (
              <div className="dropdown-item-vacio">
                {busquedaProducto[index] ? '🔍 No se encontraron productos' : '📦 Comience a escribir para buscar'}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default OrdenPedido;
