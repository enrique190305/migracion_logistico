<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'LOGEO';
    protected $primaryKey = 'id';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id_rol',
        'nombre',
        'usuario',
        'contraseña',
        'firma',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'contraseña',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Get the password for authentication.
     */
    public function getAuthPassword()
    {
        return $this->contraseña;
    }

    /**
     * Relación con rol
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'id_rol', 'id_rol');
    }

    /**
     * Verificar si el usuario es administrador
     */
    public function isAdmin()
    {
        return $this->id_rol === 1;
    }

    /**
     * Verificar si el usuario es usuario normal
     */
    public function isUser()
    {
        return $this->id_rol === 2;
    }

    /**
     * Obtener permisos del usuario
     */
    public function getPermissions()
    {
        return [
            'can_access_approval_modules' => $this->isAdmin(),
            'is_admin' => $this->isAdmin(),
            'role_id' => $this->id_rol,
            'role_name' => $this->role ? $this->role->descripcion : null,
        ];
    }
}
