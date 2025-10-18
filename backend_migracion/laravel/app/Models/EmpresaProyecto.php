<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpresaProyecto extends Model
{
    protected $table = 'EMPRESA_PROYECTO';
    protected $primaryKey = 'id_empresa_proyecto';
    public $timestamps = false;

    protected $fillable = [
        'id_empresa',
        'id_proyecto',
        'fecha_asignacion',
        'observaciones',
        'fecha_creacion',
        'usuario_creacion',
        'fecha_modificacion',
        'usuario_modificacion'
    ];

    protected $casts = [
        'fecha_asignacion' => 'date',
        'fecha_creacion' => 'datetime',
        'fecha_modificacion' => 'datetime'
    ];

    // Relación con Empresa
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    // Relación con Proyecto
    public function proyecto()
    {
        return $this->belongsTo(ProyectoAlmacen::class, 'id_proyecto', 'id_proyecto');
    }

    // Scope para buscar por empresa
    public function scopeDeEmpresa($query, $idEmpresa)
    {
        return $query->where('id_empresa', $idEmpresa);
    }

    // Scope para buscar por proyecto
    public function scopeDeProyecto($query, $idProyecto)
    {
        return $query->where('id_proyecto', $idProyecto);
    }
}
