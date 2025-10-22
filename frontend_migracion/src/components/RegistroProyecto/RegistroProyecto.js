
import React, { useState, useEffect } from 'react';
import './RegistroProyecto.css';

const RegistroProyecto = () => {
  // Estados principales
  const [paso, setPaso] = useState(1); // Control de pasos del wizard
  const [bodegas, setBodegas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [subproyectos, setSubproyectos] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Bodega y Almacén
    bodega_id: '',
    ubicacion: '',
    departamento: '',
    
    // Paso 2: Tipo de Reserva
    tipo_reserva: '',
    area_ejecucion: '',
    
    // Paso 3: Definir Móvil
    movil_tipo: '', // 'sin_proyecto' o 'con_proyecto'
    movil_nombre: '', // Nombre de persona o proyecto
    proyecto_padre_id: '', // Si es subproyecto
    
    // Datos adicionales
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    responsable: '',
    estado: 'activo'
  });

  // Estado para vista de subproyectos
  const [mostrarSubproyectos, setMostrarSubproyectos] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarBodegas();
    cargarProyectos();
  }, []);

  const cargarBodegas = async () => {
    // Simulación de carga de bodegas
    // En producción, esto sería una llamada al backend
    setBodegas([
      { id: 1, nombre: 'Bodega Lima Centro', departamento: 'Lima' },
      { id: 2, nombre: 'Bodega Callao', departamento: 'Callao' },
      { id: 3, nombre: 'Bodega Arequipa', departamento: 'Arequipa' },
      { id: 4, nombre: 'Bodega Cusco', departamento: 'Cusco' }
    ]);
  };

  const cargarProyectos = async () => {
    // Simulación de carga de proyectos existentes
    setProyectos([
      { 
        id: 1, 
        nombre: 'Proyecto Construcción A', 
        tipo: 'con_proyecto',
        subproyectos: [
          { id: 101, nombre: 'Subproyecto A1 - Cimentación' },
          { id: 102, nombre: 'Subproyecto A2 - Estructura' }
        ]
      },
      { 
        id: 2, 
        nombre: 'Juan Pérez - Mantenimiento', 
        tipo: 'sin_proyecto',
        subproyectos: []
      }
    ]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
        if (!formData.bodega_id || !formData.ubicacion) {
          alert('Por favor, seleccione una bodega y ubicación');
          return false;
        }
        return true;
      case 2:
        if (!formData.tipo_reserva || !formData.area_ejecucion) {
          alert('Por favor, seleccione el tipo de reserva y área de ejecución');
          return false;
        }
        return true;
      case 3:
        if (!formData.movil_tipo || !formData.movil_nombre) {
          alert('Por favor, complete la información del móvil');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Datos a enviar:', formData);
      
      // Aquí iría la llamada al backend
      // const response = await fetch('http://localhost/migracion_logistico/backend_migracion/controllers/RegistroProyecto.php', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData)
      // });
      
      alert('Proyecto registrado exitosamente (Simulación)');
      limpiarFormulario();
      setPaso(1);
      
    } catch (error) {
      console.error('Error al registrar proyecto:', error);
      alert('Error al registrar el proyecto');
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      bodega_id: '',
      ubicacion: '',
      departamento: '',
      tipo_reserva: '',
      area_ejecucion: '',
      movil_tipo: '',
      movil_nombre: '',
      proyecto_padre_id: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      responsable: '',
      estado: 'activo'
    });
  };

  const verSubproyectos = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setSubproyectos(proyecto.subproyectos || []);
    setMostrarSubproyectos(true);
  };

  const crearSubproyecto = () => {
    setFormData(prev => ({
      ...prev,
      proyecto_padre_id: proyectoSeleccionado.id,
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
          <button className="btn-volver" onClick={() => setMostrarSubproyectos(false)}>
            ← Volver
          </button>
          <h2>Subproyectos de: {proyectoSeleccionado?.nombre}</h2>
        </div>

        <div className="subproyectos-container">
          <div className="subproyectos-header">
            <h3>Lista de Subproyectos</h3>
            <button className="btn-primary" onClick={crearSubproyecto}>
              + Crear Nuevo Subproyecto
            </button>
          </div>

          <div className="subproyectos-grid">
            {subproyectos.length === 0 ? (
              <div className="empty-state">
                <p>No hay subproyectos registrados</p>
                <button className="btn-primary" onClick={crearSubproyecto}>
                  Crear el Primer Subproyecto
                </button>
              </div>
            ) : (
              subproyectos.map(sub => (
                <div key={sub.id} className="subproyecto-card">
                  <div className="subproyecto-icon">📋</div>
                  <h4>{sub.nombre}</h4>
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
              <div className="form-group">
                <label>Bodega / Almacén *</label>
                <select
                  name="bodega_id"
                  value={formData.bodega_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione una bodega</option>
                  {bodegas.map(bodega => (
                    <option key={bodega.id} value={bodega.id}>
                      {bodega.nombre} - {bodega.departamento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación *</label>
                <select
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione ubicación</option>
                  <option value="lima">Lima</option>
                  <option value="callao">Callao</option>
                  <option value="arequipa">Arequipa</option>
                  <option value="cusco">Cusco</option>
                  <option value="otro">Otro Departamento</option>
                </select>
              </div>

              {formData.ubicacion === 'otro' && (
                <div className="form-group full-width">
                  <label>Especifique el Departamento *</label>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre del departamento"
                    required
                  />
                </div>
              )}
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
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, tipo_reserva: e.target.value }));
                  }}
                  required
                >
                  <option value="">Seleccione el área</option>
                  <option value="externa">Externa</option>
                  <option value="interna">Interna</option>
                  <option value="comercial">Comercial</option>
                </select>
              </div>

              {formData.area_ejecucion && (
                <div className="info-box">
                  <div className="info-icon">ℹ️</div>
                  <div className="info-content">
                    <strong>Área seleccionada: {formData.area_ejecucion.toUpperCase()}</strong>
                    <p>
                      {formData.area_ejecucion === 'externa' && 'Proyectos ejecutados fuera de las instalaciones'}
                      {formData.area_ejecucion === 'interna' && 'Proyectos ejecutados dentro de las instalaciones'}
                      {formData.area_ejecucion === 'comercial' && 'Proyectos de carácter comercial'}
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

              {formData.movil_tipo === 'sin_proyecto' && (
                <div className="form-group full-width">
                  <label>Nombre de la Persona *</label>
                  <input
                    type="text"
                    name="movil_nombre"
                    value={formData.movil_nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
              )}

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

              <div className="form-group full-width">
                <label>Responsable del Proyecto</label>
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleInputChange}
                  placeholder="Nombre del responsable"
                />
              </div>
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
                  <span className="resumen-label">Bodega:</span>
                  <span className="resumen-value">
                    {bodegas.find(b => b.id === parseInt(formData.bodega_id))?.nombre || '-'}
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
                    {formData.movil_tipo === 'sin_proyecto' ? 'Persona' : 'Proyecto con Subproyectos'}
                  </span>
                </div>
                <div className="resumen-item">
                  <span className="resumen-label">Nombre:</span>
                  <span className="resumen-value">{formData.movil_nombre || '-'}</span>
                </div>
                <div className="resumen-item">
                  <span className="resumen-label">Responsable:</span>
                  <span className="resumen-value">{formData.responsable || '-'}</span>
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

              <div className="form-grid">
                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin (Estimada)</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                  />
                </div>
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
        <h3>Proyectos Registrados</h3>
        <div className="proyectos-grid">
          {proyectos.map(proyecto => (
            <div key={proyecto.id} className="proyecto-card">
              <div className="proyecto-icon">
                {proyecto.tipo === 'con_proyecto' ? '📊' : '👤'}
              </div>
              <h4>{proyecto.nombre}</h4>
              <p className="proyecto-tipo">
                {proyecto.tipo === 'con_proyecto' ? 'Proyecto con Subproyectos' : 'Persona'}
              </p>
              {proyecto.tipo === 'con_proyecto' && (
                <button 
                  className="btn-secondary"
                  onClick={() => verSubproyectos(proyecto)}
                >
                  Ver Subproyectos ({proyecto.subproyectos?.length || 0})
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegistroProyecto;