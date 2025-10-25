<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalidaMaterial extends Model
{
    protected $table = 'salidas_materiales';
    protected $primaryKey = 'numero_salida';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'numero_salida',
        'proyecto_almacen',
        'id_personal',
        'fecha_salida',
        'observaciones',
        'usuario_registro',
        'fecha_registro'
    ];

    /**
     * Relación con Personal (Trabajador que recibe)
     */
    public function personal()
    {
        return $this->belongsTo(Personal::class, 'id_personal', 'id_personal');
    }

    /**
     * Relación con los detalles de la salida
     */
    public function detalles()
    {
        return $this->hasMany(DetalleSalida::class, 'numero_salida', 'numero_salida');
    }
}
