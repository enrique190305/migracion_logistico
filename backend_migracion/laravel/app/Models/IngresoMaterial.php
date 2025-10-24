<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IngresoMaterial extends Model
{
    protected $table = 'ingreso_material';
    protected $primaryKey = 'id_ingreso';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_ingreso',
        'id_oc',
        'fecha_ingreso',
        'num_guia',
        'factura',
        'observaciones',
        'usuario',
        'proyecto_almacen'
    ];

    protected $casts = [
        'fecha_ingreso' => 'date'
    ];

    /**
     * Relación con Orden de Compra
     */
    public function ordenCompra()
    {
        return $this->belongsTo(OrdenCompra::class, 'id_oc', 'id_oc');
    }

    /**
     * Relación con los detalles del ingreso
     */
    public function detalles()
    {
        return $this->hasMany(DetalleIngresoMaterial::class, 'id_ingreso', 'id_ingreso');
    }
}
