<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleTraslado extends Model
{
    protected $table = 'detalle_traslado';
    protected $primaryKey = 'id_detalle';
    public $timestamps = false;

    protected $fillable = [
        'id_traslado',
        'codigo_producto',
        'descripcion',
        'cantidad',
        'unidad',
        'observaciones',
        'fecha_creacion'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'fecha_creacion' => 'datetime'
    ];

    /**
     * Relación con el traslado principal
     */
    public function traslado()
    {
        return $this->belongsTo(TrasladoMaterial::class, 'id_traslado', 'id_traslado');
    }

    /**
     * Relación con el producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'codigo_producto', 'codigo_producto');
    }
}
