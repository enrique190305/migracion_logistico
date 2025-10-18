<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'PRODUCTO';
    protected $primaryKey = 'codigo_producto';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'codigo_producto',
        'tipo_producto',
        'descripcion',
        'unidad',
        'observacion'
    ];

    // Relaciones
    public function detallesOrdenCompra()
    {
        return $this->hasMany(DetalleOrdenCompra::class, 'codigo_producto', 'codigo_producto');
    }

    public function familia()
    {
        return $this->belongsTo(Familia::class, 'tipo_producto', 'tipo_producto');
    }

    // Scopes
    public function scopeBuscar($query, $termino)
    {
        return $query->where(function($q) use ($termino) {
            $q->where('codigo_producto', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        });
    }
}
