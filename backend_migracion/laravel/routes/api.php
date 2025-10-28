<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\OrdenCompraServicioController;
use App\Http\Controllers\Api\AprobacionController;
use App\Http\Controllers\Api\ProyectoController;
use App\Http\Controllers\Api\IngresoMaterialController;
use App\Http\Controllers\Api\TrasladoMaterialesController;
use App\Http\Controllers\KardexController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\OrdenPedidoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BodegaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\PersonalController;

/*
|--------------------------------------------------------------------------
| API Routes - Órdenes de Compra y Servicios
|--------------------------------------------------------------------------
*/

// Rutas para obtener catálogos
Route::prefix('ordenes')->group(function () {
    
    // Empresas
    Route::get('/empresas', [OrdenCompraServicioController::class, 'obtenerEmpresas']);
    
    // Proveedores
    Route::get('/proveedores', [OrdenCompraServicioController::class, 'obtenerProveedores']);
    Route::get('/proveedores/{id}', [OrdenCompraServicioController::class, 'obtenerDetalleProveedor']);
    
    // Productos
    Route::get('/productos', [OrdenCompraServicioController::class, 'obtenerProductos']);
    Route::get('/productos/buscar', [OrdenCompraServicioController::class, 'buscarProductos']);
    Route::get('/productos/validar/{codigo}', [OrdenCompraServicioController::class, 'validarProducto']);
    Route::get('/productos/{codigo}', [OrdenCompraServicioController::class, 'obtenerProductoPorCodigo']);
    
    // Monedas
    Route::get('/monedas', [OrdenCompraServicioController::class, 'obtenerMonedas']);
    
    // Correlativos
    Route::get('/correlativo-oc', [OrdenCompraServicioController::class, 'obtenerSiguienteCorrelativoOC']);
    Route::get('/correlativo-os', [OrdenCompraServicioController::class, 'obtenerSiguienteCorrelativoOS']);
    
    // Órdenes de Pedido (para OC/OS)
    Route::get('/ordenes-pedido-pendientes', [OrdenCompraServicioController::class, 'obtenerOrdenesPedidoPendientes']);
    Route::get('/ordenes-pedido/{id}', [OrdenCompraServicioController::class, 'obtenerOrdenPedido']);
    
    // CRUD Órdenes de Compra
    Route::get('/compra', [OrdenCompraServicioController::class, 'listarOrdenesCompra']);
    Route::get('/compra/pendientes', [OrdenCompraServicioController::class, 'listarOrdenesCompraPendientes']); // Para interfaz Eliminar
    Route::get('/compra/historial', [OrdenCompraServicioController::class, 'listarOrdenesCompraHistorial']); // Para Reportería (incluye ANULADO)
    Route::get('/compra/{id}', [OrdenCompraServicioController::class, 'obtenerDetalleOrdenCompra']);
    Route::post('/compra', [OrdenCompraServicioController::class, 'guardarOrdenCompra']);
    Route::delete('/compra/{id}', [OrdenCompraServicioController::class, 'eliminarOrdenCompra']);
    
    // PDF Orden de Compra
    Route::get('/compra/{id}/pdf', [OrdenCompraServicioController::class, 'generarPDFOrdenCompra']);
    
    // CRUD Órdenes de Servicio
    Route::get('/servicio', [OrdenCompraServicioController::class, 'listarOrdenesServicio']);
    Route::get('/servicio/pendientes', [OrdenCompraServicioController::class, 'listarOrdenesServicioPendientes']); // Para interfaz Eliminar
    Route::get('/servicio/historial', [OrdenCompraServicioController::class, 'listarOrdenesServicioHistorial']); // Para Reportería (incluye ANULADO)
    Route::get('/servicio/{id}', [OrdenCompraServicioController::class, 'obtenerDetalleOrdenServicio']);
    Route::post('/servicio', [OrdenCompraServicioController::class, 'guardarOrdenServicio']);
    Route::delete('/servicio/{id}', [OrdenCompraServicioController::class, 'eliminarOrdenServicio']);
    
    // PDF Orden de Servicio
    Route::get('/servicio/{id}/pdf', [OrdenCompraServicioController::class, 'generarPDFOrdenServicio']);
});

