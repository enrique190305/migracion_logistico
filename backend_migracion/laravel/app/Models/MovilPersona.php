<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovilPersona extends Model
{
    protected $table = 'movil_persona';
    protected $primaryKey = 'id_movil_persona';
    public $timestamps = false;

    protected $fillable = [
        'id_persona',
        'id_empresa',
        'id_bodega',
        'id_reserva',
        'id_responsable',
        'nom_ape',
        'dni',
        'ciudad',
        'observaciones',
        'firma',
        'fecha_registro',
        'estado'
    ];

    protected $casts = [
        'fecha_registro' => 'date'
    ];

    // Relaciones
    public function persona()
    {
        return $this->belongsTo(User::class, 'id_persona', 'id');
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    public function bodega()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega', 'id_bodega');
    }

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva', 'id_reserva');
    }

    public function responsable()
    {
        return $this->belongsTo(User::class, 'id_responsable', 'id');
    }

    public function proyectoAlmacen()
    {
        return $this->hasOne(ProyectoAlmacen::class, 'id_referencia', 'id_movil_persona')
                    ->where('tipo_movil', 'SIN_PROYECTO');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }
}
