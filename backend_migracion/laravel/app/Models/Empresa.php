<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'EMPRESA';
    protected $primaryKey = 'id_empresa';
    public $timestamps = false;

    protected $fillable = [
        'razon_social'
    ];

    // Relaciones
    public function ordenesCompra()
    {
        return $this->hasMany(OrdenCompra::class, 'id_empresa', 'id_empresa');
    }

    public function ordenesServicio()
    {
        return $this->hasMany(OrdenServicio::class, 'id_empresa', 'id_empresa');
    }
}
