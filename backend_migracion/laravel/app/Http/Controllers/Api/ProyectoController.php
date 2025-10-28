<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProyectoAlmacen;
use App\Models\MovilProyecto;
use App\Models\MovilPersona;
use App\Models\Empresa;
use App\Models\Bodega;
use App\Models\Reserva;
use App\Models\User;
use App\Models\Personal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProyectoController extends Controller
{
    /**
     * ========================================
     * ENDPOINTS PARA CATÁLOGOS (Selectores)
     * ========================================
     */

    /**
     * Obtener lista de empresas
     */
    public function obtenerEmpresas()
    {
        try {
            $empresas = Empresa::select('id_empresa', 'razon_social', 'ruc', 'nombre_comercial')
                ->orderBy('razon_social', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $empresas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener empresas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener empresas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las bodegas
     */
    public function obtenerBodegas()
    {
        try {
            $bodegas = Bodega::with('empresa:id_empresa,razon_social')
                ->where('estado', 'ACTIVO')
                ->orderBy('nombre', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bodegas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener bodegas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bodegas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener bodegas filtradas por empresa
     */
    public function obtenerBodegasPorEmpresa($idEmpresa)
    {
        try {
            $bodegas = Bodega::where('id_empresa', $idEmpresa)
                ->where('estado', 'ACTIVO')
                ->orderBy('nombre', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bodegas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener bodegas por empresa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bodegas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener tipos de reserva (antes áreas)
     */
    public function obtenerReservas()
    {
        try {
            $reservas = Reserva::where('estado', 'ACTIVO')
                ->orderBy('tipo_reserva', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reservas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener reservas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tipos de reserva: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener personas/usuarios para asignar como responsables
     */
   public function obtenerPersonas()
{
    try {
        // ✅ SOLO obtener de tabla personal (sin admin/usuario de logeo)
        $personas = DB::table('personal')
            ->select(
                'id_personal as id',
                'nom_ape as nombre',
                'dni',
                'ciudad',
                DB::raw('CONCAT(nom_ape, " - DNI: ", dni) as nombre_completo')
            )
            ->orderBy('nom_ape', 'asc')
            ->get()
            ->map(function ($persona) {
                return [
                    'id' => $persona->id,
                    'nombre' => $persona->nombre,
                    'dni' => $persona->dni,
                    'ciudad' => $persona->ciudad,
                    'nombre_completo' => $persona->nombre_completo
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $personas
        ]);

    } catch (\Exception $e) {
        Log::error('Error al obtener personas: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener personas: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * ✅ NUEVO: Lista simplificada de proyectos para dropdowns/selectores
     * Devuelve solo id_proyecto_almacen y nombre_proyecto
     */
    public function listaSimplificada()
    {
        try {
            $proyectos = DB::table('vista_proyectos_almacen')
                ->select('id_proyecto_almacen', 'nombre_proyecto', 'codigo_proyecto')
                ->where('estado', 'ACTIVO')
                ->orderBy('nombre_proyecto', 'asc')
                ->get()
                ->map(function ($proyecto) {
                    return [
                        'id_proyecto' => $proyecto->id_proyecto_almacen, // ✅ Alias para compatibilidad
                        'id' => $proyecto->id_proyecto_almacen,
                        'nombre_proyecto' => $proyecto->nombre_proyecto,
                        'nombre' => $proyecto->nombre_proyecto, // ✅ Alias para compatibilidad
                        'codigo' => $proyecto->codigo_proyecto
                    ];
                });

            return response()->json($proyectos);
        } catch (\Exception $e) {
            Log::error('Error al obtener lista de proyectos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proyectos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ========================================
     * CRUD PROYECTOS
     * ========================================
     */

    /**
     * Listar todos los proyectos (vista unificada)
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('vista_proyectos_almacen');

            // Filtros opcionales
            if ($request->has('id_empresa') && $request->id_empresa) {
                // Necesitamos hacer join con proyecto_almacen para filtrar por empresa
                $query = ProyectoAlmacen::with([
                    'empresa:id_empresa,razon_social',
                    'bodega:id_bodega,nombre,ubicacion',
                    'reserva:id_reserva,tipo_reserva'
                ])
                ->where('id_empresa', $request->id_empresa)
                ->where('estado', 'ACTIVO');
                
                $proyectos = $query->orderBy('fecha_registro', 'desc')->get();
            } else {
                $proyectos = $query->orderBy('fecha_registro', 'desc')->get();
            }

            // Enriquecer con información de subproyectos
            $proyectos = collect($proyectos)->map(function ($proyecto) {
                if ($proyecto->tipo_movil === 'CON_PROYECTO') {
                    // ✅ Contar subproyectos correctamente usando id_referencia
                    $cantidadSubproyectos = MovilProyecto::where('proyecto_padre_id', $proyecto->id_referencia)
                        ->where('estado', 'ACTIVO')
                        ->count();
                    
                    $proyecto->cantidad_subproyectos = $cantidadSubproyectos;
                } else {
                    $proyecto->cantidad_subproyectos = 0;
                }
                return $proyecto;
            });

            return response()->json([
                'success' => true,
                'data' => $proyectos
            ]);
        } catch (\Exception $e) {
            Log::error('Error al listar proyectos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proyectos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo proyecto (usando stored procedure)
     */
    public function store(Request $request)
{
    // ✅ Validación directa contra personal (ahora la FK apunta a personal)
    $validator = Validator::make($request->all(), [
        'razon_social_id' => 'required|exists:empresa,id_empresa',
        'bodega_id' => 'required|exists:bodega,id_bodega',
        'tipo_reserva' => 'required|exists:reserva,id_reserva',
        'movil_tipo' => 'required|in:sin_proyecto,con_proyecto',
        'responsable' => 'required|exists:personal,id_personal',
        'fecha_registro' => 'required|date',
        'movil_nombre' => 'required_if:movil_tipo,con_proyecto|max:100',
        'descripcion' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        // ✅ Obtener el ID del usuario desde el request (enviado desde el frontend)
        $idUsuarioLogueado = $request->input('id_usuario_logueado', 1); // Por defecto ID 1 si no viene
        
        $tipoMovil = $request->movil_tipo;
        $resultado = null;

        if ($tipoMovil === 'sin_proyecto') {
            // Usar stored procedure
            $resultado = DB::select('CALL sp_crear_movil_persona(?, ?, ?, ?, ?, ?)', [
                $idUsuarioLogueado,      // id_persona → FK a logeo (quien registra)
                $request->razon_social_id,
                $request->bodega_id,
                $request->tipo_reserva,
                $request->responsable,   // id_responsable → FK a personal (responsable físico)
                $request->fecha_registro
            ]);
        } else {
            // Usar stored procedure para proyecto con nombre
            $resultado = DB::select('CALL sp_crear_proyecto_con_subproyecto(?, ?, ?, ?, ?, ?, ?, ?)', [
                $idUsuarioLogueado,      // id_persona → FK a logeo (quien registra)
                $request->movil_nombre,
                $request->razon_social_id,
                $request->bodega_id,
                $request->tipo_reserva,
                $request->responsable,   // id_responsable → FK a personal (responsable físico)
                $request->descripcion ?? null,
                $request->fecha_registro
            ]);
        }

        if (empty($resultado)) {
            throw new \Exception('El stored procedure no retornó datos');
        }

        $proyectoCreado = DB::table('vista_proyectos_almacen')
            ->where('id_proyecto_almacen', $resultado[0]->id_proyecto_almacen)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Proyecto registrado exitosamente',
            'data' => [
                'proyecto' => $proyectoCreado,
                'codigo_proyecto' => $resultado[0]->codigo_proyecto
            ]
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error al crear proyecto: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Error al registrar proyecto: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Obtener detalle de un proyecto específico
     */
    public function show($id)
    {
        try {
            // Obtener desde la vista
            $proyecto = DB::table('vista_proyectos_almacen')
                ->where('id_proyecto_almacen', $id)
                ->first();

            if (!$proyecto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Si es un proyecto con subproyectos, obtener la lista
            if ($proyecto->tipo_movil === 'CON_PROYECTO') {
                $proyectoAlmacen = ProyectoAlmacen::find($id);
                $movilProyecto = MovilProyecto::where('id_movil_proyecto', $proyectoAlmacen->id_referencia)->first();
                
                if ($movilProyecto) {
                    $subproyectos = MovilProyecto::with([
                        'empresa:id_empresa,razon_social',
                        'bodega:id_bodega,nombre',
                        'reserva:id_reserva,tipo_reserva',
                        'responsable:id_personal,nom_ape,dni' // ✅ Corregido: usar campos de tabla 'personal'
                    ])
                    ->where('proyecto_padre_id', $movilProyecto->id_movil_proyecto)
                    ->where('estado', 'ACTIVO')
                    ->get();
                    
                    $proyecto->subproyectos = $subproyectos;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $proyecto
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener detalle del proyecto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalle: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar proyecto
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre_proyecto' => 'sometimes|required|max:200',
            'descripcion' => 'nullable|string',
            'responsable' => 'sometimes|required|exists:personal,id_personal',
            'fecha_registro' => 'sometimes|required|date',
            'estado' => 'sometimes|in:ACTIVO,INACTIVO'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $proyectoAlmacen = ProyectoAlmacen::findOrFail($id);
            
            // Actualizar en proyecto_almacen
            if ($request->has('nombre_proyecto')) {
                $proyectoAlmacen->nombre_proyecto = $request->nombre_proyecto;
            }
            if ($request->has('descripcion')) {
                $proyectoAlmacen->descripcion = $request->descripcion;
            }
            if ($request->has('fecha_registro')) {
                $proyectoAlmacen->fecha_registro = $request->fecha_registro;
            }
            if ($request->has('estado')) {
                $proyectoAlmacen->estado = $request->estado;
            }
            
            $proyectoAlmacen->save();

            // Actualizar también en la tabla específica (movil_proyecto o movil_persona)
            if ($proyectoAlmacen->tipo_movil === 'CON_PROYECTO') {
                $movilProyecto = MovilProyecto::find($proyectoAlmacen->id_referencia);
                if ($movilProyecto) {
                    if ($request->has('nombre_proyecto')) {
                        $movilProyecto->nombre_proyecto = $request->nombre_proyecto;
                    }
                    if ($request->has('descripcion')) {
                        $movilProyecto->descripcion = $request->descripcion;
                    }
                    if ($request->has('responsable')) {
                        $movilProyecto->id_responsable = $request->responsable;
                    }
                    if ($request->has('fecha_registro')) {
                        $movilProyecto->fecha_registro = $request->fecha_registro;
                    }
                    if ($request->has('estado')) {
                        $movilProyecto->estado = $request->estado;
                    }
                    $movilProyecto->save();
                }
            } else {
                // Para móviles sin proyecto (SIN_PROYECTO)
                $movilPersona = MovilPersona::find($proyectoAlmacen->id_referencia);
                if ($movilPersona) {
                    if ($request->has('nombre_proyecto')) {
                        $movilPersona->nombre = $request->nombre_proyecto;
                    }
                    if ($request->has('responsable')) {
                        $movilPersona->id_responsable = $request->responsable;
                    }
                    if ($request->has('fecha_registro')) {
                        $movilPersona->fecha_registro = $request->fecha_registro;
                    }
                    if ($request->has('estado')) {
                        $movilPersona->estado = $request->estado;
                    }
                    $movilPersona->save();
                }
            }

            DB::commit();

            // Obtener proyecto actualizado
            $proyectoActualizado = DB::table('vista_proyectos_almacen')
                ->where('id_proyecto_almacen', $id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Proyecto actualizado exitosamente',
                'data' => $proyectoActualizado
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar proyecto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar (desactivar) proyecto
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $proyectoAlmacen = ProyectoAlmacen::findOrFail($id);
            
            // Cambiar estado a INACTIVO en lugar de eliminar
            $proyectoAlmacen->estado = 'INACTIVO';
            $proyectoAlmacen->save();

            // También desactivar en la tabla específica
            if ($proyectoAlmacen->tipo_movil === 'CON_PROYECTO') {
                MovilProyecto::where('id_movil_proyecto', $proyectoAlmacen->id_referencia)
                    ->update(['estado' => 'INACTIVO']);
            } else {
                MovilPersona::where('id_movil_persona', $proyectoAlmacen->id_referencia)
                    ->update(['estado' => 'INACTIVO']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Proyecto desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar proyecto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar proyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ========================================
     * GESTIÓN DE SUBPROYECTOS
     * ========================================
     */

    /**
     * Obtener subproyectos de un proyecto padre
     */
    public function obtenerSubproyectos($idProyecto)
    {
        try {
            // Obtener el proyecto padre
            $proyectoAlmacen = ProyectoAlmacen::find($idProyecto);
            
            if (!$proyectoAlmacen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }
            
            if ($proyectoAlmacen->tipo_movil !== 'CON_PROYECTO') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este proyecto no puede tener subproyectos (es tipo SIN_PROYECTO)',
                    'tipo_movil' => $proyectoAlmacen->tipo_movil,
                    'nombre' => $proyectoAlmacen->nombre_proyecto
                ], 400);
            }

            // Obtener el movil_proyecto
            $movilProyecto = MovilProyecto::find($proyectoAlmacen->id_referencia);
            
            if (!$movilProyecto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            // Obtener subproyectos
            $subproyectos = MovilProyecto::with([
                'empresa:id_empresa,razon_social',
                'bodega:id_bodega,nombre,ubicacion',
                'reserva:id_reserva,tipo_reserva',
                'responsable:id_personal,nom_ape,dni', // ✅ Corregido: usar campos de tabla 'personal'
                'proyectoAlmacen'
            ])
            ->where('proyecto_padre_id', $movilProyecto->id_movil_proyecto)
            ->where('estado', 'ACTIVO')
            ->orderBy('fecha_registro', 'desc')
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id_movil_proyecto,
                    'id_proyecto_almacen' => $sub->proyectoAlmacen->id_proyecto_almacen ?? null,
                    'codigo_proyecto' => $sub->proyectoAlmacen->codigo_proyecto ?? null,
                    'nombre' => $sub->nombre_proyecto,
                    'descripcion' => $sub->descripcion,
                    'empresa' => $sub->empresa->razon_social ?? null,
                    'bodega' => $sub->bodega->nombre ?? null,
                    'ubicacion' => $sub->bodega->ubicacion ?? null,
                    'tipo_reserva' => $sub->reserva->tipo_reserva ?? null,
                    'responsable' => $sub->responsable->nom_ape ?? 'Sin responsable', // ✅ Corregido: usar nom_ape
                    'dni_responsable' => $sub->responsable->dni ?? null,
                    'fecha_registro' => $sub->fecha_registro,
                    'estado' => $sub->estado
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $subproyectos
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener subproyectos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener subproyectos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear subproyecto
     */
    public function crearSubproyecto(Request $request, $idProyecto)
{
    $validator = Validator::make($request->all(), [
        'nombre_proyecto' => 'required|max:100',
        'descripcion' => 'nullable|string',
        'responsable' => 'required|integer', // ✅ ID del personal responsable
        'fecha_registro' => 'required|date',
        'id_usuario_logueado' => 'nullable|integer' // ✅ Usuario que registra (opcional con default)
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        // Obtener proyecto padre
        $proyectoAlmacen = ProyectoAlmacen::findOrFail($idProyecto);
        
        if ($proyectoAlmacen->tipo_movil !== 'CON_PROYECTO') {
            return response()->json([
                'success' => false,
                'message' => 'Este proyecto no puede tener subproyectos'
            ], 400);
        }

        $movilProyectoPadre = MovilProyecto::find($proyectoAlmacen->id_referencia);

        // ✅ Obtener usuario logueado del localStorage (enviado desde frontend)
        $idUsuarioLogueado = $request->input('id_usuario_logueado', 1); // Por defecto ID 1

        // Crear subproyecto
        $subproyecto = MovilProyecto::create([
            'id_persona' => $idUsuarioLogueado, // ✅ Usuario que registra
            'nombre_proyecto' => $request->nombre_proyecto,
            'id_empresa' => $proyectoAlmacen->id_empresa,
            'id_bodega' => $proyectoAlmacen->id_bodega,
            'id_reserva' => $proyectoAlmacen->id_reserva,
            'id_responsable' => $request->responsable, // ✅ Responsable del subproyecto
            'descripcion' => $request->descripcion,
            'fecha_registro' => $request->fecha_registro,
            'puede_subproyectos' => 0,
            'proyecto_padre_id' => $movilProyectoPadre->id_movil_proyecto,
            'estado' => 'ACTIVO'
        ]);

        // ✅ Crear entrada en PROYECTO_ALMACEN para el subproyecto
        $proyectoAlmacenSub = ProyectoAlmacen::create([
            'tipo_movil' => 'CON_PROYECTO',
            'id_referencia' => $subproyecto->id_movil_proyecto,
            'id_empresa' => $proyectoAlmacen->id_empresa,
            'id_bodega' => $proyectoAlmacen->id_bodega,
            'id_reserva' => $proyectoAlmacen->id_reserva,
            'nombre_proyecto' => $request->nombre_proyecto,
            'fecha_registro' => $request->fecha_registro,
            'estado' => 'ACTIVO'
        ]);

        // ✅ Generar código del proyecto (similar al padre)
        $empresa = Empresa::find($proyectoAlmacen->id_empresa);
        $bodega = Bodega::find($proyectoAlmacen->id_bodega);
        $reserva = Reserva::find($proyectoAlmacen->id_reserva);
        
        $prefijoEmpresa = substr($empresa->razon_social, 0, 3);
        $prefijoBodega = substr($bodega->nombre, 0, 3);
        $prefijoReserva = substr($reserva->tipo_reserva, 0, 3);
        
        $codigoGenerado = strtoupper($prefijoEmpresa . '-' . $prefijoBodega . '-' . $prefijoReserva) 
                        . '-SUB-' . str_pad($proyectoAlmacenSub->id_proyecto_almacen, 4, '0', STR_PAD_LEFT);
        
        // Actualizar código
        $proyectoAlmacenSub->codigo_proyecto = $codigoGenerado;
        $proyectoAlmacenSub->save();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Subproyecto creado exitosamente',
            'data' => [
                'subproyecto' => $subproyecto,
                'codigo_proyecto' => $codigoGenerado,
                'id_proyecto_almacen' => $proyectoAlmacenSub->id_proyecto_almacen
            ]
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Error al crear subproyecto: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error al crear subproyecto: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Actualizar subproyecto
     */
    public function actualizarSubproyecto(Request $request, $idProyecto, $idSubproyecto)
    {
        $validator = Validator::make($request->all(), [
            'nombre_proyecto' => 'sometimes|required|max:100',
            'descripcion' => 'nullable|string',
            'responsable' => 'sometimes|required|integer',
            'fecha_registro' => 'sometimes|required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Buscar el subproyecto en proyecto_almacen
            $proyectoAlmacen = ProyectoAlmacen::findOrFail($idSubproyecto);
            
            if ($proyectoAlmacen->tipo_movil !== 'CON_PROYECTO') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este registro no es un proyecto válido'
                ], 400);
            }

            // Obtener el registro en movil_proyecto
            $subproyecto = MovilProyecto::findOrFail($proyectoAlmacen->id_referencia);
            
            // Verificar que sea un subproyecto
            if (!$subproyecto->proyecto_padre_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este no es un subproyecto'
                ], 400);
            }

            // Actualizar datos en movil_proyecto
            if ($request->has('nombre_proyecto')) {
                $subproyecto->nombre_proyecto = $request->nombre_proyecto;
                $proyectoAlmacen->nombre_proyecto = $request->nombre_proyecto;
            }
            
            if ($request->has('descripcion')) {
                $subproyecto->descripcion = $request->descripcion;
            }
            
            if ($request->has('responsable')) {
                $subproyecto->id_responsable = $request->responsable;
            }
            
            if ($request->has('fecha_registro')) {
                $subproyecto->fecha_registro = $request->fecha_registro;
                $proyectoAlmacen->fecha_registro = $request->fecha_registro;
            }

            $subproyecto->save();
            $proyectoAlmacen->save();

            DB::commit();

            // Recargar con relaciones
            $subproyecto->load(['responsable:id_personal,nom_ape,dni']);

            return response()->json([
                'success' => true,
                'message' => 'Subproyecto actualizado exitosamente',
                'data' => [
                    'subproyecto' => $subproyecto,
                    'codigo_proyecto' => $proyectoAlmacen->codigo_proyecto
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar subproyecto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar subproyecto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar (desactivar) subproyecto
     */
    public function eliminarSubproyecto($idProyecto, $idSubproyecto)
    {
        DB::beginTransaction();
        try {
            // Buscar el subproyecto en proyecto_almacen
            $proyectoAlmacen = ProyectoAlmacen::findOrFail($idSubproyecto);
            
            if ($proyectoAlmacen->tipo_movil !== 'CON_PROYECTO') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este registro no es un proyecto válido'
                ], 400);
            }

            // Obtener el registro en movil_proyecto
            $subproyecto = MovilProyecto::findOrFail($proyectoAlmacen->id_referencia);
            
            // Verificar que sea un subproyecto
            if (!$subproyecto->proyecto_padre_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este no es un subproyecto'
                ], 400);
            }

            // Cambiar estado a INACTIVO en lugar de eliminar
            $subproyecto->estado = 'INACTIVO';
            $subproyecto->save();

            $proyectoAlmacen->estado = 'INACTIVO';
            $proyectoAlmacen->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Subproyecto eliminado (desactivado) exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar subproyecto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar subproyecto: ' . $e->getMessage()
            ], 500);
        }
    }

}