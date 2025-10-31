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
        'fecha_creacion',
        'id_bodega_origen',      // Nueva columna para bodega origen
        'reserva_origen',        // Nueva columna para reserva origen
        'id_bodega_destino',     // Nueva columna para bodega destino
        'reserva_destino'        // Nueva columna para reserva destino
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
     * Relación con Bodega Origen (nueva)
     */
    public function bodegaOrigen()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega_origen', 'id_bodega');
    }

    /**
     * Relación con Reserva Origen (nueva)
     */
    public function reservaOrigenRelacion()
    {
        return $this->belongsTo(Reserva::class, 'reserva_origen', 'id_reserva');
    }

    /**
     * Relación con Bodega Destino (nueva)
     */
    public function bodegaDestino()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega_destino', 'id_bodega');
    }

    /**
     * Relación con Reserva Destino (nueva)
     */
    public function reservaDestinoRelacion()
    {
        return $this->belongsTo(Reserva::class, 'reserva_destino', 'id_reserva');
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
     * Scope para filtrar por reserva origen (nuevo)
     */
    public function scopeReservaOrigen($query, $idReserva)
    {
        return $query->where('reserva_origen', $idReserva);
    }

    /**
     * Scope para filtrar por reserva destino (nuevo)
     */
    public function scopeReservaDestino($query, $idReserva)
    {
        return $query->where('reserva_destino', $idReserva);
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
