
import React, { useState, useEffect } from 'react';
import './RegistroProyecto.css';

const RegistroProyecto = () => {
  // Estados principales
  const [paso, setPaso] = useState(1); // Control de pasos del wizard
  const [empresas, setEmpresas] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [subproyectos, setSubproyectos] = useState([]);
  const [personas, setPersonas] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Bodega y Almacén
    razon_social_id: '',
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
    fecha_registro: new Date().toISOString().split('T')[0], // Fecha actual
    responsable: '',
    estado: 'activo'
  });

  // Estado para vista de subproyectos
  const [mostrarSubproyectos, setMostrarSubproyectos] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpresas();
    cargarBodegas();
    cargarProyectos();
    cargarPersonas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      // En producción, esto sería una llamada al backend
      // const response = await fetch('API_URL/empresas');
      // const data = await response.json();
      
      // Simulación temporal
      setEmpresas([
        { id: 1, razon_social: 'EMPRESA ABC S.A.C.', ruc: '20123456789' },
        { id: 2, razon_social: 'CONSTRUCTORA XYZ S.R.L.', ruc: '20987654321' },
        { id: 3, razon_social: 'SERVICIOS GENERALES SAC', ruc: '20456789123' }
      ]);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    }
  };

  const cargarBodegas = async () => {
    // Simulación de carga de bodegas con empresa
    // En producción, esto sería una llamada al backend
    setBodegas([
      { id: 1, nombre: 'Bodega Lima Centro', ubicacion: 'Lima', departamento: 'Lima', id_empresa: 1 },
      { id: 2, nombre: 'Bodega Lima Sur', ubicacion: 'Lima', departamento: 'Lima', id_empresa: 1 },
      { id: 3, nombre: 'Bodega Callao', ubicacion: 'Callao', departamento: 'Callao', id_empresa: 2 },
      { id: 4, nombre: 'Bodega Arequipa', ubicacion: 'Arequipa', departamento: 'Arequipa', id_empresa: 2 },
      { id: 5, nombre: 'Bodega Cusco', ubicacion: 'Cusco', departamento: 'Cusco', id_empresa: 3 }
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

  const cargarPersonas = async () => {
    try {
      // Mock data - Reemplazar con llamada API real cuando esté disponible
      const mockPersonas = [
        { id: 1, nombre: 'Juan Carlos', apellido: 'García Pérez', cargo: 'Jefe de Proyecto' },
        { id: 2, nombre: 'María Elena', apellido: 'Rodríguez López', cargo: 'Supervisor' },
        { id: 3, nombre: 'Pedro Antonio', apellido: 'Martínez Silva', cargo: 'Coordinador' },
        { id: 4, nombre: 'Ana Lucía', apellido: 'Fernández Torres', cargo: 'Jefe de Operaciones' },
        { id: 5, nombre: 'Carlos Alberto', apellido: 'Sánchez Vargas', cargo: 'Gerente' },
        { id: 6, nombre: 'Rosa María', apellido: 'Díaz Contreras', cargo: 'Asistente' },
        { id: 7, nombre: 'Luis Miguel', apellido: 'Ramírez Castro', cargo: 'Supervisor' },
        { id: 8, nombre: 'Carmen Julia', apellido: 'Torres Mendoza', cargo: 'Coordinadora' }
      ];
      setPersonas(mockPersonas);
      
      // Llamada API real (cuando esté disponible):
      /*
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/personas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPersonas(data);
      */
    } catch (error) {
      console.error('Error al cargar personas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se selecciona una bodega, autocompletar ubicación
    if (name === 'bodega_id') {
      const bodegaSeleccionada = bodegas.find(b => b.id === parseInt(value));
      if (bodegaSeleccionada) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          ubicacion: bodegaSeleccionada.ubicacion,
          razon_social_id: bodegaSeleccionada.id_empresa
        }));
        return;
      }
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
          alert('Por favor, seleccione una empresa, bodega y ubicación');
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
        if (!formData.movil_tipo) {
          alert('Por favor, seleccione el tipo de móvil');
          return false;
        }
        if (!formData.responsable) {
          alert('Por favor, ingrese el responsable del proyecto');
          return false;
        }
        if (formData.movil_tipo === 'con_proyecto' && !formData.movil_nombre) {
          alert('Por favor, ingrese el nombre del proyecto');
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
                    <option key={empresa.id} value={empresa.id}>
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
                  {bodegas
                    .filter(bodega => bodega.id_empresa === parseInt(formData.razon_social_id))
                    .map(bodega => (
                      <option key={bodega.id} value={bodega.id}>
                        {bodega.nombre} - {bodega.departamento}
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
                        {persona.nombre} {persona.apellido} - {persona.cargo}
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
                    {empresas.find(e => e.id === parseInt(formData.razon_social_id))?.razon_social || '-'}
                  </span>
                </div>
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
                          return persona ? `${persona.nombre} ${persona.apellido}` : '-';
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