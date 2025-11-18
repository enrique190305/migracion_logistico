import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import axios from 'axios';
import './Prestamos.css';

const Prestamos = () => {
  const [activeTab, setActiveTab] = useState('nuevo');
  
  // Estados para Nuevo Préstamo
  const [areas, setAreas] = useState([]); // Áreas desde BD
  const [registroManual, setRegistroManual] = useState({
    codigoPersonal: '',
    nombrePersonal: '',
    areaPersonal: '',
    codigoProducto: '',
    nombreProducto: '',
    cantidad: '',
    unidadMedida: '',
    condicionInicial: 'OPERATIVO',
    condicionDescripcion: '',
    observacion: '',
    fechaPrestamo: new Date().toISOString().slice(0, 16)
  });

  const [listaPrestamosPendientes, setListaPrestamosPendientes] = useState([]);

  // Estados para Código de Barras (Multi-selección)
  const [personalSeleccionados, setPersonalSeleccionados] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [medidasCodigos, setMedidasCodigos] = useState({});
  const [mostrarPrevisualizacion, setMostrarPrevisualizacion] = useState(false);
  
  // Estados para datos desde BD
  const [personalBD, setPersonalBD] = useState([]);
  const [productosBD, setProductosBD] = useState([]);
  const [cargandoPersonal, setCargandoPersonal] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  
  // Estados para filtros y modal
  const [filtroPersonal, setFiltroPersonal] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  const [modalMedidas, setModalMedidas] = useState(null);
  
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

  const [personalData, setPersonalData] = useState([]);

  // Cargar áreas y personal desde la BD
  useEffect(() => {
    cargarAreas();
    cargarPersonal();
  }, []);

  // Cargar datos de BD cuando se activa pestaña código de barras
  useEffect(() => {
    if (activeTab === 'codigo') {
      cargarPersonalBD();
      cargarProductosBD();
    }
    if (activeTab === 'historial') {
      cargarHistorialPrestamos();
    }
  }, [activeTab]);

  const cargarAreas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/areas');
      if (response.data.success) {
        setAreas(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      // Áreas de respaldo si falla la petición
      setAreas([
        { id_area: 1, nombre: 'ADMINISTRATIVO' },
        { id_area: 2, nombre: 'PRODUCCION' },
        { id_area: 3, nombre: 'RIEGO' },
        { id_area: 4, nombre: 'SEGURIDAD' },
        { id_area: 5, nombre: 'SUPERVISOR' },
        { id_area: 6, nombre: 'SUPERVISOR (RIEGO)' }
      ]);
    }
  };

  const cargarPersonal = async () => {
    try {
      // Aquí puedes hacer una petición a tu API de personal si existe
      // Por ahora usamos datos de ejemplo que parecen reales
      setPersonalData([
        { codigo: '12345678', nombre: 'Juan Pérez', area: 'PRODUCCION' },
        { codigo: '23456789', nombre: 'María López', area: 'ADMINISTRATIVO' },
        { codigo: '34567890', nombre: 'Carlos Ramírez', area: 'RIEGO' },
        { codigo: '45678901', nombre: 'Ana García', area: 'SEGURIDAD' },
        { codigo: '56789012', nombre: 'Luis Torres', area: 'SUPERVISOR' }
      ]);
    } catch (error) {
      console.error('Error al cargar personal:', error);
    }
  };

  const cargarPersonalBD = async () => {
    setCargandoPersonal(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/personal-codigo-barras');
      if (response.data.success) {
        setPersonalBD(response.data.data);
      }
    } catch (error) {
      // Silenciar error de conexión
      setPersonalBD([]);
    } finally {
      setCargandoPersonal(false);
    }
  };

  const cargarProductosBD = async () => {
    setCargandoProductos(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/productos-codigo-barras');
      if (response.data.success) {
        setProductosBD(response.data.data);
      }
    } catch (error) {
      // Silenciar error de conexión
      setProductosBD([]);
    } finally {
      setCargandoProductos(false);
    }
  };

  const cargarHistorialPrestamos = async () => {
    setCargandoHistorial(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/prestamos-historial');
      if (response.data.success) {
        setHistorialPrestamos(response.data.data);
      }
    } catch (error) {
      // Silenciar error de conexión
      setHistorialPrestamos([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const [historialPrestamos, setHistorialPrestamos] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  
  // Estados para Historial
  const [prestamosSeleccionados, setPrestamosSeleccionados] = useState([]);
  const [filtroHistorial, setFiltroHistorial] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // TODOS, PRESTADO, DEVUELTO

  // Estados para Escaneo Rápido
  const [modoEscaneoRapido, setModoEscaneoRapido] = useState(false);
  const [codigoEscaneoRapido, setCodigoEscaneoRapido] = useState('');
  const [ultimoPersonalEscaneado, setUltimoPersonalEscaneado] = useState(null);

  // ============ FUNCIONES PARA NUEVO PRÉSTAMO ============
  const handleAgregarPrestamo = () => {
    if (!registroManual.codigoPersonal || !registroManual.codigoProducto || !registroManual.cantidad) {
      alert('⚠️ Por favor complete todos los campos requeridos (Personal, Producto y Cantidad)');
      return;
    }

    // Validar que si seleccionó OTROS, debe ingresar descripción
    if (registroManual.condicionInicial === 'OTROS' && !registroManual.condicionDescripcion.trim()) {
      alert('⚠️ Por favor especifique la condición del producto');
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
      condicionDescripcion: registroManual.condicionDescripcion,
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
      condicionDescripcion: '',
      observacion: '',
      fechaPrestamo: registroManual.fechaPrestamo
    });

    // Enfocar el primer input
    setTimeout(() => {
      const firstInput = document.querySelector('input[placeholder="Escanee o escriba DNI"]');
      if (firstInput) firstInput.focus();
    }, 100);
  };

  const handleBuscarPersonal = async (codigo) => {
    setRegistroManual({
      ...registroManual,
      codigoPersonal: codigo,
      nombrePersonal: '',
      areaPersonal: ''
    });

    if (!codigo || codigo.trim() === '') return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/personal-codigo-barras');
      if (response.data.success) {
        const personal = response.data.data.find(p => p.codigo === codigo.trim());
        if (personal) {
          setRegistroManual({
            ...registroManual,
            codigoPersonal: codigo,
            nombrePersonal: personal.nombre,
            areaPersonal: personal.area || 'Sin área'
          });
        }
      }
    } catch (error) {
      // Silenciar error de conexión
    }
  };

  const handleBuscarProducto = async (codigo) => {
    setRegistroManual({
      ...registroManual,
      codigoProducto: codigo,
      nombreProducto: '',
      unidadMedida: ''
    });

    if (!codigo || codigo.trim() === '') return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/productos-codigo-barras');
      if (response.data.success) {
        const producto = response.data.data.find(p => p.codigo === codigo.trim());
        if (producto) {
          setRegistroManual({
            ...registroManual,
            codigoProducto: codigo,
            nombreProducto: producto.nombre,
            unidadMedida: producto.unidad || 'UND'
          });
        }
      }
    } catch (error) {
      // Silenciar error de conexión
    }
  };

  const handleGuardarPrestamos = async () => {
    if (listaPrestamosPendientes.length === 0) {
      alert('⚠️ No hay préstamos pendientes para guardar');
      return;
    }
    
    try {
      // Preparar datos para enviar al backend
      const prestamosParaGuardar = listaPrestamosPendientes.map(item => ({
        codigo_producto: item.codigoProducto,
        tipo_producto: item.nombreProducto,
        cantidad: parseInt(item.cantidad),
        condicion_inicial: item.condicionInicial,
        condicion_descripcion: item.condicionDescripcion || null,
        unidad: item.unidadMedida || 'UND',
        observaciones: item.observacion || null,
        dni: item.codigoPersonal,
        nom_ape: item.nombrePersonal
      }));

      // Guardar en la base de datos
      const response = await axios.post('http://127.0.0.1:8000/api/prestamos/guardar', {
        prestamos: prestamosParaGuardar
      });

      if (response.data.success) {
        setListaPrestamosPendientes([]);
        
        // Recargar historial desde BD
        await cargarHistorialPrestamos();
        
        alert('✅ ' + response.data.data.total + ' préstamo(s) guardado(s) exitosamente');
      } else {
        throw new Error(response.data.message);
      }
      
    } catch (error) {
      console.error('Error al guardar préstamos:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('❌ Error al guardar préstamos: ' + errorMsg);
    }
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

  // ============ FUNCIONES PARA ESCANEO RÁPIDO ============
  
  const handleEscaneoRapido = async (e) => {
    if (e.key !== 'Enter') return;
    
    const codigo = codigoEscaneoRapido.trim();
    if (!codigo) return;

    try {
      // Buscar en productos primero
      const respProducto = await axios.get('http://127.0.0.1:8000/api/productos-codigo-barras');
      const producto = respProducto.data.data?.find(p => p.codigo === codigo);
      
      if (producto) {
        if (!ultimoPersonalEscaneado) {
          alert('⚠️ Escanee primero un código de personal');
          setCodigoEscaneoRapido('');
          return;
        }

        // Agregar a lista con valores por defecto (se pueden editar después en la tabla)
        const nuevo = {
          codigoProducto: producto.codigo,
          nombreProducto: producto.nombre,
          codigoPersonal: ultimoPersonalEscaneado.codigo,
          nombrePersonal: ultimoPersonalEscaneado.nombre,
          cantidad: 1,
          unidadMedida: producto.unidad || 'UND',
          condicionInicial: 'OPERATIVO',
          condicionDescripcion: '',
          observacion: ''
        };

        setListaPrestamosPendientes(prev => [...prev, nuevo]);
        setCodigoEscaneoRapido('');
        setUltimoPersonalEscaneado(null); // Limpiar para nuevo par
        return;
      }

      // Si no es producto, buscar en personal
      const respPersonal = await axios.get('http://127.0.0.1:8000/api/personal-codigo-barras');
      const personal = respPersonal.data.data?.find(p => p.codigo === codigo);
      
      if (personal) {
        setUltimoPersonalEscaneado(personal);
        setCodigoEscaneoRapido('');
        return;
      }

      alert(`❌ Código ${codigo} no encontrado`);
      setCodigoEscaneoRapido('');
    } catch (error) {
      // Silenciar errores
      setCodigoEscaneoRapido('');
    }
  };

  // ============ FUNCIONES PARA HISTORIAL ============
  
  // Filtrar historial según búsqueda y estado
  const historialFiltrado = historialPrestamos.filter(prestamo => {
    const cumpleFiltroTexto = 
      prestamo.codigoProducto.toLowerCase().includes(filtroHistorial.toLowerCase()) ||
      prestamo.nombreProducto.toLowerCase().includes(filtroHistorial.toLowerCase()) ||
      prestamo.codigoUsuario.includes(filtroHistorial) ||
      prestamo.nombreUsuario.toLowerCase().includes(filtroHistorial.toLowerCase());
    
    const cumpleFiltroEstado = filtroEstado === 'TODOS' || prestamo.estado === filtroEstado;
    
    return cumpleFiltroTexto && cumpleFiltroEstado;
  });
  
  // Seleccionar/deseleccionar préstamo (solo los PRESTADO)
  const handleSeleccionarPrestamoCheckbox = (prestamo) => {
    if (prestamo.estado !== 'PRESTADO') return; // No permitir seleccionar devueltos
    
    const existe = prestamosSeleccionados.find(p => p.id === prestamo.id);
    if (existe) {
      setPrestamosSeleccionados(prestamosSeleccionados.filter(p => p.id !== prestamo.id));
    } else {
      setPrestamosSeleccionados([...prestamosSeleccionados, prestamo]);
    }
  };
  
  // Seleccionar todos los préstamos activos (filtrados)
  const handleSeleccionarTodosPrestamos = () => {
    const prestamosActivos = historialFiltrado.filter(p => p.estado === 'PRESTADO');
    
    if (prestamosSeleccionados.length === prestamosActivos.length && prestamosActivos.length > 0) {
      // Deseleccionar todos
      setPrestamosSeleccionados([]);
    } else {
      // Seleccionar todos los activos
      setPrestamosSeleccionados(prestamosActivos);
    }
  };

  const handleDevolverPrestamos = async () => {
    if (prestamosSeleccionados.length === 0) {
      alert('⚠️ Por favor seleccione al menos un préstamo para devolver');
      return;
    }
    
    const confirmacion = window.confirm(`¿Confirmar devolución de ${prestamosSeleccionados.length} préstamo(s)?`);
    if (!confirmacion) return;
    
    try {
      // Obtener IDs de los préstamos seleccionados
      const ids = prestamosSeleccionados.map(p => p.id);
      
      // Enviar petición al backend
      const response = await axios.post('http://127.0.0.1:8000/api/prestamos/devolver', {
        ids: ids
      });

      if (response.data.success) {
        // Recargar historial desde BD
        await cargarHistorialPrestamos();
        
        // Limpiar selección
        setPrestamosSeleccionados([]);
        
        alert(`✅ ${response.data.data.total_devueltos} préstamo(s) devuelto(s) exitosamente`);
      } else {
        throw new Error(response.data.message);
      }
      
    } catch (error) {
      console.error('Error al devolver préstamos:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('❌ Error al devolver préstamos: ' + errorMsg);
    }
  };

  // ============ FUNCIONES PARA CÓDIGO DE BARRAS (Multi-selección) ============
  
  // Filtrar personal según búsqueda (desde BD)
  const personalFiltrado = personalBD.filter(p => 
    p.nombre.toLowerCase().includes(filtroPersonal.toLowerCase()) ||
    p.codigo.includes(filtroPersonal) ||
    (p.area && p.area.toLowerCase().includes(filtroPersonal.toLowerCase()))
  );

  // Filtrar productos según búsqueda (desde BD)
  const productosFiltrados = productosBD.filter(p => 
    p.nombre.toLowerCase().includes(filtroProducto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(filtroProducto.toLowerCase())
  );

  // Selección de personal (checkbox)
  const handleSeleccionPersonalCheckbox = (personal) => {
    const existe = personalSeleccionados.find(p => p.codigo === personal.codigo);
    if (existe) {
      setPersonalSeleccionados(personalSeleccionados.filter(p => p.codigo !== personal.codigo));
    } else {
      setPersonalSeleccionados([...personalSeleccionados, personal]);
    }
  };

  // Selección de producto (checkbox)
  const handleSeleccionProductoCheckbox = (producto) => {
    const existe = productosSeleccionados.find(p => p.codigo === producto.codigo);
    if (existe) {
      setProductosSeleccionados(productosSeleccionados.filter(p => p.codigo !== producto.codigo));
    } else {
      setProductosSeleccionados([...productosSeleccionados, producto]);
    }
  };

  // Abrir modal para configurar medidas
  const handleAbrirModalMedidas = (tipo, codigo) => {
    const key = `${tipo}-${codigo}`;
    const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };
    setModalMedidas({ tipo, codigo, medidas: { ...medidas } });
  };

  // Cerrar modal
  const handleCerrarModalMedidas = () => {
    setModalMedidas(null);
  };

  // Guardar medidas desde el modal
  const handleGuardarMedidasModal = () => {
    if (modalMedidas) {
      const key = `${modalMedidas.tipo}-${modalMedidas.codigo}`;
      setMedidasCodigos({
        ...medidasCodigos,
        [key]: modalMedidas.medidas
      });
      setModalMedidas(null);
    }
  };

  // Seleccionar todos (respeta filtros)
  const handleSeleccionarTodosPersonal = () => {
    if (personalSeleccionados.length === personalFiltrado.length && personalFiltrado.length > 0) {
      // Deseleccionar solo los filtrados
      const codigosFiltrados = personalFiltrado.map(p => p.codigo);
      setPersonalSeleccionados(personalSeleccionados.filter(p => !codigosFiltrados.includes(p.codigo)));
    } else {
      // Seleccionar todos los filtrados
      const nuevos = personalFiltrado.filter(p => !personalSeleccionados.find(ps => ps.codigo === p.codigo));
      setPersonalSeleccionados([...personalSeleccionados, ...nuevos]);
    }
  };

  const handleSeleccionarTodosProductos = () => {
    if (productosSeleccionados.length === productosFiltrados.length && productosFiltrados.length > 0) {
      const codigosFiltrados = productosFiltrados.map(p => p.codigo);
      setProductosSeleccionados(productosSeleccionados.filter(p => !codigosFiltrados.includes(p.codigo)));
    } else {
      const nuevos = productosFiltrados.filter(p => !productosSeleccionados.find(ps => ps.codigo === p.codigo));
      setProductosSeleccionados([...productosSeleccionados, ...nuevos]);
    }
  };

  // Limpiar selección
  const handleLimpiarSeleccion = () => {
    setPersonalSeleccionados([]);
    setProductosSeleccionados([]);
    setMedidasCodigos({});
    setMostrarPrevisualizacion(false);
    setFiltroPersonal('');
    setFiltroProducto('');
  };

  // Mostrar previsualización
  const handleMostrarPrevisualizacion = () => {
    setMostrarPrevisualizacion(true);
  };

  // Generar PDF con múltiples códigos de barras en cuadrícula 2 columnas
  const generarPDFCodigosBarras = () => {
    const totalCodigos = personalSeleccionados.length + productosSeleccionados.length;
    if (totalCodigos === 0) {
      alert('⚠️ Seleccione al menos un personal o producto');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuración de cuadrícula optimizada
      const margenSuperior = 15;
      const margenIzquierdo = 10;
      const margenDerecho = 10;
      const anchoHoja = 210; // A4
      const altoHoja = 297; // A4
      const columnas = 2;
      const espacioEntreColumnas = 5;
      const espacioEntreFilas = 8;
      
      // Calcular ancho disponible por columna
      const anchoDisponible = anchoHoja - margenIzquierdo - margenDerecho - espacioEntreColumnas;
      const anchoPorColumna = anchoDisponible / columnas;

      // Combinar todos los códigos en un solo array
      const todosLosCodigos = [
        ...personalSeleccionados.map(p => ({ tipo: 'personal', data: p })),
        ...productosSeleccionados.map(p => ({ tipo: 'producto', data: p }))
      ];

      let columnaActual = 0;
      let yPos = margenSuperior;
      let alturaMaximaFila = 0;

      todosLosCodigos.forEach((item, index) => {
        const { tipo, data } = item;
        const key = `${tipo}-${data.codigo}`;
        const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };

        // Ajustar medidas al ancho de columna (máximo)
        const anchoCodeBar = Math.min(medidas.ancho, anchoPorColumna - 5);
        const altoCodeBar = medidas.alto;
        
        // Altura total del bloque (texto + código de barras)
        const alturaBloque = 15 + altoCodeBar;

        // Si no cabe en la página actual, crear nueva página
        if (yPos + alturaBloque > altoHoja - 15) {
          pdf.addPage();
          yPos = margenSuperior;
          columnaActual = 0;
          alturaMaximaFila = 0;
        }

        // Calcular posición X según la columna
        const xPos = margenIzquierdo + (columnaActual * (anchoPorColumna + espacioEntreColumnas));

        // Generar código de barras en canvas con ALTA RESOLUCIÓN
        const canvas = document.createElement('canvas');
        
        // Escalar el canvas para mejor calidad (3x resolución)
        const escala = 3;
        JsBarcode(canvas, data.codigo, {
          format: 'CODE128',
          width: 3,  // Aumentado para mejor calidad
          height: 80, // Aumentado para mejor calidad
          displayValue: true,
          fontSize: 20, // Aumentado proporcionalmente
          margin: 8,
          lineColor: '#000000',
          background: '#ffffff'
        });

        // Dibujar borde del contenedor
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.rect(xPos, yPos, anchoPorColumna, alturaBloque);

        // Título
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const titulo = tipo === 'personal' ? data.nombre : data.nombre;
        const tituloRecortado = titulo.length > 30 ? titulo.substring(0, 27) + '...' : titulo;
        pdf.text(tituloRecortado, xPos + 2, yPos + 4);

        // Subtítulo
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        const subtitulo = tipo === 'personal' 
          ? `DNI: ${data.codigo} | ${data.area}`
          : `Código: ${data.codigo}`;
        const subtituloRecortado = subtitulo.length > 35 ? subtitulo.substring(0, 32) + '...' : subtitulo;
        pdf.text(subtituloRecortado, xPos + 2, yPos + 8);

        // Código de barras centrado con alta calidad
        const xCodeBar = xPos + (anchoPorColumna - anchoCodeBar) / 2;
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0), // Calidad máxima 
          'PNG', 
          xCodeBar, 
          yPos + 10, 
          anchoCodeBar, 
          altoCodeBar
        );

        // Actualizar altura máxima de la fila
        alturaMaximaFila = Math.max(alturaMaximaFila, alturaBloque);

        // Avanzar a siguiente columna o fila
        columnaActual++;
        if (columnaActual >= columnas) {
          columnaActual = 0;
          yPos += alturaMaximaFila + espacioEntreFilas;
          alturaMaximaFila = 0;
        }
      });

      pdf.save(`codigos_barras_${new Date().getTime()}.pdf`);
      alert(`✅ PDF generado con ${totalCodigos} códigos de barras en formato optimizado`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF: ' + error.message);
    }
  };

  // Imprimir códigos de barras directamente
  const imprimirCodigosBarras = () => {
    const totalCodigos = personalSeleccionados.length + productosSeleccionados.length;
    if (totalCodigos === 0) {
      alert('⚠️ Seleccione al menos un personal o producto');
      return;
    }

    try {
      // Crear una ventana de impresión oculta
      const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
      
      if (!ventanaImpresion) {
        alert('❌ Por favor permita las ventanas emergentes para imprimir');
        return;
      }

      // Construir el HTML para imprimir
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Impresión de Códigos de Barras</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            
            .codigo-item {
              page-break-inside: avoid;
              margin-bottom: 30px;
              padding: 15px;
              border: 2px solid #333;
              border-radius: 8px;
              background: white;
            }
            
            .codigo-info {
              margin-bottom: 10px;
            }
            
            .codigo-info h3 {
              margin: 0 0 5px 0;
              font-size: 16px;
              color: #2c3e50;
            }
            
            .codigo-info p {
              margin: 3px 0;
              font-size: 12px;
              color: #555;
            }
            
            .codigo-barras-container {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 10px;
              background: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            
            .codigo-barras-container canvas {
              max-width: 100%;
            }
            
            .medidas-info {
              font-size: 10px;
              color: #999;
              text-align: right;
              margin-top: 5px;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .codigo-item {
                border: 1px solid #000;
              }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
      `;

      // Agregar códigos de personal
      personalSeleccionados.forEach((personal, index) => {
        const key = `personal-${personal.codigo}`;
        const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };
        
        htmlContent += `
          <div class="codigo-item">
            <div class="codigo-info">
              <h3>👤 ${personal.nombre}</h3>
              <p><strong>DNI:</strong> ${personal.codigo}</p>
              <p><strong>Área:</strong> ${personal.area}</p>
            </div>
            <div class="codigo-barras-container">
              <canvas id="barcode-personal-${index}"></canvas>
            </div>
            <p class="medidas-info">Medidas: ${medidas.ancho}mm × ${medidas.alto}mm</p>
          </div>
        `;
      });

      // Agregar códigos de productos
      productosSeleccionados.forEach((producto, index) => {
        const key = `producto-${producto.codigo}`;
        const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };
        
        htmlContent += `
          <div class="codigo-item">
            <div class="codigo-info">
              <h3>🔧 ${producto.nombre}</h3>
              <p><strong>Código:</strong> ${producto.codigo}</p>
              <p><strong>Tipo:</strong> ${producto.tipo}</p>
            </div>
            <div class="codigo-barras-container">
              <canvas id="barcode-producto-${index}"></canvas>
            </div>
            <p class="medidas-info">Medidas: ${medidas.ancho}mm × ${medidas.alto}mm</p>
          </div>
        `;
      });

      htmlContent += `
        </body>
        <script>
          // Generar códigos de barras después de cargar
          window.onload = function() {
      `;

      // Scripts para generar códigos de personal
      personalSeleccionados.forEach((personal, index) => {
        htmlContent += `
          JsBarcode("#barcode-personal-${index}", "${personal.codigo}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            margin: 10
          });
        `;
      });

      // Scripts para generar códigos de productos
      productosSeleccionados.forEach((producto, index) => {
        htmlContent += `
          JsBarcode("#barcode-producto-${index}", "${producto.codigo}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            margin: 10
          });
        `;
      });

      htmlContent += `
            // Abrir diálogo de impresión automáticamente
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
        </html>
      `;

      // Escribir el contenido en la ventana
      ventanaImpresion.document.write(htmlContent);
      ventanaImpresion.document.close();

    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('❌ Error al preparar la impresión: ' + error.message);
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
          
          {/* Toggle de Modo */}
          <div className="toggle-modo-container">
            <button 
              className={`btn-modo ${!modoEscaneoRapido ? 'activo' : ''}`}
              onClick={() => setModoEscaneoRapido(false)}
            >
              📝 Registro Manual
            </button>
            <button 
              className={`btn-modo ${modoEscaneoRapido ? 'activo' : ''}`}
              onClick={() => setModoEscaneoRapido(true)}
            >
              ⚡ Escaneo Rápido
            </button>
          </div>

          {/* Sección de Escaneo Rápido */}
          {modoEscaneoRapido && (
            <div className="escaneo-rapido-section">
              <h3>⚡ Escaneo Rápido (Personal → Producto)</h3>
              <div className="escaneo-rapido-container">
                <div className="escaneo-info">
                  {ultimoPersonalEscaneado ? (
                    <div className="personal-escaneado">
                      <span className="badge-personal">👤 {ultimoPersonalEscaneado.nombre}</span>
                      <span className="texto-instruccion">→ Ahora escanee el producto</span>
                    </div>
                  ) : (
                    <span className="texto-instruccion">👉 Escanee o pegue el código de personal</span>
                  )}
                </div>
                <input
                  type="text"
                  className="input-escaneo-rapido"
                  placeholder="Escanee código aquí y presione Enter"
                  value={codigoEscaneoRapido}
                  onChange={(e) => setCodigoEscaneoRapido(e.target.value)}
                  onKeyPress={handleEscaneoRapido}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Sección de Registro Manual */}
          {!modoEscaneoRapido && (
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.querySelector('input[placeholder*="código"]')?.nextElementSibling?.nextElementSibling?.nextElementSibling?.querySelector('input')?.focus();
                    }
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>📋 Nombre del Personal</label>
                <input
                  type="text"
                  placeholder="Nombre del personal aparecerá..."
                  value={registroManual.nombrePersonal}
                  readOnly
                  style={{backgroundColor: '#f0f0f0'}}
                />
              </div>
              
              <div className="form-group">
                <label>🏢 Área del Personal</label>
                <input
                  type="text"
                  placeholder="Área aparecerá automáticamente..."
                  value={registroManual.areaPersonal}
                  readOnly
                  style={{backgroundColor: '#f0f0f0'}}
                />
              </div>
              
              <div className="form-group">
                <label>🔧 Código Producto</label>
                <input
                  type="text"
                  placeholder="Escanee o escriba código"
                  value={registroManual.codigoProducto}
                  onChange={(e) => handleBuscarProducto(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.querySelector('input[type="number"]')?.focus();
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-row-4cols">
              <div className="form-group">
                <label>📦 Nombre del Producto</label>
                <input
                  type="text"
                  placeholder="Nombre del producto aparecerá..."
                  value={registroManual.nombreProducto}
                  readOnly
                  style={{backgroundColor: '#f0f0f0'}}
                />
              </div>
              
              <div className="form-group">
                <label>🔢 Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ingrese cantidad"
                  value={registroManual.cantidad}
                  onChange={(e) => setRegistroManual({...registroManual, cantidad: e.target.value})}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAgregarPrestamo();
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label>📏 Unidad de Medida</label>
                <input
                  type="text"
                  placeholder="Unidad (autocompletado)"
                  value={registroManual.unidadMedida}
                  readOnly
                  style={{backgroundColor: '#f0f0f0'}}
                />
              </div>

              <div className="form-group">
                <label>⚙️ Condición Inicial *</label>
                <select
                  value={registroManual.condicionInicial}
                  onChange={(e) => {
                    setRegistroManual({
                      ...registroManual, 
                      condicionInicial: e.target.value,
                      condicionDescripcion: e.target.value !== 'OTROS' ? '' : registroManual.condicionDescripcion
                    });
                  }}
                >
                  <option value="NUEVO">NUEVO</option>
                  <option value="OPERATIVO">OPERATIVO</option>
                  <option value="CON FALLAS">CON FALLAS</option>
                  <option value="OTROS">OTROS (especificar)</option>
                </select>
              </div>
            </div>

            {/* Campo de descripción personalizada cuando se selecciona OTROS */}
            {registroManual.condicionInicial === 'OTROS' && (
              <div className="form-row-1col" style={{marginTop: '10px'}}>
                <div className="form-group">
                  <label>📝 Especificar Condición *</label>
                  <input
                    type="text"
                    placeholder="Ej: Pantalla rayada, botón de encendido flojo..."
                    value={registroManual.condicionDescripcion}
                    onChange={(e) => setRegistroManual({...registroManual, condicionDescripcion: e.target.value})}
                    maxLength="200"
                    required
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>Máximo 200 caracteres</small>
                </div>
              </div>
            )}

            <div className="form-row-2cols">
              <div className="form-group">
                <label>📝 Observación</label>
                <textarea
                  rows="2"
                  placeholder="Observaciones adicionales (opcional)"
                  value={registroManual.observacion}
                  onChange={(e) => setRegistroManual({...registroManual, observacion: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>📅 Fecha de Préstamo</label>
                <input
                  type="datetime-local"
                  value={registroManual.fechaPrestamo}
                  onChange={(e) => setRegistroManual({...registroManual, fechaPrestamo: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <button className="btn-agregar" onClick={handleAgregarPrestamo}>
                ➕ Agregar a Lista
              </button>
            </div>
          </div>
          )}

          {/* Lista de Préstamos Pendientes */}
          <div className="lista-pendientes-section">
            <h3>
              📋 Lista de Préstamos Pendientes
              <span className="contador-badge">{listaPrestamosPendientes.length}</span>
            </h3>
            
            <div className="tabla-wrapper">
              <table className="tabla-prestamos">
                <thead>
                  <tr>
                    <th>Código Producto</th>
                    <th>Nombre Producto</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Condición</th>
                    <th>Código Personal</th>
                    <th>Nombre Personal</th>
                    <th>Observación</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {listaPrestamosPendientes.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No hay préstamos pendientes
                      </td>
                    </tr>
                  ) : (
                    listaPrestamosPendientes.map((prestamo, index) => (
                      <tr key={index}>
                        <td>{prestamo.codigoProducto}</td>
                        <td>{prestamo.nombreProducto}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={prestamo.cantidad}
                            onChange={(e) => {
                              const nuevaLista = [...listaPrestamosPendientes];
                              nuevaLista[index].cantidad = parseInt(e.target.value) || 1;
                              setListaPrestamosPendientes(nuevaLista);
                            }}
                            style={{width: '60px', padding: '5px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px'}}
                          />
                        </td>
                        <td>{prestamo.unidadMedida}</td>
                        <td>
                          <select
                            value={prestamo.condicionInicial}
                            onChange={(e) => {
                              const nuevaLista = [...listaPrestamosPendientes];
                              nuevaLista[index].condicionInicial = e.target.value;
                              if (e.target.value !== 'OTROS') {
                                nuevaLista[index].condicionDescripcion = '';
                              }
                              setListaPrestamosPendientes(nuevaLista);
                            }}
                            style={{padding: '5px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px'}}
                          >
                            <option value="NUEVO">NUEVO</option>
                            <option value="OPERATIVO">OPERATIVO</option>
                            <option value="CON FALLAS">CON FALLAS</option>
                            <option value="OTROS">OTROS</option>
                          </select>
                          {prestamo.condicionInicial === 'OTROS' && (
                            <input
                              type="text"
                              placeholder="Especificar..."
                              value={prestamo.condicionDescripcion}
                              onChange={(e) => {
                                const nuevaLista = [...listaPrestamosPendientes];
                                nuevaLista[index].condicionDescripcion = e.target.value;
                                setListaPrestamosPendientes(nuevaLista);
                              }}
                              style={{marginTop: '5px', width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px'}}
                            />
                          )}
                        </td>
                        <td>{prestamo.codigoPersonal}</td>
                        <td>{prestamo.nombrePersonal}</td>
                        <td>
                          <input
                            type="text"
                            placeholder="Observación..."
                            value={prestamo.observacion}
                            onChange={(e) => {
                              const nuevaLista = [...listaPrestamosPendientes];
                              nuevaLista[index].observacion = e.target.value;
                              setListaPrestamosPendientes(nuevaLista);
                            }}
                            style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px'}}
                          />
                        </td>
                        <td>
                          <button 
                            className="btn-eliminar-fila"
                            onClick={() => handleEliminarPrestamoLista(index)}
                            title="Eliminar"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="acciones-footer">
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
          <h3>📜 Historial Completo de Préstamos ({historialPrestamos.length})</h3>
          
          {/* Filtros y acciones */}
          <div className="historial-header-controls">
            <div className="filtros-historial">
              <input
                type="text"
                className="filtro-busqueda"
                placeholder="🔍 Buscar por código, nombre, DNI..."
                value={filtroHistorial}
                onChange={(e) => setFiltroHistorial(e.target.value)}
              />
              
              <select
                className="filtro-estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODOS">📋 Todos los Estados</option>
                <option value="PRESTADO">📤 Solo Prestados</option>
                <option value="DEVUELTO">✅ Solo Devueltos</option>
              </select>
              
              <button 
                className="btn-seleccionar-todos-historial"
                onClick={handleSeleccionarTodosPrestamos}
                disabled={historialFiltrado.filter(p => p.estado === 'PRESTADO').length === 0}
              >
                {prestamosSeleccionados.length > 0 ? '☐ Deseleccionar Todos' : '☑ Seleccionar Todos Activos'}
              </button>
            </div>
            
            {prestamosSeleccionados.length > 0 && (
              <div className="acciones-seleccion">
                <span className="contador-seleccionados">
                  {prestamosSeleccionados.length} seleccionado(s)
                </span>
                <button className="btn-devolver-multiple" onClick={handleDevolverPrestamos}>
                  🔄 Devolver Préstamo(s)
                </button>
              </div>
            )}
          </div>
          
          <div className="tabla-wrapper">
            <table className="tabla-historial">
              <thead>
                <tr>
                  <th style={{width: '40px'}}>✓</th>
                  <th>Código Producto</th>
                  <th>Nombre Producto</th>
                  <th style={{width: '70px'}}>Cant.</th>
                  <th style={{width: '70px'}}>Unidad</th>
                  <th>Código Usuario</th>
                  <th>Nombre Usuario</th>
                  <th>Condición</th>
                  <th>Observación</th>
                  <th style={{width: '150px'}}>Fecha Préstamo</th>
                  <th style={{width: '150px'}}>Fecha Devolución</th>
                  <th style={{width: '100px'}}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargandoHistorial ? (
                  <tr>
                    <td colSpan="12" style={{textAlign: 'center', padding: '30px'}}>
                      ⏳ Cargando historial de préstamos...
                    </td>
                  </tr>
                ) : historialFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                      {filtroHistorial || filtroEstado !== 'TODOS' ? '🔍 Sin resultados' : 'No hay préstamos registrados'}
                    </td>
                  </tr>
                ) : (
                  historialFiltrado.map((item, index) => {
                    const estaSeleccionado = prestamosSeleccionados.find(p => p.id === item.id);
                    const puedeSeleccionar = item.estado === 'PRESTADO';
                    
                    return (
                      <tr 
                        key={index} 
                        className={estaSeleccionado ? 'fila-seleccionada' : ''}
                        style={{opacity: puedeSeleccionar ? 1 : 0.6}}
                      >
                        <td style={{textAlign: 'center'}}>
                          <input
                            type="checkbox"
                            checked={!!estaSeleccionado}
                            onChange={() => handleSeleccionarPrestamoCheckbox(item)}
                            disabled={!puedeSeleccionar}
                            style={{cursor: puedeSeleccionar ? 'pointer' : 'not-allowed'}}
                          />
                        </td>
                        <td><strong>{item.codigoProducto}</strong></td>
                        <td>{item.nombreProducto}</td>
                        <td style={{textAlign: 'center'}}>{item.cantidad}</td>
                        <td style={{textAlign: 'center'}}>{item.unidadMedida}</td>
                        <td><strong>{item.codigoUsuario}</strong></td>
                        <td>{item.nombreUsuario}</td>
                        <td>
                          <span className="badge-condicion">
                            {item.condicionInicial === 'OTROS' && item.condicionDescripcion 
                              ? item.condicionDescripcion 
                              : item.condicionInicial}
                          </span>
                        </td>
                        <td>{item.observacion || '-'}</td>
                        <td style={{fontSize: '0.9em'}}>{item.fechaPrestamo}</td>
                        <td style={{fontSize: '0.9em'}}>{item.fechaDevolucion || '-'}</td>
                        <td style={{textAlign: 'center'}}>
                          <span className={`estado-badge ${item.estado.toLowerCase()}`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'codigo' && (
        <div className="codigo-barras-content">
          <h3>🔍 Generador de Códigos de Barras Múltiple</h3>
          
          {!mostrarPrevisualizacion ? (
            <>
              {/* Grid de 2 columnas: Personal | Productos */}
              <div className="tabla-seleccion-grid">
                
                {/* COLUMNA: PERSONAL */}
                <div className="tabla-seleccion-seccion">
                  <div className="tabla-seleccion-header">
                    <h4>👤 Personal ({personalSeleccionados.length})</h4>
                    <div className="tabla-header-acciones">
                      <input
                        type="text"
                        className="filtro-busqueda"
                        placeholder="🔍 Buscar por nombre, DNI..."
                        value={filtroPersonal}
                        onChange={(e) => setFiltroPersonal(e.target.value)}
                      />
                      <button 
                        className="btn-seleccionar-todos"
                        onClick={handleSeleccionarTodosPersonal}
                      >
                        {personalSeleccionados.length === personalFiltrado.length && personalFiltrado.length > 0 
                          ? '☐ Deseleccionar Todos' 
                          : '☑ Seleccionar Todos'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="tabla-seleccion-wrapper">
                    <table className="tabla-seleccion">
                      <thead>
                        <tr>
                          <th style={{width: '40px'}}></th>
                          <th>Nombre</th>
                          <th>DNI</th>
                          <th>Área</th>
                          <th style={{width: '110px'}}>Medidas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cargandoPersonal ? (
                          <tr>
                            <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>
                              ⏳ Cargando personal...
                            </td>
                          </tr>
                        ) : personalFiltrado.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                              {filtroPersonal ? '🔍 Sin resultados' : 'No hay personal registrado'}
                            </td>
                          </tr>
                        ) : (
                          personalFiltrado.map((personal, index) => {
                            const isSelected = personalSeleccionados.find(p => p.codigo === personal.codigo);
                            const key = `personal-${personal.codigo}`;
                            const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };
                            
                            return (
                              <tr key={index} className={isSelected ? 'fila-seleccionada' : ''}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={!!isSelected}
                                    onChange={() => handleSeleccionPersonalCheckbox(personal)}
                                  />
                                </td>
                                <td><strong>{personal.nombre}</strong></td>
                                <td>{personal.codigo}</td>
                                <td>{personal.area || 'Sin área'}</td>
                                <td>
                                  {isSelected && (
                                    <button
                                      className="btn-config-medidas"
                                      onClick={() => handleAbrirModalMedidas('personal', personal.codigo)}
                                      title="Configurar medidas"
                                    >
                                      📏 {medidas.ancho}×{medidas.alto}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* COLUMNA: PRODUCTOS */}
                <div className="tabla-seleccion-seccion">
                  <div className="tabla-seleccion-header">
                    <h4>🔧 Productos ({productosSeleccionados.length})</h4>
                    <div className="tabla-header-acciones">
                      <input
                        type="text"
                        className="filtro-busqueda"
                        placeholder="🔍 Buscar por código, nombre..."
                        value={filtroProducto}
                        onChange={(e) => setFiltroProducto(e.target.value)}
                      />
                      <button 
                        className="btn-seleccionar-todos"
                        onClick={handleSeleccionarTodosProductos}
                      >
                        {productosSeleccionados.length === productosFiltrados.length && productosFiltrados.length > 0
                          ? '☐ Deseleccionar Todos' 
                          : '☑ Seleccionar Todos'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="tabla-seleccion-wrapper">
                    <table className="tabla-seleccion">
                      <thead>
                        <tr>
                          <th style={{width: '40px'}}></th>
                          <th>Nombre</th>
                          <th>Código</th>
                          <th>Tipo</th>
                          <th style={{width: '110px'}}>Medidas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cargandoProductos ? (
                          <tr>
                            <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>
                              ⏳ Cargando productos...
                            </td>
                          </tr>
                        ) : productosFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                              {filtroProducto ? '🔍 Sin resultados' : 'No hay productos no consumibles'}
                            </td>
                          </tr>
                        ) : (
                          productosFiltrados.map((producto, index) => {
                            const isSelected = productosSeleccionados.find(p => p.codigo === producto.codigo);
                            const key = `producto-${producto.codigo}`;
                            const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };
                            
                            return (
                              <tr key={index} className={isSelected ? 'fila-seleccionada' : ''}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={!!isSelected}
                                    onChange={() => handleSeleccionProductoCheckbox(producto)}
                                  />
                                </td>
                                <td><strong>{producto.nombre}</strong></td>
                                <td>{producto.codigo}</td>
                                <td><span className="badge-tipo">NO CONSUMIBLE</span></td>
                                <td>
                                  {isSelected && (
                                    <button
                                      className="btn-config-medidas"
                                      onClick={() => handleAbrirModalMedidas('producto', producto.codigo)}
                                      title="Configurar medidas"
                                    >
                                      📏 {medidas.ancho}×{medidas.alto}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Resumen y Acciones */}
              <div className="resumen-seleccion">
                <div className="resumen-info">
                  <h4>� Resumen de Selección</h4>
                  <p>Personal seleccionado: <strong>{personalSeleccionados.length}</strong></p>
                  <p>Productos seleccionados: <strong>{productosSeleccionados.length}</strong></p>
                  <p>Total códigos: <strong>{personalSeleccionados.length + productosSeleccionados.length}</strong></p>
                </div>
                
                <div className="acciones-footer">
                  <button className="btn-limpiar" onClick={handleLimpiarSeleccion}>
                    🗑️ Limpiar Selección
                  </button>
                  <button 
                    className="btn-preview" 
                    onClick={handleMostrarPrevisualizacion}
                    disabled={personalSeleccionados.length === 0 && productosSeleccionados.length === 0}
                  >
                    👁️ Previsualizar ({personalSeleccionados.length + productosSeleccionados.length})
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Previsualización de códigos */}
              <div className="previsualizacion-section">
                <h4>👁️ Previsualización de Códigos de Barras</h4>
                
                <div className="preview-lista">
                  {personalSeleccionados.map((personal, index) => {
                    const key = `personal-${personal.codigo}`;
                    const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };
                    
                    return (
                      <div key={index} className="preview-item">
                        <div className="preview-info">
                          <p><strong>{personal.nombre}</strong></p>
                          <p>DNI: {personal.codigo}</p>
                          <p>Área: {personal.area}</p>
                          <p className="medidas-text">Medidas: {medidas.ancho}mm × {medidas.alto}mm</p>
                        </div>
                        <div className="preview-barcode">
                          <Barcode value={personal.codigo} width={1.5} height={50} fontSize={12} />
                        </div>
                      </div>
                    );
                  })}
                  
                  {productosSeleccionados.map((producto, index) => {
                    const key = `producto-${producto.codigo}`;
                    const medidas = medidasCodigos[key] || { ancho: 80, alto: 40 };
                    
                    return (
                      <div key={index} className="preview-item">
                        <div className="preview-info">
                          <p><strong>{producto.nombre}</strong></p>
                          <p>Código: {producto.codigo}</p>
                          <p>Tipo: {producto.tipo}</p>
                          <p className="medidas-text">Medidas: {medidas.ancho}mm × {medidas.alto}mm</p>
                        </div>
                        <div className="preview-barcode">
                          <Barcode value={producto.codigo} width={1.5} height={50} fontSize={12} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="acciones-footer">
                  <button className="btn-volver" onClick={() => setMostrarPrevisualizacion(false)}>
                    ← Volver a Selección
                  </button>
                  <button className="btn-generar-pdf" onClick={generarPDFCodigosBarras}>
                    📄 Generar PDF
                  </button>
                  <button className="btn-imprimir" onClick={imprimirCodigosBarras}>
                    🖨️ Imprimir
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Modal para configurar medidas */}
          {modalMedidas && (
            <div className="modal-overlay" onClick={handleCerrarModalMedidas}>
              <div className="modal-medidas" onClick={(e) => e.stopPropagation()}>
                <h3>� Configurar Medidas del Código de Barras</h3>
                <p className="modal-subtitle">
                  {modalMedidas.tipo === 'personal' ? '👤 Personal' : '🔧 Producto'}: {modalMedidas.codigo}
                </p>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label>Ancho (mm):</label>
                    <input 
                      type="number" 
                      min="30" 
                      max="150" 
                      value={modalMedidas.medidas.ancho}
                      onChange={(e) => setModalMedidas({
                        ...modalMedidas, 
                        medidas: {...modalMedidas.medidas, ancho: parseInt(e.target.value) || 30}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Alto (mm):</label>
                    <input 
                      type="number" 
                      min="20" 
                      max="100" 
                      value={modalMedidas.medidas.alto}
                      onChange={(e) => setModalMedidas({
                        ...modalMedidas, 
                        medidas: {...modalMedidas.medidas, alto: parseInt(e.target.value) || 20}
                      })}
                    />
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button className="btn-cancelar" onClick={handleCerrarModalMedidas}>
                    Cancelar
                  </button>
                  <button className="btn-guardar-modal" onClick={handleGuardarMedidasModal}>
                    ✓ Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Prestamos;