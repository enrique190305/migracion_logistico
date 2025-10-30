<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdenServicio extends Model
{
    use HasFactory;

    protected $table = 'orden_servicio';
    protected $primaryKey = 'id_os';
    public $timestamps = false;

    protected $fillable = [
        'correlativo',
        'id_empresa',
        'id_orden_pedido',
        'id_proveedor',
        'id_forma_pago',
        'id_moneda',
        'contacto',
        'celular',
        'correo',
        'latitud',
        'longitud',
        'destino',
        'fecha_servicio',
        'fecha_requerida',
        'igv',
        'total_general',
        'estado',
        'usuario_creacion',
        'fecha_creacion',
        'usuario_modificacion',
        'fecha_modificacion'
    ];

    protected $casts = [
        'fecha_servicio' => 'date',
        'fecha_requerida' => 'date',
        'igv' => 'decimal:2',
        'total_general' => 'decimal:2',
        'fecha_creacion' => 'datetime',
        'fecha_modificacion' => 'datetime',
    ];

    // Relaciones
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }

    public function moneda()
    {
        return $this->belongsTo(Moneda::class, 'id_moneda', 'id_moneda');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleOrdenServicio::class, 'id_os', 'id_os');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeAprobados($query)
    {
        return $query->where('estado', 'aprobado');
    }

    public function scopePorFecha($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
    }

    // Método estático para obtener el siguiente correlativo
    public static function obtenerSiguienteCorrelativo()
    {
        $ultimaOrden = self::orderBy('id_os', 'desc')->first();
        $siguienteNumero = $ultimaOrden ? $ultimaOrden->id_os + 1 : 1;
        return 'OS-' . str_pad($siguienteNumero, 3, '0', STR_PAD_LEFT);
    }
}
