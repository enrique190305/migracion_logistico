
import React, { useState, useEffect } from 'react';
import './RegistroProyecto.css';
import * as proyectosAPI from '../../services/proyectosAPI';
import Notificacion from './Notificacion';

// ============================================
// COMPONENTE: Modal de Confirmación
// ============================================
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  return (
    <div className="modal-overlay-confirm" onClick={onCancel}>
      <div className="modal-confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-confirm-box-header ${type}`}>
          <span className="modal-confirm-box-icon">
            {type === 'danger' ? '⚠️' : type === 'warning' ? '❓' : 'ℹ️'}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="modal-confirm-box-body">
          <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
        </div>
        <div className="modal-confirm-box-footer">
          <button className="btn-modal-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-modal-confirm btn-modal-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistroProyecto = () => {
  // Estados principales
  const [paso, setPaso] = useState(1); // Control de pasos del wizard
  const [empresas, setEmpresas] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [reservas, setReservas] = useState([]); // ✨ NUEVO
  const [proyectos, setProyectos] = useState([]);
  const [subproyectos, setSubproyectos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false); // ✨ NUEVO
  
  // Estado para notificaciones personalizadas
  const [notificacion, setNotificacion] = useState(null);

  // Estado para modal de confirmación
  const [confirmModal, setConfirmModal] = useState(null);

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
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Bodega y Almacén
    razon_social_id: '',
    bodega_id: '',
    ubicacion: '',
    departamento: '',
    
    // Paso 2: Tipo de Reserva
    tipo_reserva: '', // ✨ AHORA ES ID (número)
    area_ejecucion: '',
    
    // Paso 3: Definir Móvil
    movil_tipo: '', // 'sin_proyecto' o 'con_proyecto'
    movil_nombre: '', // Nombre de persona o proyecto
    proyecto_padre_id: '', // Si es subproyecto
    
    // Datos adicionales
    descripcion: '',
    fecha_registro: new Date().toISOString().split('T')[0], // Fecha actual
    responsable: '',
    estado: 'activo',
    
    // ✅ NUEVOS CAMPOS: Para Móvil sin Proyecto (Datos Personales)
    nom_ape: '',        // Nombre completo de la persona
    dni: '',            // DNI de la persona
    ciudad: '',         // Ciudad de residencia
    observaciones: '',  // Observaciones adicionales
    firma: null         // Archivo de firma (imagen)
  });

  // Estado para vista de subproyectos
  const [mostrarSubproyectos, setMostrarSubproyectos] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  // Estados para las vistas de proyectos registrados
  const [vistaProyectos, setVistaProyectos] = useState('menu'); // 'menu', 'con_proyecto', 'sin_proyecto'

  // Estados para crear subproyecto
  const [mostrarFormSubproyecto, setMostrarFormSubproyecto] = useState(false);
  const [formSubproyecto, setFormSubproyecto] = useState({
    nombre_proyecto: '',
    descripcion: '',
    responsable: '',
    fecha_registro: new Date().toISOString().split('T')[0]
  });

  // Estados para editar subproyecto
  const [editandoSubproyecto, setEditandoSubproyecto] = useState(false);
  const [subproyectoEditando, setSubproyectoEditando] = useState(null);
  const [formEditarSubproyecto, setFormEditarSubproyecto] = useState({
    nombre_proyecto: '',
    descripcion: '',
    responsable: '',
    fecha_registro: ''
  });

  // Estados para editar móvil sin proyecto (persona)
  const [editandoPersona, setEditandoPersona] = useState(false);
  const [personaEditando, setPersonaEditando] = useState(null);
  const [formEditarPersona, setFormEditarPersona] = useState({
    nombre_proyecto: '',
    responsable: '',
    fecha_registro: '',
    // ✅ Nuevos campos personales
    nom_ape: '',
    dni: '',
    ciudad: '',
    observaciones: '',
    firma: null,
    estado: 'ACTIVO' // ✅ Campo de estado
  });

  // Estados para editar proyecto con subproyectos
  const [editandoProyecto, setEditandoProyecto] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [formEditarProyecto, setFormEditarProyecto] = useState({
    nombre_proyecto: '',
    descripcion: '',
    responsable: '',
    fecha_registro: ''
  });

  // ✅ Estados para Modal de Firma Digital
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);
  const [pasoFirma, setPasoFirma] = useState(1); // 1: Términos, 2: Canvas
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [canvasRef, setCanvasRef] = useState(null);
  const [dibujando, setDibujando] = useState(false);
  const [firmaGuardada, setFirmaGuardada] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false); // Para distinguir si es creación o edición

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpresas();
    cargarBodegas();
    cargarReservas(); // ✨ NUEVO
    cargarProyectos();
    cargarPersonas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      const data = await proyectosAPI.obtenerEmpresas();
      setEmpresas(data);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      mostrarNotificacion(
        'error',
        'Error al Cargar Empresas',
        'No se pudieron cargar las empresas disponibles.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Por favor recargue la página' }
        ]
      );
    }
  };

  const cargarBodegas = async () => {
    try {
      const data = await proyectosAPI.obtenerBodegas();
      setBodegas(data);
    } catch (error) {
      console.error('Error al cargar bodegas:', error);
      mostrarNotificacion(
        'error',
        'Error al Cargar Bodegas',
        'No se pudieron cargar las bodegas disponibles.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Por favor recargue la página' }
        ]
      );
    }
  };

  const cargarReservas = async () => {
    try {
      const data = await proyectosAPI.obtenerReservas();
      setReservas(data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      mostrarNotificacion(
        'error',
        'Error al Cargar Tipos de Reserva',
        'No se pudieron cargar los tipos de reserva disponibles.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Por favor recargue la página' }
        ]
      );
    }
  };

  const cargarProyectos = async () => {
    try {
      const data = await proyectosAPI.obtenerProyectos();
      setProyectos(data);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  const cargarPersonas = async () => {
    try {
      const data = await proyectosAPI.obtenerPersonas();
      setPersonas(data);
    } catch (error) {
      console.error('Error al cargar personas:', error);
      mostrarNotificacion(
        'error',
        'Error al Cargar Personas',
        'No se pudieron cargar las personas responsables.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Por favor recargue la página' }
        ]
      );
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    // Si se selecciona una empresa, cargar sus bodegas
    if (name === 'razon_social_id') {
      try {
        const bodegasEmpresa = await proyectosAPI.obtenerBodegasPorEmpresa(value);
        setBodegas(bodegasEmpresa);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          bodega_id: '', // Resetear bodega al cambiar empresa
          ubicacion: ''
        }));
      } catch (error) {
        console.error('Error al cargar bodegas:', error);
      }
      return;
    }
    
    // Si se selecciona una bodega, autocompletar ubicación
    if (name === 'bodega_id') {
      const bodegaSeleccionada = bodegas.find(b => b.id_bodega === parseInt(value));
      if (bodegaSeleccionada) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          ubicacion: bodegaSeleccionada.ubicacion
        }));
        return;
      }
    }
    
    // Si se cambia area_ejecucion, buscar el ID de la reserva correspondiente
    if (name === 'area_ejecucion') {
      const reservaSeleccionada = reservas.find(r => 
        r.tipo_reserva.toLowerCase() === value.toLowerCase()
      );
      setFormData(prev => ({
        ...prev,
        area_ejecucion: value,
        tipo_reserva: reservaSeleccionada ? reservaSeleccionada.id_reserva : ''
      }));
      return;
    }
    
    // Si se resetea movil_tipo, limpiar movil_nombre
    if (name === 'movil_tipo') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        movil_nombre: ''
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ FUNCIONES PARA MODAL DE FIRMA DIGITAL

  /**
   * Abrir modal de firma (modo creación)
   */
  const abrirModalFirma = () => {
    setModoEdicion(false);
    setModalFirmaAbierto(true);
    setPasoFirma(1);
    setTerminosAceptados(false);
    setFirmaGuardada(false);
  };

  /**
   * Abrir modal de firma (modo edición)
   */
  const abrirModalFirmaEdicion = () => {
    setModoEdicion(true);
    setModalFirmaAbierto(true);
    setPasoFirma(1);
    setTerminosAceptados(false);
    setFirmaGuardada(false);
  };

  /**
   * Cerrar modal de firma
   */
  const cerrarModalFirma = () => {
    setModalFirmaAbierto(false);
    setPasoFirma(1);
    setTerminosAceptados(false);
    setModoEdicion(false);
  };

  /**
   * Aceptar términos y avanzar al canvas
   */
  const aceptarTerminos = () => {
    setTerminosAceptados(true);
    setPasoFirma(2);
  };

  /**
   * Rechazar términos y cerrar modal
   */
  const rechazarTerminos = () => {
    cerrarModalFirma();
  };

  /**
   * Inicializar canvas cuando se muestra
   */
  useEffect(() => {
    if (pasoFirma === 2 && canvasRef) {
      const canvas = canvasRef;
      const ctx = canvas.getContext('2d');
      
      // Ajustar tamaño del canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Fondo blanco
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [pasoFirma, canvasRef]);

  /**
   * Iniciar dibujo en canvas
   */
  const iniciarDibujo = (e) => {
    if (!canvasRef) return;
    
    setDibujando(true);
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  /**
   * Dibujar en canvas
   */
  const dibujar = (e) => {
    if (!dibujando || !canvasRef) return;
    
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  /**
   * Finalizar dibujo
   */
  const finalizarDibujo = () => {
    setDibujando(false);
  };

  /**
   * Borrar firma del canvas
   */
  const borrarFirma = () => {
    if (!canvasRef) return;
    
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setFirmaGuardada(false);
  };

  /**
   * Guardar firma del canvas
   */
  const guardarFirma = () => {
    if (!canvasRef) return;
    
    const canvas = canvasRef;
    
    // Convertir canvas a imagen base64
    const firmaBase64 = canvas.toDataURL('image/png');
    
    // Guardar en formData o formEditarPersona según el modo
    if (modoEdicion) {
      setFormEditarPersona(prev => ({
        ...prev,
        firma: firmaBase64
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        firma: firmaBase64
      }));
    }
    
    setFirmaGuardada(true);
    
    // Cerrar modal
    setTimeout(() => {
      cerrarModalFirma();
    }, 500);
  };

  const siguientePaso = () => {
    if (validarPaso(paso)) {
      setPaso(paso + 1);
    }
  };

  const pasoAnterior = () => {
    setPaso(paso - 1);
  };

  const validarPaso = (pasoActual) => {
    switch(pasoActual) {
      case 1:
        if (!formData.razon_social_id || !formData.bodega_id || !formData.ubicacion) {
          mostrarNotificacion(
            'warning',
            'Datos Incompletos - Paso 1',
            'Debe completar todos los campos obligatorios antes de continuar.',
            [
              { label: '⚠️ Paso', valor: 'Bodega y Almacén' },
              { label: '📋 Campos requeridos', valor: 'Empresa, Bodega y Ubicación' },
              { label: '🔧 Acción', valor: 'Complete los campos y vuelva a intentar' }
            ]
          );
          return false;
        }
        return true;
      case 2:
        if (!formData.tipo_reserva || !formData.area_ejecucion) {
          mostrarNotificacion(
            'warning',
            'Datos Incompletos - Paso 2',
            'Debe completar todos los campos obligatorios antes de continuar.',
            [
              { label: '⚠️ Paso', valor: 'Tipo de Reserva' },
              { label: '📋 Campos requeridos', valor: 'Tipo de Reserva y Área de Ejecución' },
              { label: '🔧 Acción', valor: 'Complete los campos y vuelva a intentar' }
            ]
          );
          return false;
        }
        return true;
      case 3:
        if (!formData.movil_tipo) {
          mostrarNotificacion(
            'warning',
            'Tipo de Móvil Requerido',
            'Debe seleccionar el tipo de móvil antes de continuar.',
            [
              { label: '⚠️ Campo faltante', valor: 'Tipo de Móvil' },
              { label: '📋 Opciones', valor: 'Sin Proyecto o Con Proyecto' },
              { label: '🔧 Acción', valor: 'Seleccione una opción' }
            ]
          );
          return false;
        }

        // ✅ Validación para MÓVIL CON PROYECTO
        if (formData.movil_tipo === 'con_proyecto') {
          if (!formData.movil_nombre) {
            mostrarNotificacion(
              'warning',
              'Nombre de Proyecto Requerido',
              'Debe ingresar el nombre del proyecto.',
              [
                { label: '⚠️ Campo faltante', valor: 'Nombre del Proyecto' },
                { label: '📋 Tipo seleccionado', valor: 'Con Proyecto' },
                { label: '🔧 Acción', valor: 'Ingrese un nombre para el proyecto' }
              ]
            );
            return false;
          }
          if (!formData.responsable) {
            mostrarNotificacion(
              'warning',
              'Responsable Requerido',
              'Debe seleccionar un responsable para el proyecto.',
              [
                { label: '⚠️ Campo faltante', valor: 'Responsable' },
                { label: '🔧 Acción', valor: 'Seleccione un responsable de la lista' }
              ]
            );
            return false;
          }
        }

        // ✅ Validación para MÓVIL SIN PROYECTO (datos personales)
        if (formData.movil_tipo === 'sin_proyecto') {
          if (!formData.nom_ape || !formData.dni || !formData.ciudad) {
            mostrarNotificacion(
              'warning',
              'Datos Personales Incompletos',
              'Debe completar todos los datos de la persona.',
              [
                { label: '⚠️ Campos requeridos', valor: 'Nombre Completo, DNI y Ciudad' },
                { label: '📋 Tipo seleccionado', valor: 'Móvil sin Proyecto' },
                { label: '🔧 Acción', valor: 'Complete todos los campos obligatorios' }
              ]
            );
            return false;
          }
          if (formData.dni.length !== 8) {
            mostrarNotificacion(
              'warning',
              'DNI Inválido',
              'El DNI debe tener exactamente 8 dígitos.',
              [
                { label: '⚠️ DNI ingresado', valor: formData.dni },
                { label: '📋 Longitud esperada', valor: '8 dígitos' },
                { label: '🔧 Acción', valor: 'Verifique el DNI ingresado' }
              ]
            );
            return false;
          }
        }
        
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // ✅ Obtener usuario logueado del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const idUsuarioLogueado = user.id || 1; // Por defecto ID 1 si no hay usuario
      
      // Preparar datos para el backend
      const proyectoData = {
        id_usuario_logueado: idUsuarioLogueado, // ✅ NUEVO: enviar ID del usuario que registra
        razon_social_id: parseInt(formData.razon_social_id),
        bodega_id: parseInt(formData.bodega_id),
        tipo_reserva: parseInt(formData.tipo_reserva), // ID de la reserva
        movil_tipo: formData.movil_tipo,
        fecha_registro: formData.fecha_registro
      };

      // ✅ Campos según el tipo de móvil
      if (formData.movil_tipo === 'con_proyecto') {
        // Para proyectos CON subproyectos
        if (formData.movil_nombre) {
          proyectoData.movil_nombre = formData.movil_nombre;
        }
        proyectoData.responsable = parseInt(formData.responsable);
        
        if (formData.descripcion) {
          proyectoData.descripcion = formData.descripcion;
        }
      } else if (formData.movil_tipo === 'sin_proyecto') {
        // ✅ Para móviles SIN proyecto (datos personales)
        proyectoData.nom_ape = formData.nom_ape;
        proyectoData.dni = formData.dni;
        proyectoData.ciudad = formData.ciudad;
        
        if (formData.observaciones) {
          proyectoData.observaciones = formData.observaciones;
        }
        
        if (formData.firma) {
          proyectoData.firma = formData.firma; // Base64 de la firma
        }
      }

      console.log('Enviando datos:', proyectoData);
      
      // Llamar al API
      const response = await proyectosAPI.crearProyecto(proyectoData);
      
      // Obtener datos para la notificación
      const empresaSeleccionada = empresas.find(e => e.id_empresa === parseInt(formData.razon_social_id));
      const bodegaSeleccionada = bodegas.find(b => b.id_bodega === parseInt(formData.bodega_id));
      const reservaSeleccionada = reservas.find(r => r.id_reserva === parseInt(formData.tipo_reserva));
      
      mostrarNotificacion(
        'success',
        'Proyecto Registrado Exitosamente',
        'El proyecto se ha creado correctamente en el sistema.',
        [
          { label: '📋 Código', valor: response.data.codigo_proyecto },
          { label: '🏢 Empresa', valor: empresaSeleccionada?.razon_social || '-' },
          { label: '🏪 Bodega', valor: bodegaSeleccionada?.nombre || '-' },
          { label: '📦 Tipo Reserva', valor: reservaSeleccionada?.tipo_reserva || '-' },
          { label: '👤 Tipo Móvil', valor: formData.movil_tipo === 'con_proyecto' ? 'Con Proyecto' : 'Sin Proyecto' },
          { label: '✅ Estado', valor: 'ACTIVO' }
        ]
      );

      // Si se creó un móvil sin proyecto, refrescar la lista de personas
      if (formData.movil_tipo === 'sin_proyecto') {
        try {
          // refrescar dropdown de responsables sin recargar la página
          await cargarPersonas();
        } catch (err) {
          console.error('Error al refrescar personas después de crear movil sin proyecto:', err);
        }
      }

      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        limpiarFormulario();
        setPaso(1);
        cargarProyectos();
        cerrarNotificacion();
      }, 3000);
      
    } catch (error) {
      console.error('Error al registrar proyecto:', error);
      mostrarNotificacion(
        'error',
        'Error al Registrar Proyecto',
        'Ocurrió un error al intentar crear el proyecto.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' },
          { label: '🏢 Empresa', valor: empresas.find(e => e.id_empresa === parseInt(formData.razon_social_id))?.razon_social || '-' },
          { label: '🔧 Acción', valor: 'Verifique los datos e intente nuevamente' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      razon_social_id: '',
      bodega_id: '',
      ubicacion: '',
      departamento: '',
      tipo_reserva: '',
      area_ejecucion: '',
      movil_tipo: '',
      movil_nombre: '',
      proyecto_padre_id: '',
      descripcion: '',
      fecha_registro: new Date().toISOString().split('T')[0], // Fecha actual
      responsable: '',
      estado: 'activo',
      // ✅ Limpiar nuevos campos personales
      nom_ape: '',
      dni: '',
      ciudad: '',
      observaciones: '',
      firma: null
    });
  };

  const verSubproyectos = async (proyecto) => {
    try {
      setProyectoSeleccionado(proyecto);
      setLoading(true);
      
      // Cargar subproyectos desde el backend
      const subs = await proyectosAPI.obtenerSubproyectos(proyecto.id_proyecto_almacen);
      setSubproyectos(subs);
      setMostrarSubproyectos(true);
    } catch (error) {
      console.error('Error al cargar subproyectos:', error);
      mostrarNotificacion(
        'error',
        'Error al Cargar Subproyectos',
        'No se pudieron cargar los subproyectos del proyecto seleccionado.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' },
          { label: '📁 Proyecto', valor: proyecto?.codigo_proyecto || '-' },
          { label: '🔧 Acción', valor: 'Intente nuevamente' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const crearSubproyecto = () => {
    setMostrarFormSubproyecto(true);
  };

  const handleSubproyectoChange = (e) => {
    const { name, value } = e.target;
    setFormSubproyecto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitSubproyecto = async (e) => {
    e.preventDefault();
    
    if (!formSubproyecto.nombre_proyecto || !formSubproyecto.responsable) {
      mostrarNotificacion(
        'warning',
        'Datos Incompletos',
        'Debe completar todos los campos obligatorios.',
        [
          { label: '⚠️ Campos requeridos', valor: 'Nombre del Subproyecto y Responsable' }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // ✅ Obtener usuario logueado del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const idUsuarioLogueado = user.id || 1; // Por defecto ID 1 si no hay usuario

      // ✅ Agregar id_usuario_logueado al objeto a enviar
      const datosSubproyecto = {
        ...formSubproyecto,
        id_usuario_logueado: idUsuarioLogueado
      };

      const response = await proyectosAPI.crearSubproyecto(
        proyectoSeleccionado.id_proyecto_almacen,
        datosSubproyecto
      );

      mostrarNotificacion(
        'success',
        'Subproyecto Creado Exitosamente',
        'El subproyecto se ha registrado correctamente.',
        [
          { label: '📋 Proyecto Padre', valor: proyectoSeleccionado.codigo_proyecto },
          { label: '🆕 Subproyecto', valor: formSubproyecto.nombre_proyecto },
          { label: '✅ Estado', valor: 'ACTIVO' }
        ]
      );

      // Limpiar formulario y recargar subproyectos
      setFormSubproyecto({
        nombre_proyecto: '',
        descripcion: '',
        responsable: '',
        fecha_registro: new Date().toISOString().split('T')[0]
      });
      setMostrarFormSubproyecto(false);

      // Recargar subproyectos
      const subs = await proyectosAPI.obtenerSubproyectos(proyectoSeleccionado.id_proyecto_almacen);
      setSubproyectos(subs);

      setTimeout(() => {
        cerrarNotificacion();
      }, 3000);

    } catch (error) {
      console.error('Error al crear subproyecto:', error);
      mostrarNotificacion(
        'error',
        'Error al Crear Subproyecto',
        'Ocurrió un error al intentar crear el subproyecto.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' },
          { label: '🔧 Acción', valor: 'Verifique los datos e intente nuevamente' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelarSubproyecto = () => {
    setFormSubproyecto({
      nombre_proyecto: '',
      descripcion: '',
      responsable: '',
      fecha_registro: new Date().toISOString().split('T')[0]
    });
    setMostrarFormSubproyecto(false);
  };

  // Función para iniciar edición de subproyecto
  const iniciarEdicionSubproyecto = (sub) => {
    setSubproyectoEditando(sub);
    setFormEditarSubproyecto({
      nombre_proyecto: sub.nombre || sub.nombre_proyecto || '',
      descripcion: sub.descripcion || '',
      responsable: sub.id_responsable || '',
      fecha_registro: sub.fecha_registro ? sub.fecha_registro.split('T')[0] : ''
    });
    setEditandoSubproyecto(true);
  };

  // Función para manejar cambios en el formulario de edición
  const handleEditarSubproyectoChange = (e) => {
    const { name, value } = e.target;
    setFormEditarSubproyecto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar edición
  const handleSubmitEditarSubproyecto = async (e) => {
    e.preventDefault();
    
    if (!formEditarSubproyecto.nombre_proyecto || !formEditarSubproyecto.responsable) {
      mostrarNotificacion(
        'warning',
        'Datos Incompletos',
        'Debe completar todos los campos obligatorios.',
        [
          { label: '⚠️ Campos requeridos', valor: 'Nombre del Subproyecto y Responsable' }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await proyectosAPI.actualizarSubproyecto(
        proyectoSeleccionado.id_proyecto_almacen,
        subproyectoEditando.id_proyecto_almacen || subproyectoEditando.id,
        formEditarSubproyecto
      );

      mostrarNotificacion(
        'success',
        'Subproyecto Actualizado',
        'El subproyecto se ha actualizado correctamente.',
        [
          { label: '📋 Subproyecto', valor: formEditarSubproyecto.nombre_proyecto },
          { label: '✅ Estado', valor: 'Actualizado' }
        ]
      );

      // Cerrar formulario de edición
      setEditandoSubproyecto(false);
      setSubproyectoEditando(null);

      // Recargar subproyectos
      const subs = await proyectosAPI.obtenerSubproyectos(proyectoSeleccionado.id_proyecto_almacen);
      setSubproyectos(subs);

      setTimeout(() => {
        cerrarNotificacion();
      }, 3000);

    } catch (error) {
      console.error('Error al actualizar subproyecto:', error);
      mostrarNotificacion(
        'error',
        'Error al Actualizar',
        'Ocurrió un error al intentar actualizar el subproyecto.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar edición
  const cancelarEdicionSubproyecto = () => {
    setEditandoSubproyecto(false);
    setSubproyectoEditando(null);
    setFormEditarSubproyecto({
      nombre_proyecto: '',
      descripcion: '',
      responsable: '',
      fecha_registro: ''
    });
  };

  // Función para eliminar (desactivar) subproyecto
  const eliminarSubproyectoHandler = async (sub) => {
    setConfirmModal({
      title: 'Eliminar Subproyecto',
      message: `¿Está seguro de eliminar el subproyecto "${sub.nombre || sub.nombre_proyecto}"?\n\nCódigo: ${sub.codigo_proyecto || 'N/A'}\n\nEsta acción desactivará el subproyecto y no se podrá revertir.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setConfirmModal(null);
        setLoading(true);
        
        try {
          await proyectosAPI.eliminarSubproyecto(
            proyectoSeleccionado.id_proyecto_almacen,
            sub.id_proyecto_almacen || sub.id
          );

          mostrarNotificacion(
            'success',
            'Subproyecto Eliminado',
            'El subproyecto ha sido desactivado exitosamente.',
            [
              { label: '📋 Subproyecto', valor: sub.nombre || sub.nombre_proyecto },
              { label: '🗑️ Acción', valor: 'Desactivado' }
            ]
          );

          // Recargar subproyectos
          const subs = await proyectosAPI.obtenerSubproyectos(proyectoSeleccionado.id_proyecto_almacen);
          setSubproyectos(subs);

          setTimeout(() => {
            cerrarNotificacion();
          }, 3000);

        } catch (error) {
      console.error('Error al eliminar subproyecto:', error);
      mostrarNotificacion(
        'error',
        'Error al Eliminar',
        'Ocurrió un error al intentar eliminar el subproyecto.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' }
        ]
      );
    } finally {
      setLoading(false);
    }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // ========================================
  // FUNCIONES PARA MÓVILES SIN PROYECTO (PERSONA)
  // ========================================

  // Función para iniciar edición de persona
  const iniciarEdicionPersona = (persona) => {
    setPersonaEditando(persona);
    setFormEditarPersona({
      nom_ape: persona.nombre_proyecto || '', // El nombre está en nombre_proyecto
      dni: persona.dni || '',
      ciudad: persona.ciudad || '',
      observaciones: persona.observaciones || '',
      firma: persona.firma || null,
      fecha_registro: persona.fecha_registro ? persona.fecha_registro.split('T')[0] : '',
      estado: persona.estado || 'ACTIVO' // ✅ Cargar estado actual
    });
    setEditandoPersona(true);
  };

  // Función para manejar cambios en el formulario de edición de persona
  const handleEditarPersonaChange = (e) => {
    const { name, value } = e.target;
    setFormEditarPersona(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar edición de persona
  const handleSubmitEditarPersona = async (e) => {
    e.preventDefault();
    
    // ✅ Validar campos personales
    if (!formEditarPersona.nom_ape || !formEditarPersona.dni || !formEditarPersona.ciudad) {
      mostrarNotificacion(
        'warning',
        'Datos Incompletos',
        'Debe completar todos los campos obligatorios.',
        [
          { label: '⚠️ Campos requeridos', valor: 'Nombre Completo, DNI y Ciudad' }
        ]
      );
      return;
    }

    if (formEditarPersona.dni.length !== 8) {
      mostrarNotificacion(
        'warning',
        'DNI Inválido',
        'El DNI debe tener exactamente 8 dígitos.',
        [
          { label: '⚠️ DNI ingresado', valor: formEditarPersona.dni }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // ✅ Enviar datos personales
      const datosActualizados = {
        nom_ape: formEditarPersona.nom_ape,
        dni: formEditarPersona.dni,
        ciudad: formEditarPersona.ciudad,
        observaciones: formEditarPersona.observaciones,
        fecha_registro: formEditarPersona.fecha_registro,
        estado: formEditarPersona.estado // ✅ Incluir estado
      };

      // Agregar firma si fue modificada
      if (formEditarPersona.firma) {
        datosActualizados.firma = formEditarPersona.firma;
      }

      const response = await proyectosAPI.actualizarProyecto(
        personaEditando.id_proyecto_almacen,
        datosActualizados
      );

      mostrarNotificacion(
        'success',
        'Móvil sin Proyecto Actualizado',
        'Los datos personales se han actualizado correctamente.',
        [
          { label: '👤 Persona', valor: formEditarPersona.nom_ape },
          { label: '📇 DNI', valor: formEditarPersona.dni },
          { label: '🏙️ Ciudad', valor: formEditarPersona.ciudad },
          { label: '✅ Estado', valor: 'Actualizado' }
        ]
      );

      // Cerrar formulario de edición
      setEditandoPersona(false);
      setPersonaEditando(null);

      // Recargar proyectos
      await cargarProyectos();

      setTimeout(() => {
        cerrarNotificacion();
      }, 3000);

    } catch (error) {
      console.error('Error al actualizar persona:', error);
      mostrarNotificacion(
        'error',
        'Error al Actualizar',
        'Ocurrió un error al intentar actualizar los datos.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar edición de persona
  const cancelarEdicionPersona = () => {
    setEditandoPersona(false);
    setPersonaEditando(null);
    setFormEditarPersona({
      nom_ape: '',
      dni: '',
      ciudad: '',
      observaciones: '',
      firma: null,
      fecha_registro: '',
      estado: 'ACTIVO' // ✅ Resetear estado
    });
  };

  // Función para eliminar (desactivar) móvil sin proyecto
  const eliminarPersonaHandler = async (persona) => {
    setConfirmModal({
      title: 'Eliminar Móvil sin Proyecto',
      message: `¿Está seguro de eliminar el móvil sin proyecto "${persona.nombre_proyecto}"?\n\nCódigo: ${persona.codigo_proyecto || 'N/A'}\n\nEsta acción desactivará el registro y no se podrá revertir.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setConfirmModal(null);
        setLoading(true);
        
        try {
          await proyectosAPI.eliminarProyecto(persona.id_proyecto_almacen);

          mostrarNotificacion(
            'success',
            'Móvil sin Proyecto Eliminado',
            'El registro ha sido desactivado exitosamente.',
            [
              { label: '👤 Persona', valor: persona.nombre_proyecto },
              { label: '🗑️ Acción', valor: 'Desactivado' }
            ]
          );

          // Recargar proyectos para reflejar los cambios
          await cargarProyectos();

          setTimeout(() => {
            cerrarNotificacion();
          }, 3000);

        } catch (error) {
          console.error('Error al eliminar persona:', error);
          mostrarNotificacion(
            'error',
            'Error al Eliminar',
            'Ocurrió un error al intentar eliminar el registro.',
            [
              { label: '❌ Error', valor: error.message || 'Error desconocido' }
            ]
          );
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // ========================================
  // FUNCIONES PARA PROYECTOS CON SUBPROYECTOS
  // ========================================

  // Función para iniciar edición de proyecto
  const iniciarEdicionProyecto = (proyecto) => {
    setProyectoEditando(proyecto);
    setFormEditarProyecto({
      nombre_proyecto: proyecto.nombre_proyecto || '',
      descripcion: proyecto.descripcion || '',
      responsable: proyecto.id_responsable || '',
      fecha_registro: proyecto.fecha_registro ? proyecto.fecha_registro.split('T')[0] : ''
    });
    setEditandoProyecto(true);
  };

  // Función para manejar cambios en el formulario de edición de proyecto
  const handleEditarProyectoChange = (e) => {
    const { name, value } = e.target;
    setFormEditarProyecto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar edición de proyecto
  const handleSubmitEditarProyecto = async (e) => {
    e.preventDefault();
    
    if (!formEditarProyecto.nombre_proyecto || !formEditarProyecto.responsable) {
      mostrarNotificacion(
        'warning',
        'Datos Incompletos',
        'Debe completar todos los campos obligatorios.',
        [
          { label: '⚠️ Campos requeridos', valor: 'Nombre del Proyecto y Responsable' }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await proyectosAPI.actualizarProyecto(
        proyectoEditando.id_proyecto_almacen,
        formEditarProyecto
      );

      mostrarNotificacion(
        'success',
        'Proyecto Actualizado',
        'El proyecto se ha actualizado correctamente.',
        [
          { label: '📋 Proyecto', valor: formEditarProyecto.nombre_proyecto },
          { label: '✅ Estado', valor: 'Actualizado' }
        ]
      );

      // Cerrar formulario de edición
      setEditandoProyecto(false);
      setProyectoEditando(null);

      // Recargar proyectos
      await cargarProyectos();

      setTimeout(() => {
        cerrarNotificacion();
      }, 3000);

    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      mostrarNotificacion(
        'error',
        'Error al Actualizar',
        'Ocurrió un error al intentar actualizar el proyecto.',
        [
          { label: '❌ Error', valor: error.message || 'Error desconocido' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar edición de proyecto
  const cancelarEdicionProyecto = () => {
    setEditandoProyecto(false);
    setProyectoEditando(null);
    setFormEditarProyecto({
      nombre_proyecto: '',
      descripcion: '',
      responsable: '',
      fecha_registro: ''
    });
  };

  // Función para eliminar (desactivar) proyecto con subproyectos
  const eliminarProyectoHandler = async (proyecto) => {
    // Verificar si tiene subproyectos activos
    if (proyecto.cantidad_subproyectos > 0) {
      mostrarNotificacion(
        'warning',
        'No se puede Eliminar',
        'Este proyecto tiene subproyectos activos.',
        [
          { label: '⚠️ Proyecto', valor: proyecto.nombre_proyecto },
          { label: '📋 Subproyectos', valor: `${proyecto.cantidad_subproyectos} activos` },
          { label: '💡 Sugerencia', valor: 'Elimine primero los subproyectos' }
        ]
      );
      return;
    }

    setConfirmModal({
      title: 'Eliminar Proyecto',
      message: `¿Está seguro de eliminar el proyecto "${proyecto.nombre_proyecto}"?\n\nCódigo: ${proyecto.codigo_proyecto || 'N/A'}\n\nEsta acción desactivará el proyecto y no se podrá revertir.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setConfirmModal(null);
        setLoading(true);
        
        try {
          await proyectosAPI.eliminarProyecto(proyecto.id_proyecto_almacen);

          mostrarNotificacion(
            'success',
            'Proyecto Eliminado',
            'El proyecto ha sido desactivado exitosamente.',
            [
              { label: '📋 Proyecto', valor: proyecto.nombre_proyecto },
              { label: '🗑️ Acción', valor: 'Desactivado' }
            ]
          );

          // Recargar proyectos
          await cargarProyectos();

          setTimeout(() => {
            cerrarNotificacion();
          }, 3000);

        } catch (error) {
          console.error('Error al eliminar proyecto:', error);
          mostrarNotificacion(
            'error',
            'Error al Eliminar',
            'Ocurrió un error al intentar eliminar el proyecto.',
            [
              { label: '❌ Error', valor: error.message || 'Error desconocido' }
            ]
          );
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // Renderizado condicional según la vista
  if (mostrarSubproyectos) {
    return (
      <div className="registro-proyecto-container">
        <div className="proyecto-header">
          <button className="btn-volver" onClick={() => {
            setMostrarSubproyectos(false);
            setMostrarFormSubproyecto(false);
            setVistaProyectos('con_proyecto');
          }}>
            ← Volver
          </button>
          <h2>Subproyectos de: {proyectoSeleccionado?.nombre_proyecto || proyectoSeleccionado?.codigo_proyecto}</h2>
        </div>

        {/* Formulario para crear subproyecto */}
        {mostrarFormSubproyecto && (
          <div className="subproyecto-form-container">
            <form onSubmit={handleSubmitSubproyecto} className="subproyecto-form">
              <h3>Crear Nuevo Subproyecto</h3>
              <p className="form-description">Complete los datos del subproyecto para {proyectoSeleccionado?.codigo_proyecto}</p>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Subproyecto *</label>
                  <input
                    type="text"
                    name="nombre_proyecto"
                    value={formSubproyecto.nombre_proyecto}
                    onChange={handleSubproyectoChange}
                    placeholder="Ej: Subproyecto - Fase 1"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Responsable del Subproyecto *</label>
                  <select
                    name="responsable"
                    value={formSubproyecto.responsable}
                    onChange={handleSubproyectoChange}
                    required
                  >
                    <option value="">Seleccione una persona</option>
                    {personas.map(persona => (
                      <option key={persona.id} value={persona.id}>
                        {persona.nombre_completo || persona.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Descripción (Opcional)</label>
                  <textarea
                    name="descripcion"
                    value={formSubproyecto.descripcion}
                    onChange={handleSubproyectoChange}
                    rows="3"
                    placeholder="Descripción del subproyecto..."
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Registro</label>
                  <input
                    type="date"
                    name="fecha_registro"
                    value={formSubproyecto.fecha_registro}
                    readOnly
                    className="input-readonly"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={cancelarSubproyecto}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success" disabled={loading}>
                  {loading ? 'Creando...' : '✓ Crear Subproyecto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulario para editar subproyecto */}
        {editandoSubproyecto && (
          <div className="subproyecto-form-container modal-overlay">
            <div className="modal-content">
              <form onSubmit={handleSubmitEditarSubproyecto} className="subproyecto-form">
                <h3>Editar Subproyecto</h3>
                <p className="form-description">
                  Código: {subproyectoEditando?.codigo_proyecto || 'N/A'}
                </p>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nombre del Subproyecto *</label>
                    <input
                      type="text"
                      name="nombre_proyecto"
                      value={formEditarSubproyecto.nombre_proyecto}
                      onChange={handleEditarSubproyectoChange}
                      placeholder="Ej: Subproyecto - Fase 1"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Responsable del Subproyecto *</label>
                    <select
                      name="responsable"
                      value={formEditarSubproyecto.responsable}
                      onChange={handleEditarSubproyectoChange}
                      required
                    >
                      <option value="">Seleccione una persona</option>
                      {personas.map(persona => (
                        <option key={persona.id} value={persona.id}>
                          {persona.nombre_completo || persona.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción (Opcional)</label>
                    <textarea
                      name="descripcion"
                      value={formEditarSubproyecto.descripcion}
                      onChange={handleEditarSubproyectoChange}
                      rows="3"
                      placeholder="Descripción del subproyecto..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Registro</label>
                    <input
                      type="date"
                      name="fecha_registro"
                      value={formEditarSubproyecto.fecha_registro}
                      onChange={handleEditarSubproyectoChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={cancelarEdicionSubproyecto}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-success" disabled={loading}>
                    {loading ? 'Guardando...' : '✓ Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="subproyectos-container">
          <div className="subproyectos-header">
            <h3>Lista de Subproyectos</h3>
            {!mostrarFormSubproyecto && (
              <button className="btn-primary" onClick={crearSubproyecto}>
                + Crear Nuevo Subproyecto
              </button>
            )}
          </div>

          <div className="subproyectos-grid">
            {loading ? (
              <div className="empty-state">
                <p>Cargando subproyectos...</p>
              </div>
            ) : subproyectos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No hay subproyectos registrados</p>
              </div>
            ) : (
              subproyectos.map(sub => (
                <div key={sub.id || sub.id_proyecto_almacen} className="subproyecto-card">
                  <div className="subproyecto-header-card">
                    <div className="subproyecto-icon">📋</div>
                    <h4>{sub.nombre || sub.nombre_proyecto}</h4>
                  </div>
                  
                  <div className="subproyecto-body">
                    {sub.codigo_proyecto && (
                      <div className="subproyecto-info-item codigo">
                        <strong>Código:</strong> {sub.codigo_proyecto}
                      </div>
                    )}
                    
                    {sub.responsable && (
                      <div className="subproyecto-info-item">
                        <span className="info-label">👤 Responsable:</span>
                        <span className="info-value">{sub.responsable}</span>
                      </div>
                    )}
                    
                    {sub.dni_responsable && (
                      <div className="subproyecto-info-item">
                        <span className="info-label">📄 DNI:</span>
                        <span className="info-value">{sub.dni_responsable}</span>
                      </div>
                    )}
                    
                    {sub.fecha_registro && (
                      <div className="subproyecto-info-item">
                        <span className="info-label">📅 Fecha:</span>
                        <span className="info-value">{new Date(sub.fecha_registro).toLocaleDateString('es-PE')}</span>
                      </div>
                    )}
                    
                    {sub.descripcion && (
                      <div className="subproyecto-descripcion">
                        <em>{sub.descripcion}</em>
                      </div>
                    )}
                    
                    <div className="subproyecto-estado">
                      <span className={`badge ${sub.estado === 'ACTIVO' ? 'badge-activo' : 'badge-inactivo'}`}>
                        {sub.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="subproyecto-actions">
                    <button 
                      type="button"
                      className="btn-icon btn-info" 
                      title="Ver Detalles"
                      onClick={() => {
                        mostrarNotificacion(
                          'info',
                          'Detalles del Subproyecto',
                          `Información completa de: ${sub.nombre || sub.nombre_proyecto}`,
                          [
                            { label: '📋 Código', valor: sub.codigo_proyecto || 'N/A' },
                            { label: '📦 Proyecto Padre', valor: proyectoSeleccionado?.nombre_proyecto || proyectoSeleccionado?.codigo_proyecto },
                            { label: '👤 Responsable', valor: sub.responsable || 'N/A' },
                            { label: '📄 DNI', valor: sub.dni_responsable || 'N/A' },
                            { label: '🏢 Empresa', valor: sub.empresa || 'N/A' },
                            { label: '🏪 Bodega', valor: sub.bodega || 'N/A' },
                            { label: '📍 Ubicación', valor: sub.ubicacion || 'N/A' },
                            { label: '📦 Tipo Reserva', valor: sub.tipo_reserva || 'N/A' },
                            { label: '📅 Fecha Registro', valor: sub.fecha_registro ? new Date(sub.fecha_registro).toLocaleDateString('es-PE') : 'N/A' },
                            { label: '✅ Estado', valor: sub.estado || 'N/A' },
                            { label: '📝 Descripción', valor: sub.descripcion || 'Sin descripción' }
                          ]
                        );
                      }}
                    >
                      📄 Ver Detalles
                    </button>
                    
                    <button 
                      type="button"
                      className="btn-icon btn-warning"
                      title="Editar Subproyecto"
                      onClick={() => iniciarEdicionSubproyecto(sub)}
                    >
                      ✏️ Editar
                    </button>
                    
                    <button 
                      type="button"
                      className="btn-icon btn-danger"
                      title="Eliminar Subproyecto"
                      onClick={() => eliminarSubproyectoHandler(sub)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Componente de Notificación para la vista de subproyectos */}
        {notificacion && (
          <Notificacion
            tipo={notificacion.tipo}
            titulo={notificacion.titulo}
            mensaje={notificacion.mensaje}
            detalles={notificacion.detalles}
            onClose={cerrarNotificacion}
          />
        )}
      </div>
    );
  }

  return (
    <div className="registro-proyecto-container">
      {/* Header con progreso */}
      <div className="proyecto-header">
        <h2>Registro de Nuevo Proyecto</h2>
        <div className="progress-bar">
          <div className={`progress-step ${paso >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Bodega y Almacén</div>
          </div>
          <div className={`progress-line ${paso >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${paso >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Tipo de Reserva</div>
          </div>
          <div className={`progress-line ${paso >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${paso >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Definir Móvil</div>
          </div>
          <div className={`progress-line ${paso >= 4 ? 'active' : ''}`}></div>
          <div className={`progress-step ${paso >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Resumen</div>
          </div>
        </div>
      </div>

      {/* Formulario por pasos */}
      <form onSubmit={handleSubmit} className="proyecto-form">
        {/* PASO 1: Bodega y Almacén */}
        {paso === 1 && (
          <div className="form-step">
            <h3>Paso 1: Bodega y Almacén</h3>
            <p className="step-description">Seleccione la ubicación del proyecto</p>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Razón Social (Empresa) *</label>
                <select
                  name="razon_social_id"
                  value={formData.razon_social_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione una empresa</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id_empresa} value={empresa.id_empresa}>
                      {empresa.razon_social} {empresa.ruc ? `- RUC: ${empresa.ruc}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bodega / Almacén *</label>
                <select
                  name="bodega_id"
                  value={formData.bodega_id}
                  onChange={handleInputChange}
                  disabled={!formData.razon_social_id}
                  required
                >
                  <option value="">
                    {formData.razon_social_id ? 'Seleccione una bodega' : 'Primero seleccione una empresa'}
                  </option>
                  {bodegas.map(bodega => (
                    <option key={bodega.id_bodega} value={bodega.id_bodega}>
                      {bodega.nombre} - {bodega.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  readOnly
                  placeholder="Se autocompletará al seleccionar bodega"
                  className="input-readonly"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={limpiarFormulario}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={siguientePaso}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Tipo de Reserva */}
        {paso === 2 && (
          <div className="form-step">
            <h3>Paso 2: Tipo de Reserva</h3>
            <p className="step-description">Defina el área de ejecución del proyecto</p>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Área de Ejecución *</label>
                <select
                  name="area_ejecucion"
                  value={formData.area_ejecucion}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione el área</option>
                  {reservas.map(reserva => (
                    <option key={reserva.id_reserva} value={reserva.tipo_reserva.toLowerCase()}>
                      {reserva.tipo_reserva}
                    </option>
                  ))}
                </select>
              </div>

              {formData.area_ejecucion && (
                <div className="info-box">
                  <div className="info-icon">ℹ️</div>
                  <div className="info-content">
                    <strong>Área seleccionada: {formData.area_ejecucion.toUpperCase()}</strong>
                    <p>
                      Tipo de reserva para gestión de recursos y materiales
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={pasoAnterior}>
                ← Anterior
              </button>
              <button type="button" className="btn-primary" onClick={siguientePaso}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Definir Móvil */}
        {paso === 3 && (
          <div className="form-step">
            <h3>Paso 3: Definir Móvil</h3>
            <p className="step-description">Determine si es una persona o un proyecto con subproyectos</p>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Tipo de Móvil *</label>
                <div className="radio-group">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="sin_proyecto"
                      name="movil_tipo"
                      value="sin_proyecto"
                      checked={formData.movil_tipo === 'sin_proyecto'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="sin_proyecto">
                      <div className="radio-card">
                        <div className="radio-icon">👤</div>
                        <div className="radio-title">Móvil sin Proyecto</div>
                        <div className="radio-description">Es una persona individual</div>
                      </div>
                    </label>
                  </div>

                  <div className="radio-option">
                    <input
                      type="radio"
                      id="con_proyecto"
                      name="movil_tipo"
                      value="con_proyecto"
                      checked={formData.movil_tipo === 'con_proyecto'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="con_proyecto">
                      <div className="radio-card">
                        <div className="radio-icon">📊</div>
                        <div className="radio-title">Móvil con Proyecto</div>
                        <div className="radio-description">Es un proyecto que tendrá subproyectos</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {formData.movil_tipo === 'con_proyecto' && (
                <>
                  <div className="form-group full-width">
                    <label>Nombre del Proyecto *</label>
                    <input
                      type="text"
                      name="movil_nombre"
                      value={formData.movil_nombre}
                      onChange={handleInputChange}
                      placeholder="Ej: Construcción Edificio Central"
                      required
                    />
                  </div>

                  <div className="info-box success">
                    <div className="info-icon">✓</div>
                    <div className="info-content">
                      <strong>Este proyecto podrá tener subproyectos</strong>
                      <p>Después de crear el proyecto principal, podrá agregar subproyectos desde la vista de gestión.</p>
                    </div>
                  </div>

                  {/* Responsable del Proyecto (solo para CON proyecto) */}
                  <div className="form-group full-width">
                    <label>Responsable del Proyecto *</label>
                    <select
                      name="responsable"
                      value={formData.responsable}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione una persona</option>
                      {personas.map(persona => (
                        <option key={persona.id} value={persona.id}>
                          {persona.nombre_completo || persona.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* ✅ FORMULARIO PARA MÓVIL SIN PROYECTO */}
              {formData.movil_tipo === 'sin_proyecto' && (
                <>
                  <div className="info-box info">
                    <div className="info-icon">ℹ️</div>
                    <div className="info-content">
                      <strong>Nuevo Personal sin Proyecto</strong>
                      <p>Complete los datos de la persona que será asignada al móvil.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      name="nom_ape"
                      value={formData.nom_ape}
                      onChange={handleInputChange}
                      placeholder="Ej: Juan Pérez García"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>DNI *</label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      placeholder="12345678"
                      maxLength="8"
                      pattern="[0-9]{8}"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Ciudad *</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      placeholder="Ej: Lima"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      placeholder="Observaciones adicionales..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Firma (Imagen)</label>
                    <button
                      type="button"
                      className="btn-insertar-firma"
                      onClick={abrirModalFirma}
                    >
                      ✍️ {formData.firma ? 'Cambiar Firma' : 'Insertar Firma Digital'}
                    </button>
                    {formData.firma && (
                      <div className="firma-preview-proyecto" style={{
                        marginTop: '15px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        padding: '20px 30px',
                        background: 'linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%)',
                        border: '2px solid #27ae60',
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.15)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flex: '1 1 auto',
                          minWidth: '200px'
                        }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
                            flexShrink: 0
                          }}>
                            ✓
                          </div>
                          <div>
                            <p style={{
                              margin: 0,
                              color: '#27ae60',
                              fontWeight: 700,
                              fontSize: '15px',
                              lineHeight: 1.4
                            }}>
                              Firma Digital Guardada
                            </p>
                            <p style={{
                              margin: '4px 0 0 0',
                              color: '#666',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              Lista para usar en el proyecto
                            </p>
                          </div>
                        </div>
                        <div style={{
                          flex: '0 0 auto',
                          padding: '15px 20px',
                          background: 'white',
                          borderRadius: '10px',
                          border: '2px solid #27ae60',
                          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)'
                        }}>
                          <img 
                            src={formData.firma} 
                            alt="Vista previa de firma"
                            style={{
                              maxWidth: '300px',
                              width: 'auto',
                              maxHeight: '90px',
                              height: 'auto',
                              display: 'block',
                              objectFit: 'contain',
                              cursor: 'default',
                              transition: 'none',
                              transform: 'none',
                              pointerEvents: 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={pasoAnterior}>
                ← Anterior
              </button>
              <button type="button" className="btn-primary" onClick={siguientePaso}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: Resumen y Confirmación */}
        {paso === 4 && (
          <div className="form-step">
            <h3>Paso 4: Resumen y Confirmación</h3>
            <p className="step-description">Revise los datos antes de guardar</p>

            <div className="resumen-container">
              <div className="resumen-section">
                <h4>📍 Ubicación</h4>
                <div className="resumen-item">
                  <span className="resumen-label">Empresa:</span>
                  <span className="resumen-value">
                    {empresas.find(e => e.id_empresa === parseInt(formData.razon_social_id))?.razon_social || '-'}
                  </span>
                </div>
                <div className="resumen-item">
                  <span className="resumen-label">Bodega:</span>
                  <span className="resumen-value">
                    {bodegas.find(b => b.id_bodega === parseInt(formData.bodega_id))?.nombre || '-'}
                  </span>
                </div>
                <div className="resumen-item">
                  <span className="resumen-label">Ubicación:</span>
                  <span className="resumen-value">{formData.ubicacion || '-'}</span>
                </div>
              </div>

              <div className="resumen-section">
                <h4>📋 Tipo de Reserva</h4>
                <div className="resumen-item">
                  <span className="resumen-label">Área de Ejecución:</span>
                  <span className="resumen-value">{formData.area_ejecucion || '-'}</span>
                </div>
              </div>

              <div className="resumen-section">
                <h4>🎯 Información del Móvil</h4>
                <div className="resumen-item">
                  <span className="resumen-label">Tipo:</span>
                  <span className="resumen-value">
                    {formData.movil_tipo === 'sin_proyecto' 
                      ? 'Móvil sin Proyecto (Persona)' 
                      : formData.movil_tipo === 'con_proyecto'
                      ? 'Móvil con Proyecto (Con Subproyectos)'
                      : '-'}
                  </span>
                </div>

                {/* ✅ Mostrar datos del PROYECTO */}
                {formData.movil_tipo === 'con_proyecto' && (
                  <>
                    <div className="resumen-item">
                      <span className="resumen-label">Nombre del Proyecto:</span>
                      <span className="resumen-value">{formData.movil_nombre || '-'}</span>
                    </div>
                    <div className="resumen-item">
                      <span className="resumen-label">Responsable:</span>
                      <span className="resumen-value">
                        {formData.responsable 
                          ? (() => {
                              const persona = personas.find(p => p.id === parseInt(formData.responsable));
                              return persona ? (persona.nombre_completo || persona.nombre) : '-';
                            })()
                          : '-'
                        }
                      </span>
                    </div>
                  </>
                )}

                {/* ✅ Mostrar datos PERSONALES para móvil sin proyecto */}
                {formData.movil_tipo === 'sin_proyecto' && (
                  <>
                    <div className="resumen-item">
                      <span className="resumen-label">Nombre Completo:</span>
                      <span className="resumen-value">{formData.nom_ape || '-'}</span>
                    </div>
                    <div className="resumen-item">
                      <span className="resumen-label">DNI:</span>
                      <span className="resumen-value">{formData.dni || '-'}</span>
                    </div>
                    <div className="resumen-item">
                      <span className="resumen-label">Ciudad:</span>
                      <span className="resumen-value">{formData.ciudad || '-'}</span>
                    </div>
                    {formData.observaciones && (
                      <div className="resumen-item">
                        <span className="resumen-label">Observaciones:</span>
                        <span className="resumen-value">{formData.observaciones}</span>
                      </div>
                    )}
                    {formData.firma && (
                      <div className="resumen-item">
                        <span className="resumen-label">Firma:</span>
                        <div className="firma-preview-resumen">
                          <img src={formData.firma} alt="Firma" style={{maxWidth: '150px', border: '1px solid #ddd', padding: '5px'}} />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="form-group full-width">
                <label>Descripción Adicional (Opcional)</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Agregue información adicional sobre el proyecto..."
                />
              </div>

              <div className="form-group full-width">
                <label>Fecha de Registro</label>
                <input
                  type="date"
                  name="fecha_registro"
                  value={formData.fecha_registro}
                  readOnly
                  className="input-readonly"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={pasoAnterior}>
                ← Anterior
              </button>
              <button type="submit" className="btn-success">
                ✓ Registrar Proyecto
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Lista de proyectos existentes */}
      <div className="proyectos-existentes">
        {vistaProyectos === 'menu' && (
          <>
            <h3>Proyectos Registrados</h3>
            <div className="menu-proyectos-grid">
              <div className="menu-proyectos-card" onClick={() => setVistaProyectos('con_proyecto')}>
                <div className="menu-proyectos-icon">📊</div>
                <h4>Móviles con Proyectos</h4>
                <p>Ver todos los proyectos que se han creado y sus subproyectos</p>
                <div className="menu-proyectos-badge">
                  {proyectos.filter(p => p.tipo_movil === 'CON_PROYECTO' && p.estado === 'ACTIVO').length} proyectos
                </div>
              </div>

              <div className="menu-proyectos-card" onClick={() => setVistaProyectos('sin_proyecto')}>
                <div className="menu-proyectos-icon">👤</div>
                <h4>Móviles sin Proyectos</h4>
                <p>Ver todos los proyectos de personas sin proyecto</p>
                <div className="menu-proyectos-badge">
                  {proyectos.filter(p => p.tipo_movil === 'SIN_PROYECTO' && p.estado === 'ACTIVO').length} personas
                </div>
              </div>
            </div>
          </>
        )}

        {vistaProyectos === 'con_proyecto' && (
          <>
            <div className="proyectos-header-section">
              <div>
                <button className="btn-volver-small" onClick={() => setVistaProyectos('menu')}>
                  ← Volver
                </button>
                <h3 style={{marginTop: '10px'}}>Móviles con Proyectos</h3>
              </div>
              <p className="proyectos-count">
                {proyectos.filter(p => p.tipo_movil === 'CON_PROYECTO' && p.estado === 'ACTIVO').length} proyecto(s)
              </p>
            </div>
            <div className="proyectos-grid">
              {proyectos.filter(p => p.tipo_movil === 'CON_PROYECTO' && p.estado === 'ACTIVO').length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <p>No hay proyectos con subproyectos registrados</p>
                </div>
              ) : (
                proyectos
                  .filter(p => p.tipo_movil === 'CON_PROYECTO' && p.estado === 'ACTIVO')
                  .map(proyecto => (
                    <div key={proyecto.id_proyecto_almacen} className="proyecto-card">
                      <div className="proyecto-icon">📊</div>
                      <h4>{proyecto.nombre_proyecto || proyecto.codigo_proyecto}</h4>
                      <p className="proyecto-codigo">Código: {proyecto.codigo_proyecto}</p>
                      <p className="proyecto-tipo">Proyecto con Subproyectos</p>
                      
                      <button 
                        className="btn-secondary"
                        onClick={() => verSubproyectos(proyecto)}
                        disabled={loading}
                      >
                        Ver Subproyectos ({proyecto.cantidad_subproyectos || 0})
                      </button>

                      {/* Botones de acción */}
                      <div className="proyecto-actions">
                        <button 
                          className="btn-action btn-info-action" 
                          title="Ver Detalles"
                          onClick={() => {
                            mostrarNotificacion(
                              'info',
                              'Detalles del Proyecto',
                              `Información completa de: ${proyecto.nombre_proyecto || proyecto.codigo_proyecto}`,
                              [
                                { label: '📋 Código', valor: proyecto.codigo_proyecto || 'N/A' },
                                { label: '📊 Nombre', valor: proyecto.nombre_proyecto || 'N/A' },
                                { label: '🏢 Empresa', valor: proyecto.empresa_nombre || 'N/A' },
                                { label: '🏪 Bodega', valor: proyecto.bodega_nombre || 'N/A' },
                                { label: '📍 Ubicación', valor: proyecto.bodega_ubicacion || 'N/A' },
                                { label: '📦 Tipo Reserva', valor: proyecto.reserva_tipo || 'N/A' },
                                { label: '📁 Subproyectos', valor: `${proyecto.cantidad_subproyectos || 0} activos` },
                                { label: '📅 Fecha Registro', valor: proyecto.fecha_registro ? new Date(proyecto.fecha_registro).toLocaleDateString('es-PE') : 'N/A' },
                                { label: '✅ Estado', valor: proyecto.estado || 'N/A' }
                              ]
                            );
                          }}
                        >
                          📄 Ver Detalles
                        </button>
                        
                        <button 
                          className="btn-action btn-warning-action"
                          title="Editar Proyecto"
                          onClick={() => iniciarEdicionProyecto(proyecto)}
                        >
                          ✏️ Editar
                        </button>
                        
                        <button 
                          className="btn-action btn-danger-action"
                          title="Eliminar Proyecto"
                          onClick={() => eliminarProyectoHandler(proyecto)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {vistaProyectos === 'sin_proyecto' && (
          <>
            <div className="proyectos-header-section">
              <div>
                <button className="btn-volver-small" onClick={() => setVistaProyectos('menu')}>
                  ← Volver
                </button>
                <h3 style={{marginTop: '10px'}}>Móviles sin Proyectos</h3>
              </div>
              <p className="proyectos-count">
                {proyectos.filter(p => p.tipo_movil === 'SIN_PROYECTO' && p.estado === 'ACTIVO').length} persona(s)
              </p>
            </div>
            <div className="proyectos-grid">
              {proyectos.filter(p => p.tipo_movil === 'SIN_PROYECTO' && p.estado === 'ACTIVO').length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👤</div>
                  <p>No hay personas sin proyecto registradas</p>
                </div>
              ) : (
                proyectos
                  .filter(p => p.tipo_movil === 'SIN_PROYECTO' && p.estado === 'ACTIVO')
                  .map(proyecto => (
                    <div key={proyecto.id_proyecto_almacen} className="proyecto-card persona-card">
                      <div className="proyecto-icon">👤</div>
                      <h4>{proyecto.nombre_proyecto || proyecto.codigo_proyecto}</h4>
                      <p className="proyecto-codigo">Código: {proyecto.codigo_proyecto}</p>
                      <p className="proyecto-tipo">Persona</p>
                      {proyecto.empresa_nombre && (
                        <div className="persona-info">
                          <p className="info-item">🏢 {proyecto.empresa_nombre}</p>
                        </div>
                      )}
                      
                      {/* Botones de acción */}
                      <div className="proyecto-actions">
                        <button 
                          className="btn-action btn-info-action" 
                          title="Ver Detalles"
                          onClick={() => {
                            mostrarNotificacion(
                              'info',
                              'Detalles del Móvil sin Proyecto',
                              `Información completa de: ${proyecto.nombre_proyecto || proyecto.codigo_proyecto}`,
                              [
                                { label: '📋 Código', valor: proyecto.codigo_proyecto || 'N/A' },
                                { label: '👤 Nombre', valor: proyecto.nombre_proyecto || 'N/A' },
                                { label: '🏢 Empresa', valor: proyecto.empresa_nombre || 'N/A' },
                                { label: '🏪 Bodega', valor: proyecto.bodega_nombre || 'N/A' },
                                { label: '📍 Ubicación', valor: proyecto.bodega_ubicacion || 'N/A' },
                                { label: '📦 Tipo Reserva', valor: proyecto.reserva_tipo || 'N/A' },
                                { label: '📅 Fecha Registro', valor: proyecto.fecha_registro ? new Date(proyecto.fecha_registro).toLocaleDateString('es-PE') : 'N/A' },
                                { label: '✅ Estado', valor: proyecto.estado || 'N/A' }
                              ]
                            );
                          }}
                        >
                          📄 Ver Detalles
                        </button>
                        
                        <button 
                          className="btn-action btn-warning-action"
                          title="Editar Móvil"
                          onClick={() => iniciarEdicionPersona(proyecto)}
                        >
                          ✏️ Editar
                        </button>
                        
                        <button 
                          className="btn-action btn-danger-action"
                          title="Eliminar Móvil"
                          onClick={() => eliminarPersonaHandler(proyecto)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {/* Modal para editar móvil sin proyecto (persona) */}
        {editandoPersona && (
          <div className="subproyecto-form-container modal-overlay">
            <div className="modal-content">
              <form onSubmit={handleSubmitEditarPersona} className="subproyecto-form">
                <h3>Editar Móvil sin Proyecto</h3>
                <p className="form-description">
                  Código: {personaEditando?.codigo_proyecto || 'N/A'}
                </p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      name="nom_ape"
                      value={formEditarPersona.nom_ape}
                      onChange={handleEditarPersonaChange}
                      placeholder="Ej: Juan Pérez García"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>DNI *</label>
                    <input
                      type="text"
                      name="dni"
                      value={formEditarPersona.dni}
                      onChange={handleEditarPersonaChange}
                      placeholder="12345678"
                      maxLength="8"
                      pattern="[0-9]{8}"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Ciudad *</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formEditarPersona.ciudad}
                      onChange={handleEditarPersonaChange}
                      placeholder="Ej: Lima"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Registro</label>
                    <input
                      type="date"
                      name="fecha_registro"
                      value={formEditarPersona.fecha_registro}
                      onChange={handleEditarPersonaChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ 
                        padding: '8px 16px', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        backgroundColor: formEditarPersona.estado === 'ACTIVO' ? '#28a745' : '#dc3545',
                        color: 'white'
                      }}>
                        {formEditarPersona.estado === 'ACTIVO' ? '✓ ACTIVO' : '✗ INACTIVO'}
                      </span>
                      <button 
                        type="button"
                        className={formEditarPersona.estado === 'ACTIVO' ? 'btn-danger' : 'btn-success'}
                        onClick={() => {
                          setFormEditarPersona(prev => ({
                            ...prev,
                            estado: prev.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
                          }));
                        }}
                        style={{ padding: '8px 16px' }}
                      >
                        {formEditarPersona.estado === 'ACTIVO' ? '⏸ Desactivar' : '▶ Activar'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                      name="observaciones"
                      value={formEditarPersona.observaciones}
                      onChange={handleEditarPersonaChange}
                      placeholder="Observaciones adicionales..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Firma (Imagen)</label>
                    <button
                      type="button"
                      className="btn-insertar-firma"
                      onClick={abrirModalFirmaEdicion}
                    >
                      ✍️ {formEditarPersona.firma ? 'Cambiar Firma' : 'Insertar Firma Digital'}
                    </button>
                    {formEditarPersona.firma && (
                      <div className="firma-preview">
                        <p>
                          <span style={{fontSize: '18px'}}>✓</span> Firma guardada correctamente
                        </p>
                        <img src={formEditarPersona.firma} alt="Vista previa de firma" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={cancelarEdicionPersona}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-success" disabled={loading}>
                    {loading ? 'Guardando...' : '✓ Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para editar proyecto con subproyectos */}
        {editandoProyecto && (
          <div className="subproyecto-form-container modal-overlay">
            <div className="modal-content">
              <form onSubmit={handleSubmitEditarProyecto} className="subproyecto-form">
                <h3>Editar Proyecto</h3>
                <p className="form-description">
                  Código: {proyectoEditando?.codigo_proyecto || 'N/A'}
                </p>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nombre del Proyecto *</label>
                    <input
                      type="text"
                      name="nombre_proyecto"
                      value={formEditarProyecto.nombre_proyecto}
                      onChange={handleEditarProyectoChange}
                      placeholder="Ej: Proyecto Principal"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Responsable del Proyecto *</label>
                    <select
                      name="responsable"
                      value={formEditarProyecto.responsable}
                      onChange={handleEditarProyectoChange}
                      required
                    >
                      <option value="">Seleccione una persona</option>
                      {personas.map(persona => (
                        <option key={persona.id} value={persona.id}>
                          {persona.nombre_completo || persona.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción (Opcional)</label>
                    <textarea
                      name="descripcion"
                      value={formEditarProyecto.descripcion}
                      onChange={handleEditarProyectoChange}
                      rows="3"
                      placeholder="Descripción del proyecto..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Registro</label>
                    <input
                      type="date"
                      name="fecha_registro"
                      value={formEditarProyecto.fecha_registro}
                      onChange={handleEditarProyectoChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={cancelarEdicionProyecto}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-success" disabled={loading}>
                    {loading ? 'Guardando...' : '✓ Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

      {/* ✅ MODAL DE FIRMA DIGITAL */}
      {modalFirmaAbierto && (
        <div className="firma-modal-overlay" onClick={(e) => {
          if (e.target.className === 'firma-modal-overlay') {
            cerrarModalFirma();
          }
        }}>
          <div className="firma-modal-content">
            <div className="firma-modal-header">
              <span className="firma-modal-icon">✍️</span>
              <h3>Firma Digital - Protección de Datos</h3>
            </div>

            {/* PASO 1: Términos y Condiciones */}
            {pasoFirma === 1 && (
              <div className="terminos-container">
                <div className="terminos-content">
                  <h4>POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES</h4>
                  
                  <p>
                    <strong>Processmart S.A.C.</strong>, está dando cumplimiento estricto a lo establecido en la Ley 1581 de 2012 
                    y en el Decreto 1377 de 2013. En consecuencia, Processmart S.A.C. proporciona esta política respecto a la 
                    recolección, manejo, uso, tratamiento, almacenamiento e intercambio de todas aquellas actividades que 
                    constituyan tratamiento de datos personales.
                  </p>

                  <p>
                    Processmart S.A.C., identificado con Nit: 830.113.252-6, con sede principal en la Avenida Carrera 45 
                    (Autopista Norte) N° 114-44 Oficina 605 en la ciudad de Bogotá, portal web https://processmart.net/. 
                    Correo electrónico comercial@processmart.net, teléfono (+51) 923 926 675; como responsable del tratamiento 
                    de sus datos personales, para el desarrollo de sus actividades propias (SICTE), así como para el 
                    fortalecimiento de sus relaciones con terceros.
                  </p>

                  <h4>Definiciones</h4>
                  <ul>
                    <li><strong>Autorización:</strong> Consentimiento previo, expreso e informado del Titular para llevar a cabo el Tratamiento de datos personales.</li>
                    <li><strong>Aviso de privacidad:</strong> Comunicación verbal o escrita generada por el Responsable, dirigida al Titular para el Tratamiento de sus Datos Personales.</li>
                    <li><strong>Base de datos:</strong> Conjunto organizado de datos personales que sea objeto de Tratamiento.</li>
                    <li><strong>Dato personal:</strong> Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
                    <li><strong>Dato sensible:</strong> Aquel dato que afecta la intimidad del titular o cuyo uso indebido puede generar su discriminación.</li>
                    <li><strong>Titular:</strong> Persona natural cuyos datos personales sean objeto de Tratamiento.</li>
                    <li><strong>Tratamiento:</strong> Cualquier operación o conjunto de operaciones sobre datos personales, tales como la recolección, almacenamiento, uso, circulación o supresión.</li>
                  </ul>

                  <h4>Principios</h4>
                  <ul>
                    <li><strong>Principio de legalidad:</strong> La captura, recolección y tratamiento de datos personales, se realizará bajo las disposiciones vigentes y aplicables.</li>
                    <li><strong>Principio de libertad:</strong> La captura, recolección y tratamiento de datos personales sólo puede llevarse a cabo con el consentimiento, previo, expreso e informado del Titular.</li>
                    <li><strong>Principio de finalidad:</strong> El tratamiento de datos personales estará subordinado y atenderá una finalidad legítima.</li>
                    <li><strong>Principio de veracidad o calidad:</strong> La información debe ser veraz, completa, exacta, actualizada, comprobable y comprensible.</li>
                    <li><strong>Principio de transparencia:</strong> Garantiza el derecho del Titular a obtener información acerca de la existencia de cualquier tipo de información o dato personal.</li>
                    <li><strong>Principio de seguridad:</strong> Los datos personales serán objeto de protección mediante medidas tecnológicas y administrativas.</li>
                    <li><strong>Principio de confidencialidad:</strong> Todas las personas que manejen datos se comprometen a mantenerlos de manera estrictamente confidencial.</li>
                  </ul>

                  <h4>Finalidad para el tratamiento</h4>
                  <ul>
                    <li>Envío de información y contacto eventual.</li>
                    <li>Fortalecimiento de relaciones con proveedores, clientes, contratistas y partes interesadas.</li>
                    <li>Registrar sus datos personales en los sistemas de información de Processmart S.A.C.</li>
                    <li>Administración de la relación contractual, legal o comercial.</li>
                    <li>Dar respuesta a consultas, peticiones, quejas y reclamos.</li>
                    <li>Cumplimiento de mandatos judiciales o legales.</li>
                  </ul>

                  <h4>Derechos del titular</h4>
                  <ul>
                    <li>Conocer, actualizar y rectificar los datos personales.</li>
                    <li>Solicitar prueba de la autorización otorgada.</li>
                    <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
                    <li>Solicitar la supresión de los datos cuando no se respeten los principios.</li>
                    <li>Acceder de forma gratuita a sus Datos Personales objeto de Tratamiento.</li>
                  </ul>

                  <h4>Seguridad de datos personales</h4>
                  <p>
                    Processmart S.A.C., proporcionará las medidas técnicas, humanas y administrativas necesarias para otorgar 
                    seguridad a los registros evitando su adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento.
                  </p>

                  <p style={{marginTop: '20px', fontWeight: 'bold', fontSize: '14px'}}>
                    Al continuar y firmar digitalmente, usted acepta expresamente esta política de protección de datos personales.
                  </p>
                </div>

                <div className="terminos-actions">
                  <button type="button" className="btn-no-acepto" onClick={rechazarTerminos}>
                    ⭕ No Acepto
                  </button>
                  <button type="button" className="btn-acepto" onClick={aceptarTerminos}>
                    ✅ Acepto
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: Canvas de Firma Digital */}
            {pasoFirma === 2 && (
              <div className="firma-canvas-container">
                <div className="canvas-wrapper">
                  <canvas
                    ref={setCanvasRef}
                    className="firma-canvas"
                    onMouseDown={iniciarDibujo}
                    onMouseMove={dibujar}
                    onMouseUp={finalizarDibujo}
                    onMouseLeave={finalizarDibujo}
                  />
                  <p className="canvas-info">
                    ✍️ Dibuje su firma con el mouse en el área de arriba
                  </p>
                </div>

                <div className="canvas-actions">
                  <button type="button" className="btn-borrar-firma" onClick={borrarFirma}>
                    🗑️ Borrar
                  </button>
                  <button type="button" className="btn-guardar-firma" onClick={guardarFirma}>
                    💾 Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
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
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
        />
      )}
    </div>
  );
};

export default RegistroProyecto;