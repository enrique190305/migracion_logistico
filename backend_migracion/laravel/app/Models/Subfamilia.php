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

    /**
     * Relación: Una subfamilia pertenece a una familia nueva
     */
    public function familiaNueva()
    {
        return $this->belongsTo(FamiliaNueva::class, 'id_familia', 'id_familia');
    }

    /**
     * Relación: Una subfamilia tiene muchos productos
     */
    public function productos()
    {
        return $this->hasMany(Producto::class, 'id_subfamilia', 'id_subfamilia');
    }

    /**
     * Scope para solo activos
     */
    public function scopeActivo($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    /**
     * Scope para filtrar por familia
     */
    public function scopePorFamilia($query, $idFamilia)
    {
        return $query->where('id_familia', $idFamilia);
    }

    /**
     * Accessor para obtener el código completo (prefijo familia + prefijo sub)
     */
    public function getCodigoCompletoAttribute()
    {
        return $this->familiaNueva->prefijo_codigo . '-' . $this->prefijo_sub;
    }

    /**
     * Accessor para obtener cantidad de productos
     */
    public function getCantidadProductosAttribute()
    {
        return $this->productos()->count();
    }

    /**
     * Método para generar el siguiente código de producto
     */
    public function generarSiguienteCodigoProducto()
    {
        $ultimoProducto = $this->productos()
            ->orderBy('codigo_producto', 'desc')
            ->first();

        $ultimoNumero = 0;
        if ($ultimoProducto) {
            // Extraer el número del código: HERR-MANU-0001 → 0001
            preg_match('/(\d+)$/', $ultimoProducto->codigo_producto, $matches);
            $ultimoNumero = isset($matches[1]) ? intval($matches[1]) : 0;
        }

        $nuevoNumero = $ultimoNumero + 1;

        return sprintf(
            '%s-%s-%04d',
            $this->familiaNueva->prefijo_codigo,
            $this->prefijo_sub,
            $nuevoNumero
        );
    }

    /**
     * Método para validar si un código pertenece a esta subfamilia
     */
    public function perteneceCodigoProducto($codigoProducto)
    {
        $prefijoEsperado = $this->codigo_completo;
        return strpos($codigoProducto, $prefijoEsperado) === 0;
    }
}