/*
|--------------------------------------------------------------------------
| API Routes - INGRESO DE MATERIALES (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('ingreso-materiales')->group(function () {
    
    // Catálogos y listados
    Route::get('/ordenes-pendientes', [IngresoMaterialController::class, 'listarOrdenesPendientes']);
    Route::get('/proyectos-almacen', [IngresoMaterialController::class, 'listarProyectosAlmacen']);
    Route::get('/productos', [IngresoMaterialController::class, 'listarProductos']);
    Route::get('/generar-numero', [IngresoMaterialController::class, 'generarNumeroIngreso']);
    
    // Información de órdenes
    Route::post('/info-orden', [IngresoMaterialController::class, 'obtenerInfoOrden']);
    Route::post('/precargar-productos', [IngresoMaterialController::class, 'precargarProductos']);
    
    // Guardar ingreso
    Route::post('/guardar', [IngresoMaterialController::class, 'guardarIngreso']);
    
    // PDF
    Route::get('/{idIngreso}/pdf', [IngresoMaterialController::class, 'generarPDF']);
    
    // Historial
    Route::get('/historial-ingresos', [IngresoMaterialController::class, 'obtenerHistorialIngresos']);
    Route::get('/historial-servicios', [IngresoMaterialController::class, 'obtenerHistorialServicios']);
    Route::get('/historial-directos', [IngresoMaterialController::class, 'obtenerHistorialDirectos']);
    
    // Ingreso Directo - Catálogos
    Route::get('/empresas', [IngresoMaterialController::class, 'listarEmpresas']);
    Route::get('/proveedores', [IngresoMaterialController::class, 'listarProveedores']);
    Route::get('/monedas', [IngresoMaterialController::class, 'listarMonedas']);
    
    // Ingreso Directo - Guardar
    Route::post('/guardar-directo', [IngresoMaterialController::class, 'guardarIngresoDirecto']);
});

/*
|--------------------------------------------------------------------------
| API Routes - TRASLADO DE MATERIALES (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('traslado-materiales')->group(function () {
    
    // Generar número de traslado
    Route::get('/generar-numero', [TrasladoMaterialesController::class, 'generarNumero']);
    
    // Listar proyectos disponibles
    Route::get('/proyectos', [TrasladoMaterialesController::class, 'listarProyectos']);
    
    // Productos con stock por proyecto
    Route::get('/proyectos/{id}/productos-stock', [TrasladoMaterialesController::class, 'productosConStock']);
    
    // Obtener stock de un producto específico
    Route::get('/stock/{codigo_producto}/proyecto/{proyecto_id}', [TrasladoMaterialesController::class, 'obtenerStock']);
    
    // Guardar traslado
    Route::post('/', [TrasladoMaterialesController::class, 'store']);
    
    // Historial de traslados
    Route::get('/historial', [TrasladoMaterialesController::class, 'historial']);
    
    // Generar PDF del traslado
    Route::get('/{id}/pdf', [TrasladoMaterialesController::class, 'generarPDF']);
    
    // Detalle de un traslado
    Route::get('/{id}', [TrasladoMaterialesController::class, 'detalle']);
});

/*
|--------------------------------------------------------------------------
| API Routes - KARDEX (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('kardex')->group(function () {
    // Inventario actual
    Route::get('/inventario', [KardexController::class, 'getInventario']);
    
    // Historial de movimientos
    Route::get('/historial', [KardexController::class, 'getHistorial']);
    
    // Kardex de un producto específico
    Route::get('/producto/{codigo}', [KardexController::class, 'getKardexProducto']);
    
    // Stock actual de un producto
    Route::get('/stock/{codigo}/{proyecto?}', [KardexController::class, 'getStockProducto']);
});

/*
|--------------------------------------------------------------------------
| API Routes - PRODUCTOS (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('productos')->group(function () {
    // Catálogos
    Route::get('/familias', [ProductoController::class, 'obtenerFamilias']);
    Route::get('/unidades', [ProductoController::class, 'obtenerUnidades']);
    Route::get('/estadisticas', [ProductoController::class, 'estadisticas']);
    Route::get('/generar-codigo', [ProductoController::class, 'generarCodigo']);
    Route::get('/validar-codigo/{codigo}', [ProductoController::class, 'validarCodigo']);
    
    // CRUD Productos
    Route::get('/', [ProductoController::class, 'index']);
    Route::post('/', [ProductoController::class, 'store']);
    Route::get('/{codigo}', [ProductoController::class, 'show']);
    Route::put('/{codigo}', [ProductoController::class, 'update']);
    Route::delete('/{codigo}', [ProductoController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API Routes - PROVEEDORES (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('proveedores')->group(function () {
    // Buscar debe ir ANTES de /{id} para evitar conflictos
    Route::get('/buscar', [ProveedorController::class, 'buscar']);
    
    // CRUD Proveedores
    Route::get('/', [ProveedorController::class, 'index']);
    Route::post('/', [ProveedorController::class, 'store']);
    Route::get('/{id}', [ProveedorController::class, 'show']);
    Route::put('/{id}', [ProveedorController::class, 'update']);
    Route::delete('/{id}', [ProveedorController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| API Routes - Órdenes de Pedido
|--------------------------------------------------------------------------
*/

