import React from 'react';
import './DashboardStats.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardStats = ({ dashboardData, error }) => {
  const stats = dashboardData?.stats || {};
  const charts = dashboardData?.charts || {};

  // Datos para gráfico de líneas - Movimientos por mes (DATOS REALES)
  const movimientosData = {
    labels: charts.movimientos_por_mes?.labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ingresos',
        data: charts.movimientos_por_mes?.ingresos || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Salidas',
        data: charts.movimientos_por_mes?.salidas || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Datos para gráfico de barras - Productos por familia (DATOS REALES)
  const productosPorFamiliaData = {
    labels: charts.productos_por_familia?.labels || ['Sin datos'],
    datasets: [
      {
        label: 'Productos',
        data: charts.productos_por_familia?.data || [0],
        backgroundColor: [
          'rgba(74, 144, 226, 0.8)',
          'rgba(39, 174, 96, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(149, 165, 166, 0.8)'
        ],
        borderColor: [
          '#4a90e2',
          '#27ae60',
          '#f1c40f',
          '#9b59b6',
          '#e74c3c',
          '#95a5a6'
        ],
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico circular - Distribución de inventario (DATOS REALES)
  const inventarioPorBodegaData = {
    labels: charts.inventario_por_bodega?.labels || ['Sin datos'],
    datasets: [
      {
        label: 'Items',
        data: charts.inventario_por_bodega?.data || [0],
        backgroundColor: [
          'rgba(74, 144, 226, 0.8)',
          'rgba(39, 174, 96, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(155, 89, 182, 0.8)'
        ],
        borderColor: [
          '#4a90e2',
          '#27ae60',
          '#f1c40f',
          '#9b59b6'
        ],
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico de dona - Estado de proyectos (DATOS REALES)
  const estadoProyectosData = {
    labels: charts.proyectos_por_estado?.labels || ['Sin datos'],
    datasets: [
      {
        label: 'Proyectos',
        data: charts.proyectos_por_estado?.data || [0],
        backgroundColor: [
          'rgba(39, 174, 96, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(74, 144, 226, 0.8)',
          'rgba(231, 76, 60, 0.8)'
        ],
        borderColor: [
          '#27ae60',
          '#f1c40f',
          '#4a90e2',
          '#e74c3c'
        ],
        borderWidth: 2
      }
    ]
  };

  // Calcular total de proyectos para el subtítulo
  const totalProyectos = charts.proyectos_por_estado?.data?.reduce((a, b) => a + b, 0) || 0;

  // Opciones comunes para los gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }
        }
      }
    }
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="dashboard-stats-container">
      {error && (
        <div className="alert-warning-stats">
          ⚠️ {error}
        </div>
      )}

      {/* Sección de Estadísticas del Sistema */}
      <div className="stats-section-wrapper">
        <h2 className="section-title">Estadísticas del Sistema</h2>
        
        <div className="stats-cards-grid-figma">
          {/* Tarjeta Azul - Productos Registrados */}
          <div className="stat-card-figma blue-card">
            <div className="stat-card-content">
              <div className="stat-icon-figma">📦</div>
              <div className="stat-info-figma">
                <h3>{stats.productos_registrados || 267}</h3>
                <p>Productos Registrados</p>
              </div>
            </div>
          </div>

          {/* Tarjeta Verde - Proyectos Activos */}
          <div className="stat-card-figma green-card">
            <div className="stat-card-content">
              <div className="stat-icon-figma">📋</div>
              <div className="stat-info-figma">
                <h3>{stats.proyectos_activos || 10}</h3>
                <p>Proyectos Activos</p>
              </div>
            </div>
          </div>

          {/* Tarjeta Morada - Movimientos este mes */}
          <div className="stat-card-figma purple-card">
            <div className="stat-card-content">
              <div className="stat-icon-figma">📈</div>
              <div className="stat-info-figma">
                <h3>{stats.movimientos_mes || 17}</h3>
                <p>Movimientos este mes</p>
              </div>
            </div>
          </div>

          {/* Tarjeta Naranja - Personal Activo */}
          <div className="stat-card-figma orange-card">
            <div className="stat-card-content">
              <div className="stat-icon-figma">👥</div>
              <div className="stat-info-figma">
                <h3>{stats.personal_activo || 1}</h3>
                <p>Personal Activo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Actividad Reciente */}
      <div className="activity-section-wrapper">
        <h2 className="section-title">Actividad Reciente</h2>
        
        <div className="activity-list-figma">
          <div className="activity-item-figma">
            <div className="activity-icon-figma">📥</div>
            <div className="activity-info-figma">
              <h4>Ingreso de materiales</h4>
              <p>Se registraron 50 unidades de cemento</p>
            </div>
          </div>

          <div className="activity-item-figma">
            <div className="activity-icon-figma">📝</div>
            <div className="activity-info-figma">
              <h4>Nueva orden de compra</h4>
              <p>OC-2025-001 creada para proveedor ABC</p>
            </div>
          </div>

          <div className="activity-item-figma">
            <div className="activity-icon-figma">✅</div>
            <div className="activity-info-figma">
              <h4>Orden aprobada</h4>
              <p>OC-2025-002 aprobada y enviada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className="charts-grid-stats">
        {/* Gráfico de líneas - Movimientos */}
        <div className="chart-card-stats large">
          <div className="chart-header-stats">
            <h3>📊 Movimientos de Inventario</h3>
            <span className="chart-subtitle-stats">Últimos 12 meses</span>
          </div>
          <div className="chart-body-stats">
            <Line data={movimientosData} options={lineOptions} />
          </div>
        </div>

        {/* Gráfico de barras - Productos por familia */}
        <div className="chart-card-stats medium">
          <div className="chart-header-stats">
            <h3>📦 Productos por Familia</h3>
            <span className="chart-subtitle-stats">Distribución actual</span>
          </div>
          <div className="chart-body-stats">
            <Bar data={productosPorFamiliaData} options={commonOptions} />
          </div>
        </div>

        {/* Gráfico circular - Inventario por bodega */}
        <div className="chart-card-stats small">
          <div className="chart-header-stats">
            <h3>🏭 Inventario por Bodega</h3>
            <span className="chart-subtitle-stats">% de distribución</span>
          </div>
          <div className="chart-body-stats">
            <Pie data={inventarioPorBodegaData} options={commonOptions} />
          </div>
        </div>

        {/* Gráfico de dona - Estado de proyectos */}
        <div className="chart-card-stats small">
          <div className="chart-header-stats">
            <h3>🎯 Estado de Proyectos</h3>
            <span className="chart-subtitle-stats">Total: {totalProyectos}</span>
          </div>
          <div className="chart-body-stats">
            <Doughnut data={estadoProyectosData} options={commonOptions} />
          </div>
        </div>
      </div>

      {/* Sección de actividad y alertas */}
      <div className="activity-alerts-grid-stats">
        {/* Actividad reciente */}
        <div className="activity-section-stats">
          <h3>🕐 Actividad Reciente</h3>
          <div className="activity-list-stats">
            {dashboardData?.recent_activity?.length > 0 ? (
              dashboardData.recent_activity.map((activity, index) => (
                <div key={index} className="activity-item-stats">
                  <div className="activity-icon-stats">{activity.icon}</div>
                  <div className="activity-info-stats">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span className="activity-time-stats">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="activity-item-stats">
                  <div className="activity-icon-stats">📥</div>
                  <div className="activity-info-stats">
                    <h4>Ingreso de materiales</h4>
                    <p>Se registró el ingreso de 15 items al almacén</p>
                    <span className="activity-time-stats">Hace 2 horas</span>
                  </div>
                </div>
                <div className="activity-item-stats">
                  <div className="activity-icon-stats">📦</div>
                  <div className="activity-info-stats">
                    <h4>Nuevo producto registrado</h4>
                    <p>Producto HERR-MANU-0045 agregado al catálogo</p>
                    <span className="activity-time-stats">Hace 5 horas</span>
                  </div>
                </div>
                <div className="activity-item-stats">
                  <div className="activity-icon-stats">📋</div>
                  <div className="activity-info-stats">
                    <h4>Orden de compra aprobada</h4>
                    <p>OC-2025-00123 aprobada y lista para procesar</p>
                    <span className="activity-time-stats">Ayer</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="alerts-section-stats">
          <h3>⚠️ Alertas del Sistema</h3>
          <div className="alerts-list-stats">
            {dashboardData?.alerts?.length > 0 ? (
              dashboardData.alerts.map((alert, index) => (
                <div key={index} className={`alert-item-stats ${alert.type}`}>
                  <div className="alert-icon-stats">{alert.icon}</div>
                  <div className="alert-info-stats">
                    <h4>{alert.title}</h4>
                    <p>{alert.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert-item-stats success">
                <div className="alert-icon-stats">✅</div>
                <div className="alert-info-stats">
                  <h4>Sistema operativo</h4>
                  <p>No hay alertas pendientes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
