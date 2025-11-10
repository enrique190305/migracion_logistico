import React, { useRef, useState, useEffect } from 'react';
import './SignatureCanvas.css';

const SignatureCanvas = ({ onSave, onCancel, initialSignature }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [context, setContext] = useState(null);

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      setContext(ctx);

      // Configurar canvas
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000000';

      // Llenar fondo blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Si hay una firma inicial, dibujarla
      if (initialSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setIsEmpty(false);
        };
        img.src = initialSignature;
      }
    }
  }, [initialSignature]);

  // Obtener posición del mouse/touch relativa al canvas
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      // Touch event
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  // Iniciar dibujo
  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setIsEmpty(false);

    const pos = getMousePos(e);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  // Dibujar
  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const pos = getMousePos(e);
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  // Terminar dibujo
  const stopDrawing = (e) => {
    e.preventDefault();
    if (isDrawing) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  // Limpiar canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  // Guardar firma
  const saveSignature = () => {
    if (isEmpty) {
      alert('Por favor, dibuja tu firma antes de guardar');
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="signature-canvas-container">
      <div className="signature-canvas-header">
        <h3>✍️ Dibuja tu Firma</h3>
        <p className="signature-help">Usa el mouse o tu dedo para firmar</p>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="signature-canvas-actions">
        <button
          type="button"
          className="btn-clear-canvas"
          onClick={clearCanvas}
        >
          🗑️ Limpiar
        </button>
        <button
          type="button"
          className="btn-cancel-canvas"
          onClick={onCancel}
        >
          ✕ Cancelar
        </button>
        <button
          type="button"
          className="btn-save-canvas"
          onClick={saveSignature}
          disabled={isEmpty}
        >
          ✓ Guardar Firma
        </button>
      </div>
    </div>
  );
};

export default SignatureCanvas;
