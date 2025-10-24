<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoKardex extends Model
{
    protected $table = 'movimiento_kardex';
    protected $primaryKey = 'id_movimiento';
    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'tipo_movimiento',
        'codigo_producto',
        'descripcion',
        'unidad',
        'cantidad',
        'proyecto',
        'documento',
        'precio_unitario',
        'observaciones'
    ];

    protected $casts = [
        'fecha' => 'date',
        'cantidad' => 'decimal:2',
        'precio_unitario' => 'decimal:2'
    ];

    /**
     * Relación con Producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'codigo_producto', 'codigo_producto');
    }
}
