<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdenCompra;
use App\Models\OrdenServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AprobacionController extends Controller
{
    /**
     * Listar órdenes de compra pendientes de aprobación
     */
    public function listarOrdenesCompraPendientes()
    {
        try {
            $ordenes = OrdenCompra::with(['empresa', 'proveedor', 'moneda'])
                ->whereIn('estado', ['PENDIENTE', 'Pendiente', 'pendiente'])
                ->orderBy('fecha_creacion', 'desc')
                ->get()
                ->map(function ($orden) {
                    return [
                        'id_oc' => $orden->id_oc,
                        'codigo_oc' => $orden->correlativo,
                        'empresa' => $orden->empresa->nombre ?? 'N/A',
                        'razon_social' => $orden->proveedor->razon_social ?? 'N/A',
                        'fecha_creacion' => $orden->fecha_oc,
                        'fecha_requerida' => $orden->fecha_requerida,
                        'moneda' => $orden->moneda->nombre ?? 'PEN',
                        'total' => $orden->total_general,
                        'estado' => $orden->estado,
                        'usuario_creacion' => $orden->usuario_creacion ?? 'admin',
                        'proyecto' => $orden->ordenPedido->proyecto->nombre ?? 'N/A'
                    ];
                });

            return response()->json($ordenes);
        } catch (\Exception $e) {
            Log::error('Error al listar órdenes de compra pendientes: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Listar órdenes de servicio pendientes de aprobación
     */
    public function listarOrdenesServicioPendientes()
    {
        try {
            $ordenes = OrdenServicio::with(['empresa', 'proveedor', 'moneda'])
                ->whereIn('estado', ['PENDIENTE', 'Pendiente', 'pendiente'])
                ->orderBy('fecha_creacion', 'desc')
                ->get()
                ->map(function ($orden) {
                    return [
                        'id_os' => $orden->id_os,
                        'codigo_os' => $orden->correlativo,
                        'empresa' => $orden->empresa->nombre ?? 'N/A',
                        'razon_social' => $orden->proveedor->razon_social ?? 'N/A',
                        'fecha_creacion' => $orden->fecha_servicio,
                        'fecha_requerida' => $orden->fecha_requerida,
                        'moneda' => $orden->moneda->nombre ?? 'PEN',
                        'total' => $orden->total_general,
                        'estado' => $orden->estado,
                        'usuario_creacion' => $orden->usuario_creacion ?? 'admin',
                        'proyecto' => 'N/A'
                    ];
                });

            return response()->json($ordenes);
        } catch (\Exception $e) {
            Log::error('Error al listar órdenes de servicio pendientes: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener detalles de orden de compra
     */
    public function obtenerDetallesOrdenCompra($id)
    {
        try {
            $orden = OrdenCompra::with(['detalles.producto'])->findOrFail($id);
            
            $detalles = $orden->detalles->map(function ($detalle) {
                return [
                    'codigo_producto' => $detalle->codigo_producto ?? 'N/A',
                    'descripcion' => $detalle->producto->descripcion ?? 'N/A',
                    'unidad' => $detalle->producto->unidad_medida ?? 'UND',
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->cantidad * $detalle->precio_unitario
                ];
            });

            return response()->json($detalles);
        } catch (\Exception $e) {
            Log::error('Error al obtener detalles de OC: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener detalles de orden de servicio
     */
    public function obtenerDetallesOrdenServicio($id)
    {
        try {
            $orden = OrdenServicio::with('detalles')->findOrFail($id);
            
            $detalles = $orden->detalles->map(function ($detalle) {
                return [
                    'codigo_servicio' => $detalle->codigo_servicio ?? 'N/A',
                    'descripcion' => $detalle->descripcion ?? 'N/A',
                    'unidad' => $detalle->unidad ?? 'UND',
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal ?? ($detalle->cantidad * $detalle->precio_unitario)
                ];
            });

            return response()->json($detalles);
        } catch (\Exception $e) {
            Log::error('Error al obtener detalles de OS: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar estado de orden de compra (Aprobar/Rechazar)
     */
    public function actualizarEstadoOrdenCompra(Request $request, $id)
    {
        try {
            $orden = OrdenCompra::findOrFail($id);
            
            $orden->estado = $request->estado;
            $orden->usuario_modificacion = auth()->user()->username ?? 'admin';
            $orden->fecha_modificacion = now();
            
            $orden->save();

            return response()->json([
                'success' => true,
                'message' => 'Estado de orden de compra actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar estado de OC: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar estado de orden de servicio (Aprobar/Rechazar)
     */
    public function actualizarEstadoOrdenServicio(Request $request, $id)
    {
        try {
            $orden = OrdenServicio::findOrFail($id);
            
            $orden->estado = $request->estado;
            $orden->usuario_modificacion = auth()->user()->username ?? 'admin';
            $orden->fecha_modificacion = now();
            
            $orden->save();

            return response()->json([
                'success' => true,
                'message' => 'Estado de orden de servicio actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar estado de OS: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}