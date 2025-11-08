import React, { useState } from 'react';
import './Prestamos.css'; 

const Prestamos = () => {
  const [activeTab, setActiveTab] = useState('nuevo'); // 'nuevo', 'historial', 'codigo'
  const [registroManual, setRegistroManual] = useState({
    codigoPersonal: '',
    nombrePersonal: '',
    codigoProducto: '',
    nombreProducto: '',
    fechaPrestamo: new Date().toISOString().slice(0, 16)
  });

  const [listaPrestamosPendientes, setListaPrestamosPendientes] = useState([]);
  
  // Estados para generación de códigos de barras
  const [configBarras, setConfigBarras] = useState({
    tipo: 'personal', // 'personal', 'productos', 'ambos'
    ancho: 80,
    alto: 40,
    fontSize: 12,
    margen: 2
  });
  const [personalSeleccionado, setPersonalSeleccionado] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [codigosGenerados, setCodigosGenerados] = useState([]);
  
  // Datos estáticos de productos NO CONSUMIBLES
  const productosNoConsumibles = [
    { codigo: 'HER-0003', nombre: 'MARTILLO DE GOMA', tipo: 'NO CONSUMIBLE' },
    { codigo: 'HER-0001', nombre: 'DESTORNILLADOR PLANO', tipo: 'NO CONSUMIBLE' },
    { codigo: 'HER-0005', nombre: 'ALICATE DE PRESIÓN', tipo: 'NO CONSUMIBLE' },
    { codigo: 'ACTI-0001', nombre: 'LAPTOP DELL INSPIRON', tipo: 'NO CONSUMIBLE' },
    { codigo: 'ACTI-0002', nombre: 'TALADRO BOSCH', tipo: 'NO CONSUMIBLE' },
    { codigo: 'EPROT-0001', nombre: 'CASCO DE SEGURIDAD', tipo: 'NO CONSUMIBLE' },
    { codigo: 'EPROT-0003', nombre: 'ARNÉS DE SEGURIDAD', tipo: 'NO CONSUMIBLE' }
  ];

  // Datos estáticos de personal
  const personalData = [
    { codigo: '12345678', nombre: 'Juan Pérez' },
    { codigo: '23456789', nombre: 'María López' },
    { codigo: '34567890', nombre: 'Carlos Ramírez' },
    { codigo: '45678901', nombre: 'Ana García' },
    { codigo: '56789012', nombre: 'Luis Torres' }
  ];

  // Historial de préstamos (datos estáticos)
  const [historialPrestamos] = useState([
    {
      codigoProducto: 'ALV-0002',
      nombreProducto: 'ALVEOL',
      codigoUsuario: '12345678',
      nombreUsuario: 'Juan Pérez',
      fechaPrestamo: '13/09/2025 01:49:12',
      fechaDevolucion: '13/09/2025 01:49',
      estado: 'DEVUELTO'
    },
    {
      codigoProducto: 'ALV-0002',
      nombreProducto: 'ALVEOL',
      codigoUsuario: '12345678',
      nombreUsuario: 'Juan Pérez',
      fechaPrestamo: '13/09/2025 01:13:15',
      fechaDevolucion: '13/09/2025 01:13',
      estado: 'DEVUELTO'
    },
    {
      codigoProducto: 'ALV-0002',
      nombreProducto: 'ALVEOL',
      codigoUsuario: '12345678',
      nombreUsuario: 'Juan Pérez',
      fechaPrestamo: '13/09/2025 00:42:37',
      fechaDevolucion: '13/09/2025 00:43',
      estado: 'DEVUELTO'
    },
    {
      codigoProducto: 'CAJ-0001',
      nombreProducto: 'CAJAS',
      codigoUsuario: '12345678',
      nombreUsuario: 'Juan Pérez',
      fechaPrestamo: '13/09/2025 00:12:38',
      fechaDevolucion: '13/09/2025 00:12',
      estado: 'DEVUELTO'
    },
    {
      codigoProducto: 'FER-0006',
      nombreProducto: 'FERT',
      codigoUsuario: '23456789',
      nombreUsuario: 'María López',
      fechaPrestamo: '26/08/2025 23:55:20',
      fechaDevolucion: '26/08/2025 23:55',
      estado: 'DEVUELTO'
    },
    {
      codigoProducto: 'BAN-0001',
      nombreProducto: 'BANDJA',
      codigoUsuario: '34567890',
      nombreUsuario: 'Carlos Ramírez',
      fechaPrestamo: '26/08/2025 23:50:58',
      fechaDevolucion: '13/09/2025 00:13',
      estado: 'DEVUELTO'
    },
    {
      codigoProducto: 'ACT-0001',
      nombreProducto: 'ACTI',
      codigoUsuario: '12345678',
      nombreUsuario: 'Juan Pérez',
      fechaPrestamo: '26/08/2025 23:50:13',
      fechaDevolucion: '13/09/2025 00:43',
      estado: 'DEVUELTO'
    }
  ]);

  const handleAgregarPrestamo = () => {
    if (!registroManual.codigoPersonal || !registroManual.codigoProducto) {
      alert('⚠️ Por favor complete el código del personal y del producto');
      return;
    }

    const nuevoPrestamo = {
      codigoProducto: registroManual.codigoProducto,
      nombreProducto: registroManual.nombreProducto,
      codigoPersonal: registroManual.codigoPersonal,
      nombrePersonal: registroManual.nombrePersonal
    };

    setListaPrestamosPendientes([...listaPrestamosPendientes, nuevoPrestamo]);
    
    // Limpiar formulario
    setRegistroManual({
      codigoPersonal: '',
      nombrePersonal: '',
      codigoProducto: '',
      nombreProducto: '',
      fechaPrestamo: new Date().toISOString().slice(0, 16)
    });
  };

  const handleBuscarPersonal = (codigo) => {
    const personal = personalData.find(p => p.codigo === codigo);
    if (personal) {
      setRegistroManual({
        ...registroManual,
        codigoPersonal: codigo,
        nombrePersonal: personal.nombre
      });
    } else {
      setRegistroManual({
        ...registroManual,
        codigoPersonal: codigo,
        nombrePersonal: ''
      });
    }
  };

  const handleBuscarProducto = (codigo) => {
    const producto = productosNoConsumibles.find(p => p.codigo === codigo);
    if (producto) {
      setRegistroManual({
        ...registroManual,
        codigoProducto: codigo,
        nombreProducto: producto.nombre
      });
    } else {
      setRegistroManual({
        ...registroManual,
        codigoProducto: codigo,
        nombreProducto: ''
      });
    }
  };

  const handleGuardarPrestamos = () => {
    if (listaPrestamosPendientes.length === 0) {
      alert('⚠️ No hay préstamos pendientes para guardar');
      return;
    }
    
    alert('✅ Préstamos guardados exitosamente (Simulación)');
    setListaPrestamosPendientes([]);
  };

  const handleLimpiarLista = () => {
    setListaPrestamosPendientes([]);
  };

  const handleDevolverPrestamo = () => {
    alert('✅ Devolución de préstamo registrada (Simulación)');
  };

  // Funciones para códigos de barras
  const togglePersonalSeleccion = (codigo) => {
    if (personalSeleccionado.includes(codigo)) {
      setPersonalSeleccionado(personalSeleccionado.filter(c => c !== codigo));
    } else {
      setPersonalSeleccionado([...personalSeleccionado, codigo]);
    }
  };

  const toggleProductoSeleccion = (codigo) => {
    if (productosSeleccionados.includes(codigo)) {
      setProductosSeleccionados(productosSeleccionados.filter(c => c !== codigo));
    } else {
      setProductosSeleccionados([...productosSeleccionados, codigo]);
    }
  };

  const seleccionarTodoPersonal = () => {
    if (personalSeleccionado.length === personalData.length) {
      setPersonalSeleccionado([]);
    } else {
      setPersonalSeleccionado(personalData.map(p => p.codigo));
    }
  };

  const seleccionarTodoProductos = () => {
    if (productosSeleccionados.length === productosNoConsumibles.length) {
      setProductosSeleccionados([]);
    } else {
      setProductosSeleccionados(productosNoConsumibles.map(p => p.codigo));
    }
  };

  const generarCodigos = () => {
    const codigos = [];
    
    if (configBarras.tipo === 'personal' || configBarras.tipo === 'ambos') {
      personalSeleccionado.forEach(codigo => {
        const persona = personalData.find(p => p.codigo === codigo);
        if (persona) {
          codigos.push({
            tipo: 'personal',
            codigo: persona.codigo,
            nombre: persona.nombre,
            ancho: configBarras.ancho,
            alto: configBarras.alto,
            fontSize: configBarras.fontSize,
            margen: configBarras.margen
          });
        }
      });
    }
    
    if (configBarras.tipo === 'productos' || configBarras.tipo === 'ambos') {
      productosSeleccionados.forEach(codigo => {
        const producto = productosNoConsumibles.find(p => p.codigo === codigo);
        if (producto) {
          codigos.push({
            tipo: 'producto',
            codigo: producto.codigo,
            nombre: producto.nombre,
            ancho: configBarras.ancho,
            alto: configBarras.alto,
            fontSize: configBarras.fontSize,
            margen: configBarras.margen
          });
        }
      });
    }
    
    if (codigos.length === 0) {
      alert('⚠️ Por favor seleccione al menos un item para generar códigos de barras');
      return;
    }
    
    setCodigosGenerados(codigos);
    alert(`✅ ${codigos.length} código(s) de barras generado(s) exitosamente`);
  };

  const descargarPDF = () => {
    if (codigosGenerados.length === 0) {
      alert('⚠️ Primero debe generar los códigos de barras');
      return;
    }
    alert('📥 Función de descarga PDF en desarrollo\n\nEn producción, aquí se generará un PDF con todos los códigos de barras.');
  };

  const imprimirCodigos = () => {
    if (codigosGenerados.length === 0) {
      alert('⚠️ Primero debe generar los códigos de barras');
      return;
    }
    window.print();
  };

  return (
    <div className="prestamos-container">
      <div className="prestamos-header">
        <h1>💳 Gestión de Préstamos</h1>
      </div>

      {/* Pestañas de navegación */}
      <div className="prestamos-tabs">
        <button 
          className={`tab-btn ${activeTab === 'nuevo' ? 'active' : ''}`}
          onClick={() => setActiveTab('nuevo')}
        >
          📝 Nuevo Préstamo
        </button>
        <button 
          className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          📜 Historial de Préstamos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'codigo' ? 'active' : ''}`}
          onClick={() => setActiveTab('codigo')}
        >
          🔍 Código de Barras
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'nuevo' && (
        <div className="prestamo-content">
          {/* Sección de Registro Manual */}
          <div className="registro-manual-section">
            <h3>📝 Registro Manual por Código</h3>
            
            <div className="form-row-4cols">
              <div className="form-group">
                <label>👤 Código del Personal</label>
                <input
                  type="text"
                  placeholder="Escanee o escriba código"
                  value={registroManual.codigoPersonal}
                  onChange={(e) => handleBuscarPersonal(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>📋 Nombre del Personal</label>
                <input
                  type="text"
                  placeholder="Nombre del personal aparecerá..."
                  value={registroManual.nombrePersonal}
                  readOnly
                />
              </div>
              
              <div className="form-group">
                <label>🔧 Código Producto</label>
                <input
                  type="text"
                  placeholder="Escanee o escriba código"
                  value={registroManual.codigoProducto}
                  onChange={(e) => handleBuscarProducto(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>📦 Nombre del Producto</label>
                <input
                  type="text"
                  placeholder="Nombre del producto aparecerá..."
                  value={registroManual.nombreProducto}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row-2cols">
              <div className="form-group">
                <label>📅 Fecha de Préstamo</label>
                <input
                  type="datetime-local"
                  value={registroManual.fechaPrestamo}
                  onChange={(e) => setRegistroManual({...registroManual, fechaPrestamo: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <button className="btn-agregar" onClick={handleAgregarPrestamo}>
                  ➕ Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Préstamos Pendientes */}
          <div className="lista-pendientes-section">
            <h3>📋 Lista de Préstamos Pendientes</h3>
            
            <div className="tabla-wrapper">
              <table className="tabla-prestamos">
                <thead>
                  <tr>
                    <th>Código del Producto</th>
                    <th>Nombre del Producto</th>
                    <th>Código del Personal</th>
                    <th>Nombre del Personal</th>
                  </tr>
                </thead>
                <tbody>
                  {listaPrestamosPendientes.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No hay préstamos pendientes
                      </td>
                    </tr>
                  ) : (
                    listaPrestamosPendientes.map((prestamo, index) => (
                      <tr key={index}>
                        <td>{prestamo.codigoProducto}</td>
                        <td>{prestamo.nombreProducto}</td>
                        <td>{prestamo.codigoPersonal}</td>
                        <td>{prestamo.nombrePersonal}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="acciones-footer">
            <button className="btn-devolver" onClick={handleDevolverPrestamo}>
              🔄 Devolver Préstamo
            </button>
            <button className="btn-limpiar" onClick={handleLimpiarLista}>
              🗑️ Limpiar Lista
            </button>
            <button className="btn-guardar" onClick={handleGuardarPrestamos}>
              💾 Guardar Préstamos
            </button>
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="historial-content">
          <h3>📜 Historial Completo de Préstamos</h3>
          
          <div className="tabla-wrapper">
            <table className="tabla-historial">
              <thead>
                <tr>
                  <th>Código Producto</th>
                  <th>Nombre Producto</th>
                  <th>Código del Usuario</th>
                  <th>Nombre del Usuario</th>
                  <th>Fecha de Préstamo</th>
                  <th>Fecha de Devolución</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historialPrestamos.map((item, index) => (
                  <tr key={index}>
                    <td>{item.codigoProducto}</td>
                    <td>{item.nombreProducto}</td>
                    <td>{item.codigoUsuario}</td>
                    <td>{item.nombreUsuario}</td>
                    <td>{item.fechaPrestamo}</td>
                    <td>{item.fechaDevolucion}</td>
                    <td>
                      <span className={`estado-badge ${item.estado.toLowerCase()}`}>
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'codigo' && (
        <div className="codigo-barras-content">
          <h3>🔍 Generador de Códigos de Barras Múltiples</h3>
          
          {/* Configuración de generación */}
          <div className="config-section">
            <h4>⚙️ CONFIGURACIÓN DE GENERACIÓN</h4>
            
            <div className="config-grid">
              <div className="config-group">
                <label>Tipo de Código:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="personal"
                      checked={configBarras.tipo === 'personal'}
                      onChange={(e) => setConfigBarras({...configBarras, tipo: e.target.value})}
                    />
                    <span>👤 Personal</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="productos"
                      checked={configBarras.tipo === 'productos'}
                      onChange={(e) => setConfigBarras({...configBarras, tipo: e.target.value})}
                    />
                    <span>📦 Productos</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="ambos"
                      checked={configBarras.tipo === 'ambos'}
                      onChange={(e) => setConfigBarras({...configBarras, tipo: e.target.value})}
                    />
                    <span>🔀 Ambos</span>
                  </label>
                </div>
              </div>
              
              <div className="medidas-grid">
                <div className="medida-input">
                  <label>📏 Ancho (mm):</label>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    value={configBarras.ancho}
                    onChange={(e) => setConfigBarras({...configBarras, ancho: parseInt(e.target.value)})}
                  />
                </div>
                <div className="medida-input">
                  <label>📐 Alto (mm):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={configBarras.alto}
                    onChange={(e) => setConfigBarras({...configBarras, alto: parseInt(e.target.value)})}
                  />
                </div>
                <div className="medida-input">
                  <label>🔤 Tamaño fuente (px):</label>
                  <input
                    type="number"
                    min="8"
                    max="24"
                    value={configBarras.fontSize}
                    onChange={(e) => setConfigBarras({...configBarras, fontSize: parseInt(e.target.value)})}
                  />
                </div>
                <div className="medida-input">
                  <label>📏 Margen (mm):</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={configBarras.margen}
                    onChange={(e) => setConfigBarras({...configBarras, margen: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selección de items */}
          <div className="seleccion-section">
            <h4>📋 SELECCIÓN DE ITEMS</h4>
            
            <div className="seleccion-grid">
              {/* Personal */}
              {(configBarras.tipo === 'personal' || configBarras.tipo === 'ambos') && (
                <div className="seleccion-box">
                  <div className="seleccion-header">
                    <h5>👤 Personal ({personalSeleccionado.length}/{personalData.length})</h5>
                    <button 
                      className="btn-seleccionar-todo"
                      onClick={seleccionarTodoPersonal}
                    >
                      {personalSeleccionado.length === personalData.length ? '❌ Deseleccionar' : '✅ Seleccionar Todo'}
                    </button>
                  </div>
                  <div className="items-list">
                    {personalData.map((p) => (
                      <label key={p.codigo} className="item-checkbox">
                        <input
                          type="checkbox"
                          checked={personalSeleccionado.includes(p.codigo)}
                          onChange={() => togglePersonalSeleccion(p.codigo)}
                        />
                        <span>{p.nombre} - {p.codigo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Productos */}
              {(configBarras.tipo === 'productos' || configBarras.tipo === 'ambos') && (
                <div className="seleccion-box">
                  <div className="seleccion-header">
                    <h5>📦 Productos ({productosSeleccionados.length}/{productosNoConsumibles.length})</h5>
                    <button 
                      className="btn-seleccionar-todo"
                      onClick={seleccionarTodoProductos}
                    >
                      {productosSeleccionados.length === productosNoConsumibles.length ? '❌ Deseleccionar' : '✅ Seleccionar Todo'}
                    </button>
                  </div>
                  <div className="items-list">
                    {productosNoConsumibles.map((p) => (
                      <label key={p.codigo} className="item-checkbox">
                        <input
                          type="checkbox"
                          checked={productosSeleccionados.includes(p.codigo)}
                          onChange={() => toggleProductoSeleccion(p.codigo)}
                        />
                        <span>{p.nombre} - {p.codigo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview de códigos generados */}
          {codigosGenerados.length > 0 && (
            <div className="preview-section">
              <h4>🔲 PREVIEW DE CÓDIGOS GENERADOS ({codigosGenerados.length} códigos)</h4>
              <div className="codigos-preview-grid">
                {codigosGenerados.map((codigo, index) => (
                  <div 
                    key={index} 
                    className="codigo-preview-item"
                    style={{
                      width: `${codigo.ancho}mm`,
                      minHeight: `${codigo.alto}mm`,
                      padding: `${codigo.margen}mm`,
                      fontSize: `${codigo.fontSize}px`
                    }}
                  >
                    <div className="codigo-preview-header">
                      {codigo.tipo === 'personal' ? '👤' : '📦'} {codigo.nombre}
                    </div>
                    <div className="codigo-preview-barras">
                      | | | | | | | | | | | | | | | |
                    </div>
                    <div className="codigo-preview-numero">{codigo.codigo}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="barras-acciones-footer">
            <button className="btn-generar-barras" onClick={generarCodigos}>
              🔲 Generar Códigos ({(configBarras.tipo === 'personal' ? personalSeleccionado.length : 0) + (configBarras.tipo === 'productos' ? productosSeleccionados.length : 0) + (configBarras.tipo === 'ambos' ? personalSeleccionado.length + productosSeleccionados.length : 0)})
            </button>
            <button className="btn-descargar-pdf" onClick={descargarPDF} disabled={codigosGenerados.length === 0}>
              📥 Descargar PDF
            </button>
            <button className="btn-imprimir" onClick={imprimirCodigos} disabled={codigosGenerados.length === 0}>
              🖨️ Imprimir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestamos;
