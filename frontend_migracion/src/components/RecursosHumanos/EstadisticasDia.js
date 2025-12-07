import React from 'react';
import './EstadisticasDia.css';

const EstadisticasDia = ({ asignaciones, totalTrabajadores, estadisticas }) => {
  // SIEMPRE calcular desde asignaciones locales para reflejar cambios en tiempo real
  const calcularEstadisticas = () => {
    const stats = {
      t1: 0,
      t2: 0,
      descanso: 0,
      sinAsignar: 0
    };

    Object.values(asignaciones).forEach(turno => {
      // Comparar con IDs numéricos (1=T1, 2=T2, 3=Descanso)
      if (turno === 1) stats.t1++;
      else if (turno === 2) stats.t2++;
      else if (turno === 3) stats.descanso++;
    });

    stats.sinAsignar = totalTrabajadores - (stats.t1 + stats.t2 + stats.descanso);

    return stats;
  };

  const stats = calcularEstadisticas();

  const calcularPorcentaje = (cantidad) => {
    return totalTrabajadores > 0 ? ((cantidad / totalTrabajadores) * 100).toFixed(1) : 0;
  };

  return (
    <div className="estadisticas-dia-container">
      <div className="estadisticas-header">
        <h3>📊 Resumen del Día</h3>
      </div>
      
      <div className="estadisticas-grid">
        <div className="stat-card stat-t1">
          <div className="stat-icon">☀️</div>
          <div className="stat-content">
            <div className="stat-label">Turno 1 (T1)</div>
            <div className="stat-value">{stats.t1}</div>
            <div className="stat-percentage">{calcularPorcentaje(stats.t1)}%</div>
          </div>
        </div>

        <div className="stat-card stat-t2">
          <div className="stat-icon">🌙</div>
          <div className="stat-content">
            <div className="stat-label">Turno 2 (T2)</div>
            <div className="stat-value">{stats.t2}</div>
            <div className="stat-percentage">{calcularPorcentaje(stats.t2)}%</div>
          </div>
        </div>

        <div className="stat-card stat-descanso">
          <div className="stat-icon">😴</div>
          <div className="stat-content">
            <div className="stat-label">Descanso</div>
            <div className="stat-value">{stats.descanso}</div>
            <div className="stat-percentage">{calcularPorcentaje(stats.descanso)}%</div>
          </div>
        </div>

        <div className="stat-card stat-sin-asignar">
          <div className="stat-icon">❓</div>
          <div className="stat-content">
            <div className="stat-label">Sin Asignar</div>
            <div className="stat-value">{stats.sinAsignar}</div>
            <div className="stat-percentage">{calcularPorcentaje(stats.sinAsignar)}%</div>
          </div>
        </div>
      </div>

      <div className="estadisticas-footer">
        <div className="total-trabajadores">
          <span className="total-icon">👥</span>
          <span className="total-label">Total:</span>
          <span className="total-value">{totalTrabajadores} trabajadores</span>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasDia;
