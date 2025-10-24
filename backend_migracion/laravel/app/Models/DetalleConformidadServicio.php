<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleConformidadServicio extends Model
{
    protected $table = 'detalle_conformidad_servicio';
    protected $primaryKey = 'id_detalle_conf';
    public $timestamps = false;

    protected $fillable = [
        'id_conformidad',
        'codigo_servicio',
        'cantidad_conforme',
        'observaciones'
    ];

    protected $casts = [
        'cantidad_conforme' => 'decimal:2'
    ];

    /**
     * Relación con Conformidad de Servicio
     */
    public function conformidadServicio()
    {
        return $this->belongsTo(ConformidadServicio::class, 'id_conformidad', 'id_conformidad');
    }
}
