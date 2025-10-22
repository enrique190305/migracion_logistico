<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenPedido extends Model
{
    protected $table = 'orden_pedido'; // Tabla en minúsculas (coincide con BD)
    protected $primaryKey = 'id_orden_pedido';
    public $timestamps = false;

    protected $fillable = [
        'correlativo',
        'id_empresa',
        'id_proyecto',
        'fecha_pedido',
        'observacion',
        'estado',
        'estado_compra',
        'fecha_requerida',
        'usuario_solicitante',
        'usuario_aprobador',
        'fecha_aprobacion',
        'usuario_creacion',
        'fecha_creacion',
        'usuario_modificacion',
        'fecha_modificacion'
    ];

    // Relación con Empresa
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    // Relación con Proyecto
    public function proyecto()
    {
        return $this->belongsTo(ProyectoAlmacen::class, 'id_proyecto', 'id_proyecto');
    }

    // Relación con Detalles
    public function detalles()
    {
        return $this->hasMany(DetalleOrdenPedido::class, 'id_orden_pedido', 'id_orden_pedido');
    }
}
