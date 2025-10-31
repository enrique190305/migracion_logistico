<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductoNuevo extends Model
{
    use HasFactory;

    protected $table = 'productos';
    protected $primaryKey = 'id_producto';
    public $timestamps = false;

    protected $fillable = [
        'codigo_producto',
        'id_subfamilia',
        'descripcion',
        'unidad_medida',
        'observacion',
        'id_bodega',
        'estado',
        'consumible',
        'stock_minimo',
        'stock_maximo'
    ];

    const CREATED_AT = 'fecha_creacion';
    const UPDATED_AT = 'fecha_modificacion';

    // Relación: Un producto pertenece a una subfamilia
    public function subfamilia()
    {
        return $this->belongsTo(SubfamiliaProducto::class, 'id_subfamilia', 'id_subfamilia');
    }

    // Relación: Un producto pertenece a una bodega
    public function bodega()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega', 'id_bodega');
    }

    // Scope para solo activos
    public function scopeActivo($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Event: Generar código automáticamente antes de crear
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($producto) {
            if (empty($producto->codigo_producto)) {
                $subfamilia = SubfamiliaProducto::with('familia')->find($producto->id_subfamilia);
                
                if ($subfamilia) {
                    $producto->codigo_producto = $subfamilia->generarSiguienteCodigoProducto();
                }
            }
        });
    }
}
