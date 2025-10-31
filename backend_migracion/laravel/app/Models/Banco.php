<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banco extends Model
{
    use HasFactory;

    protected $table = 'banco';
    protected $primaryKey = 'id_banco';
    public $timestamps = true;

    protected $fillable = [
        'nombre_banco',
        'codigo_banco',
        'logo_banco',
        'activo'
    ];

    // Relación: Un banco puede tener muchos proveedores
    public function proveedores()
    {
        return $this->hasMany(Proveedor::class, 'id_banco', 'id_banco');
    }
}
