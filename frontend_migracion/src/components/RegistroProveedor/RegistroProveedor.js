import React, { useState } from 'react';
import './RegistroProveedor.css';

const RegistroProveedor = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFormaPago, setFiltroFormaPago] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      proveedor: 'CONSTRUCTORA DEL NORTE SAC',
      ruc: '20123456789',
      direccion: 'Av. Los Constructores 123, Lima',
      contacto: 'Juan Pérez González',
      telefono: '987654321',
      email: 'ventas@constructoranorte.com',
      formaPago: 'Transferencia Bancaria',
      servicios: 'Suministro de materiales de construcción'
    },
    {
      id: 2,
      proveedor: 'TECNOLOGÍA DIGITAL EIRL',
      ruc: '20234567890',
      direccion: 'Jr. Tecnología 456, San Isidro',
      contacto: 'María Rodriguez López',
      telefono: '998765432',
      email: 'info@tecdigital.com',
      formaPago: 'Contado',
      servicios: 'Equipos de cómputo y software'
    },
    {
      id: 3,
      proveedor: 'SERVICIOS LOGÍSTICOS SA',
      ruc: '20345678901',
      direccion: 'Av. Industrial 789, Callao',
      contacto: 'Carlos Mendoza Silva',
      telefono: '987123456',
      email: 'contacto@servlog.com',
      formaPago: 'Crédito 30 días',
      servicios: 'Transporte y almacenamiento'
    },
    {
      id: 4,
      proveedor: 'PAPELERÍA OFICINA SAC',
      ruc: '20456789012',
      direccion: 'Calle Los Olivos 321, Miraflores',
      contacto: 'Ana Torres Vargas',
      telefono: '965432198',
      email: 'ventas@papeleriaoficina.com',
      formaPago: 'Transferencia Bancaria',
      servicios: 'Útiles de oficina y papelería'
    },
    {
      id: 5,
      proveedor: 'FERRETERÍA INDUSTRIAL EIRL',
      ruc: '20567890123',
      direccion: 'Av. Argentina 654, Cercado',
      contacto: 'Roberto Salazar Cruz',
      telefono: '954321987',
      email: 'ventas@ferreteriaind.com',
      formaPago: 'Crédito 15 días',
      servicios: 'Herramientas y equipos industriales'
    },
    {
      id: 6,
      proveedor: 'IMPORTADORA GLOBAL SAC',
      ruc: '20678901234',
      direccion: 'Av. Colonial 987, Los Olivos',
      contacto: 'Luis Ramírez Castro',
      telefono: '943210876',
      email: 'info@importadoraglobal.com',
      formaPago: 'Contado',
      servicios: 'Importación de equipos electrónicos'
    },
    {
      id: 7,
      proveedor: 'CONSTRUCTORA PERUANA EIRL',
      ruc: '20789012345',
      direccion: 'Jr. Las Palmeras 234, Surco',
      contacto: 'Patricia Vega Rojas',
      telefono: '932109765',
      email: 'ventas@constperuana.com',
      formaPago: 'Crédito 45 días',
      servicios: 'Materiales de construcción y acabados'
    },
    {
      id: 8,
      proveedor: 'ALIMENTOS DEL VALLE SAC',
      ruc: '20890123456',
      direccion: 'Av. Grau 567, La Victoria',
      contacto: 'Jorge Flores Díaz',
      telefono: '921098654',
      email: 'contacto@alimentosvalle.com',
      formaPago: 'Contado',
      servicios: 'Suministro de alimentos y bebidas'
    }
  ]);

  const [proveedorEditando, setProveedorEditando] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleNuevoProveedor = () => {
    handleLimpiar();
    setMostrarModal(true);
  };

  const handleRegistrar = () => {
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

    if (proveedorEditando) {
      setProveedores(proveedores.map(prov => 
        prov.id === proveedorEditando.id 
          ? { ...formulario, id: proveedorEditando.id }
          : prov
      ));
      alert(`✅ Proveedor actualizado correctamente\n\nProveedor: ${formulario.proveedor}\nRUC: ${formulario.ruc}`);
      setProveedorEditando(null);
    } else {
      const nuevoProveedor = {
        ...formulario,
        id: proveedores.length + 1
      };
      setProveedores([...proveedores, nuevoProveedor]);
      alert(`✅ Proveedor registrado correctamente\n\nProveedor: ${formulario.proveedor}\nRUC: ${formulario.ruc}`);
    }

    handleLimpiar();
    setMostrarModal(false);
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
    setProveedorEditando(null);
  };

  const handleEditar = (proveedor) => {
    setFormulario({
      proveedor: proveedor.proveedor,
      ruc: proveedor.ruc,
      direccion: proveedor.direccion,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email,
      formaPago: proveedor.formaPago,
      servicios: proveedor.servicios
    });
    setProveedorEditando(proveedor);
    setMostrarModal(true);
  };

  const handleEliminar = (proveedor) => {
    if (window.confirm(`¿Está seguro de eliminar el proveedor "${proveedor.proveedor}"?`)) {
      setProveedores(proveedores.filter(prov => prov.id !== proveedor.id));
      alert(`🗑️ Proveedor eliminado: ${proveedor.proveedor}`);
    }
  };

  const handleVer = (proveedor) => {
    alert(
      `📋 DETALLES DEL PROVEEDOR\n\n` +
      `Proveedor: ${proveedor.proveedor}\n` +
      `RUC: ${proveedor.ruc}\n` +
      `Dirección: ${proveedor.direccion}\n` +
      `Contacto: ${proveedor.contacto}\n` +
      `Teléfono: ${proveedor.telefono}\n` +
      `Email: ${proveedor.email}\n` +
      `Forma de Pago: ${proveedor.formaPago}\n` +
      `Servicios: ${proveedor.servicios}`
    );
  };

  const handleExportar = () => {
    alert('📊 Exportando datos...\n\nSe generará un archivo Excel con el listado de proveedores.');
  };

  // Filtrar proveedores
  const filteredProveedores = proveedores.filter(prov => {
    const matchSearch = prov.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prov.ruc.includes(searchTerm) ||
                       prov.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prov.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFormaPago = filtroFormaPago === 'todos' || prov.formaPago === filtroFormaPago;
    
    return matchSearch && matchFormaPago;
  });

  // Calcular estadísticas
  const totalProveedores = proveedores.length;
  const formasPago = [...new Set(proveedores.map(p => p.formaPago))].length;

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProveedores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);

  return (
    <div className="registro-proveedor-container">
      {/* Header */}
      <div className="registro-proveedor-header">
        <div className="header-title">
          <span className="header-icon">📋</span>
          <div>
            <h1>REGISTRO DE PROVEEDORES</h1>
            <p>Gestión del catálogo de proveedores</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleNuevoProveedor}>
            <span>➕</span> Nuevo Proveedor
          </button>
          <button className="btn btn-secondary" onClick={handleExportar}>
            <span>📊</span> Exportar
          </button>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <>
          <div className="modal-overlay" onClick={() => setMostrarModal(false)}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h2>📝 {proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>✖</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group-row">
                <div className="form-group">
                  <label>🏢 Proveedor: *</label>
                  <input
                    type="text"
                    name="proveedor"
                    value={formulario.proveedor}
                    onChange={handleInputChange}
                    placeholder="Nombre de la empresa"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>🔢 RUC: *</label>
                  <input
                    type="text"
                    name="ruc"
                    value={formulario.ruc}
                    onChange={handleInputChange}
                    placeholder="11 dígitos"
                    maxLength="11"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>📍 Dirección:</label>
                <input
                  type="text"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>👤 Contacto:</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formulario.contacto}
                    onChange={handleInputChange}
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div className="form-group">
                  <label>📞 Teléfono:</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={handleInputChange}
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>📧 Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="form-group">
                  <label>💳 Forma de Pago:</label>
                  <select
                    name="formaPago"
                    value={formulario.formaPago}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione una forma de pago...</option>
                    <option value="Contado">Contado</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Crédito 15 días">Crédito 15 días</option>
                    <option value="Crédito 30 días">Crédito 30 días</option>
                    <option value="Crédito 45 días">Crédito 45 días</option>
                    <option value="Crédito 60 días">Crédito 60 días</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>🛠️ Servicios:</label>
                <textarea
                  name="servicios"
                  value={formulario.servicios}
                  onChange={handleInputChange}
                  placeholder="Descripción de servicios o productos que ofrece..."
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-success" onClick={handleRegistrar}>
                <span>✅</span> {proveedorEditando ? 'ACTUALIZAR' : 'REGISTRAR'}
              </button>
              <button className="btn btn-cancel" onClick={handleLimpiar}>
                <span>🔄</span> LIMPIAR
              </button>
            </div>
          </div>
        </>
      )}

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <span>🏢</span>
          </div>
          <div className="stat-info">
            <h3>{totalProveedores}</h3>
            <p>Total Proveedores</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <span>💳</span>
          </div>
          <div className="stat-info">
            <h3>{formasPago}</h3>
            <p>Formas de Pago</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <span>✅</span>
          </div>
          <div className="stat-info">
            <h3>{proveedores.filter(p => p.email).length}</h3>
            <p>Con Email</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <span>🔍</span>
          </div>
          <div className="stat-info">
            <h3>{filteredProveedores.length}</h3>
            <p>Resultados Filtrados</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h2>🔍 Filtros de Búsqueda</h2>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Nombre, RUC, contacto o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Forma de Pago</label>
            <select value={filtroFormaPago} onChange={(e) => setFiltroFormaPago(e.target.value)}>
              <option value="todos">Todas las formas de pago</option>
              <option value="Contado">Contado</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Crédito 15 días">Crédito 15 días</option>
              <option value="Crédito 30 días">Crédito 30 días</option>
              <option value="Crédito 45 días">Crédito 45 días</option>
              <option value="Crédito 60 días">Crédito 60 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-section">
        <div className="tabla-header">
          <h2>📋 Listado de Proveedores ({filteredProveedores.length})</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Búsqueda rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="proveedores-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Proveedor</th>
                <th>RUC</th>
                <th>Dirección</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Forma de Pago</th>
                <th>Servicios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((proveedor) => (
                  <tr key={proveedor.id}>
                    <td><strong>{proveedor.id}</strong></td>
                    <td><strong>{proveedor.proveedor}</strong></td>
                    <td>{proveedor.ruc}</td>
                    <td className="direccion-cell">{proveedor.direccion}</td>
                    <td>{proveedor.contacto}</td>
                    <td>{proveedor.telefono}</td>
                    <td>{proveedor.email}</td>
                    <td>
                      <span className="forma-pago-badge">{proveedor.formaPago}</span>
                    </td>
                    <td className="servicios-cell">{proveedor.servicios}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon btn-view" onClick={() => handleVer(proveedor)} title="Ver detalles">
                          👁️
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => handleEditar(proveedor)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleEliminar(proveedor)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <h3>No se encontraron proveedores</h3>
                      <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredProveedores.length > itemsPerPage && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroProveedor;