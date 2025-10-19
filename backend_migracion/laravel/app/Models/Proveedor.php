<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'proveedor';
    protected $primaryKey = 'id_proveedor';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'ruc',
        'direccion',
        'contacto',
        'celular',
        'correo',
        'forma_pago',
        'servicio'
    ];

    // Relaciones
    public function ordenesCompra()
    {
        return $this->hasMany(OrdenCompra::class, 'id_proveedor', 'id_proveedor');
    }

    public function ordenesServicio()
    {
        return $this->hasMany(OrdenServicio::class, 'id_proveedor', 'id_proveedor');
    }
}
