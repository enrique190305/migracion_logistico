<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProyectoAlmacen extends Model
{
    protected $table = 'proyecto_almacen';
    protected $primaryKey = 'id_proyecto_almacen';
    public $timestamps = false;

    protected $fillable = [
        'tipo_movil',
        'id_referencia',
        'id_empresa',
        'id_bodega',
        'id_reserva',
        'codigo_proyecto',
        'nombre_proyecto',
        'descripcion',
        'fecha_registro',
        'estado'
    ];

    protected $casts = [
        'fecha_registro' => 'date'
    ];

    // Relaciones
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

    // Relación polimórfica manual según tipo_movil
    public function movil()
    {
        if ($this->tipo_movil === 'CON_PROYECTO') {
            return $this->belongsTo(MovilProyecto::class, 'id_referencia', 'id_movil_proyecto');
        } else {
            return $this->belongsTo(MovilPersona::class, 'id_referencia', 'id_movil_persona');
        }
    }

    public function movilProyecto()
    {
        return $this->belongsTo(MovilProyecto::class, 'id_referencia', 'id_movil_proyecto')
                    ->where('tipo_movil', 'CON_PROYECTO');
    }

    public function movilPersona()
    {
        return $this->belongsTo(MovilPersona::class, 'id_referencia', 'id_movil_persona')
                    ->where('tipo_movil', 'SIN_PROYECTO');
    }

    // Relación N:N con Empresas a través de tabla intermedia (mantenida para compatibilidad)
    public function empresas()
    {
        return $this->belongsToMany(
            Empresa::class,
            'empresa_proyecto',
            'id_proyecto',
            'id_empresa',
            'id_proyecto_almacen',
            'id_empresa'
        )
        ->withPivot('fecha_asignacion', 'observaciones')
        ->withTimestamps();
    }

    // Relación con Orden Pedido
    public function ordenesPedido()
    {
        return $this->hasMany(OrdenPedido::class, 'id_proyecto', 'id_proyecto_almacen');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeConProyecto($query)
    {
        return $query->where('tipo_movil', 'CON_PROYECTO');
    }

    public function scopeSinProyecto($query)
    {
        return $query->where('tipo_movil', 'SIN_PROYECTO');
    }

    public function scopePorEmpresa($query, $idEmpresa)
    {
        return $query->where('id_empresa', $idEmpresa);
    }

    // Atributos computados
    public function getEsProyectoAttribute()
    {
        return $this->tipo_movil === 'CON_PROYECTO';
    }

    public function getEsPersonaAttribute()
    {
        return $this->tipo_movil === 'SIN_PROYECTO';
    }
}
