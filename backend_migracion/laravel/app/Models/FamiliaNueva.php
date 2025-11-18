<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamiliaNueva extends Model
{
    use HasFactory;

    protected $table = 'familia_nueva';
    protected $primaryKey = 'id_familia';
    public $timestamps = false;

    const CREATED_AT = 'fecha_creacion';
    const UPDATED_AT = 'fecha_modificacion';

    protected $fillable = [
        'nombre_familia',
        'prefijo_codigo',
        'tipo_producto_legacy',
        'descripcion',
        'estado'
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'fecha_modificacion' => 'datetime',
    ];

    /**
     * Relación: Una familia tiene muchas subfamilias
     */
    public function subfamilias()
    {
        return $this->hasMany(Subfamilia::class, 'id_familia', 'id_familia');
    }

    /**
     * Relación: Una familia tiene muchos productos (a través de subfamilias)
     */
    public function productos()
    {
        return $this->hasManyThrough(
            Producto::class,
            Subfamilia::class,
            'id_familia',      // Foreign key en subfamilia
            'id_subfamilia',   // Foreign key en producto
            'id_familia',      // Local key en familia_nueva
            'id_subfamilia'    // Local key en subfamilia
        );
    }

    /**
     * Scope para solo activos
     */
    public function scopeActivo($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    /**
     * Scope para buscar por prefijo
     */
    public function scopePorPrefijo($query, $prefijo)
    {
        return $query->where('prefijo_codigo', $prefijo);
    }

    /**
     * Accessor para obtener subfamilias activas
     */
    public function getSubfamiliasActivasAttribute()
    {
        return $this->subfamilias()->where('estado', 'ACTIVO')->get();
    }

    /**
     * Accessor para obtener cantidad de subfamilias
     */
    public function getCantidadSubfamiliasAttribute()
    {
        return $this->subfamilias()->count();
    }

    /**
     * Accessor para obtener cantidad de productos
     */
    public function getCantidadProductosAttribute()
    {
        return $this->productos()->count();
    }
}
