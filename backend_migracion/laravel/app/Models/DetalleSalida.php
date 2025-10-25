<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleSalida extends Model
{
    protected $table = 'detalle_salida';
    protected $primaryKey = 'id_detalle_salida';
    public $timestamps = false;

    protected $fillable = [
        'numero_salida',
        'codigo_producto',
        'descripcion',
        'cantidad',
        'unidad_medida',
        'observacion_general'
    ];

    /**
     * Relación con la salida principal
     */
    public function salida()
    {
        return $this->belongsTo(SalidaMaterial::class, 'numero_salida', 'numero_salida');
    }

    /**
     * Relación con el producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'codigo_producto', 'codigo_producto');
    }
}
