<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrasladoMaterial extends Model
{
    protected $table = 'traslado_materiales';
    protected $primaryKey = 'id_traslado';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id_traslado',
        'fecha_traslado',
        'proyecto_origen',
        'proyecto_destino',
        'usuario',
        'estado',
        'fecha_creacion'
    ];

    protected $casts = [
        'fecha_traslado' => 'date',
        'fecha_creacion' => 'datetime'
    ];

    /**
     * Relación con los detalles del traslado
     */
    public function detalles()
    {
        return $this->hasMany(DetalleTraslado::class, 'id_traslado', 'id_traslado');
    }

    /**
     * Scope para filtrar por rango de fechas
     */
    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_traslado', [$fechaInicio, $fechaFin]);
    }

    /**
     * Scope para filtrar por proyecto origen
     */
    public function scopeProyectoOrigen($query, $proyecto)
    {
        return $query->where('proyecto_origen', $proyecto);
    }

    /**
     * Scope para filtrar por proyecto destino
     */
    public function scopeProyectoDestino($query, $proyecto)
    {
        return $query->where('proyecto_destino', $proyecto);
    }

    /**
     * Scope para filtrar por usuario
     */
    public function scopePorUsuario($query, $usuario)
    {
        return $query->where('usuario', $usuario);
    }

    /**
     * Obtener total de productos del traslado
     */
    public function getTotalProductosAttribute()
    {
        return $this->detalles()->count();
    }

    /**
     * Obtener cantidad total trasladada
     */
    public function getCantidadTotalAttribute()
    {
        return $this->detalles()->sum('cantidad');
    }
}
