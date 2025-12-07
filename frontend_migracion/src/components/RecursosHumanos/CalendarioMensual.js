import React, { useState } from 'react';
import './CalendarioMensual.css';

const CalendarioMensual = ({ fechaActual, onFechaSelect, asignacionesMes }) => {
  const [mesActual, setMesActual] = useState(new Date(fechaActual));

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getPrimerDiaMes = () => {
    const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    return fecha.getDay();
  };

  const getDiasEnMes = () => {
    return new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevoMes);
  };

  const formatearFecha = (dia) => {
    const year = mesActual.getFullYear();
    const month = String(mesActual.getMonth() + 1).padStart(2, '0');
    const day = String(dia).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const obtenerColorDia = (fecha) => {
    const asignaciones = asignacionesMes[fecha];
    if (!asignaciones || Object.keys(asignaciones).length === 0) {
      return 'sin-asignar';
    }

    // Contar turnos
    const turnos = Object.values(asignaciones);
    const t1Count = turnos.filter(t => t === 'T1').length;
    const t2Count = turnos.filter(t => t === 'T2').length;
    const descansoCount = turnos.filter(t => t === 'DESCANSO').length;

    // Determinar color predominante
    const max = Math.max(t1Count, t2Count, descansoCount);
    if (max === 0) return 'sin-asignar';
    if (t1Count === max) return 'mayoria-t1';
    if (t2Count === max) return 'mayoria-t2';
    return 'mayoria-descanso';
  };

  const esFechaActual = (dia) => {
    const fecha = formatearFecha(dia);
    return fecha === fechaActual;
  };

  const esFechaHoy = (dia) => {
    const hoy = new Date();
    return (
      dia === hoy.getDate() &&
      mesActual.getMonth() === hoy.getMonth() &&
      mesActual.getFullYear() === hoy.getFullYear()
    );
  };

  const renderDias = () => {
    const primerDia = getPrimerDiaMes();
    const totalDias = getDiasEnMes();
    const dias = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < primerDia; i++) {
      dias.push(
        <div key={`empty-${i}`} className="calendario-dia calendario-dia-vacio"></div>
      );
    }

    // Días del mes
    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = formatearFecha(dia);
      const colorClass = obtenerColorDia(fecha);
      const isActual = esFechaActual(dia);
      const isHoy = esFechaHoy(dia);

      dias.push(
        <div
          key={dia}
          className={`calendario-dia ${colorClass} ${isActual ? 'dia-seleccionado' : ''} ${isHoy ? 'dia-hoy' : ''}`}
          onClick={() => onFechaSelect(fecha)}
          title={`Seleccionar ${dia}/${mesActual.getMonth() + 1}/${mesActual.getFullYear()}`}
        >
          <span className="numero-dia">{dia}</span>
          {isHoy && <span className="badge-hoy">Hoy</span>}
        </div>
      );
    }

    return dias;
  };

  return (
    <div className="calendario-mensual-container">
      <div className="calendario-header">
        <button className="btn-mes" onClick={() => cambiarMes(-1)} title="Mes anterior">
          ◀
        </button>
        <h3 className="calendario-titulo">
          📅 {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
        </h3>
        <button className="btn-mes" onClick={() => cambiarMes(1)} title="Mes siguiente">
          ▶
        </button>
      </div>

      <div className="calendario-dias-semana">
        {diasSemana.map(dia => (
          <div key={dia} className="dia-semana">
            {dia}
          </div>
        ))}
      </div>

      <div className="calendario-grid">
        {renderDias()}
      </div>

      <div className="calendario-leyenda">
        <div className="leyenda-item">
          <span className="leyenda-color leyenda-t1"></span>
          <span className="leyenda-texto">Mayoría T1</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color leyenda-t2"></span>
          <span className="leyenda-texto">Mayoría T2</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color leyenda-descanso"></span>
          <span className="leyenda-texto">Mayoría Descanso</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color leyenda-sin-asignar"></span>
          <span className="leyenda-texto">Sin asignar</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarioMensual;
