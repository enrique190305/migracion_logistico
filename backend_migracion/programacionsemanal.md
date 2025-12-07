<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramacionSemanal extends Model
{
    use HasFactory;

    protected $table = 'programacion_semanal';
    protected $primaryKey = 'id_programacion';
    
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id_usuario',
        'fecha',
        'id_horario',
        'asignado_por'
    ];

    protected $casts = [
        'fecha' => 'date',
        'creado_en' => 'datetime',
        'actualizado_en' => 'datetime'
    ];

    /**
     * Relación: Usuario asignado
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación: Horario asignado
     */
    public function horario()
    {
        return $this->belongsTo(Horario::class, 'id_horario', 'id_horario');
    }

    /**
     * Relación: Usuario que asignó (admin)
     */
    public function asignador()
    {
        return $this->belongsTo(Usuario::class, 'asignado_por', 'id_usuario');
    }

    /**
     * Obtener programación de una fecha específica
     */
    public static function obtenerPorFecha($fecha)
    {
        return self::where('fecha', $fecha)
            ->with(['usuario', 'horario'])
            ->get();
    }

    /**
     * Obtener programación de un mes completo
     */
    public static function obtenerPorMes($mes, $anio)
    {
        $fechaInicio = "{$anio}-{$mes}-01";
        $fechaFin = date('Y-m-t', strtotime($fechaInicio));

        return self::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->with(['usuario', 'horario'])
            ->orderBy('fecha')
            ->orderBy('id_usuario')
            ->get();
    }

    /**
     * Asignar o actualizar horario de usuario
     */
    public static function asignarHorario($idUsuario, $fecha, $idHorario, $asignadoPor = null)
    {
        return self::updateOrCreate(
            [
                'id_usuario' => $idUsuario,
                'fecha' => $fecha
            ],
            [
                'id_horario' => $idHorario,
                'asignado_por' => $asignadoPor
            ]
        );
    }

    /**
     * Limpiar programación de una fecha
     */
    public static function limpiarFecha($fecha)
    {
        return self::where('fecha', $fecha)->delete();
    }

    /**
     * Scope: Filtrar por horario
     */
    public function scopePorHorario($query, $idHorario)
    {
        return $query->where('id_horario', $idHorario);
    }

    /**
     * Scope: Filtrar por rango de fechas
     */
    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
    }
}
