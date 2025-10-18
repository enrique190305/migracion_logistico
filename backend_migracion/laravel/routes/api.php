<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrdenCompraServicioController;
use App\Http\Controllers\OrdenPedidoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

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
                        'pending_approvals' => [
                            // Aquí irían las aprobaciones pendientes
                        ]
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
                        'users' => [
                            // Aquí iría la lista de usuarios
                        ]
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