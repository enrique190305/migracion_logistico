<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'EMPRESA';
    protected $primaryKey = 'id_empresa';
    public $timestamps = false;

    protected $fillable = [
        'razon_social',
        'ruc',
        'nombre_comercial',
        'fecha_creacion',
        'estado_contribuyente',
        'domicilio_fiscal',
        'actividades_economicas'
    ];

    // Relaciones
    public function ordenesCompra()
    {
        return $this->hasMany(OrdenCompra::class, 'id_empresa', 'id_empresa');
    }

    public function ordenesServicio()
    {
        return $this->hasMany(OrdenServicio::class, 'id_empresa', 'id_empresa');
    }

    // Relación N:N con Proyectos a través de tabla intermedia
    public function proyectos()
    {
        return $this->belongsToMany(
            ProyectoAlmacen::class,
            'EMPRESA_PROYECTO',
            'id_empresa',
            'id_proyecto',
            'id_empresa',
            'id_proyecto'
        )
        ->withPivot('fecha_asignacion', 'observaciones')
        ->withTimestamps();
    }

    // Relación directa con la tabla intermedia
    public function empresaProyectos()
    {
        return $this->hasMany(EmpresaProyecto::class, 'id_empresa', 'id_empresa');
    }

    public function ordenesPedido()
    {
        return $this->hasMany(OrdenPedido::class, 'id_empresa', 'id_empresa');
    }
}
