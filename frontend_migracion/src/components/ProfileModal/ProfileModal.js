import React, { useState, useRef } from 'react';
import { authService } from '../../services/authService';
import SignatureCanvas from './SignatureCanvas';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    contraseña: '',
    confirmarContraseña: ''
  });
  
  const [firma, setFirma] = useState(null);
  const [firmaPreview, setFirmaPreview] = useState(user?.firma || null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Actualizar firmaPreview cuando el modal se abre o cambia el usuario
  React.useEffect(() => {
    if (isOpen) {
      setFirmaPreview(user?.firma || null);
      setFormData({
        nombre: user?.nombre || '',
        contraseña: '',
        confirmarContraseña: ''
      });
      setFirma(null);
      setShowCanvas(false);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, user]);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Eliminar firma
  const handleRemoveSignature = () => {
    setFirma('');
    setFirmaPreview(null);
    setShowCanvas(false);
  };

  // Manejar guardado de firma desde canvas
  const handleSaveCanvasSignature = (signatureData) => {
    setFirma(signatureData);
    setFirmaPreview(signatureData);
    setShowCanvas(false);
    setError(null);
  };

  // Cancelar dibujo de firma
  const handleCancelCanvas = () => {
    setShowCanvas(false);
  };

  // Abrir canvas para dibujar
  const handleDrawSignature = () => {
    setShowCanvas(true);
  };

  // Validar formulario
  const validateForm = () => {
    // Validar que al menos un campo tenga datos
    if (!formData.nombre.trim() && !formData.contraseña && !firma && firma !== '') {
      setError('Debes modificar al menos un campo');
      return false;
    }

    // Validar contraseña si se proporcionó
    if (formData.contraseña) {
      if (formData.contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      if (formData.contraseña !== formData.confirmarContraseña) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }

    return true;
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para enviar
      const updateData = {};

      if (formData.nombre.trim() && formData.nombre !== user?.nombre) {
        updateData.nombre = formData.nombre.trim();
      }

      if (formData.contraseña) {
        updateData.contraseña = formData.contraseña;
      }

      if (firma !== null) {
        updateData.firma = firma;
      }

      // Enviar actualización
      const result = await authService.updateProfile(updateData);

      if (result.success) {
        setSuccessMessage('¡Perfil actualizado exitosamente!');
        
        // Notificar al componente padre
        if (onProfileUpdated) {
          onProfileUpdated(result.user);
        }

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          onClose();
          // Resetear formulario
          setFormData({
            nombre: result.user.nombre,
            contraseña: '',
            confirmarContraseña: ''
          });
          setFirma(null);
          setSuccessMessage(null);
        }, 1500);
      } else {
        setError(result.message || 'Error al actualizar perfil');
      }
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError('Error inesperado al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccessMessage(null);
      setShowCanvas(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={handleClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-modal-title">
            <span className="profile-icon">👤</span>
            <h2>Editar Perfil</h2>
          </div>
          <button 
            className="profile-modal-close" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="profile-alert profile-alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="profile-alert profile-alert-success">
            <span className="alert-icon">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form className="profile-modal-form" onSubmit={handleSubmit}>
          {/* Usuario (solo lectura) */}
          <div className="profile-form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={user?.usuario || ''}
              disabled
              className="profile-input disabled"
            />
            <small className="profile-help-text">El nombre de usuario no se puede modificar</small>
          </div>

          {/* Nombre */}
          <div className="profile-form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ingrese su nombre completo"
              disabled={isLoading}
              className="profile-input"
            />
          </div>

          {/* Contraseña */}
          <div className="profile-form-group">
            <label htmlFor="contraseña">Nueva Contraseña</label>
            <div className="profile-password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="contraseña"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                placeholder="Dejar en blanco para no cambiar"
                disabled={isLoading}
                className="profile-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <small className="profile-help-text">Mínimo 6 caracteres</small>
          </div>

          {/* Confirmar Contraseña */}
          {formData.contraseña && (
            <div className="profile-form-group">
              <label htmlFor="confirmarContraseña">Confirmar Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmarContraseña"
                name="confirmarContraseña"
                value={formData.confirmarContraseña}
                onChange={handleInputChange}
                placeholder="Confirme la nueva contraseña"
                disabled={isLoading}
                className="profile-input"
              />
            </div>
          )}

          {/* Firma */}
          <div className="profile-form-group">
            <label>Firma Digital</label>
            
            {/* Mostrar canvas si está activo */}
            {showCanvas ? (
              <SignatureCanvas
                onSave={handleSaveCanvasSignature}
                onCancel={handleCancelCanvas}
                initialSignature={null}
              />
            ) : firmaPreview ? (
              /* Mostrar preview de firma existente */
              <div className="signature-preview-container">
                <div className="signature-current-label">
                  <span>✅</span>
                  <span>Firma actual guardada</span>
                </div>
                <img 
                  src={firmaPreview} 
                  alt="Firma actual" 
                  className="signature-preview"
                />
                <div className="signature-actions-simple">
                  <button
                    type="button"
                    className="btn-action-signature btn-redraw"
                    onClick={handleDrawSignature}
                    disabled={isLoading}
                  >
                    ✍️ Cambiar Firma
                  </button>
                  <button
                    type="button"
                    className="btn-action-signature btn-remove"
                    onClick={handleRemoveSignature}
                    disabled={isLoading}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ) : (
              /* Mostrar botón para dibujar firma */
              <div className="signature-empty-container">
                <button
                  type="button"
                  className="btn-draw-signature-main"
                  onClick={handleDrawSignature}
                  disabled={isLoading}
                >
                  <span className="draw-icon">✍️</span>
                  <span className="draw-title">Dibujar Firma</span>
                  <span className="draw-desc">Usa el mouse o tu dedo para firmar</span>
                </button>
              </div>
            )}

            {!showCanvas && (
              <small className="profile-help-text">
                {firmaPreview 
                  ? 'Puedes redibujar tu firma cuando lo desees' 
                  : 'Dibuja tu firma para documentos oficiales'}
              </small>
            )}
          </div>

          {/* Botones */}
          <div className="profile-modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Guardando...
                </>
              ) : (
                <>
                  💾 Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
