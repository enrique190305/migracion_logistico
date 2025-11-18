<?php

namespace App\Http\Controllers;

use App\Models\FamiliaNueva;
use App\Models\Subfamilia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class FamiliaController extends Controller
{
    /**
     * Listar todas las familias nuevas
     * GET /api/familias-nuevas
     */
    public function index()
    {
        try {
            $familias = FamiliaNueva::activo()
                ->with(['subfamilias' => function($query) {
                    $query->where('estado', 'ACTIVO');
                }])
                ->orderBy('nombre_familia', 'asc')
                ->get()
                ->map(function($familia) {
                    return [
                        'id_familia' => $familia->id_familia,
                        'nombre_familia' => $familia->nombre_familia,
                        'prefijo_codigo' => $familia->prefijo_codigo,
                        'descripcion' => $familia->descripcion,
                        'tipo_producto_legacy' => $familia->tipo_producto_legacy,
                        'estado' => $familia->estado,
                        'cantidad_subfamilias' => $familia->subfamilias->count(),
                        'fecha_creacion' => $familia->fecha_creacion?->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $familias,
                'total' => $familias->count()
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar familias',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una familia específica con sus subfamilias
     * GET /api/familias-nuevas/{id}
     */
    public function show($id)
    {
        try {
            $familia = FamiliaNueva::with(['subfamilias' => function($query) {
                $query->where('estado', 'ACTIVO')
                    ->orderBy('nombre_subfamilia', 'asc');
            }])->find($id);

            if (!$familia) {
                return response()->json([
                    'success' => false,
                    'error' => 'Familia no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id_familia' => $familia->id_familia,
                    'nombre_familia' => $familia->nombre_familia,
                    'prefijo_codigo' => $familia->prefijo_codigo,
                    'descripcion' => $familia->descripcion,
                    'estado' => $familia->estado,
                    'subfamilias' => $familia->subfamilias->map(function($sub) {
                        return [
                            'id_subfamilia' => $sub->id_subfamilia,
                            'nombre_subfamilia' => $sub->nombre_subfamilia,
                            'prefijo_sub' => $sub->prefijo_sub,
                            'descripcion' => $sub->descripcion,
                            'codigo_completo' => $sub->codigo_completo,
                            'cantidad_productos' => $sub->cantidad_productos
                        ];
                    })
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener familia',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva familia
     * POST /api/familias-nuevas
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre_familia' => 'required|string|max:50',
                'prefijo_codigo' => 'required|string|max:10|unique:familia_nueva,prefijo_codigo',
                'descripcion' => 'nullable|string|max:200',
                'tipo_producto_legacy' => 'nullable|string|max:20'
            ]);

            $familia = FamiliaNueva::create($validated);

            return response()->json([
                'success' => true,
                'mensaje' => 'Familia creada exitosamente',
                'data' => $familia
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al crear familia',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar familia
     * PUT /api/familias-nuevas/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $familia = FamiliaNueva::find($id);

            if (!$familia) {
                return response()->json([
                    'success' => false,
                    'error' => 'Familia no encontrada'
                ], 404);
            }

            $validated = $request->validate([
                'nombre_familia' => 'sometimes|required|string|max:50',
                'prefijo_codigo' => 'sometimes|required|string|max:10|unique:familia_nueva,prefijo_codigo,' . $id . ',id_familia',
                'descripcion' => 'nullable|string|max:200',
                'estado' => 'sometimes|in:ACTIVO,INACTIVO'
            ]);

            $familia->update($validated);

            return response()->json([
                'success' => true,
                'mensaje' => 'Familia actualizada exitosamente',
                'data' => $familia
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar familia',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar todas las subfamilias
     * GET /api/subfamilias
     */
    public function indexSubfamilias(Request $request)
    {
        try {
            $query = Subfamilia::with('familiaNueva')
                ->where('estado', 'ACTIVO');

            // Filtrar por familia si se especifica
            if ($request->has('id_familia')) {
                $query->where('id_familia', $request->id_familia);
            }

            $subfamilias = $query->orderBy('nombre_subfamilia', 'asc')
                ->get()
                ->map(function($sub) {
                    return [
                        'id_subfamilia' => $sub->id_subfamilia,
                        'id_familia' => $sub->id_familia,
                        'nombre_subfamilia' => $sub->nombre_subfamilia,
                        'prefijo_sub' => $sub->prefijo_sub,
                        'descripcion' => $sub->descripcion,
                        'codigo_completo' => $sub->codigo_completo,
                        'familia' => [
                            'nombre_familia' => $sub->familiaNueva->nombre_familia,
                            'prefijo_codigo' => $sub->familiaNueva->prefijo_codigo
                        ],
                        'cantidad_productos' => $sub->cantidad_productos
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $subfamilias,
                'total' => $subfamilias->count()
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar subfamilias',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva subfamilia
     * POST /api/subfamilias
     */
    public function storeSubfamilia(Request $request)
    {
        try {
            $validated = $request->validate([
                'id_familia' => 'required|exists:familia_nueva,id_familia',
                'nombre_subfamilia' => 'required|string|max:50',
                'prefijo_sub' => 'required|string|max:10',
                'descripcion' => 'nullable|string|max:200'
            ]);

            // Verificar que no exista la combinación familia + prefijo
            $existe = Subfamilia::where('id_familia', $validated['id_familia'])
                ->where('prefijo_sub', $validated['prefijo_sub'])
                ->exists();

            if ($existe) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ya existe una subfamilia con ese prefijo en esta familia'
                ], 422);
            }

            $subfamilia = Subfamilia::create($validated);
            $subfamilia->load('familiaNueva');

            return response()->json([
                'success' => true,
                'mensaje' => 'Subfamilia creada exitosamente',
                'data' => [
                    'id_subfamilia' => $subfamilia->id_subfamilia,
                    'nombre_subfamilia' => $subfamilia->nombre_subfamilia,
                    'codigo_completo' => $subfamilia->codigo_completo,
                    'familia' => $subfamilia->familiaNueva->nombre_familia
                ]
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al crear subfamilia',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar subfamilia
     * PUT /api/subfamilias/{id}
     */
    public function updateSubfamilia(Request $request, $id)
    {
        try {
            $subfamilia = Subfamilia::find($id);

            if (!$subfamilia) {
                return response()->json([
                    'success' => false,
                    'error' => 'Subfamilia no encontrada'
                ], 404);
            }

            $validated = $request->validate([
                'nombre_subfamilia' => 'sometimes|required|string|max:50',
                'descripcion' => 'nullable|string|max:200',
                'estado' => 'sometimes|in:ACTIVO,INACTIVO'
            ]);

            $subfamilia->update($validated);

            return response()->json([
                'success' => true,
                'mensaje' => 'Subfamilia actualizada exitosamente',
                'data' => $subfamilia
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar subfamilia',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar código de producto para una subfamilia
     * GET /api/subfamilias/{id}/generar-codigo
     */
    public function generarCodigoProducto($id)
    {
        try {
            $subfamilia = Subfamilia::with('familiaNueva')->find($id);

            if (!$subfamilia) {
                return response()->json([
                    'success' => false,
                    'error' => 'Subfamilia no encontrada'
                ], 404);
            }

            $codigo = $subfamilia->generarSiguienteCodigoProducto();

            return response()->json([
                'success' => true,
                'data' => [
                    'codigo_producto' => $codigo,
                    'subfamilia' => $subfamilia->nombre_subfamilia,
                    'familia' => $subfamilia->familiaNueva->nombre_familia
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al generar código',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener productos de una subfamilia
     * GET /api/subfamilias/{id}/productos
     */
    public function productosSubfamilia($id)
    {
        try {
            $subfamilia = Subfamilia::with('familiaNueva')->find($id);

            if (!$subfamilia) {
                return response()->json([
                    'success' => false,
                    'error' => 'Subfamilia no encontrada'
                ], 404);
            }

            $productos = $subfamilia->productos()
                ->select('codigo_producto', 'descripcion', 'unidad', 'consumible', 'tipo_producto')
                ->orderBy('codigo_producto', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'subfamilia' => [
                        'id' => $subfamilia->id_subfamilia,
                        'nombre' => $subfamilia->nombre_subfamilia,
                        'prefijo' => $subfamilia->prefijo_sub,
                        'familia' => $subfamilia->familiaNueva->nombre_familia,
                        'prefijo_familia' => $subfamilia->familiaNueva->prefijo_codigo
                    ],
                    'productos' => $productos,
                    'total' => $productos->count()
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener productos',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }
}
