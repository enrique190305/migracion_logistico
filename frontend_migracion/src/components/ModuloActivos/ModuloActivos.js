import React, { useState } from 'react';
import './ModuloActivos.css';
import RegistroBodega from '../RegistroBodega/RegistroBodega';
import RegistroReserva from '../RegistroReserva/RegistroReserva';

const ModuloActivos = () => {
  const [tabActiva, setTabActiva] = useState('bodega');

  return (
    <div className="modulo-activos-wrapper">
      {/* Pestañas de navegación estilo Figma */}
      <div className="modulo-activos-tabs">
        <button
          className={`modulo-tab ${tabActiva === 'bodega' ? 'active' : ''}`}
          onClick={() => setTabActiva('bodega')}
        >
          📦 Registro de bodega
        </button>
        <button
          className={`modulo-tab ${tabActiva === 'reserva' ? 'active' : ''}`}
          onClick={() => setTabActiva('reserva')}
        >
          📋 Registro de reserva
        </button>
      </div>

      {/* Contenido */}
      <div className="modulo-activos-content">
        {tabActiva === 'bodega' ? <RegistroBodega /> : <RegistroReserva />}
      </div>
    </div>
  );
};

export default ModuloActivos;
