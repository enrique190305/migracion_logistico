<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Moneda extends Model
{
    use HasFactory;

    protected $table = 'moneda';
    protected $primaryKey = 'id_moneda';
    public $timestamps = false;

    protected $fillable = [
        'tipo_moneda'
    ];

    // Relaciones
    public function ordenesCompra()
    {
        return $this->hasMany(OrdenCompra::class, 'id_moneda', 'id_moneda');
    }

    public function ordenesServicio()
    {
        return $this->hasMany(OrdenServicio::class, 'id_moneda', 'id_moneda');
    }
}
