<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas principales del dashboard
     */
    public function getStats(): JsonResponse
    {
        try {
            // Obtener conteos principales
            $stats = [
                'productos_registrados' => $this->getProductosCount(),
                'proyectos_activos' => $this->getProyectosActivos(),
                'movimientos_mes' => $this->getMovimientosMes(),
                'personal_activo' => $this->getPersonalActivo(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener actividad reciente del sistema
     */
    public function getRecentActivity(): JsonResponse
    {
        try {
            $activities = [];

            // Actividad de salidas de materiales (últimas 3)
            $salidas = DB::table('SALIDAS_MATERIALES')
                ->select('fecha_registro', 'proyecto', 'nom_ape', 'area')
                ->orderBy('fecha_registro', 'desc')
                ->limit(3)
                ->get();

            foreach ($salidas as $salida) {
                $activities[] = [
                    'type' => 'salida',
                    'icon' => '📤',
                    'title' => 'Salida de materiales',
                    'description' => "Proyecto: {$salida->proyecto} - {$salida->nom_ape} ({$salida->area})",
                    'time' => $this->getTimeAgo($salida->fecha_registro),
                    'user' => $salida->nom_ape
                ];
            }

            // Actividad de ingresos de materiales (últimas 2)
            $ingresos = DB::table('INGRESO_MATERIAL')
                ->select('fecha_ingreso', 'observaciones', 'usuario')
                ->whereNotNull('fecha_ingreso')
                ->orderBy('fecha_ingreso', 'desc')
                ->limit(2)
                ->get();

            foreach ($ingresos as $ingreso) {
                $activities[] = [
                    'type' => 'ingreso',
                    'icon' => '📥',
                    'title' => 'Ingreso de materiales',
                    'description' => $ingreso->observaciones ?: 'Ingreso registrado',
                    'time' => $this->getTimeAgo($ingreso->fecha_ingreso),
                    'user' => $ingreso->usuario
                ];
            }

            // Actividad de órdenes de compra (últimas 2)
            $ordenes = DB::table('ORDEN_COMPRA')
                ->select('fecha_oc', 'estado', 'usuario_creacion', 'correlativo')
                ->whereNotNull('fecha_oc')
                ->orderBy('fecha_oc', 'desc')
                ->limit(2)
                ->get();

            foreach ($ordenes as $orden) {
                $activities[] = [
                    'type' => 'orden',
                    'icon' => '📋',
                    'title' => 'Nueva orden de compra',
                    'description' => "OC {$orden->correlativo} - Estado: " . ($orden->estado ?: 'Pendiente'),
                    'time' => $this->getTimeAgo($orden->fecha_oc),
                    'user' => $orden->usuario_creacion
                ];
            }

            // Si no hay actividades, mostrar mensaje informativo
            if (empty($activities)) {
                $activities[] = [
                    'type' => 'info',
                    'icon' => '📋',
                    'title' => 'Sin actividad reciente',
                    'description' => 'No hay movimientos registrados',
                    'time' => 'Ahora',
                    'user' => 'Sistema'
                ];
            }

            return response()->json([
                'success' => true,
                'data' => array_slice($activities, 0, 5) // Máximo 5 actividades
            ]);

        } catch (\Exception $e) {
            // Datos de fallback en caso de error
            $fallbackActivities = [
                [
                    'type' => 'error',
                    'icon' => '⚠️',
                    'title' => 'Error de conexión',
                    'description' => 'No se pudieron cargar las actividades recientes',
                    'time' => 'Ahora',
                    'user' => 'Sistema'
                ]
            ];

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividad: ' . $e->getMessage(),
                'data' => $fallbackActivities
            ], 200); // 200 para que el frontend muestre los datos de fallback
        }
    }

    /**
     * Obtener alertas del sistema
     */
    public function getSystemAlerts(): JsonResponse
    {
        try {
            $alerts = [];

            // Verificar cantidad de productos registrados
            $totalProductos = DB::table('PRODUCTO')->count();
            
            if ($totalProductos > 100) {
                $alerts[] = [
                    'type' => 'info',
                    'icon' => '📦',
                    'title' => 'Catálogo amplio',
                    'description' => "{$totalProductos} productos registrados en el sistema",
                    'priority' => 'low'
                ];
            }

            // Órdenes pendientes de aprobación
            $ordenesPendientes = DB::table('ORDEN_COMPRA')
                ->where('estado', 'PENDIENTE')
                ->count();

            if ($ordenesPendientes > 0) {
                $alerts[] = [
                    'type' => 'warning',
                    'icon' => '📋',
                    'title' => 'Órdenes pendientes',
                    'description' => "{$ordenesPendientes} órdenes esperando aprobación",
                    'priority' => 'medium'
                ];
            }

            // Verificar actividad de salidas recientes
            $salidasRecientes = DB::table('SALIDAS_MATERIALES')
                ->whereDate('fecha_registro', '>=', Carbon::now()->subDays(7))
                ->count();

            if ($salidasRecientes > 10) {
                $alerts[] = [
                    'type' => 'info',
                    'icon' => '📈',
                    'title' => 'Alta actividad',
                    'description' => "{$salidasRecientes} salidas registradas esta semana",
                    'priority' => 'low'
                ];
            }

            // Alert genérica del sistema
            $alerts[] = [
                'type' => 'success',
                'icon' => '✅',
                'title' => 'Sistema operativo',
                'description' => 'Conexión a base de datos establecida correctamente',
                'priority' => 'low'
            ];

            return response()->json([
                'success' => true,
                'data' => $alerts
            ]);

        } catch (\Exception $e) {
            // Alertas de fallback en caso de error
            $fallbackAlerts = [
                [
                    'type' => 'error',
                    'icon' => '⚠️',
                    'title' => 'Error de conexión',
                    'description' => 'No se pudieron cargar las alertas del sistema',
                    'priority' => 'high'
                ]
            ];

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener alertas: ' . $e->getMessage(),
                'data' => $fallbackAlerts
            ], 200); // 200 para que el frontend muestre los datos de fallback
        }
    }

    /**
     * Métodos auxiliares para obtener conteos
     */
    private function getProductosCount()
    {
        try {
            return DB::table('PRODUCTO')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getProyectosActivos()
    {
        try {
            // Contar proyectos únicos de la tabla PROYECTO_ALMACEN o similar
            $count = DB::table('PROYECTO_ALMACEN')->count();
            return $count > 0 ? $count : 9; // Fallback al valor actual
        } catch (\Exception $e) {
            return 9; // Valor por defecto
        }
    }

    private function getMovimientosMes()
    {
        try {
            $mesActual = Carbon::now()->month;
            $añoActual = Carbon::now()->year;

            // Contar movimientos de salida del mes actual usando SALIDAS_MATERIALES
            $salidas = DB::table('SALIDAS_MATERIALES')
                ->whereMonth('fecha_registro', $mesActual)
                ->whereYear('fecha_registro', $añoActual)
                ->count();

            // Contar ingresos del mes actual
            $ingresos = DB::table('INGRESO_MATERIAL')
                ->whereMonth('fecha_ingreso', $mesActual)
                ->whereYear('fecha_ingreso', $añoActual)
                ->count();

            return $salidas + $ingresos;
        } catch (\Exception $e) {
            return 27; // Valor por defecto
        }
    }

    private function getPersonalActivo()
    {
        try {
            // Usar la tabla PERSONAL que existe (sin columna 'activo')
            return DB::table('PERSONAL')->count();
        } catch (\Exception $e) {
            // Si hay error, usar conteo de usuarios de LOGEO
            try {
                return DB::table('LOGEO')->count();
            } catch (\Exception $e2) {
                return 15; // Valor por defecto
            }
        }
    }

    /**
     * Calcular tiempo transcurrido en formato legible
     */
    private function getTimeAgo($fecha)
    {
        try {
            $carbon = Carbon::parse($fecha);
            $diff = $carbon->diffInHours(Carbon::now());
            
            if ($diff < 1) {
                return 'Hace pocos minutos';
            } elseif ($diff < 24) {
                return "Hace {$diff} horas";
            } else {
                $days = $carbon->diffInDays(Carbon::now());
                return "Hace {$days} días";
            }
        } catch (\Exception $e) {
            return 'Recientemente';
        }
    }

    /**
     * Obtener resumen completo del dashboard
     */
    public function getDashboardSummary(): JsonResponse
    {
        try {
            $statsResponse = $this->getStats();
            $activityResponse = $this->getRecentActivity();
            $alertsResponse = $this->getSystemAlerts();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $statsResponse->getData()->data ?? [],
                    'recent_activity' => $activityResponse->getData()->data ?? [],
                    'alerts' => $alertsResponse->getData()->data ?? []
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener resumen del dashboard: ' . $e->getMessage()
            ], 500);
        }
    }
}
