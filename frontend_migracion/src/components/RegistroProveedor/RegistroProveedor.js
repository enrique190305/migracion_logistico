import React, { useState, useEffect } from 'react';
import './RegistroProveedor.css';
import * as proveedorAPI from '../../services/proveedorAPI';

const RegistroProveedor = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFormaPago, setFiltroFormaPago] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleRegistrar = async () => {
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
      const response = await proveedorAPI.crearProveedor({
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
        alert(`✅ Proveedor registrado correctamente\n\nProveedor: ${formulario.proveedor}\nRUC: ${formulario.ruc}`);
        await cargarProveedores();
        handleLimpiar();
        setMostrarModal(false);
      } else {
        alert(`❌ Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar el proveedor: ' + error.message);
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
  };

  const abrirModal = () => {
    handleLimpiar();
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    handleLimpiar();
  };

  // Función para contar formas de pago (insensible a mayúsculas/minúsculas)
  const contarFormaPago = (formaPago) => {
    return proveedores.filter(p => 
      p.formaPago && p.formaPago.toLowerCase().includes(formaPago.toLowerCase())
    ).length;
  };

  const proveedoresFiltrados = proveedores.filter(prov => {
    const coincideBusqueda = 
      prov.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prov.ruc.includes(searchTerm) ||
      (prov.contacto && prov.contacto.toLowerCase().includes(searchTerm.toLowerCase()));

    const coincideFormaPago = 
      filtroFormaPago === 'todos' || 
      (prov.formaPago && prov.formaPago.toLowerCase().includes(filtroFormaPago.toLowerCase()));

    return coincideBusqueda && coincideFormaPago;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const proveedoresActuales = proveedoresFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);

  const cambiarPagina = (numeroPagina) => {
    setCurrentPage(numeroPagina);
  };

  if (loading && proveedores.length === 0) {
    return (
      <div className="registro-proveedor-container">
        <div className="loading-container-proveedor">
          <div className="spinner-proveedor"></div>
          <p>Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registro-proveedor-container">
      {/* Header */}
      <div className="registro-proveedor-header">
        <div className="header-title-proveedor">
          <div className="header-icon-proveedor">📦</div>
          <div>
            <h1>Registro de Proveedores</h1>
            <p>Gestión integral de proveedores del sistema</p>
          </div>
        </div>
        <div className="header-actions-proveedor">
          <button onClick={abrirModal} className="btn-proveedor btn-success-proveedor">
            ➕ Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid-proveedor">
        <div className="stat-card-proveedor">
          <div className="stat-icon-proveedor">📊</div>
          <div className="stat-content-proveedor">
            <p className="stat-value-proveedor">{proveedores.length}</p>
            <p className="stat-label-proveedor">Proveedores registrados</p>
          </div>
        </div>

        <div className="stat-card-proveedor">
          <div className="stat-icon-proveedor">🔍</div>
          <div className="stat-content-proveedor">
            <p className="stat-value-proveedor">{proveedoresFiltrados.length}</p>
            <p className="stat-label-proveedor">Resultados filtrados</p>
          </div>
        </div>

        <div className="stat-card-proveedor">
          <div className="stat-icon-proveedor">💳</div>
          <div className="stat-content-proveedor">
            <p className="stat-value-proveedor">
              {contarFormaPago('contado')}
            </p>
            <p className="stat-label-proveedor">Pago Contado</p>
          </div>
        </div>

        <div className="stat-card-proveedor">
          <div className="stat-icon-proveedor">🏦</div>
          <div className="stat-content-proveedor">
            <p className="stat-value-proveedor">
              {contarFormaPago('crédito')}
            </p>
            <p className="stat-label-proveedor">Pago Crédito</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section-proveedor">
        <h2>🔍 FILTROS DE BÚSQUEDA</h2>
        <div className="filtros-grid-proveedor">
          <div className="filtro-group-proveedor">
            <label>Búsqueda General</label>
            <input
              type="text"
              placeholder="Buscar por proveedor, RUC o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filtro-group-proveedor">
            <label>Forma de Pago</label>
            <select
              value={filtroFormaPago}
              onChange={(e) => setFiltroFormaPago(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="contado">Contado</option>
              <option value="crédito">Crédito</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-section-proveedor">
        <div className="tabla-header-proveedor">
          <h2>📋 LISTADO DE PROVEEDORES</h2>
          <div className="search-box-proveedor">
            <input
              type="text"
              placeholder="Buscar en la tabla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon-proveedor">🔍</span>
          </div>
        </div>

        <div className="table-wrapper-proveedor">
          <table className="proveedores-table-proveedor">
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
              </tr>
            </thead>
            <tbody>
              {proveedoresActuales.length > 0 ? (
                proveedoresActuales.map((proveedor) => (
                  <tr key={proveedor.id}>
                    <td>{proveedor.id}</td>
                    <td><strong>{proveedor.proveedor}</strong></td>
                    <td>{proveedor.ruc}</td>
                    <td className="direccion-cell-proveedor">{proveedor.direccion || '-'}</td>
                    <td>{proveedor.contacto || '-'}</td>
                    <td>{proveedor.telefono || '-'}</td>
                    <td>{proveedor.email || '-'}</td>
                    <td>
                      <span className="forma-pago-badge-proveedor">
                        {proveedor.formaPago || '-'}
                      </span>
                    </td>
                    <td className="servicios-cell-proveedor">{proveedor.servicios || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state-proveedor">
                      <div className="empty-state-icon-proveedor">📭</div>
                      <h3>No hay proveedores registrados</h3>
                      <p>Comienza agregando un nuevo proveedor</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination-proveedor">
            <button
              onClick={() => cambiarPagina(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ⬅️ ANTERIOR
            </button>
            
            <span>Página {currentPage} de {totalPages}</span>
            
            <button
              onClick={() => cambiarPagina(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              SIGUIENTE ➡️
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <>
          <div className="modal-overlay-proveedor" onClick={cerrarModal}></div>
          <div className="modal-container-proveedor">
            <div className="modal-header-proveedor">
              <h2>➕ REGISTRAR NUEVO PROVEEDOR</h2>
              <button onClick={cerrarModal} className="btn-close-proveedor">✖</button>
            </div>

            <div className="modal-body-proveedor">
              <div className="form-group-row-proveedor">
                <div className="form-group-proveedor">
                  <label>Proveedor *</label>
                  <input
                    type="text"
                    name="proveedor"
                    value={formulario.proveedor}
                    onChange={handleInputChange}
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div className="form-group-proveedor">
                  <label>RUC *</label>
                  <input
                    type="text"
                    name="ruc"
                    value={formulario.ruc}
                    onChange={handleInputChange}
                    placeholder="11 dígitos"
                    maxLength="11"
                  />
                </div>
              </div>

              <div className="form-group-row-proveedor">
                <div className="form-group-proveedor">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formulario.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="form-group-proveedor">
                  <label>Contacto</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formulario.contacto}
                    onChange={handleInputChange}
                    placeholder="Nombre del contacto"
                  />
                </div>
              </div>

              <div className="form-group-row-proveedor">
                <div className="form-group-proveedor">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={handleInputChange}
                    placeholder="Teléfono de contacto"
                  />
                </div>

                <div className="form-group-proveedor">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="form-group-proveedor">
                <label>Forma de Pago</label>
                <input
                  type="text"
                  name="formaPago"
                  value={formulario.formaPago}
                  onChange={handleInputChange}
                  placeholder="Ej: Contado, Crédito, Transferencia, etc."
                />
              </div>

              <div className="form-group-proveedor">
                <label>Servicios</label>
                <textarea
                  name="servicios"
                  value={formulario.servicios}
                  onChange={handleInputChange}
                  placeholder="Descripción de servicios ofrecidos"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer-proveedor">
              <button onClick={cerrarModal} className="btn-proveedor btn-cancel-proveedor">
                ❌ CANCELAR
              </button>
              <button onClick={handleLimpiar} className="btn-proveedor btn-secondary-proveedor">
                🧹 LIMPIAR
              </button>
              <button onClick={handleRegistrar} className="btn-proveedor btn-success-proveedor" disabled={loading}>
                {loading ? '⏳ GUARDANDO...' : '💾 REGISTRAR'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegistroProveedor;