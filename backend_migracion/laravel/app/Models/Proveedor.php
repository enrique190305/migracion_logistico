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
        'numer_cuenta',  // Nombre del campo en la BD (sin 'o')
        'id_banco',
        'forma_pago',
        'servicio'
    ];

    // Accessor para mantener compatibilidad con 'numero_cuenta'
    public function getNumeroCuentaAttribute()
    {
        return $this->numer_cuenta;
    }

    // Relaciones
    public function banco()
    {
        return $this->belongsTo(Banco::class, 'id_banco', 'id_banco');
    }

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
