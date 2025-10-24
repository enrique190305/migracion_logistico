<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personal extends Model
{
    use HasFactory;

    protected $table = 'personal';
    protected $primaryKey = 'id_personal';
    public $timestamps = false;

    protected $fillable = [
        'id_proyecto',
        'id_area',
        'nom_ape',
        'dni',
        'ciudad',
        'observaciones',
        'firma'
    ];

    protected $casts = [
        'id_personal' => 'integer',
        'id_proyecto' => 'integer',
        'id_area' => 'integer',
    ];
}
