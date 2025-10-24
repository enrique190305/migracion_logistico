<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleIngresoMaterial extends Model
{
    protected $table = 'detalle_ingreso_material';
    protected $primaryKey = 'id_detalle_ingreso';
    public $timestamps = false;

    protected $fillable = [
        'id_ingreso',
        'codigo_producto',
        'cantidad_recibida',
        'observaciones'
    ];

    protected $casts = [
        'cantidad_recibida' => 'decimal:2'
    ];

    /**
     * Relación con Ingreso de Material
     */
    public function ingresoMaterial()
    {
        return $this->belongsTo(IngresoMaterial::class, 'id_ingreso', 'id_ingreso');
    }

    /**
     * Relación con Producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'codigo_producto', 'codigo_producto');
    }
}
