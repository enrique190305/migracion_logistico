<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleOrdenServicio extends Model
{
    use HasFactory;

    protected $table = 'detalle_os';
    protected $primaryKey = 'id_detalle_os';
    public $timestamps = false;

    protected $fillable = [
        'id_os',
        'codigo_servicio',
        'descripcion',
        'cantidad',
        'unidad',
        'precio_unitario',
        'subtotal',
        'total'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Relación
    public function ordenServicio()
    {
        return $this->belongsTo(OrdenServicio::class, 'id_os', 'id_os');
    }
}
