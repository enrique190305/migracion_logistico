<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubfamiliaProducto extends Model
{
    use HasFactory;

    protected $table = 'subfamilia';
    protected $primaryKey = 'id_subfamilia';
    public $timestamps = false;

    protected $fillable = [
        'nombre_subfamilia',
        'id_familia',
        'prefijo_sub',
        'descripcion',
        'estado'
    ];

    const CREATED_AT = 'fecha_creacion';
    const UPDATED_AT = 'fecha_modificacion';

    // Relación: Una subfamilia pertenece a una familia
    public function familia()
    {
        return $this->belongsTo(FamiliaProducto::class, 'id_familia', 'id_familia');
    }

    // Relación: Una subfamilia tiene muchos productos
    public function productos()
    {
        return $this->hasMany(ProductoNuevo::class, 'id_subfamilia', 'id_subfamilia');
    }

    // Scope para solo activos
    public function scopeActivo($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Método para generar el siguiente código de producto
    public function generarSiguienteCodigoProducto()
    {
        $ultimoProducto = $this->productos()
            ->orderBy('id_producto', 'desc')
            ->first();

        $ultimoNumero = 0;
        if ($ultimoProducto) {
            $partes = explode('-', $ultimoProducto->codigo_producto);
            $ultimoNumero = (int) end($partes);
        }

        $nuevoNumero = $ultimoNumero + 1;

        return sprintf(
            '%s-%s-%04d',
            $this->familia->prefijo_codigo,
            $this->prefijo_sub,
            $nuevoNumero
        );
    }
}
