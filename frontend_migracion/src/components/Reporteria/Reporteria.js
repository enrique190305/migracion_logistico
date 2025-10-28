import React, { useState } from 'react';
import './Reporteria.css';
import HistorialOrdenesCompra from './HistorialOrdenesCompra';
import HistorialIngresoMateriales from './HistorialIngresoMateriales';
import HistorialTrasladoMateriales from './HistorialTrasladoMateriales';
import HistorialSalidaMateriales from './HistorialSalidaMateriales';

const Reporteria = () => {
  const [moduloActivo, setModuloActivo] = useState('ordenes-compra');

  const modulos = [
    {
      id: 'ordenes-compra',
      titulo: 'Historial de Órdenes de Compra',
      icono: '🛒',
      color: '#4a90e2'
    },
    {
      id: 'ingreso-materiales',
      titulo: 'Historial de Ingreso de Materiales',
      icono: '📥',
      color: '#9b59b6'
    },
    {
      id: 'traslado-materiales',
      titulo: 'Historial de Traslado de Materiales',
      icono: '🔄',
      color: '#e67e22'
    },
    {
      id: 'salida-materiales',
      titulo: 'Historial de Salida de Materiales',
      icono: '📤',
      color: '#e74c3c'
    }
  ];

  return (
    <div className="reporteria-container">
      <div className="reporteria-header">
        <h2>📊 Reportería</h2>
        <p className="reporteria-subtitle">Historial y consultas de operaciones</p>
      </div>

      {/* Menú de submódulos */}
      <div className="reporteria-menu">
        {modulos.map(modulo => (
          <button
            key={modulo.id}
            className={`reporteria-menu-item ${moduloActivo === modulo.id ? 'active' : ''}`}
            style={{
              '--color': modulo.color,
              borderColor: moduloActivo === modulo.id ? modulo.color : 'transparent'
            }}
            onClick={() => setModuloActivo(modulo.id)}
          >
            <span className="menu-icono">{modulo.icono}</span>
            <span className="menu-titulo">{modulo.titulo}</span>
          </button>
        ))}
      </div>

      {/* Contenido del submódulo activo */}
      <div className="reporteria-content">
        {moduloActivo === 'ordenes-compra' && <HistorialOrdenesCompra />}
        {moduloActivo === 'ingreso-materiales' && <HistorialIngresoMateriales />}
        {moduloActivo === 'traslado-materiales' && <HistorialTrasladoMateriales />}
        {moduloActivo === 'salida-materiales' && <HistorialSalidaMateriales />}
      </div>
    </div>
  );
};

export default Reporteria;
