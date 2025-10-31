<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamiliaProducto extends Model
{
    use HasFactory;

    protected $table = 'familia';
    protected $primaryKey = 'id_familia';
    public $timestamps = false;

    protected $fillable = [
        'nombre_familia',
        'prefijo_codigo',
        'descripcion',
        'estado'
    ];

    const CREATED_AT = 'fecha_creacion';
    const UPDATED_AT = 'fecha_modificacion';

    // Relación: Una familia tiene muchas subfamilias
    public function subfamilias()
    {
        return $this->hasMany(SubfamiliaProducto::class, 'id_familia', 'id_familia');
    }

    // Relación: Una familia tiene muchos productos (a través de subfamilias)
    public function productos()
    {
        return $this->hasManyThrough(
            ProductoNuevo::class,
            SubfamiliaProducto::class,
            'id_familia',
            'id_subfamilia',
            'id_familia',
            'id_subfamilia'
        );
    }

    // Scope para solo activos
    public function scopeActivo($query)
    {
        return $query->where('estado', 'ACTIVO');
    }
}
