import React, { useState, useEffect } from 'react';
import './EditarProveedor.css';
import * as proveedorAPI from '../../services/proveedorAPI';

const EditarProveedor = () => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [panelMinimizado, setPanelMinimizado] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formulario, setFormulario] = useState({
    proveedor: '',
    ruc: '',
    direccion: '',
    contacto: '',
    telefono: '',
    email: '',
    formaPago: '',
    servicios: ''
  });

  // Cargar proveedores al montar el componente
  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await proveedorAPI.obtenerProveedores();
      
      if (response.success) {
        setProveedores(response.data);
      } else {
        alert('❌ Error al cargar proveedores');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleProveedorClick = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setFormulario({
      proveedor: proveedor.proveedor,
      ruc: proveedor.ruc,
      direccion: proveedor.direccion || '',
      contacto: proveedor.contacto || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      formaPago: proveedor.formaPago || '',
      servicios: proveedor.servicios || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleActualizar = async () => {
    if (!proveedorSeleccionado) {
      alert('⚠️ Por favor seleccione un proveedor de la lista');
      return;
    }

    if (!formulario.proveedor || !formulario.ruc) {
      alert('⚠️ Por favor complete los campos obligatorios (Proveedor y RUC)');
      return;
    }

    if (formulario.ruc.length !== 11 || !/^\d+$/.test(formulario.ruc)) {
      alert('⚠️ El RUC debe tener 11 dígitos numéricos');
      return;
    }

    if (formulario.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      alert('⚠️ Por favor ingrese un email válido');
      return;
    }

    try {
      setLoading(true);
      
      const response = await proveedorAPI.actualizarProveedor(proveedorSeleccionado.id, {
        nombre: formulario.proveedor,
        ruc: formulario.ruc,
        direccion: formulario.direccion,
        contacto: formulario.contacto,
        celular: formulario.telefono,
        correo: formulario.email,
        forma_pago: formulario.formaPago,
        servicio: formulario.servicios
      });
      
      if (response.success) {
        alert(`✅ Proveedor actualizado correctamente\n\nProveedor: ${formulario.proveedor}\nRUC: ${formulario.ruc}`);
        await cargarProveedores(); // Recargar lista
        
        // Actualizar el proveedor seleccionado con los nuevos datos
        const proveedorActualizado = proveedores.find(p => p.id === proveedorSeleccionado.id);
        if (proveedorActualizado) {
          setProveedorSeleccionado({
            ...proveedorActualizado,
            proveedor: formulario.proveedor,
            direccion: formulario.direccion,
            contacto: formulario.contacto,
            telefono: formulario.telefono,
            email: formulario.email,
            formaPago: formulario.formaPago,
            servicios: formulario.servicios
          });
        }
      } else {
        alert(`❌ Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar el proveedor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefrescar = async () => {
    if (!proveedorSeleccionado) {
      alert('⚠️ Seleccione un proveedor primero');
      return;
    }

    try {
      setLoading(true);
      const response = await proveedorAPI.obtenerProveedorPorId(proveedorSeleccionado.id);
      
      if (response.success) {
        const proveedorActualizado = response.data;
        setFormulario({
          proveedor: proveedorActualizado.proveedor,
          ruc: proveedorActualizado.ruc,
          direccion: proveedorActualizado.direccion || '',
          contacto: proveedorActualizado.contacto || '',
          telefono: proveedorActualizado.telefono || '',
          email: proveedorActualizado.email || '',
          formaPago: proveedorActualizado.formaPago || '',
          servicios: proveedorActualizado.servicios || ''
        });
        alert('🔄 Datos refrescados desde la base de datos');
      } else {
        alert('❌ Error al refrescar datos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al refrescar datos del proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormulario({
      proveedor: '',
      ruc: '',
      direccion: '',
      contacto: '',
      telefono: '',
      email: '',
      formaPago: '',
      servicios: ''
    });
    setProveedorSeleccionado(null);
  };

  const handleEliminar = async () => {
    if (!proveedorSeleccionado) {
      alert('⚠️ Por favor seleccione un proveedor de la lista');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar el proveedor "${proveedorSeleccionado.proveedor}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        setLoading(true);
        const response = await proveedorAPI.eliminarProveedor(proveedorSeleccionado.id);
        
        if (response.success) {
          alert(`🗑️ Proveedor eliminado: ${proveedorSeleccionado.proveedor}`);
          await cargarProveedores(); // Recargar lista
          handleLimpiar();
        } else {
          alert(`❌ Error: ${response.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar el proveedor');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProveedores = proveedores.filter(prov =>
    prov.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prov.ruc.includes(searchTerm) ||
    (prov.contacto && prov.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && proveedores.length === 0) {
    return (
      <div className="editar-proveedor-container">
        <div className="loading-container-editar-prov">
          <div className="spinner-editar-prov"></div>
          <p>Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-proveedor-container">
      {/* Header */}
      <div className="editar-proveedor-header">
        <div className="header-icon-title-editar-prov">
          <span className="header-icon-editar-prov">⚙️</span>
          <div>
            <h1>EDITAR PROVEEDORES</h1>
            <p>Seleccione un proveedor para editar su información</p>
          </div>
        </div>
        <div className="header-stats-editar-prov">
          <div className="stat-item-editar-prov">
            <span className="stat-icon-editar-prov">📊</span>
            <span className="stat-text-editar-prov">
              <strong>{proveedores.length}</strong> Proveedores
            </span>
          </div>
          <div className="stat-item-editar-prov">
            <span className="stat-icon-editar-prov">🔍</span>
            <span className="stat-text-editar-prov">
              <strong>{filteredProveedores.length}</strong> Filtrados
            </span>
          </div>
        </div>
      </div>

      {/* PANEL HORIZONTAL - DATOS DEL PROVEEDOR */}
      <div className={`datos-proveedor-horizontal-editar-prov ${panelMinimizado ? 'minimizado' : ''}`}>
        <div className="datos-header-horizontal-editar-prov">
          <h2>✏️ DATOS DEL PROVEEDOR</h2>
          <button 
            className="btn-minimizar-editar-prov"
            onClick={() => setPanelMinimizado(!panelMinimizado)}
            title={panelMinimizado ? "Maximizar panel" : "Minimizar panel"}
          >
            {panelMinimizado ? '➕' : '➖'}
          </button>
        </div>

        {!panelMinimizado && (
          <>
            <div className="datos-grid-horizontal-editar-prov">
              <div className="dato-field-editar-prov">
                <label>🏢 PROVEEDOR *</label>
                <input
                  type="text"
                  name="proveedor"
                  value={formulario.proveedor}
                  onChange={handleInputChange}
                  placeholder="Seleccione un proveedor de la lista"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📋 RUC (NO EDITABLE)</label>
                <input
                  type="text"
                  value={formulario.ruc}
                  disabled
                  className="input-disabled-editar-prov"
                  placeholder="RUC del proveedor"
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📍 DIRECCIÓN</label>
                <textarea
                  name="direccion"
                  value={formulario.direccion}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Dirección completa"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>👤 NOMBRE CONTACTO</label>
                <input
                  type="text"
                  name="contacto"
                  value={formulario.contacto}
                  onChange={handleInputChange}
                  placeholder="Nombre del contacto"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📞 TELÉFONO</label>
                <input
                  type="text"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>📧 EMAIL</label>
                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  disabled={!proveedorSeleccionado}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>💳 FORMA DE PAGO</label>
                <input
                  type="text"
                  name="formaPago"
                  value={formulario.formaPago}
                  onChange={handleInputChange}
                  placeholder="Forma de pago"
                  disabled={!proveedorSeleccionado}
                  className={!proveedorSeleccionado ? '' : ''}
                />
              </div>
              
              <div className="dato-field-editar-prov">
                <label>🛠️ SERVICIOS</label>
                <input
                  type="text"
                  name="servicios"
                  value={formulario.servicios}
                  onChange={handleInputChange}
                  placeholder="Servicios que ofrece"
                  disabled={!proveedorSeleccionado}
                />
              </div>
            </div>

            <div className="datos-footer-horizontal-editar-prov">
              <button 
                className="btn-actualizar-editar-prov" 
                onClick={handleActualizar}
                disabled={!proveedorSeleccionado || loading}
              >
                <span>✅</span> {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
              </button>
              <button 
                className="btn-refrescar-editar-prov" 
                onClick={handleRefrescar}
                disabled={!proveedorSeleccionado || loading}
              >
                <span>🔄</span> REFRESCAR
              </button>
              <button 
                className="btn-limpiar-editar-prov" 
                onClick={handleLimpiar}
                disabled={loading}
              >
                <span>🗑️</span> LIMPIAR
              </button>
              <button 
                className="btn-eliminar-editar-prov" 
                onClick={handleEliminar}
                disabled={!proveedorSeleccionado || loading}
              >
                <span>❌</span> ELIMINAR
              </button>
            </div>
          </>
        )}
      </div>

      {/* LISTA DE PROVEEDORES */}
      <div className="lista-proveedores-section-editar-prov">
        <div className="lista-header-editar-prov">
          <h2>📋 LISTA DE PROVEEDORES</h2>
        </div>

        <div className="search-proveedor-editar-prov">
          <input
            type="text"
            placeholder="Buscar por nombre, RUC o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon-editar-prov">🔍</span>
        </div>

        <div className="tabla-proveedores-wrapper-editar-prov">
          <table className="tabla-proveedores-editar-prov">
            <thead>
              <tr>
                <th>ID</th>
                <th>PROVEEDOR</th>
                <th>RUC</th>
                <th>DIRECCIÓN</th>
                <th>CONTACTO</th>
                <th>TELÉFONO</th>
                <th>EMAIL</th>
                <th>FORMA PAGO</th>
                <th>SERVICIOS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProveedores.length > 0 ? (
                filteredProveedores.map((proveedor) => (
                  <tr
                    key={proveedor.id}
                    className={proveedorSeleccionado?.id === proveedor.id ? 'selected-editar-prov' : ''}
                    onClick={() => handleProveedorClick(proveedor)}
                  >
                    <td>{proveedor.id}</td>
                    <td><strong>{proveedor.proveedor}</strong></td>
                    <td>{proveedor.ruc}</td>
                    <td>{proveedor.direccion || '-'}</td>
                    <td>{proveedor.contacto || '-'}</td>
                    <td>{proveedor.telefono || '-'}</td>
                    <td className="email-cell-editar-prov">{proveedor.email || '-'}</td>
                    <td>{proveedor.formaPago || '-'}</td>
                    <td>{proveedor.servicios || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty-message-editar-prov">
                    <div className="empty-state-editar-prov">
                      <span className="empty-icon-editar-prov">📋</span>
                      <p>No se encontraron proveedores</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EditarProveedor;