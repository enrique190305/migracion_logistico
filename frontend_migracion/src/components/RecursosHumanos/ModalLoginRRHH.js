import React, { useState } from 'react';
import { loginRRHH } from '../../services/rrhh.service';
import './ModalLoginRRHH.css';

/**
 * Modal de Re-autenticación para el módulo de Recursos Humanos
 * 
 * Este modal aparece cuando el usuario intenta acceder a RRHH
 * y solicita credenciales de la BD bappasistencia
 */
const ModalLoginRRHH = ({ onLoginExitoso, onCancelar, mostrar }) => {
  const [credenciales, setCredenciales] = useState({
    usuario: '',
    contrasena: ''
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciales(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      console.log('🔐 Intentando login RRHH con:', credenciales.usuario);
      
      const resultado = await loginRRHH(credenciales.usuario, credenciales.contrasena);
      
      if (resultado.success && resultado.jwt_token) {
        console.log('✅ Login RRHH exitoso');
        
        // Notificar éxito
        onLoginExitoso(resultado);
        
        // Limpiar formulario
        setCredenciales({ usuario: '', contrasena: '' });
      } else {
        setError('Credenciales inválidas o respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('❌ Error en login RRHH:', error);
      
      // Construir mensaje de error detallado
      let mensajeError = 'Error al conectar con el servidor de RRHH.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          mensajeError = '❌ Formato de credenciales incorrecto. Verifica usuario y contraseña.';
        } else if (status === 401) {
          mensajeError = '❌ Credenciales incorrectas. Verifica tu usuario y contraseña.';
        } else if (status === 404) {
          mensajeError = '❌ Endpoint de login no encontrado. Verifica la URL del API.';
        } else if (status === 500) {
          mensajeError = '❌ Error interno del servidor. Contacta al administrador.';
        } else {
          mensajeError = data?.message || data?.error || `Error ${status}: ${error.message}`;
        }
      } else if (error.request) {
        mensajeError = '❌ No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        mensajeError = error.message || 'Error desconocido';
      }
      
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = () => {
    setCredenciales({ usuario: '', contrasena: '' });
    setError('');
    onCancelar();
  };

  if (!mostrar) return null;

  return (
    <div className="modal-overlay" onClick={handleCancelar}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 Autenticación de Recursos Humanos</h2>
          <button className="modal-close" onClick={handleCancelar}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-info">
            <p>
              <strong>⚠️ Módulo Protegido</strong>
            </p>
            <p>
              Este módulo requiere autenticación adicional con la base de datos de RRHH.
              Ingresa tu <strong>número de documento</strong> y <strong>contraseña</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="usuario">Número de Documento (DNI)</label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                value={credenciales.usuario}
                onChange={handleChange}
                placeholder="Ingresa tu número de documento"
                required
                disabled={cargando}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                value={credenciales.contrasena}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                required
                disabled={cargando}
              />
            </div>

            {error && (
              <div className="modal-error">
                <span>❌</span> {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCancelar}
                className="btn-cancelar"
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-ingresar"
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <span className="spinner"></span> Verificando...
                  </>
                ) : (
                  '🔓 Ingresar a RRHH'
                )}
              </button>
            </div>
          </form>

          <div className="modal-footer">
            <small>
              💡 <strong>Nota:</strong> Usa tu número de documento (DNI) y contraseña de la base de datos RRHH (bappasistencia).
              Si no tienes acceso, contacta al administrador.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalLoginRRHH;
