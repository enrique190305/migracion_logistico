<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BodegaStock extends Model
{
    use HasFactory;

    protected $table = 'bodega_stock';
    protected $primaryKey = 'id_stock';
    public $timestamps = false; // Usamos fecha_ultima_actualizacion personalizada

    protected $fillable = [
        'id_bodega',
        'id_reserva',
        'codigo_producto',
        'cantidad_disponible',
        'cantidad_reservada',
    ];

    protected $casts = [
        'cantidad_disponible' => 'decimal:2',
        'cantidad_reservada' => 'decimal:2',
        'fecha_ultima_actualizacion' => 'datetime',
    ];

    /**
     * Relación con Bodega
     */
    public function bodega()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega', 'id_bodega');
    }

    /**
     * Relación con Reserva
     */
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva', 'id_reserva');
    }

    /**
     * Relación con Producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'codigo_producto', 'codigo_producto');
    }

    /**
     * Scope para obtener stock por bodega
     */
    public function scopePorBodega($query, $idBodega)
    {
        return $query->where('id_bodega', $idBodega);
    }

    /**
     * Scope para obtener stock por reserva
     */
    public function scopePorReserva($query, $idReserva)
    {
        return $query->where('id_reserva', $idReserva);
    }

    /**
     * Scope para obtener stock de un producto específico
     */
    public function scopePorProducto($query, $codigoProducto)
    {
        return $query->where('codigo_producto', $codigoProducto);
    }

    /**
     * Scope para obtener solo productos con stock disponible
     */
    public function scopeConStock($query)
    {
        return $query->where('cantidad_disponible', '>', 0);
    }

    /**
     * Obtener cantidad total disponible
     */
    public function getCantidadTotalAttribute()
    {
        return $this->cantidad_disponible + $this->cantidad_reservada;
    }
}
