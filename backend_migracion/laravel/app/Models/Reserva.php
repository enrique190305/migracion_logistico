<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reserva';
    protected $primaryKey = 'id_reserva';
    public $timestamps = false;

    protected $fillable = [
        'tipo_reserva',
        'estado',
        'fecha_creacion'
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime'
    ];

    // Relaciones
    public function movilPersonas()
    {
        return $this->hasMany(MovilPersona::class, 'id_reserva', 'id_reserva');
    }

    public function movilProyectos()
    {
        return $this->hasMany(MovilProyecto::class, 'id_reserva', 'id_reserva');
    }

    public function proyectosAlmacen()
    {
        return $this->hasMany(ProyectoAlmacen::class, 'id_reserva', 'id_reserva');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }
}
