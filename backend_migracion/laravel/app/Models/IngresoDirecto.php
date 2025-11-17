<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IngresoDirecto extends Model
{
    protected $table = 'ingreso_directo';
    protected $primaryKey = 'id_ingreso_directo';
    public $timestamps = false;

    protected $fillable = [
        'correlativo',
        'id_empresa',
        'id_proveedor',
        'id_bodega',        // ← CAMPO NUEVO AGREGADO
        'id_forma_pago',
        'id_moneda',
        'contacto',
        'celular',
        'correo',
        'latitud',
        'longitud',
        'destino',
        'fecha_servicio',
        'fecha_oc',
        'fecha_requerida',
        'igv',
        'total_general',
        'estado',
        'usuario_creacion',
        'fecha_creacion',
        'usuario_modificacion',
        'fecha_modificacion'
    ];

    protected $casts = [
        'fecha_servicio' => 'date',
        'fecha_oc' => 'date',
        'fecha_requerida' => 'date',
        'fecha_creacion' => 'datetime',
        'fecha_modificacion' => 'datetime',
        'igv' => 'decimal:2',
        'total_general' => 'decimal:2'
    ];

    /**
     * Relación con Empresa
     */
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    /**
     * Relación con Proveedor
     */
    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }

    /**
     * Relación con Bodega (NUEVA)
     */
    public function bodega()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega', 'id_bodega');
    }

    /**
     * Relación con Forma de Pago
     */
    public function formaPago()
    {
        return $this->belongsTo(FormaPago::class, 'id_forma_pago', 'id_forma_pago');
    }

    /**
     * Relación con Moneda
     */
    public function moneda()
    {
        return $this->belongsTo(Moneda::class, 'id_moneda', 'id_moneda');
    }

    /**
     * Relación con los detalles del ingreso directo
     */
    public function detalles()
    {
        return $this->hasMany(DetalleIngresoDirecto::class, 'id_ingreso_directo', 'id_ingreso_directo');
    }
}
