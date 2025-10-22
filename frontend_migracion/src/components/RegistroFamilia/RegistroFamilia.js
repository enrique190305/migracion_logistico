import React, { useState } from 'react';
import './RegistroFamilia.css';

const RegistroFamilia = () => {
  const [familias, setFamilias] = useState([
    {
      id: 1,
      tipoFamilia: 'HERRAMIENTAS',
      equivalencia: 'HERR',
      fechaCreacion: '21/10/2025'
    },
    {
      id: 2,
      tipoFamilia: 'MATERIALES',
      equivalencia: 'MATE',
      fechaCreacion: '21/10/2025'
    },
    {
      id: 3,
      tipoFamilia: 'EQUIPOS',
      equivalencia: 'EQUI',
      fechaCreacion: '21/10/2025'
    },
    {
      id: 4,
      tipoFamilia: 'SUMINISTROS',
      equivalencia: 'SUMI',
      fechaCreacion: '21/10/2025'
    },
    {
      id: 5,
      tipoFamilia: 'ACTIVOS FIJOS',
      equivalencia: 'ACFI',
      fechaCreacion: '21/10/2025'
    }
  ]);

  const [familiaSeleccionada, setFamiliaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formulario, setFormulario] = useState({
    tipoFamilia: '',
    equivalencia: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleFamiliaClick = (familia) => {
    setFamiliaSeleccionada(familia);
    setFormulario({
      tipoFamilia: familia.tipoFamilia,
      equivalencia: familia.equivalencia
    });
  };

  const handleNuevaFamilia = () => {
    setModalAbierto(true);
    setFamiliaSeleccionada(null);
    setFormulario({
      tipoFamilia: '',
      equivalencia: ''
    });
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setFormulario({
      tipoFamilia: '',
      equivalencia: ''
    });
  };

  const handleGuardar = () => {
    if (!formulario.tipoFamilia || !formulario.equivalencia) {
      alert('⚠️ Por favor complete todos los campos obligatorios');
      return;
    }

    const nuevaFamilia = {
      id: familias.length + 1,
      tipoFamilia: formulario.tipoFamilia.toUpperCase(),
      equivalencia: formulario.equivalencia.toUpperCase(),
      fechaCreacion: new Date().toLocaleDateString('es-ES')
    };

    setFamilias([...familias, nuevaFamilia]);
    alert(`✅ Familia creada correctamente\n\nTipo: ${nuevaFamilia.tipoFamilia}\nEquivalencia: ${nuevaFamilia.equivalencia}`);
    handleCerrarModal();
  };

  const handleEliminar = (id) => {
    const familia = familias.find(f => f.id === id);
    if (window.confirm(`¿Está seguro de eliminar la familia "${familia.tipoFamilia}"?\n\nEsta acción no se puede deshacer.`)) {
      setFamilias(familias.filter(fam => fam.id !== id));
      alert(`🗑️ Familia eliminada: ${familia.tipoFamilia}`);
      if (familiaSeleccionada?.id === id) {
        setFamiliaSeleccionada(null);
      }
    }
  };

  const handleEditar = (familia) => {
    setFamiliaSeleccionada(familia);
    setFormulario({
      tipoFamilia: familia.tipoFamilia,
      equivalencia: familia.equivalencia
    });
    setModalAbierto(true);
  };

  const handleActualizar = () => {
    if (!formulario.tipoFamilia || !formulario.equivalencia) {
      alert('⚠️ Por favor complete todos los campos obligatorios');
      return;
    }

    setFamilias(familias.map(fam => 
      fam.id === familiaSeleccionada.id 
        ? { ...fam, tipoFamilia: formulario.tipoFamilia.toUpperCase(), equivalencia: formulario.equivalencia.toUpperCase() }
        : fam
    ));

    alert(`✅ Familia actualizada correctamente\n\nTipo: ${formulario.tipoFamilia}\nEquivalencia: ${formulario.equivalencia}`);
    handleCerrarModal();
  };

  const filteredFamilias = familias.filter(fam =>
    fam.tipoFamilia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fam.equivalencia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Colores para las categorías
  const getCategoriaColor = (tipo) => {
    const colores = {
      'HERRAMIENTAS': '#f39c12',
      'MATERIALES': '#3498db',
      'EQUIPOS': '#2ecc71',
      'SUMINISTROS': '#e74c3c',
      'ACTIVOS FIJOS': '#9b59b6'
    };
    return colores[tipo] || '#95a5a6';
  };

  return (
    <div className="registro-familia-container-new">
      {/* Header */}
      <div className="registro-familia-header-new">
        <div className="header-left-familia">
          <span className="header-icon-familia-new">📁</span>
          <div>
            <h1>REGISTRO DE FAMILIA</h1>
            <p>Gestione las familias de productos del sistema</p>
          </div>
        </div>
        <button className="btn-nueva-familia-new" onClick={handleNuevaFamilia}>
          <span>➕</span> NUEVA FAMILIA
        </button>
      </div>

      {/* Buscador */}
      <div className="search-familia-new">
        <input
          type="text"
          placeholder="🔍 Buscar por tipo de familia o equivalencia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Familias */}
      <div className="tabla-familia-container-new">
        <table className="tabla-familia-new">
          <thead>
            <tr>
              <th>ID</th>
              <th>TIPO DE FAMILIA</th>
              <th>EQUIVALENCIA</th>
              <th>FECHA CREACIÓN</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredFamilias.length > 0 ? (
              filteredFamilias.map((familia) => (
                <tr key={familia.id}>
                  <td>{familia.id}</td>
                  <td>
                    <span 
                      className="badge-familia-new"
                      style={{ backgroundColor: getCategoriaColor(familia.tipoFamilia) }}
                    >
                      {familia.tipoFamilia}
                    </span>
                  </td>
                  <td><strong>{familia.equivalencia}</strong></td>
                  <td>{familia.fechaCreacion}</td>
                  <td>
                    <div className="acciones-familia-new">
                      <button 
                        className="btn-accion-familia ver-familia"
                        onClick={() => handleFamiliaClick(familia)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-accion-familia editar-familia"
                        onClick={() => handleEditar(familia)}
                        title="Editar familia"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-accion-familia eliminar-familia"
                        onClick={() => handleEliminar(familia.id)}
                        title="Eliminar familia"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-message-familia-new">
                  <div className="empty-state-familia-new">
                    <span className="empty-icon-familia-new">📁</span>
                    <p>No se encontraron familias</p>
                    <small>Prueba con otros criterios de búsqueda</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="paginacion-familia-new">
        <button className="btn-paginacion-familia" disabled>
          ← ANTERIOR
        </button>
        <span className="pagina-actual-familia">Página 1 de 1</span>
        <button className="btn-paginacion-familia" disabled>
          SIGUIENTE →
        </button>
      </div>

      {/* MODAL PARA NUEVA/EDITAR FAMILIA */}
      {modalAbierto && (
        <div className="modal-overlay-familia" onClick={handleCerrarModal}>
          <div className="modal-content-familia" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-familia">
              <h2>{familiaSeleccionada ? '✏️ EDITAR FAMILIA' : '➕ NUEVA FAMILIA DE PRODUCTOS'}</h2>
              <button className="btn-cerrar-modal-familia" onClick={handleCerrarModal}>
                ✖
              </button>
            </div>

            <div className="modal-body-familia">
              <div className="form-group-modal-familia">
                <label>📂 TIPO DE FAMILIA *</label>
                <input
                  type="text"
                  name="tipoFamilia"
                  value={formulario.tipoFamilia}
                  onChange={handleInputChange}
                  placeholder="Ej: HERRAMIENTAS, MATERIALES, EQUIPOS"
                  autoFocus
                />
                <span className="hint-text-familia">💡 Nombre completo de la categoría principal</span>
              </div>

              <div className="form-group-modal-familia">
                <label>📝 EQUIVALENCIA (CÓDIGO) *</label>
                <input
                  type="text"
                  name="equivalencia"
                  value={formulario.equivalencia}
                  onChange={handleInputChange}
                  placeholder="Ej: HERR, MATE, EQUI"
                  maxLength="6"
                />
                <span className="hint-text-familia">💡 Código abreviado de 3-4 caracteres en mayúsculas</span>
              </div>

              <div className="info-box-familia">
                <span className="info-icon-familia">ℹ️</span>
                <div>
                  <strong>Información Importante:</strong>
                  <p>Este código se utilizará para clasificar y organizar todos los productos del sistema. Asegúrese de que sea único y representativo.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer-familia">
              <button className="btn-cancelar-modal-familia" onClick={handleCerrarModal}>
                <span>❌</span> CANCELAR
              </button>
              <button 
                className="btn-guardar-modal-familia" 
                onClick={familiaSeleccionada ? handleActualizar : handleGuardar}
              >
                <span>💾</span> {familiaSeleccionada ? 'ACTUALIZAR' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroFamilia;