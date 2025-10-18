<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $table = 'ROL';
    protected $primaryKey = 'id_rol';
    public $timestamps = false;

    protected $fillable = [
        'descripcion'
    ];

    /**
     * Relación con usuarios
     */
    public function users()
    {
        return $this->hasMany(User::class, 'id_rol', 'id_rol');
    }

    /**
     * Verificar si es rol de administrador
     */
    public function isAdmin()
    {
        return $this->id_rol === 1;
    }

    /**
     * Verificar si es rol de usuario
     */
    public function isUser()
    {
        return $this->id_rol === 2;
    }
}