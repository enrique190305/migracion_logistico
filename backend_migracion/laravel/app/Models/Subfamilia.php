<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subfamilia extends Model
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

    protected $dates = [
        'fecha_creacion',
        'fecha_modificacion'
    ];

    // Relación: Una subfamilia pertenece a una familia
    public function familia()
    {
        return $this->belongsTo(Familia::class, 'id_familia', 'id_familia');
    }

    // Relación: Una subfamilia tiene muchos productos
    public function productos()
    {
        return $this->hasMany(Producto::class, 'id_subfamilia', 'id_subfamilia');
    }

    // Scope para solo activos
    public function scopeActivo($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Accessor para obtener el código completo (prefijo familia + prefijo sub)
    public function getCodigoCompletoAttribute()
    {
        return $this->familia->prefijo_codigo . '-' . $this->prefijo_sub;
    }

    // Accessor para obtener cantidad de productos
    public function getProductosCountAttribute()
    {
        return $this->productos()->count();
    }

    // Método para generar el siguiente código de producto
    public function generarSiguienteCodigoProducto()
    {
        $ultimoProducto = $this->productos()
            ->orderBy('id_producto', 'desc')
            ->first();

        $ultimoNumero = 0;
        if ($ultimoProducto) {
            // Extraer el número del código: FAMI-SUB-0001 → 0001
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
