<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConformidadServicio extends Model
{
    protected $table = 'conformidad_servicio';
    protected $primaryKey = 'id_conformidad';
    public $timestamps = false;

    protected $fillable = [
        'id_os',
        'fecha_conformidad',
        'num_doc_servicio',
        'factura',
        'observaciones',
        'usuario',
        'proyecto_almacen'
    ];

    protected $casts = [
        'fecha_conformidad' => 'date'
    ];

    /**
     * Relación con Orden de Servicio
     */
    public function ordenServicio()
    {
        return $this->belongsTo(OrdenServicio::class, 'id_os', 'id_os');
    }

    /**
     * Relación con los detalles de la conformidad
     */
    public function detalles()
    {
        return $this->hasMany(DetalleConformidadServicio::class, 'id_conformidad', 'id_conformidad');
    }
}
