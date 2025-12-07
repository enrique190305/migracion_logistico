import React from 'react';
import { verificarSesionRRHH, obtenerUsuarioRRHH, cerrarSesionRRHH } from '../../services/rrhh.service';

/**
 * Componente de diagnóstico rápido para verificar el sistema de login dual
 * Agrega este componente temporalmente en cualquier vista para hacer pruebas
 */
const DiagnosticoDual = () => {
  const [info, setInfo] = React.useState(null);

  const verificarEstado = () => {
    const estado = {
      timestamp: new Date().toLocaleString(),
      token_principal: localStorage.getItem('jwt_token') ? '✅ Presente' : '❌ No existe',
      token_rrhh: localStorage.getItem('jwt_token_rrhh') ? '✅ Presente' : '❌ No existe',
      sesion_rrhh_activa: verificarSesionRRHH() ? '✅ Activa' : '❌ Inactiva',
      usuario_rrhh: obtenerUsuarioRRHH() || 'No hay usuario',
      tokens: {
        principal: localStorage.getItem('jwt_token')?.substring(0, 30) + '...',
        rrhh: localStorage.getItem('jwt_token_rrhh')?.substring(0, 30) + '...'
      }
    };
    setInfo(estado);
    console.log('📊 Estado del Sistema Dual:', estado);
  };

  const limpiarTodo = () => {
    cerrarSesionRRHH();
    alert('✅ Sesión RRHH cerrada (sesión principal intacta)');
    verificarEstado();
  };

  React.useEffect(() => {
    verificarEstado();
  }, []);

  if (!info) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔧 Diagnóstico Sistema Dual</h3>
      
      <div style={styles.grid}>
        <InfoCard label="Token Principal (oc_compra)" value={info.token_principal} />
        <InfoCard label="Token RRHH (bappasistencia)" value={info.token_rrhh} />
        <InfoCard label="Sesión RRHH" value={info.sesion_rrhh_activa} />
        <InfoCard 
          label="Usuario RRHH" 
          value={info.usuario_rrhh?.nombres || info.usuario_rrhh?.usuario || 'N/A'} 
        />
      </div>

      <div style={styles.actions}>
        <button onClick={verificarEstado} style={styles.btn}>
          🔄 Refrescar Estado
        </button>
        <button onClick={limpiarTodo} style={{ ...styles.btn, backgroundColor: '#dc3545' }}>
          🗑️ Cerrar Sesión RRHH
        </button>
      </div>

      <details style={styles.details}>
        <summary style={styles.summary}>Ver JSON Completo</summary>
        <pre style={styles.json}>{JSON.stringify(info, null, 2)}</pre>
      </details>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div style={styles.card}>
    <div style={styles.label}>{label}</div>
    <div style={styles.value}>{value}</div>
  </div>
);

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 9998,
    maxWidth: '500px',
    border: '3px solid #667eea'
  },
  title: {
    margin: '0 0 15px 0',
    color: '#333',
    borderBottom: '2px solid #667eea',
    paddingBottom: '10px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '15px'
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  label: {
    fontSize: '0.8rem',
    color: '#666',
    marginBottom: '5px'
  },
  value: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#333'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  btn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  details: {
    marginTop: '10px'
  },
  summary: {
    cursor: 'pointer',
    padding: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  json: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    overflow: 'auto',
    maxHeight: '200px'
  }
};

export default DiagnosticoDual;