Route::prefix('pedidos')->group(function () {
    
    // Catálogos
    Route::get('/empresas', [OrdenPedidoController::class, 'getEmpresas']);
    Route::get('/proyectos/{id_empresa}', [OrdenPedidoController::class, 'getProyectosByEmpresa']);
    Route::get('/productos', [OrdenPedidoController::class, 'getProductos']);
    
    // Correlativo
    Route::get('/correlativo', [OrdenPedidoController::class, 'getCorrelativo']);
    
    // CRUD Órdenes de Pedido
    Route::get('/', [OrdenPedidoController::class, 'index']);
    Route::post('/', [OrdenPedidoController::class, 'store']);
    Route::get('/{id}', [OrdenPedidoController::class, 'show']);
    Route::delete('/{id}', [OrdenPedidoController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API Routes - PROYECTOS (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('proyectos')->group(function () {
    
    // CATÁLOGOS (para los selectores del formulario)
    Route::get('/empresas', [ProyectoController::class, 'obtenerEmpresas']);
    Route::get('/bodegas', [ProyectoController::class, 'obtenerBodegas']);
    Route::get('/bodegas/{id_empresa}', [ProyectoController::class, 'obtenerBodegasPorEmpresa']);
    Route::get('/reservas', [ProyectoController::class, 'obtenerReservas']);
    Route::get('/personas', [ProyectoController::class, 'obtenerPersonas']);
    Route::get('/lista', [ProyectoController::class, 'listaSimplificada']); // ✅ NUEVO: para dropdowns
    
    // CRUD PROYECTOS
    Route::get('/', [ProyectoController::class, 'index']);
    Route::post('/', [ProyectoController::class, 'store']);
    Route::get('/{id}', [ProyectoController::class, 'show']);
    Route::put('/{id}', [ProyectoController::class, 'update']);
    Route::delete('/{id}', [ProyectoController::class, 'destroy']);
    
    // SUBPROYECTOS
    Route::get('/{id}/subproyectos', [ProyectoController::class, 'obtenerSubproyectos']);
    Route::post('/{id}/subproyectos', [ProyectoController::class, 'crearSubproyecto']);
    Route::put('/{idProyecto}/subproyectos/{idSubproyecto}', [ProyectoController::class, 'actualizarSubproyecto']);
    Route::delete('/{idProyecto}/subproyectos/{idSubproyecto}', [ProyectoController::class, 'eliminarSubproyecto']);
});

/*
|--------------------------------------------------------------------------
| API Routes - BODEGAS (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('bodegas')->group(function () {
    // Listar todas las bodegas
    Route::get('/', [BodegaController::class, 'index']);
    
    // Obtener bodegas por empresa
    Route::get('/empresa/{id_empresa}', [BodegaController::class, 'porEmpresa']);
    
    // Estadísticas
    Route::get('/estadisticas', [BodegaController::class, 'estadisticas']);
    
    // Ver una bodega específica
    Route::get('/{id}', [BodegaController::class, 'show']);
    
    // Crear nueva bodega
    Route::post('/', [BodegaController::class, 'store']);
    
    // Actualizar bodega
    Route::put('/{id}', [BodegaController::class, 'update']);
    
    // Eliminar bodega
    Route::delete('/{id}', [BodegaController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API Routes - RESERVAS (NUEVO)
|--------------------------------------------------------------------------
*/

Route::prefix('reservas')->group(function () {
    // Listar todas las reservas
    Route::get('/', [ReservaController::class, 'index']);
    
    // Obtener solo activas
    Route::get('/activas', [ReservaController::class, 'activas']);
    
    // Estadísticas
    Route::get('/estadisticas', [ReservaController::class, 'estadisticas']);
    
    // Ver una reserva específica
    Route::get('/{id}', [ReservaController::class, 'show']);
    
    // Crear nueva reserva
    Route::post('/', [ReservaController::class, 'store']);
    
    // Actualizar reserva
    Route::put('/{id}', [ReservaController::class, 'update']);
    
    // Eliminar reserva
    Route::delete('/{id}', [ReservaController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API Routes - APROBACIÓN (✅ CORREGIDO)
|--------------------------------------------------------------------------
*/

Route::prefix('aprobacion')->group(function () {
    // ✅ CAMBIADO A AprobacionController
    Route::get('/ordenes-compra', [AprobacionController::class, 'listarOrdenesCompraPendientes']);
    Route::get('/ordenes-servicio', [AprobacionController::class, 'listarOrdenesServicioPendientes']);
    Route::get('/ordenes-compra/{id}/detalles', [AprobacionController::class, 'obtenerDetallesOrdenCompra']);
    Route::get('/ordenes-servicio/{id}/detalles', [AprobacionController::class, 'obtenerDetallesOrdenServicio']);
    Route::put('/ordenes-compra/{id}/estado', [AprobacionController::class, 'actualizarEstadoOrdenCompra']);
    Route::put('/ordenes-servicio/{id}/estado', [AprobacionController::class, 'actualizarEstadoOrdenServicio']);
});

// Rutas públicas (sin autenticación)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas protegidas con JWT (requieren autenticación)
Route::middleware(['jwt.auth'])->group(function () {
    
    // Rutas de autenticación
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/check-admin', [AuthController::class, 'checkAdminPermissions']);
    });

    // Rutas del Dashboard (para todos los usuarios autenticados)
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'getStats']);
        Route::get('/activity', [DashboardController::class, 'getRecentActivity']);
        Route::get('/alerts', [DashboardController::class, 'getSystemAlerts']);
        Route::get('/summary', [DashboardController::class, 'getDashboardSummary']);
    });

    // Rutas para usuarios generales (tanto admin como usuario)
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json([
                'success' => true,
                'message' => 'Acceso al dashboard de usuario',
                'data' => [
                    'modules' => [
                        'profile' => true,
                        'reports' => true,
                        'notifications' => true
                    ]
                ]
            ]);
        });
    });

    // Rutas solo para administradores
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        
        Route::get('/dashboard', function () {
            return response()->json([
                'success' => true,
                'message' => 'Acceso al dashboard de administrador',
                'data' => [
                    'modules' => [
                        'user_management' => true,
                        'approval_modules' => true,
                        'system_config' => true,
                        'reports' => true,
                        'audit_logs' => true
                    ]
                ]
            ]);
        });

        // Módulos de aprobación (solo admin)
        Route::prefix('approval')->group(function () {
            Route::get('/pending', function () {
                return response()->json([
                    'success' => true,
                    'message' => 'Lista de aprobaciones pendientes',
                    'data' => [
                        'pending_approvals' => []
                    ]
                ]);
            });

            Route::post('/approve/{id}', function ($id) {
                return response()->json([
                    'success' => true,
                    'message' => "Aprobación {$id} procesada exitosamente"
                ]);
            });

            Route::post('/reject/{id}', function ($id) {
                return response()->json([
                    'success' => true,
                    'message' => "Aprobación {$id} rechazada exitosamente"
                ]);
            });
        });

        // Gestión de usuarios (solo admin)
        Route::prefix('users')->group(function () {
            Route::get('/', function () {
                return response()->json([
                    'success' => true,
                    'message' => 'Lista de usuarios del sistema',
                    'data' => [
                        'users' => []
                    ]
                ]);
            });
        });
    });
});

