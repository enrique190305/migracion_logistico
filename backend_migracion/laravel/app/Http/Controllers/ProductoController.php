<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Familia;
use App\Models\Subfamilia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class ProductoController extends Controller
{
    /**
     * Listar todos los productos
     * GET /api/productos
     */
    public function index(Request $request)
    {
        try {
            $query = Producto::with('familia:tipo_producto,equivalencia');
            
            // Filtros opcionales
            if ($request->has('tipo_producto') && $request->tipo_producto !== 'todos') {
                $query->where('tipo_producto', $request->tipo_producto);
            }
            
            if ($request->has('unidad') && $request->unidad !== 'todos') {
                $query->where('unidad', $request->unidad);
            }
            
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('codigo_producto', 'LIKE', "%{$search}%")
                      ->orWhere('descripcion', 'LIKE', "%{$search}%")
                      ->orWhere('tipo_producto', 'LIKE', "%{$search}%");
                });
            }
            
            $productos = $query->orderBy('codigo_producto', 'asc')->get();
            
            // Formatear respuesta
            $productosFormateados = $productos->map(function($producto) {
                return [
                    'id' => $producto->codigo_producto,
                    'codigo_producto' => $producto->codigo_producto,
                    'tipo_producto' => $producto->tipo_producto,
                    'tipo_producto_nombre' => $producto->familia ? $producto->familia->equivalencia : $producto->tipo_producto,
                    'descripcion' => $producto->descripcion,
                    'unidad' => $producto->unidad,
                    'consumible' => $producto->consumible ?? 'NO',
                    'observacion' => $producto->observacion
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $productosFormateados,
                'total' => $productosFormateados->count()
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar productos',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener familias/tipos de producto
     * GET /api/productos/familias
     */
    public function obtenerFamilias()
    {
        try {
            $familias = Familia::orderBy('equivalencia', 'asc')
                ->get()
                ->map(function($familia) {
                    return [
                        'tipo_producto' => $familia->tipo_producto,
                        'descripcion' => $familia->equivalencia
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $familias
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener familias',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener unidades de medida únicas
     * GET /api/productos/unidades
     */
    public function obtenerUnidades()
    {
        try {
            $unidades = Producto::select('unidad')
                ->whereNotNull('unidad')
                ->distinct()
                ->orderBy('unidad', 'asc')
                ->pluck('unidad');

            return response()->json([
                'success' => true,
                'data' => $unidades
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener unidades',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un producto específico
     * GET /api/productos/{codigo}
     */
    public function show($codigo)
    {
        try {
            $producto = Producto::with('familia:tipo_producto,descripcion')
                ->where('codigo_producto', $codigo)
                ->first();

            if (!$producto) {
                return response()->json([
                    'success' => false,
                    'error' => 'Producto no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $producto->codigo_producto,
                    'codigo_producto' => $producto->codigo_producto,
                    'tipo_producto' => $producto->tipo_producto,
                    'tipo_producto_nombre' => $producto->familia->descripcion ?? $producto->tipo_producto,
                    'descripcion' => $producto->descripcion,
                    'unidad' => $producto->unidad,
                    'observacion' => $producto->observacion
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener producto',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar siguiente código de producto
     * GET /api/productos/generar-codigo
     * Soporta AMBOS sistemas: antiguo (sin subfamilia) y nuevo (con subfamilia)
     */
    public function generarCodigo(Request $request)
    {
        try {
            $tipoProducto = $request->get('tipo_producto', '');
            $idSubfamilia = $request->get('id_subfamilia', null);
            
            // SISTEMA NUEVO: Con subfamilia (genera HERR-MANU-0001)
            if ($idSubfamilia) {
                $subfamilia = Subfamilia::with('familiaNueva')->find($idSubfamilia);
                
                if (!$subfamilia) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Subfamilia no encontrada'
                    ], 404);
                }
                
                // Generar código con formato: FAMILIA-SUBFAMILIA-####
                $nuevoCodigo = $subfamilia->generarSiguienteCodigoProducto();
                
                return response()->json([
                    'success' => true,
                    'codigo' => $nuevoCodigo,
                    'sistema' => 'NUEVO',
                    'familia' => $subfamilia->familiaNueva->nombre_familia,
                    'subfamilia' => $subfamilia->nombre_subfamilia
                ], 200);
            }
            
            // SISTEMA ANTIGUO: Sin subfamilia (genera HERR-001, MATE-002, etc.)
            if ($tipoProducto) {
                // Obtener el último producto de este tipo SIN subfamilia
                $ultimoProducto = Producto::where('tipo_producto', $tipoProducto)
                    ->whereNull('id_subfamilia')
                    ->orderBy('codigo_producto', 'desc')
                    ->first();
                
                $numero = 1;
                if ($ultimoProducto) {
                    // Extraer número del código: HERR-001 → 001
                    preg_match('/(\d+)$/', $ultimoProducto->codigo_producto, $matches);
                    $numero = isset($matches[1]) ? intval($matches[1]) + 1 : 1;
                }
                
                // Formato: TIPO-###
                $nuevoCodigo = $tipoProducto . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
                
                return response()->json([
                    'success' => true,
                    'codigo' => $nuevoCodigo,
                    'sistema' => 'ANTIGUO'
                ], 200);
            }
            
            // Si no se especifica nada, generar código genérico
            $ultimoProducto = Producto::orderBy('codigo_producto', 'desc')->first();
            
            if (!$ultimoProducto) {
                $nuevoCodigo = 'PROD-001';
            } else {
                preg_match('/(\d+)$/', $ultimoProducto->codigo_producto, $matches);
                $numero = isset($matches[1]) ? intval($matches[1]) + 1 : 1;
                $nuevoCodigo = 'PROD-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
            }

            return response()->json([
                'success' => true,
                'codigo' => $nuevoCodigo,
                'sistema' => 'GENERICO'
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
     * Validar si existe un código de producto
     * GET /api/productos/validar/{codigo}
     */
    public function validarCodigo($codigo)
    {
        try {
            $existe = Producto::where('codigo_producto', $codigo)->exists();

            return response()->json([
                'success' => true,
                'existe' => $existe,
                'disponible' => !$existe
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al validar código',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo producto
     * POST /api/productos
     * Soporta AMBOS sistemas: con o sin subfamilia
     */
    public function store(Request $request)
    {
        // Validación: tipo_producto es requerido solo si NO hay subfamilia
        $rules = [
            'codigo_producto' => 'required|string|max:50|unique:producto,codigo_producto',
            'descripcion' => 'required|string|max:255',
            'unidad' => 'required|string|max:10',
            'consumible' => 'nullable|in:SI,NO',
            'observacion' => 'nullable|string',
            'id_subfamilia' => 'nullable|exists:subfamilia,id_subfamilia'
        ];

        // Si se usa subfamilia, tipo_producto es opcional; si no, es requerido
        if ($request->has('id_subfamilia') && $request->id_subfamilia) {
            $rules['tipo_producto'] = 'nullable|string|max:20';
        } else {
            $rules['tipo_producto'] = 'required|string|max:20|exists:familia,tipo_producto';
        }

        $request->validate($rules, [
            'codigo_producto.required' => 'El código del producto es obligatorio',
            'codigo_producto.unique' => 'El código del producto ya existe',
            'tipo_producto.required' => 'El tipo de producto es obligatorio',
            'tipo_producto.exists' => 'El tipo de producto no es válido',
            'descripcion.required' => 'La descripción es obligatoria',
            'unidad.required' => 'La unidad de medida es obligatoria',
            'consumible.in' => 'El valor de consumible debe ser SI o NO',
            'id_subfamilia.exists' => 'La subfamilia seleccionada no existe'
        ]);

        DB::beginTransaction();

        try {
            // Crear producto con o sin subfamilia
            $datosProducto = [
                'codigo_producto' => strtoupper(trim($request->codigo_producto)),
                'descripcion' => trim($request->descripcion),
                'unidad' => strtoupper(trim($request->unidad)),
                'consumible' => $request->consumible ?? 'NO',
                'observacion' => $request->observacion ? trim($request->observacion) : null
            ];
            
            // Agregar subfamilia si se especifica (SISTEMA NUEVO)
            if ($request->has('id_subfamilia') && $request->id_subfamilia) {
                $datosProducto['id_subfamilia'] = $request->id_subfamilia;
                // Obtener tipo_producto de la familia de la subfamilia
                $subfamilia = \App\Models\Subfamilia::with('familiaNueva')->find($request->id_subfamilia);
                if ($subfamilia && $subfamilia->familiaNueva) {
                    // Intentar usar tipo_producto_legacy si existe
                    $tipoProducto = $subfamilia->familiaNueva->tipo_producto_legacy ?? $subfamilia->familiaNueva->prefijo_codigo;
                    
                    // Verificar si existe en tabla familia antigua
                    $existeEnFamilia = DB::table('familia')
                        ->where('tipo_producto', $tipoProducto)
                        ->exists();
                    
                    if ($existeEnFamilia) {
                        $datosProducto['tipo_producto'] = $tipoProducto;
                    } else {
                        // Usar el primero disponible como fallback (HERR es común)
                        $tipoFallback = DB::table('familia')
                            ->value('tipo_producto');
                        $datosProducto['tipo_producto'] = $tipoFallback ?? 'HERR';
                    }
                }
            } else {
                // Sistema antiguo: usar tipo_producto enviado
                $datosProducto['tipo_producto'] = strtoupper(trim($request->tipo_producto));
            }
            
            $producto = Producto::create($datosProducto);

            DB::commit();

            return response()->json([
                'success' => true,
                'mensaje' => 'Producto registrado exitosamente',
                'data' => [
                    'id' => $producto->codigo_producto,
                    'codigo_producto' => $producto->codigo_producto,
                    'tipo_producto' => $producto->tipo_producto,
                    'descripcion' => $producto->descripcion,
                    'unidad' => $producto->unidad,
                    'consumible' => $producto->consumible,
                    'observacion' => $producto->observacion,
                    'id_subfamilia' => $producto->id_subfamilia,
                    'sistema' => $producto->id_subfamilia ? 'NUEVO' : 'ANTIGUO'
                ]
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al registrar producto',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un producto existente
     * PUT /api/productos/{codigo}
     */
    public function update(Request $request, $codigo)
    {
        // Validación
        $request->validate([
            'tipo_producto' => 'required|string|max:20|exists:familia,tipo_producto',
            'descripcion' => 'required|string|max:255',
            'unidad' => 'required|string|max:10',
            'consumible' => 'nullable|in:SI,NO',
            'observacion' => 'nullable|string'
        ], [
            'tipo_producto.required' => 'El tipo de producto es obligatorio',
            'tipo_producto.exists' => 'El tipo de producto no es válido',
            'descripcion.required' => 'La descripción es obligatoria',
            'unidad.required' => 'La unidad de medida es obligatoria',
            'consumible.in' => 'El valor de consumible debe ser SI o NO'
        ]);

        DB::beginTransaction();

        try {
            $producto = Producto::where('codigo_producto', $codigo)->first();

            if (!$producto) {
                return response()->json([
                    'success' => false,
                    'error' => 'Producto no encontrado'
                ], 404);
            }

            $producto->update([
                'tipo_producto' => strtoupper(trim($request->tipo_producto)),
                'descripcion' => trim($request->descripcion),
                'unidad' => strtoupper(trim($request->unidad)),
                'consumible' => $request->consumible ?? 'NO',
                'observacion' => $request->observacion ? trim($request->observacion) : null
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'mensaje' => 'Producto actualizado exitosamente',
                'data' => [
                    'id' => $producto->codigo_producto,
                    'codigo_producto' => $producto->codigo_producto,
                    'tipo_producto' => $producto->tipo_producto,
                    'descripcion' => $producto->descripcion,
                    'unidad' => $producto->unidad,
                    'consumible' => $producto->consumible,
                    'observacion' => $producto->observacion
                ]
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar producto',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un producto
     * DELETE /api/productos/{codigo}
     */
    public function destroy($codigo)
    {
        DB::beginTransaction();

        try {
            $producto = Producto::where('codigo_producto', $codigo)->first();

            if (!$producto) {
                return response()->json([
                    'success' => false,
                    'error' => 'Producto no encontrado'
                ], 404);
            }

            // Verificar si tiene relaciones
            $tieneDetallesOC = $producto->detallesOrdenCompra()->count();

            if ($tieneDetallesOC > 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'No se puede eliminar',
                    'mensaje' => 'El producto está siendo utilizado en órdenes de compra. No se puede eliminar.'
                ], 400);
            }

            $codigoProducto = $producto->codigo_producto;
            $descripcion = $producto->descripcion;
            
            $producto->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'mensaje' => 'Producto eliminado exitosamente',
                'data' => [
                    'codigo_producto' => $codigoProducto,
                    'descripcion' => $descripcion
                ]
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar producto',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de productos
     * GET /api/productos/estadisticas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_productos' => Producto::count(),
                'total_familias' => Familia::count(),
                'por_familia' => Producto::select('tipo_producto', DB::raw('count(*) as total'))
                    ->groupBy('tipo_producto')
                    ->with('familia:tipo_producto,equivalencia')
                    ->get()
                    ->map(function($item) {
                        return [
                            'tipo' => $item->tipo_producto,
                            'nombre' => $item->familia->equivalencia ?? $item->tipo_producto,
                            'total' => $item->total
                        ];
                    }),
                'por_unidad' => Producto::select('unidad', DB::raw('count(*) as total'))
                    ->whereNotNull('unidad')
                    ->groupBy('unidad')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener estadísticas',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }
}
