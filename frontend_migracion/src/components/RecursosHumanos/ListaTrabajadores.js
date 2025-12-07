import React, { useState, useMemo } from 'react';
import './ListaTrabajadores.css';

const ListaTrabajadores = ({ trabajadores, asignaciones, onAsignarTurno, onGuardarIndividual, fechaSeleccionada }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('TODOS');
  const [ordenamiento, setOrdenamiento] = useState('ALFABETICO');
  const [guardandoId, setGuardandoId] = useState(null);

  // Filtrar y ordenar trabajadores
  const trabajadoresFiltrados = useMemo(() => {
    let resultado = [...trabajadores];

    // Filtro por búsqueda (nombre o DNI)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(t => 
        (t.nombres + ' ' + t.apellidos).toLowerCase().includes(busquedaLower) ||
        t.documento.includes(busqueda)
      );
    }

    // Filtro por turno
    if (filtroTurno !== 'TODOS') {
      resultado = resultado.filter(t => {
        const turnoAsignado = asignaciones[t.id_usuario];
        if (filtroTurno === 'SIN_ASIGNAR') {
          return !turnoAsignado;
        }
        // Convertir filtro a número para comparar
        const filtroNumerico = filtroTurno === 'T1' ? 1 : filtroTurno === 'T2' ? 2 : filtroTurno === 'DESCANSO' ? 3 : null;
        return turnoAsignado === filtroNumerico;
      });
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      if (ordenamiento === 'ALFABETICO') {
        return (a.nombres + ' ' + a.apellidos).localeCompare(b.nombres + ' ' + b.apellidos);
      } else if (ordenamiento === 'DNI') {
        return a.documento.localeCompare(b.documento);
      } else if (ordenamiento === 'TURNO') {
        // Comparar IDs numéricos, sin asignar al final
        const turnoA = asignaciones[a.id_usuario] || 999;
        const turnoB = asignaciones[b.id_usuario] || 999;
        return turnoA - turnoB;
      }
      return 0;
    });

    return resultado;
  }, [trabajadores, busqueda, filtroTurno, ordenamiento, asignaciones]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleFiltroChange = (e) => {
    setFiltroTurno(e.target.value);
  };

  const handleOrdenamientoChange = (e) => {
    setOrdenamiento(e.target.value);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTurno('TODOS');
    setOrdenamiento('ALFABETICO');
  };

  return (
    <div className="lista-trabajadores-container">
      {/* Barra de filtros */}
      <div className="filtros-container">
        <div className="filtro-item filtro-busqueda">
          <label htmlFor="busqueda">🔍 Buscar:</label>
          <input
            type="text"
            id="busqueda"
            placeholder="Nombre o DNI..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="input-busqueda"
          />
        </div>

        <div className="filtro-item">
          <label htmlFor="filtroTurno">🎯 Filtrar por:</label>
          <select
            id="filtroTurno"
            value={filtroTurno}
            onChange={handleFiltroChange}
            className="select-filtro"
          >
            <option value="TODOS">Todos</option>
            <option value="T1">Solo T1</option>
            <option value="T2">Solo T2</option>
            <option value="DESCANSO">Solo Descanso</option>
            <option value="SIN_ASIGNAR">Sin Asignar</option>
          </select>
        </div>

        <div className="filtro-item">
          <label htmlFor="ordenamiento">📊 Ordenar por:</label>
          <select
            id="ordenamiento"
            value={ordenamiento}
            onChange={handleOrdenamientoChange}
            className="select-filtro"
          >
            <option value="ALFABETICO">Alfabético (A-Z)</option>
            <option value="DNI">Por DNI</option>
            <option value="TURNO">Por Turno</option>
          </select>
        </div>

        {(busqueda || filtroTurno !== 'TODOS' || ordenamiento !== 'ALFABETICO') && (
          <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
            🗑️ Limpiar
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="resultados-info">
        <span className="resultados-texto">
          📋 Mostrando <strong>{trabajadoresFiltrados.length}</strong> de <strong>{trabajadores.length}</strong> trabajadores
        </span>
      </div>

      {/* Lista de trabajadores */}
      <div className="trabajadores-lista">
        {trabajadoresFiltrados.length === 0 ? (
          <div className="sin-resultados">
            <div className="sin-resultados-icon">🔍</div>
            <p className="sin-resultados-texto">No se encontraron trabajadores</p>
            <button className="btn-limpiar-filtros-small" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          trabajadoresFiltrados.map((trabajador) => {
            const turnoActual = asignaciones[trabajador.id_usuario];
            const estaGuardando = guardandoId === trabajador.id_usuario;

            const handleGuardarIndividual = async () => {
              if (!turnoActual) {
                alert('⚠️ Debes seleccionar un turno antes de guardar');
                return;
              }
              
              setGuardandoId(trabajador.id_usuario);
              try {
                await onGuardarIndividual(trabajador.id_usuario, turnoActual);
              } finally {
                setGuardandoId(null);
              }
            };

            return (
              <div key={trabajador.id} className="trabajador-card">
                <div className="trabajador-info">
                  <div className="trabajador-numero">#{trabajador.id}</div>
                  <div className="trabajador-datos">
                    <div className="trabajador-nombre">{trabajador.nombres} {trabajador.apellidos}</div>
                    <div className="trabajador-documento">DNI: {trabajador.documento}</div>
                  </div>
                </div>

                <div className="trabajador-turnos">
                  <button
                    className={`btn-turno btn-turno-t1 ${turnoActual === 1 ? 'turno-activo' : ''}`}
                    onClick={() => onAsignarTurno(trabajador.id_usuario, 1)}
                    title="Asignar Turno 1"
                    disabled={estaGuardando}
                  >
                    ☀️ T1
                  </button>

                  <button
                    className={`btn-turno btn-turno-t2 ${turnoActual === 2 ? 'turno-activo' : ''}`}
                    onClick={() => onAsignarTurno(trabajador.id_usuario, 2)}
                    title="Asignar Turno 2"
                    disabled={estaGuardando}
                  >
                    🌙 T2
                  </button>

                  <button
                    className={`btn-turno btn-turno-descanso ${turnoActual === 3 ? 'turno-activo' : ''}`}
                    onClick={() => onAsignarTurno(trabajador.id_usuario, 3)}
                    title="Asignar Descanso"
                    disabled={estaGuardando}
                  >
                    😴 Descanso
                  </button>

                  <button
                    className="btn-guardar-individual"
                    onClick={handleGuardarIndividual}
                    disabled={estaGuardando || !turnoActual}
                    title="Guardar turno de este trabajador"
                  >
                    {estaGuardando ? '⏳' : '💾'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ListaTrabajadores;
