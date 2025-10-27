<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovilProyecto extends Model
{
    protected $table = 'movil_proyecto';
    protected $primaryKey = 'id_movil_proyecto';
    public $timestamps = false;

    protected $fillable = [
        'id_persona',
        'nombre_proyecto',
        'id_empresa',
        'id_bodega',
        'id_reserva',
        'id_responsable',
        'descripcion',
        'fecha_registro',
        'estado',
        'puede_subproyectos',
        'proyecto_padre_id'
    ];

    protected $casts = [
        'fecha_registro' => 'date',
        'puede_subproyectos' => 'boolean'
    ];

    // Relaciones
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    public function bodega()
    {
        return $this->belongsTo(Bodega::class, 'id_bodega', 'id_bodega');
    }

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva', 'id_reserva');
    }

    public function usuarioRegistra()
    {
        return $this->belongsTo(User::class, 'id_persona', 'id');
    }

    public function responsable()
    {
        return $this->belongsTo(Personal::class, 'id_responsable', 'id_personal');
    }

    public function proyectoPadre()
    {
        return $this->belongsTo(MovilProyecto::class, 'proyecto_padre_id', 'id_movil_proyecto');
    }

    public function subproyectos()
    {
        return $this->hasMany(MovilProyecto::class, 'proyecto_padre_id', 'id_movil_proyecto')
                    ->where('estado', 'ACTIVO');
    }

    public function proyectoAlmacen()
    {
        return $this->hasOne(ProyectoAlmacen::class, 'id_referencia', 'id_movil_proyecto')
                    ->where('tipo_movil', 'CON_PROYECTO');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeProyectosPadre($query)
    {
        return $query->whereNull('proyecto_padre_id');
    }

    public function scopeSubproyectos($query)
    {
        return $query->whereNotNull('proyecto_padre_id');
    }

    // Atributos computados
    public function getEsSubproyectoAttribute()
    {
        return !is_null($this->proyecto_padre_id);
    }

    public function getTieneSubproyectosAttribute()
    {
        return $this->subproyectos()->count() > 0;
    }
}
