<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Familia extends Model
{
    use HasFactory;

    protected $table = 'FAMILIA';
    protected $primaryKey = 'tipo_producto';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'tipo_producto',
        'equivalencia'
    ];

    // Relación con productos
    public function productos()
    {
        return $this->hasMany(Producto::class, 'tipo_producto', 'tipo_producto');
    }
}
