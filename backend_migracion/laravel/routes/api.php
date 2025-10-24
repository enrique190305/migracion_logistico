<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrdenCompraServicioController;
use App\Http\Controllers\Api\AprobacionController;
use App\Http\Controllers\Api\ProyectoController;
use App\Http\Controllers\KardexController;
use App\Http\Controllers\OrdenPedidoController;
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
    
    // Guardar órdenes
    Route::post('/compra', [OrdenCompraServicioController::class, 'guardarOrdenCompra']);
    Route::post('/servicio', [OrdenCompraServicioController::class, 'guardarOrdenServicio']);
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
    
    // CRUD PROYECTOS
    Route::get('/', [ProyectoController::class, 'index']);
    Route::post('/', [ProyectoController::class, 'store']);
    Route::get('/{id}', [ProyectoController::class, 'show']);
    Route::put('/{id}', [ProyectoController::class, 'update']);
    Route::delete('/{id}', [ProyectoController::class, 'destroy']);
    
    // SUBPROYECTOS
    Route::get('/{id}/subproyectos', [ProyectoController::class, 'obtenerSubproyectos']);
    Route::post('/{id}/subproyectos', [ProyectoController::class, 'crearSubproyecto']);
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