<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProyectoAlmacen extends Model
{
    protected $table = 'PROYECTO_ALMACEN'; // Tabla en MAYÚSCULAS
    protected $primaryKey = 'id_proyecto';
    public $timestamps = false;

    protected $fillable = [
        'codigo_proyecto',
        'nombre_proyecto',
        'descripcion',
        'ubicacion',
        'bodega',
        'responsable',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'presupuesto',
        'usuario_creacion',
        'fecha_creacion',
        'usuario_modificacion',
        'fecha_modificacion'
    ];

    // Relación N:N con Empresas a través de tabla intermedia
    public function empresas()
    {
        return $this->belongsToMany(
            Empresa::class,
            'EMPRESA_PROYECTO',
            'id_proyecto',
            'id_empresa',
            'id_proyecto',
            'id_empresa'
        )
        ->withPivot('fecha_asignacion', 'observaciones')
        ->withTimestamps();
    }

    // Relación directa con la tabla intermedia
    public function empresaProyectos()
    {
        return $this->hasMany(EmpresaProyecto::class, 'id_proyecto', 'id_proyecto');
    }

    // Relación con Orden Pedido
    public function ordenesPedido()
    {
        return $this->hasMany(OrdenPedido::class, 'id_proyecto', 'id_proyecto');
    }
}
