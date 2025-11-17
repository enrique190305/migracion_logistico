import React, { useState } from 'react';
import Barcode from 'react-barcode';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import './Prestamos.css';

const Prestamos = () => {
  const [activeTab, setActiveTab] = useState('nuevo');
  
  // Estados para Nuevo Préstamo
  const [registroManual, setRegistroManual] = useState({
    codigoPersonal: '',
    nombrePersonal: '',
    areaPersonal: '',
    codigoProducto: '',
    nombreProducto: '',
    cantidad: '',
    unidadMedida: '',
    condicionInicial: 'OPERATIVO',
    observacion: '',
    fechaPrestamo: new Date().toISOString().slice(0, 16)
  });

  const [listaPrestamosPendientes, setListaPrestamosPendientes] = useState([]);

  // Estados para Código de Barras
  const [personalSeleccionado, setPersonalSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [codigoBarrasPersonal, setCodigoBarrasPersonal] = useState(null);
  const [codigoBarrasProducto, setCodigoBarrasProducto] = useState(null);
  
  // Datos estáticos
  const productosNoConsumibles = [
    { codigo: 'HER-0003', nombre: 'MARTILLO DE GOMA', tipo: 'NO CONSUMIBLE', unidad: 'UND' },
    { codigo: 'HER-0001', nombre: 'DESTORNILLADOR PLANO', tipo: 'NO CONSUMIBLE', unidad: 'UND' },
    { codigo: 'HER-0005', nombre: 'ALICATE DE PRESIÓN', tipo: 'NO CONSUMIBLE', unidad: 'UND' },
    { codigo: 'ACTI-0001', nombre: 'LAPTOP DELL INSPIRON', tipo: 'NO CONSUMIBLE', unidad: 'UND' },
    { codigo: 'ACTI-0002', nombre: 'TALADRO BOSCH', tipo: 'NO CONSUMIBLE', unidad: 'UND' },
    { codigo: 'EPROT-0001', nombre: 'CASCO DE SEGURIDAD', tipo: 'NO CONSUMIBLE', unidad: 'UND' },
    { codigo: 'EPROT-0003', nombre: 'ARNÉS DE SEGURIDAD', tipo: 'NO CONSUMIBLE', unidad: 'UND' }
  ];

  const personalData = [
    { codigo: '12345678', nombre: 'Juan Pérez', area: 'Producción' },
    { codigo: '23456789', nombre: 'María López', area: 'Logística' },
    { codigo: '34567890', nombre: 'Carlos Ramírez', area: 'Mantenimiento' },
    { codigo: '45678901', nombre: 'Ana García', area: 'Almacén' },
    { codigo: '56789012', nombre: 'Luis Torres', area: 'Operaciones' }
  ];

  const [historialPrestamos, setHistorialPrestamos] = useState([
    {
      id: 1,
      codigoProducto: 'HER-0003',
      nombreProducto: 'MARTILLO DE GOMA',
      codigoUsuario: '12345678',
      nombreUsuario: 'Juan Pérez',
      fechaPrestamo: '13/11/2025 10:30:00',
      fechaDevolucion: null,
      estado: 'PRESTADO'
    },
    {
      id: 2,
      codigoProducto: 'ACTI-0001',
      nombreProducto: 'LAPTOP DELL INSPIRON',
      codigoUsuario: '23456789',
      nombreUsuario: 'María López',
      fechaPrestamo: '12/11/2025 14:20:00',
      fechaDevolucion: '13/11/2025 09:15:00',
      estado: 'DEVUELTO'
    },
    {
      id: 3,
      codigoProducto: 'HER-0001',
      nombreProducto: 'DESTORNILLADOR PLANO',
      codigoUsuario: '34567890',
      nombreUsuario: 'Carlos Ramírez',
      fechaPrestamo: '11/11/2025 08:45:00',
      fechaDevolucion: null,
      estado: 'PRESTADO'
    }
  ]);

  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);

  // ============ FUNCIONES PARA NUEVO PRÉSTAMO ============
  const handleAgregarPrestamo = () => {
    if (!registroManual.codigoPersonal || !registroManual.codigoProducto || !registroManual.cantidad) {
      alert('⚠️ Por favor complete todos los campos requeridos (Personal, Producto y Cantidad)');
      return;
    }

    const nuevoPrestamo = {
      codigoProducto: registroManual.codigoProducto,
      nombreProducto: registroManual.nombreProducto,
      codigoPersonal: registroManual.codigoPersonal,
      nombrePersonal: registroManual.nombrePersonal,
      cantidad: registroManual.cantidad,
      unidadMedida: registroManual.unidadMedida,
      condicionInicial: registroManual.condicionInicial,
      observacion: registroManual.observacion
    };

    setListaPrestamosPendientes([...listaPrestamosPendientes, nuevoPrestamo]);
    
    // Limpiar formulario pero mantener fecha
    setRegistroManual({
      codigoPersonal: '',
      nombrePersonal: '',
      areaPersonal: '',
      codigoProducto: '',
      nombreProducto: '',
      cantidad: '',
      unidadMedida: '',
      condicionInicial: 'OPERATIVO',
      observacion: '',
      fechaPrestamo: registroManual.fechaPrestamo
    });

    // Enfocar el primer input
    setTimeout(() => {
      const firstInput = document.querySelector('input[placeholder="Escanee o escriba DNI"]');
      if (firstInput) firstInput.focus();
    }, 100);
  };

  const handleBuscarPersonal = (codigo) => {
    const personal = personalData.find(p => p.codigo === codigo);
    if (personal) {
      setRegistroManual({
        ...registroManual,
        codigoPersonal: codigo,
        nombrePersonal: personal.nombre,
        areaPersonal: personal.area
      });
    } else {
      setRegistroManual({
        ...registroManual,
        codigoPersonal: codigo,
        nombrePersonal: '',
        areaPersonal: ''
      });
    }
  };

  const handleBuscarProducto = (codigo) => {
    const producto = productosNoConsumibles.find(p => p.codigo === codigo);
    if (producto) {
      setRegistroManual({
        ...registroManual,
        codigoProducto: codigo,
        nombreProducto: producto.nombre,
        unidadMedida: producto.unidad
      });
    } else {
      setRegistroManual({
        ...registroManual,
        codigoProducto: codigo,
        nombreProducto: '',
        unidadMedida: ''
      });
    }
  };

  const handleGuardarPrestamos = () => {
    if (listaPrestamosPendientes.length === 0) {
      alert('⚠️ No hay préstamos pendientes para guardar');
      return;
    }
    
    // Agregar al historial
    const nuevosRegistros = listaPrestamosPendientes.map((item, index) => ({
      id: historialPrestamos.length + index + 1,
      codigoProducto: item.codigoProducto,
      nombreProducto: item.nombreProducto,
      codigoUsuario: item.codigoPersonal,
      nombreUsuario: item.nombrePersonal,
      fechaPrestamo: new Date().toLocaleString('es-PE'),
      fechaDevolucion: null,
      estado: 'PRESTADO'
    }));

    setHistorialPrestamos([...nuevosRegistros, ...historialPrestamos]);
    setListaPrestamosPendientes([]);
    alert('✅ ' + nuevosRegistros.length + ' préstamo(s) guardado(s) exitosamente');
  };

  const handleLimpiarLista = () => {
    if (listaPrestamosPendientes.length === 0) {
      alert('⚠️ No hay préstamos en la lista');
      return;
    }
    const confirmacion = window.confirm('¿Está seguro de limpiar toda la lista de préstamos pendientes?');
    if (confirmacion) {
      setListaPrestamosPendientes([]);
    }
  };

  const handleEliminarPrestamoLista = (index) => {
    const nuevaLista = listaPrestamosPendientes.filter((_, i) => i !== index);
    setListaPrestamosPendientes(nuevaLista);
  };

  // ============ FUNCIONES PARA HISTORIAL ============
  const handleSeleccionarPrestamo = (prestamo) => {
    if (prestamo.estado === 'PRESTADO') {
      setPrestamoSeleccionado(prestamo);
    }
  };

  const handleDevolverPrestamo = () => {
    if (!prestamoSeleccionado) {
      alert('⚠️ Por favor seleccione un préstamo activo del historial');
      return;
    }

    const confirmacion = window.confirm(
      `¿Confirmar devolución del préstamo?\n\n` +
      `Producto: ${prestamoSeleccionado.nombreProducto}\n` +
      `Usuario: ${prestamoSeleccionado.nombreUsuario}\n` +
      `Fecha Préstamo: ${prestamoSeleccionado.fechaPrestamo}`
    );

    if (confirmacion) {
      const historialActualizado = historialPrestamos.map(item => {
        if (item.id === prestamoSeleccionado.id) {
          return {
            ...item,
            fechaDevolucion: new Date().toLocaleString('es-PE'),
            estado: 'DEVUELTO'
          };
        }
        return item;
      });

      setHistorialPrestamos(historialActualizado);
      setPrestamoSeleccionado(null);
      alert('✅ Devolución registrada exitosamente');
    }
  };

  // ============ FUNCIONES PARA CÓDIGO DE BARRAS ============
  const handleSeleccionPersonal = (e) => {
    const codigo = e.target.value;
    if (codigo) {
      const personal = personalData.find(p => p.codigo === codigo);
      setPersonalSeleccionado(personal);
      setCodigoBarrasPersonal(codigo);
    } else {
      setPersonalSeleccionado(null);
      setCodigoBarrasPersonal(null);
    }
  };

  const handleSeleccionProducto = (e) => {
    const codigo = e.target.value;
    if (codigo) {
      const producto = productosNoConsumibles.find(p => p.codigo === codigo);
      setProductoSeleccionado(producto);
      setCodigoBarrasProducto(codigo);
    } else {
      setProductoSeleccionado(null);
      setCodigoBarrasProducto(null);
    }
  };

  const generarPDFCodigoBarras = (tipo) => {
    if (tipo === 'personal' && !personalSeleccionado) {
      alert('⚠️ Seleccione un personal primero');
      return;
    }
    if (tipo === 'producto' && !productoSeleccionado) {
      alert('⚠️ Seleccione un producto primero');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [100, 50]
      });

      // Crear canvas temporal para el código de barras
      const canvas = document.createElement('canvas');
      
      if (tipo === 'personal') {
        JsBarcode(canvas, personalSeleccionado.codigo, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 10
        });
        
        pdf.setFontSize(12);
        pdf.text(personalSeleccionado.nombre, 50, 10, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text('DNI: ' + personalSeleccionado.codigo, 50, 17, { align: 'center' });
        pdf.text('Área: ' + personalSeleccionado.area, 50, 23, { align: 'center' });
        pdf.addImage(canvas.toDataURL(), 'PNG', 10, 28, 80, 18);
        pdf.save('codigo_barras_' + personalSeleccionado.nombre.replace(/ /g, '_') + '.pdf');
      } else {
        JsBarcode(canvas, productoSeleccionado.codigo, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 10
        });
        
        pdf.setFontSize(12);
        pdf.text(productoSeleccionado.nombre, 50, 10, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text('Código: ' + productoSeleccionado.codigo, 50, 17, { align: 'center' });
        pdf.text('Tipo: ' + productoSeleccionado.tipo, 50, 23, { align: 'center' });
        pdf.addImage(canvas.toDataURL(), 'PNG', 10, 28, 80, 18);
        pdf.save('codigo_barras_' + productoSeleccionado.codigo + '.pdf');
      }

      alert('✅ Código de barras generado y descargado correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF: ' + error.message);
    }
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
          <h3>🔍 Selección por Lista y Código de Barras</h3>
          
          <div className="codigo-barras-grid">
            {/* Sección Personal */}
            <div className="codigo-section">
              <h4>👤 Seleccionar Personal</h4>
              <select className="select-codigo">
                <option value="">Seleccione un personal...</option>
                {personalData.map((p, index) => (
                  <option key={index} value={p.codigo}>
                    {p.nombre} - {p.codigo}
                  </option>
                ))}
              </select>
              
              <div className="barcode-display">
                <div className="barcode-lines">| | | | | | | | | | | | | | | | | | | | | | | | | | |</div>
                <small>System.Data.DataRowView</small>
              </div>
              
              <div className="info-box">
                <h5>💼 INFORMACIÓN DEL PERSONAL</h5>
                <div className="info-content">
                  Seleccione un personal para ver su información
                </div>
              </div>
              
              <button className="btn-generar-codigo cyan">
                � Generar Código de Barras Personal
              </button>
            </div>

            {/* Sección Producto */}
            <div className="codigo-section">
              <h4>🔧 Seleccionar Producto</h4>
              <select className="select-codigo">
                <option value="">Seleccione un producto...</option>
                {productosNoConsumibles.map((p, index) => (
                  <option key={index} value={p.codigo}>
                    {p.nombre} - {p.codigo} - {p.tipo}
                  </option>
                ))}
              </select>
              
              <div className="barcode-display">
                <div className="barcode-lines">| | | | | | | | | | | | | | | | | | | | | | | | | | |</div>
                <small>System.Data.DataRowView</small>
              </div>
              
              <div className="info-box">
                <h5>📦 INFORMACIÓN DEL PRODUCTO</h5>
                <div className="info-content">
                  Seleccione un producto para ver su información
                </div>
              </div>
              
              <button className="btn-generar-codigo blue">
                📄 Generar Código de Barras Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestamos;