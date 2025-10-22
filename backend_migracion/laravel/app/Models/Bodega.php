<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bodega extends Model
{
    protected $table = 'bodega';
    protected $primaryKey = 'id_bodega';
    public $timestamps = false;

    protected $fillable = [
        'id_empresa',
        'nombre',
        'ubicacion',
        'estado',
        'fecha_creacion'
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime'
    ];

    // Relaciones
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    public function movilPersonas()
    {
        return $this->hasMany(MovilPersona::class, 'id_bodega', 'id_bodega');
    }

    public function movilProyectos()
    {
        return $this->hasMany(MovilProyecto::class, 'id_bodega', 'id_bodega');
    }

    public function proyectosAlmacen()
    {
        return $this->hasMany(ProyectoAlmacen::class, 'id_bodega', 'id_bodega');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopePorEmpresa($query, $idEmpresa)
    {
        return $query->where('id_empresa', $idEmpresa);
    }
}