// Ruta de prueba para verificar que la API funciona
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API funcionando correctamente',
        'timestamp' => now()
    ]);
});




// Rutas de Personal
Route::prefix('personal')->group(function () {
    Route::get('/', [PersonalController::class, 'index']);
    Route::post('/', [PersonalController::class, 'store']);
    Route::get('/{id}', [PersonalController::class, 'show']);
    Route::put('/{id}', [PersonalController::class, 'update']);
    Route::delete('/{id}', [PersonalController::class, 'destroy']);
    Route::get('/proyecto/{idProyecto}', [PersonalController::class, 'porProyecto']);
});

// También necesitarás endpoints para áreas (si no los tienes)
Route::get('/areas', function() {
    return response()->json(DB::table('area')->get());
});

/*
|--------------------------------------------------------------------------
| API Routes - Salida de Materiales
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Api\SalidaMaterialController;

Route::prefix('salida-materiales')->group(function () {
    // Catálogos
    Route::get('/proyectos', [SalidaMaterialController::class, 'listarProyectos']);
    Route::get('/trabajadores', [SalidaMaterialController::class, 'listarTrabajadores']);
    Route::get('/productos-por-proyecto', [SalidaMaterialController::class, 'obtenerProductosPorProyecto']);
    
    // Generación de número
    Route::get('/generar-numero', [SalidaMaterialController::class, 'generarNumeroSalida']);
    
    // CRUD
    Route::post('/guardar', [SalidaMaterialController::class, 'guardarSalida']);
    Route::get('/historial', [SalidaMaterialController::class, 'obtenerHistorial']);
    Route::get('/detalle/{numeroSalida}', [SalidaMaterialController::class, 'obtenerDetalleSalida']);
    
    // PDF
    Route::get('/pdf/{numeroSalida}', [SalidaMaterialController::class, 'generarPDF']);
});
