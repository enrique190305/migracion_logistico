import React from 'react';
import './Notificacion.css';

const Notificacion = ({ tipo, titulo, mensaje, detalles, onClose, mostrarBoton = true }) => {
  // Configuración según el tipo de notificación
  const configs = {
    success: {
      icon: '✓',
      color: '#28a745',
      bgColor: '#d4edda',
      borderColor: '#c3e6cb',
      iconBg: '#28a745'
    },
    error: {
      icon: '✕',
      color: '#dc3545',
      bgColor: '#f8d7da',
      borderColor: '#f5c6cb',
      iconBg: '#dc3545'
    },
    warning: {
      icon: '⚠',
      color: '#ffc107',
      bgColor: '#fff3cd',
      borderColor: '#ffeaa7',
      iconBg: '#ffc107'
    },
    info: {
      icon: 'ℹ',
      color: '#17a2b8',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      iconBg: '#17a2b8'
    }
  };

  const config = configs[tipo] || configs.info;

  return (
    <div className="notificacion-overlay" onClick={onClose}>
      <div className="notificacion-modal" onClick={(e) => e.stopPropagation()}>
        {/* Icono superior */}
        <div className="notificacion-icono" style={{ backgroundColor: config.iconBg }}>
          <span>{config.icon}</span>
        </div>

        {/* Título */}
        <h2 className="notificacion-titulo" style={{ color: config.color }}>
          {titulo}
        </h2>

        {/* Mensaje principal */}
        {mensaje && (
          <p className="notificacion-mensaje">
            {mensaje}
          </p>
        )}

        {/* Detalles adicionales */}
        {detalles && detalles.length > 0 && (
          <div className="notificacion-detalles">
            {detalles.map((detalle, index) => (
              <div key={index} className="notificacion-detalle-item">
                <span className="notificacion-detalle-label">{detalle.label}:</span>
                <span className="notificacion-detalle-valor">{detalle.valor}</span>
              </div>
            ))}
          </div>
        )}

        {/* Botón de acción */}
        {mostrarBoton && (
          <button 
            className="notificacion-boton" 
            onClick={onClose}
            style={{ 
              backgroundColor: config.color,
              borderColor: config.color 
            }}
          >
            {tipo === 'success' ? 'Entendido' : tipo === 'error' ? 'Cerrar' : 'Aceptar'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Notificacion;
