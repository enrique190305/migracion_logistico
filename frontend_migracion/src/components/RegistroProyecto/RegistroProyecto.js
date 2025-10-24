
import React, { useState, useEffect } from 'react';
import './RegistroProyecto.css';
import * as proyectosAPI from '../../services/proyectosAPI';
import Notificacion from './Notificacion';

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
    estado: 'activo'
  });

  // Estado para vista de subproyectos
  const [mostrarSubproyectos, setMostrarSubproyectos] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  // Estados para las vistas de proyectos registrados
  const [vistaProyectos, setVistaProyectos] = useState('menu'); // 'menu', 'con_proyecto', 'sin_proyecto'

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
        if (formData.movil_tipo === 'con_proyecto' && !formData.movil_nombre) {
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
        responsable: parseInt(formData.responsable),
        fecha_registro: formData.fecha_registro
      };

      // Solo agregar campos opcionales si tienen valor
      if (formData.movil_tipo === 'con_proyecto' && formData.movil_nombre) {
        proyectoData.movil_nombre = formData.movil_nombre;
      }
      
      if (formData.descripcion) {
        proyectoData.descripcion = formData.descripcion;
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
      estado: 'activo'
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
    setFormData(prev => ({
      ...prev,
      proyecto_padre_id: proyectoSeleccionado.id_proyecto_almacen,
      movil_tipo: 'con_proyecto'
    }));
    setMostrarSubproyectos(false);
    setPaso(1);
  };

  // Renderizado condicional según la vista
  if (mostrarSubproyectos) {
    return (
      <div className="registro-proyecto-container">
        <div className="proyecto-header">
          <button className="btn-volver" onClick={() => {
            setMostrarSubproyectos(false);
            setVistaProyectos('con_proyecto');
          }}>
            ← Volver
          </button>
          <h2>Subproyectos de: {proyectoSeleccionado?.nombre_proyecto || proyectoSeleccionado?.codigo_proyecto}</h2>
        </div>

        <div className="subproyectos-container">
          <div className="subproyectos-header">
            <h3>Lista de Subproyectos</h3>
            <button className="btn-primary" onClick={crearSubproyecto}>
              + Crear Nuevo Subproyecto
            </button>
          </div>

          <div className="subproyectos-grid">
            {loading ? (
              <div className="empty-state">
                <p>Cargando subproyectos...</p>
              </div>
            ) : subproyectos.length === 0 ? (
              <div className="empty-state">
                <p>No hay subproyectos registrados</p>
                <button className="btn-primary" onClick={crearSubproyecto}>
                  Crear el Primer Subproyecto
                </button>
              </div>
            ) : (
              subproyectos.map(sub => (
                <div key={sub.id || sub.id_proyecto_almacen} className="subproyecto-card">
                  <div className="subproyecto-icon">📋</div>
                  <h4>{sub.nombre || sub.nombre_proyecto}</h4>
                  {sub.codigo_proyecto && (
                    <p className="subproyecto-codigo">Código: {sub.codigo_proyecto}</p>
                  )}
                  <div className="subproyecto-actions">
                    <button className="btn-secondary">Ver Detalles</button>
                    <button className="btn-secondary">Editar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
                </>
              )}

              {formData.movil_tipo && (
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
                {formData.movil_tipo === 'con_proyecto' && (
                  <div className="resumen-item">
                    <span className="resumen-label">Nombre del Proyecto:</span>
                    <span className="resumen-value">{formData.movil_nombre || '-'}</span>
                  </div>
                )}
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
                  {proyectos.filter(p => p.tipo_movil === 'CON_PROYECTO').length} proyectos
                </div>
              </div>

              <div className="menu-proyectos-card" onClick={() => setVistaProyectos('sin_proyecto')}>
                <div className="menu-proyectos-icon">👤</div>
                <h4>Móviles sin Proyectos</h4>
                <p>Ver todos los proyectos de personas sin proyecto</p>
                <div className="menu-proyectos-badge">
                  {proyectos.filter(p => p.tipo_movil === 'SIN_PROYECTO').length} personas
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
                {proyectos.filter(p => p.tipo_movil === 'CON_PROYECTO').length} proyecto(s)
              </p>
            </div>
            <div className="proyectos-grid">
              {proyectos.filter(p => p.tipo_movil === 'CON_PROYECTO').length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <p>No hay proyectos con subproyectos registrados</p>
                </div>
              ) : (
                proyectos
                  .filter(p => p.tipo_movil === 'CON_PROYECTO')
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
                {proyectos.filter(p => p.tipo_movil === 'SIN_PROYECTO').length} persona(s)
              </p>
            </div>
            <div className="proyectos-grid">
              {proyectos.filter(p => p.tipo_movil === 'SIN_PROYECTO').length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👤</div>
                  <p>No hay personas sin proyecto registradas</p>
                </div>
              ) : (
                proyectos
                  .filter(p => p.tipo_movil === 'SIN_PROYECTO')
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
                    </div>
                  ))
              )}
            </div>
          </>
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
    </div>
  );
};

export default RegistroProyecto;