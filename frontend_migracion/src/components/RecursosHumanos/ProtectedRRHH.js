import React, { useState, useEffect } from 'react';
import { verificarSesionRRHH, cerrarSesionRRHH, obtenerUsuarioRRHH } from '../../services/rrhh.service';
import ModalLoginRRHH from './ModalLoginRRHH';

/**
 * Componente HOC (Higher Order Component) que protege el acceso al módulo de RRHH
 * 
 * Funcionalidad:
 * - Verifica si existe token de RRHH (jwt_token_rrhh)
 * - Si NO existe: Muestra modal de login
 * - Si existe: Renderiza el contenido protegido
 * - Permite cerrar sesión de RRHH sin afectar la sesión principal
 */
const ProtectedRRHH = ({ children, onCancelar }) => {
  const [autenticado, setAutenticado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [usuarioRRHH, setUsuarioRRHH] = useState(null);

  useEffect(() => {
    verificarAcceso();
  }, []);

  const verificarAcceso = () => {
    setVerificando(true);
    const tieneAcceso = verificarSesionRRHH();
    
    if (tieneAcceso) {
      setAutenticado(true);
      setUsuarioRRHH(obtenerUsuarioRRHH());
      setMostrarModal(false);
    } else {
      setAutenticado(false);
      setMostrarModal(true);
    }
    
    setVerificando(false);
  };

  const handleLoginExitoso = (resultado) => {
    console.log('✅ Login RRHH exitoso:', resultado);
    setAutenticado(true);
    setUsuarioRRHH(resultado.usuario || null);
    setMostrarModal(false);
  };

  const handleCancelar = () => {
    setMostrarModal(false);
    setAutenticado(false);
    // Regresar a LOGÍSTICA cuando cancela el login
    if (onCancelar) {
      onCancelar();
    }
  };

  const handleCerrarSesion = () => {
    cerrarSesionRRHH();
    setAutenticado(false);
    setUsuarioRRHH(null);
    // Regresar a LOGÍSTICA cuando cierra sesión
    if (onCancelar) {
      onCancelar();
    }
  };

  // Pantalla de carga
  if (verificando) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Verificando acceso a RRHH...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar modal
  if (!autenticado) {
    return (
      <ModalLoginRRHH
        mostrar={mostrarModal}
        onLoginExitoso={handleLoginExitoso}
        onCancelar={handleCancelar}
      />
    );
  }

  // Si está autenticado, renderizar contenido con header
  return (
    <div style={styles.container}>
      {/* Header de sesión RRHH */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.badge}>🔐 Módulo Protegido</span>
          {usuarioRRHH && (
            <span style={styles.usuario}>
              👤 {usuarioRRHH.nombres || usuarioRRHH.usuario || 'Usuario RRHH'}
            </span>
          )}
        </div>
        <button 
          onClick={handleCerrarSesion}
          style={styles.btnCerrarSesion}
          title="Cerrar sesión de RRHH (mantiene la sesión principal)"
        >
          🚪 Cerrar Sesión RRHH
        </button>
      </div>

      {/* Contenido protegido */}
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    backgroundColor: 'white',
    padding: '12px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '3px solid #667eea'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  badge: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  usuario: {
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  btnCerrarSesion: {
    backgroundColor: '#ff5252',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  content: {
    padding: '0'
  }
};

// Agregar animación de spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProtectedRRHH;
