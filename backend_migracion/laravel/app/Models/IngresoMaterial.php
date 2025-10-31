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
        'proyecto_almacen',
        'id_bodega',      // Nueva columna para almacenamiento por bodega
        'id_reserva'      // Nueva columna para almacenamiento por reserva
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

    /**
     * Relación con Bodega (nueva)
     */
    public function bodega()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega', 'id_bodega');
    }

    /**
     * Relación con Reserva (nueva)
     */
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva', 'id_reserva');
    }
}
