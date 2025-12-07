<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Horario;
use App\Models\ProgramacionSemanal;
use App\Models\HistorialProgramacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProgramacionController extends Controller
{
    /**
     * Obtener todos los trabajadores activos (solo id_rol = 1)
     */
    public function getTrabajadores()
    {
        try {
            $trabajadores = Usuario::where('activo', 1)
                ->where('id_rol', 1) // Solo trabajadores, no supervisores ni admins
                ->select('id_usuario', 'documento', 'nombres', 'apellidos', 'id_horario', 'id_rol')
                ->orderBy('apellidos')
                ->orderBy('nombres')
                ->get();

            // Agregar nombre completo
            $trabajadores->map(function ($trabajador) {
                $trabajador->nombre_completo = trim("{$trabajador->nombres} {$trabajador->apellidos}");
                return $trabajador;
            });

            return response()->json([
                'success' => true,
                'data' => $trabajadores,
                'total' => $trabajadores->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener trabajadores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todos los horarios disponibles
     */
    public function getHorarios()
    {
        try {
            $horarios = Horario::orderBy('id_horario')->get();

            return response()->json([
                'success' => true,
                'data' => $horarios,
                'total' => $horarios->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener horarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener programación de un día específico
     */
    public function getProgramacionDia(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $fecha = $request->fecha;

            // Obtener solo trabajadores activos (id_rol = 1), no supervisores ni admins
            $trabajadores = Usuario::where('activo', 1)
                ->where('id_rol', 1)
                ->select('id_usuario', 'documento', 'nombres', 'apellidos')
                ->orderBy('apellidos')
                ->orderBy('nombres')
                ->get();

            // Obtener programación del día
            $programaciones = ProgramacionSemanal::where('fecha', $fecha)
                ->with('horario')
                ->get()
                ->keyBy('id_usuario');

            // Mapear trabajadores con su programación
            $resultado = $trabajadores->map(function ($trabajador) use ($programaciones) {
                $programacion = $programaciones->get($trabajador->id_usuario);
                
                return [
                    'id_usuario' => $trabajador->id_usuario,
                    'documento' => $trabajador->documento,
                    'nombre_completo' => trim("{$trabajador->nombres} {$trabajador->apellidos}"),
                    'id_horario' => $programacion ? $programacion->id_horario : null,
                    'horario' => $programacion ? $programacion->horario->nombre : 'Sin asignar'
                ];
            });

            // Calcular estadísticas
            $estadisticas = $this->calcularEstadisticasFecha($fecha);

            return response()->json([
                'success' => true,
                'data' => $resultado,
                'estadisticas' => $estadisticas,
                'total' => $trabajadores->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener programación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener programación de un mes completo
     */
    public function getProgramacionMes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mes' => 'required|integer|min:1|max:12',
            'anio' => 'required|integer|min:2024|max:2100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $mes = str_pad($request->mes, 2, '0', STR_PAD_LEFT);
            $anio = $request->anio;
            
            $fechaInicio = "{$anio}-{$mes}-01";
            $fechaFin = date('Y-m-t', strtotime($fechaInicio));

            // Obtener programaciones del mes
            $programaciones = ProgramacionSemanal::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->with(['usuario', 'horario'])
                ->get()
                ->groupBy('id_usuario');

            // Obtener solo trabajadores activos (id_rol = 1), no supervisores ni admins
            $trabajadores = Usuario::where('activo', 1)
                ->where('id_rol', 1)
                ->get();

            // Generar matriz de programación
            $resultado = $trabajadores->map(function ($trabajador) use ($programaciones, $fechaInicio, $fechaFin) {
                $programacionUsuario = $programaciones->get($trabajador->id_usuario, collect());
                
                $dias = [];
                $fecha = Carbon::parse($fechaInicio);
                $fechaFinCarbon = Carbon::parse($fechaFin);

                while ($fecha->lte($fechaFinCarbon)) {
                    $fechaStr = $fecha->format('Y-m-d');
                    $prog = $programacionUsuario->firstWhere('fecha', $fechaStr);
                    
                    $dias[$fechaStr] = [
                        'id_horario' => $prog ? $prog->id_horario : null,
                        'horario' => $prog ? $prog->horario->nombre : null
                    ];
                    
                    $fecha->addDay();
                }

                return [
                    'id_usuario' => $trabajador->id_usuario,
                    'documento' => $trabajador->documento,
                    'nombre_completo' => trim("{$trabajador->nombres} {$trabajador->apellidos}"),
                    'dias' => $dias
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $resultado,
                'periodo' => [
                    'mes' => (int)$mes,
                    'anio' => $anio,
                    'fecha_inicio' => $fechaInicio,
                    'fecha_fin' => $fechaFin
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener programación mensual: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar asignaciones de horarios
     */
    public function guardarAsignaciones(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date',
            'asignaciones' => 'required|array',
            'asignaciones.*.id_usuario' => 'required|exists:usuarios,id_usuario',
            'asignaciones.*.id_horario' => 'required|exists:horarios,id_horario'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $fecha = $request->fecha;
            $asignaciones = $request->asignaciones;
            $asignadoPor = auth()->id();
            $cambiosRealizados = 0;

            foreach ($asignaciones as $asignacion) {
                // VALIDAR que solo se asignen horarios a trabajadores (id_rol = 1)
                $usuario = Usuario::where('id_usuario', $asignacion['id_usuario'])->first();
                if (!$usuario || $usuario->id_rol != 1) {
                    continue; // Saltar usuarios que no son trabajadores
                }

                // Obtener programación anterior (si existe)
                $programacionAnterior = ProgramacionSemanal::where('id_usuario', $asignacion['id_usuario'])
                    ->where('fecha', $fecha)
                    ->first();

                // Asignar o actualizar
                $programacion = ProgramacionSemanal::asignarHorario(
                    $asignacion['id_usuario'],
                    $fecha,
                    $asignacion['id_horario'],
                    $asignadoPor
                );

                // Registrar en historial si hubo cambio
                if ($programacionAnterior && $programacionAnterior->id_horario != $asignacion['id_horario']) {
                    HistorialProgramacion::registrarCambio(
                        $programacion->id_programacion,
                        $asignacion['id_usuario'],
                        $fecha,
                        $programacionAnterior->id_horario,
                        $asignacion['id_horario'],
                        $asignadoPor
                    );
                    $cambiosRealizados++;
                }
            }

            DB::commit();

            // Calcular estadísticas actualizadas
            $estadisticas = $this->calcularEstadisticasFecha($fecha);

            return response()->json([
                'success' => true,
                'message' => 'Asignaciones guardadas correctamente',
                'cambios_realizados' => $cambiosRealizados,
                'total_asignaciones' => count($asignaciones),
                'estadisticas' => $estadisticas
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar asignaciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Asignación masiva de horario
     */
    public function asignacionMasiva(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date',
            'id_horario' => 'required|exists:horarios,id_horario'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $fecha = $request->fecha;
            $idHorario = $request->id_horario;
            $asignadoPor = auth()->id();

            // Obtener solo trabajadores activos (id_rol = 1), no supervisores ni admins
            $trabajadores = Usuario::where('activo', 1)
                ->where('id_rol', 1)
                ->pluck('id_usuario');
            $totalAsignados = 0;

            foreach ($trabajadores as $idUsuario) {
                ProgramacionSemanal::asignarHorario($idUsuario, $fecha, $idHorario, $asignadoPor);
                $totalAsignados++;
            }

            DB::commit();

            // Calcular estadísticas actualizadas
            $estadisticas = $this->calcularEstadisticasFecha($fecha);

            return response()->json([
                'success' => true,
                'message' => 'Asignación masiva realizada correctamente',
                'total_asignados' => $totalAsignados,
                'estadisticas' => $estadisticas
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error en asignación masiva: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Limpiar programación de un día completo
     */
    public function limpiarDia(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $fecha = $request->fecha;
            $eliminados = ProgramacionSemanal::limpiarFecha($fecha);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Programación eliminada correctamente',
                'registros_eliminados' => $eliminados
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al limpiar programación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de un usuario
     */
    public function getHistorialUsuario(Request $request, $idUsuario)
    {
        try {
            $limit = $request->input('limit', 50);
            
            $historial = HistorialProgramacion::where('id_usuario', $idUsuario)
                ->with(['horarioAnterior', 'horarioNuevo', 'cambiador'])
                ->orderBy('cambiado_en', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $historial,
                'total' => $historial->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de una fecha específica
     */
    public function getHistorialFecha(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $fecha = $request->fecha;
            
            $historial = HistorialProgramacion::where('fecha', $fecha)
                ->with(['usuario', 'horarioAnterior', 'horarioNuevo', 'cambiador'])
                ->orderBy('cambiado_en', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $historial,
                'total' => $historial->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de un día
     */
    public function getEstadisticasDia(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $fecha = $request->fecha;
            $estadisticas = $this->calcularEstadisticasFecha($fecha);

            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al calcular estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Método privado para calcular estadísticas de una fecha
     */
    private function calcularEstadisticasFecha($fecha)
    {
        // Contar solo trabajadores (id_rol = 1), no supervisores ni admins
        $totalTrabajadores = Usuario::where('activo', 1)
            ->where('id_rol', 1)
            ->count();
        
        // Contar por horario - SOLO de trabajadores (id_rol = 1)
        $programaciones = ProgramacionSemanal::where('fecha', $fecha)
            ->whereHas('usuario', function($query) {
                $query->where('id_rol', 1)->where('activo', 1);
            })
            ->select('id_horario', DB::raw('COUNT(*) as total'))
            ->groupBy('id_horario')
            ->get()
            ->keyBy('id_horario');

        $horarios = Horario::all();
        
        $estadisticas = [];
        $totalAsignados = 0;

        foreach ($horarios as $horario) {
            $total = $programaciones->get($horario->id_horario)?->total ?? 0;
            $totalAsignados += $total;
            
            $estadisticas[] = [
                'id_horario' => $horario->id_horario,
                'nombre' => $horario->nombre,
                'total' => $total,
                'porcentaje' => $totalTrabajadores > 0 ? round(($total / $totalTrabajadores) * 100, 1) : 0
            ];
        }

        // Agregar trabajadores sin asignar
        $sinAsignar = $totalTrabajadores - $totalAsignados;
        $estadisticas[] = [
            'id_horario' => null,
            'nombre' => 'Sin asignar',
            'total' => $sinAsignar,
            'porcentaje' => $totalTrabajadores > 0 ? round(($sinAsignar / $totalTrabajadores) * 100, 1) : 0
        ];

        return [
            'total_trabajadores' => $totalTrabajadores,
            'total_asignados' => $totalAsignados,
            'sin_asignar' => $sinAsignar,
            'por_horario' => $estadisticas
        ];
    }
}
