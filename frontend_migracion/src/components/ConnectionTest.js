import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [message, setMessage] = useState('Probando conexión...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await authService.testConnection();
        
        if (result.success) {
          setConnectionStatus('success');
          setMessage('✅ Conexión exitosa con el backend');
        } else {
          setConnectionStatus('error');
          setMessage('❌ ' + result.message);
        }
      } catch (error) {
        setConnectionStatus('error');
        setMessage('❌ Error crítico: ' + error.message);
      }
    };

    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      default: return '#ff9800';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 16px',
      backgroundColor: 'white',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 9999,
      fontSize: '14px',
      maxWidth: '300px'
    }}>
      <div style={{ color: getStatusColor(), fontWeight: 'bold' }}>
        Estado del Backend
      </div>
      <div style={{ color: '#666', marginTop: '4px' }}>
        {message}
      </div>
    </div>
  );
};

export default ConnectionTest;