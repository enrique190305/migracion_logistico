import React from 'react';
import './Confirmacion.css';

const Confirmacion = ({ tipo, titulo, mensaje, detalles, onConfirm, onCancel }) => {
  // Configuración según el tipo de confirmación
  const configs = {
    warning: {
      icon: '⚠',
      color: '#ffc107',
      bgColor: '#fff3cd',
      borderColor: '#ffeaa7',
      iconBg: '#ffc107',
      btnConfirmColor: '#ffc107',
      btnConfirmHover: '#e0a800',
      btnConfirmText: 'Continuar'
    },
    info: {
      icon: '❓',
      color: '#17a2b8',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      iconBg: '#17a2b8',
      btnConfirmColor: '#17a2b8',
      btnConfirmHover: '#138496',
      btnConfirmText: 'Confirmar'
    },
    danger: {
      icon: '⚠',
      color: '#dc3545',
      bgColor: '#f8d7da',
      borderColor: '#f5c6cb',
      iconBg: '#dc3545',
      btnConfirmColor: '#dc3545',
      btnConfirmHover: '#c82333',
      btnConfirmText: 'Sí, continuar'
    }
  };

  const config = configs[tipo] || configs.info;

  return (
    <div className="confirmacion-overlay" onClick={onCancel}>
      <div className="confirmacion-modal" onClick={(e) => e.stopPropagation()}>
        {/* Icono superior */}
        <div className="confirmacion-icono" style={{ backgroundColor: config.iconBg }}>
          <span>{config.icon}</span>
        </div>

        {/* Título */}
        <h2 className="confirmacion-titulo" style={{ color: config.color }}>
          {titulo}
        </h2>

        {/* Mensaje principal */}
        {mensaje && (
          <p className="confirmacion-mensaje">
            {mensaje}
          </p>
        )}

        {/* Detalles adicionales */}
        {detalles && detalles.length > 0 && (
          <div className="confirmacion-detalles">
            {detalles.map((detalle, index) => (
              <div key={index} className="confirmacion-detalle-item">
                <span className="confirmacion-detalle-label">{detalle.label}:</span>
                <span className="confirmacion-detalle-valor">{detalle.valor}</span>
              </div>
            ))}
          </div>
        )}

        {/* Botones de acción */}
        <div className="confirmacion-botones">
          <button 
            className="confirmacion-boton confirmacion-boton-cancelar" 
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button 
            className="confirmacion-boton confirmacion-boton-confirmar" 
            onClick={onConfirm}
            style={{ 
              backgroundColor: config.btnConfirmColor,
              borderColor: config.btnConfirmColor 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = config.btnConfirmHover;
              e.currentTarget.style.borderColor = config.btnConfirmHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = config.btnConfirmColor;
              e.currentTarget.style.borderColor = config.btnConfirmColor;
            }}
          >
            {config.btnConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;
