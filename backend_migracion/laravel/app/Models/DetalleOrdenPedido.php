<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleOrdenPedido extends Model
{
    protected $table = 'DETALLE_ORDEN_PEDIDO'; // Tabla en MAYÚSCULAS
    protected $primaryKey = 'id_detalle_pedido';
    public $timestamps = false;

    protected $fillable = [
        'id_orden_pedido',
        'codigo_producto',
        'cantidad_solicitada',
        'cantidad_aprobada',
        'cantidad_entregada',
        'unidad',
        'stock_actual',
        'observacion',
        'estado_linea'
    ];

    // Relación con Orden Pedido
    public function ordenPedido()
    {
        return $this->belongsTo(OrdenPedido::class, 'id_orden_pedido', 'id_orden_pedido');
    }

    // Relación con Producto
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'codigo_producto', 'codigo_producto');
    }
}
