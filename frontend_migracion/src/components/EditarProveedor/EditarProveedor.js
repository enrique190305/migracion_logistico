import React, { useState } from 'react';
import './EditarProveedor.css';

const EditarProveedor = () => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [panelMinimizado, setPanelMinimizado] = useState(false); // Estado para minimizar/maximizar

  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      proveedor: 'A&V IMPORTADORA Y DISTRIBUIDORA S.A.C',
      ruc: '20605524738',
      direccion: 'CAL.SAO PAULO NRO. 1462 URB. PERU LIMA - SAN MARTIN DE PORRES',
      contacto: 'VANESSA ESTEFANY SANTAM',
      telefono: '991761185',
      email: 'comexterior@gmail.com',
      formaPago: '25% ADELANTO - 75% CONTRA ENTREGA',
      servicios: 'TRANSPORTE'
    },
    {
      id: 2,
      proveedor: 'ALAN CLAUDIO QUISPE MOYOCCO',
      ruc: '10418634630',
      direccion: 'URB. NUEVO HORIZONTE M2 E CUZCO - SAN JERONIMO',
      contacto: 'JEAN',
      telefono: '963718160',
      email: 'Extintoresmetropolitancusco@gmail.com',
      formaPago: 'CONTADO',
      servicios: 'SEGURIDAD INDUSTRIAL'
    },
    {
      id: 3,
      proveedor: 'BS CONTROL INDUSTRIAL S.A.C',
      ruc: '20607032514',
      direccion: 'AV. MARIANO CORNEJO NRO. 1434 DPTO. 1201 LIMA',
      contacto: 'RUBEN BALDEON',
      telefono: '986974986',
      email: 'bsingenieria@gmail.com',
      formaPago: 'CONTADO',
      servicios: 'SERVICIOS VARIOS'
    },
    {
      id: 4,
      proveedor: 'CARTOCOR DE PERU S.A.',
      ruc: '20515685911',
      direccion: 'GUILLERMO PRESCOTT 325 SAN ISIDRO LIMA PERU',
      contacto: 'JUAN DANIEL LAZO',
      telefono: '92365147',
      email: 'wincho@arcor.com',
      formaPago: 'CRÉDITO',
      servicios: 'EMPAQUES INDUSTRIALES'
    },
    {
      id: 5,
      proveedor: 'CARTONES VILLA MARINA S.A.C',
      ruc: '20424649990',
      direccion: 'CAR.PANAMERICANA SUR KM.19 MZ.F INT. I1 2 END. ASOC. LA CONCORDIA',
      contacto: 'ALDO MAQUIN',
      telefono: '987425147',
      email: 'aldo.maquin@carvimsa.com',
      formaPago: 'CRÉDITO',
      servicios: 'EMPAQUES INDUSTRIALES'
    },
    {
      id: 6,
      proveedor: 'CB SOLUCIONES GLOBALES S.A.C',
      ruc: '20608998871',
      direccion: 'AV. BRASIL 1459 OFICINA 1102 JESUS MARIA - LIMA',
      contacto: 'KEYLA TORRES',
      telefono: '905450485',
      email: 'ventas3@cbsolucionesglobales.com',
      formaPago: 'AL CONTADO / EVALUACIÓN DE CRÉDITO',
      servicios: 'SERVICIOS DE SOPORTE TÉCNICO / MANTENIMIENTO'
    },
    {
      id: 7,
      proveedor: 'DIMERC PERU S.A.C',
      ruc: '20537231190',
      direccion: 'AV. ANDRES AVELINO CACERES NRO. 920',
      contacto: 'LILIANA AVASHI',
      telefono: '947859201',
      email: 'lilian.avashi@dimerc.pe',
      formaPago: 'CONTADO',
      servicios: 'SERVICIOS VARIOS'
    },
    {
      id: 8,
      proveedor: 'ECOPACKING CARTONES SA',
      ruc: '20603749645',
      direccion: 'AV. PORTILLO GRANDE SUB - LOTE 32 ETAPA TERRENO RUSTICO LOMAS DE',
      contacto: 'DANNY MENACHO',
      telefono: '965112233',
      email: 'dmenacho@ecopacking.com',
      formaPago: 'CHEQUE DIFERIDO A 120 DÍAS',
      servicios: 'CARTONERA'
    },
    {
      id: 9,
      proveedor: 'HURTADO SOCA LOURDES',
      ruc: '10243769430',
      direccion: 'CUSCO - LIMA TAMBO',
      contacto: 'LOURDES HURTADO SOCA',
      telefono: '972309990',
      email: 'hurtado.soca@hotmail.com',
      formaPago: 'CONTADO',
      servicios: 'SERVICIOS VARIOS'
    },
    {
      id: 10,
      proveedor: 'INVERSIONES DAVEMIR EIRL',
      ruc: '20605308968',
      direccion: 'Calle las retamas MZ L LOTE 17',
      contacto: 'Joseph Gutiérrez',
      telefono: '970287307',
      email: 'Jgutierrez@4gepp.com',
      formaPago: 'CONTADO',
      servicios: 'Vta. May. Maquinaria, Equipo y Herramientas'
    },
    {
      id: 11,
      proveedor: 'Metritek EIRL',
      ruc: '20612003565',
      direccion: 'Centro comercial San Felipe, of. 41, Jesús María, Lima',
      contacto: 'Alexander Santana',
      telefono: '983542039',
      email: 'ventas@politec.pe',
      formaPago: 'CONTADO',
      servicios: 'ENSAYOS, ANÁLISIS TÉCNICOS Y VENTAS DE EQUIPOS AL POR MAYOR'
    },
    {
      id: 12,
      proveedor: 'PROMOTORA SUR AMERICA',
      ruc: '20325566607',
      direccion: 'Av. República de Chile 295 Lima',
      contacto: 'Emma Salguero',
      telefono: '94074394',
      email: 'prboy@promosurperu.com',
      formaPago: 'FACTURA A 15 DÍAS',
      servicios: 'Venta al por Mayor de Otros Productos'
    }
  ]);

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

  const handleProveedorClick = (proveedor) => {
    setProveedorSeleccionado(proveedor);
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const handleActualizar = () => {
    if (!proveedorSeleccionado) {
      alert('⚠️ Por favor seleccione un proveedor de la lista');
      return;
    }

    if (!formulario.proveedor || !formulario.ruc) {
      alert('⚠️ Por favor complete los campos obligatorios (Proveedor y RUC)');
      return;
    }

    if (formulario.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      alert('⚠️ Por favor ingrese un email válido');
      return;
    }

    setProveedores(proveedores.map(prov => 
      prov.id === proveedorSeleccionado.id 
        ? { ...formulario, id: proveedorSeleccionado.id }
        : prov
    ));

    alert(`✅ Proveedor actualizado correctamente\n\nProveedor: ${formulario.proveedor}\nRUC: ${formulario.ruc}`);
  };

  const handleRefrescar = () => {
    if (proveedorSeleccionado) {
      const proveedorOriginal = proveedores.find(p => p.id === proveedorSeleccionado.id);
      if (proveedorOriginal) {
        setFormulario({
          proveedor: proveedorOriginal.proveedor,
          ruc: proveedorOriginal.ruc,
          direccion: proveedorOriginal.direccion,
          contacto: proveedorOriginal.contacto,
          telefono: proveedorOriginal.telefono,
          email: proveedorOriginal.email,
          formaPago: proveedorOriginal.formaPago,
          servicios: proveedorOriginal.servicios
        });
        alert('🔄 Datos refrescados desde la base de datos');
      }
    } else {
      alert('⚠️ Seleccione un proveedor primero');
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

  const handleEliminar = () => {
    if (!proveedorSeleccionado) {
      alert('⚠️ Por favor seleccione un proveedor de la lista');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar el proveedor "${proveedorSeleccionado.proveedor}"?\n\nEsta acción no se puede deshacer.`)) {
      setProveedores(proveedores.filter(prov => prov.id !== proveedorSeleccionado.id));
      alert(`🗑️ Proveedor eliminado: ${proveedorSeleccionado.proveedor}`);
      handleLimpiar();
    }
  };

  const filteredProveedores = proveedores.filter(prov =>
    prov.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prov.ruc.includes(searchTerm) ||
    prov.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="editar-proveedor-container">
      {/* Header */}
      <div className="editar-proveedor-header">
        <div className="header-icon-title">
          <span className="header-icon">⚙️</span>
          <div>
            <h1>EDITAR PROVEEDORES</h1>
            <p>Seleccione un proveedor para editar su información</p>
          </div>
        </div>
      </div>

      {/* PANEL HORIZONTAL - SIEMPRE VISIBLE CON OPCIÓN DE MINIMIZAR */}
      <div className={`datos-proveedor-horizontal ${panelMinimizado ? 'minimizado' : ''}`}>
        <div className="datos-header-horizontal">
          <h2>✏️ DATOS DEL PROVEEDOR</h2>
          <button 
            className="btn-minimizar"
            onClick={() => setPanelMinimizado(!panelMinimizado)}
            title={panelMinimizado ? "Maximizar panel" : "Minimizar panel"}
          >
            {panelMinimizado ? '➕' : '➖'}
          </button>
        </div>

        {!panelMinimizado && (
          <>
            <div className="datos-grid-horizontal">
              <div className="dato-field">
                <label>🏢 PROVEEDOR</label>
                <input
                  type="text"
                  name="proveedor"
                  value={formulario.proveedor}
                  onChange={handleInputChange}
                  placeholder="Seleccione un proveedor de la lista"
                />
              </div>
              <div className="dato-field">
                <label>📋 RUC (NO EDITABLE)</label>
                <input
                  type="text"
                  value={formulario.ruc}
                  disabled
                  className="input-disabled"
                  placeholder="RUC del proveedor"
                />
              </div>
              <div className="dato-field">
                <label>📍 DIRECCIÓN</label>
                <textarea
                  name="direccion"
                  value={formulario.direccion}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Dirección completa"
                />
              </div>
              <div className="dato-field">
                <label>👤 NOMBRE CONTACTO</label>
                <input
                  type="text"
                  name="contacto"
                  value={formulario.contacto}
                  onChange={handleInputChange}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div className="dato-field">
                <label>📞 TELÉFONO</label>
                <input
                  type="text"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="dato-field">
                <label>📧 EMAIL</label>
                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="dato-field">
                <label>💳 FORMA DE PAGO</label>
                <input
                  type="text"
                  name="formaPago"
                  value={formulario.formaPago}
                  onChange={handleInputChange}
                  placeholder="Forma de pago"
                />
              </div>
              <div className="dato-field">
                <label>🛠️ SERVICIOS</label>
                <input
                  type="text"
                  name="servicios"
                  value={formulario.servicios}
                  onChange={handleInputChange}
                  placeholder="Servicios que ofrece"
                />
              </div>
            </div>

            <div className="datos-footer-horizontal">
              <button className="btn-actualizar" onClick={handleActualizar}>
                <span>✅</span> ACTUALIZAR
              </button>
              <button className="btn-refrescar" onClick={handleRefrescar}>
                <span>🔄</span> REFRESCAR
              </button>
              <button className="btn-limpiar-editar" onClick={handleLimpiar}>
                <span>🗑️</span> LIMPIAR
              </button>
              <button className="btn-eliminar-editar" onClick={handleEliminar}>
                <span>❌</span> ELIMINAR
              </button>
            </div>
          </>
        )}
      </div>

      {/* LISTA DE PROVEEDORES CON TODOS LOS CAMPOS */}
      <div className="lista-proveedores-section">
        <div className="lista-header">
          <h2>📋 LISTA DE PROVEEDORES</h2>
        </div>

        <div className="search-proveedor">
          <input
            type="text"
            placeholder="Buscar por nombre, RUC o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon-editar">🔍</span>
        </div>

        <div className="tabla-proveedores-wrapper">
          <table className="tabla-proveedores-editar">
            <thead>
              <tr>
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
                    className={proveedorSeleccionado?.id === proveedor.id ? 'selected' : ''}
                    onClick={() => handleProveedorClick(proveedor)}
                  >
                    <td><strong>{proveedor.proveedor}</strong></td>
                    <td>{proveedor.ruc}</td>
                    <td>{proveedor.direccion}</td>
                    <td>{proveedor.contacto}</td>
                    <td>{proveedor.telefono}</td>
                    <td className="email-cell">{proveedor.email}</td>
                    <td>{proveedor.formaPago}</td>
                    <td>{proveedor.servicios}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-message-editar">
                    <div className="empty-state-editar">
                      <span className="empty-icon-editar">📋</span>
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