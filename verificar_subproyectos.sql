-- Script para verificar subproyectos creados

-- 1. Ver todos los registros en movil_proyecto (incluidos subproyectos)
SELECT 
    id_movil_proyecto,
    id_persona,
    nombre_proyecto,
    proyecto_padre_id,
    estado,
    fecha_registro
FROM movil_proyecto
ORDER BY id_movil_proyecto DESC
LIMIT 10;

-- 2. Ver solo subproyectos (los que tienen proyecto_padre_id)
SELECT 
    mp.id_movil_proyecto,
    mp.nombre_proyecto AS nombre_subproyecto,
    mp.proyecto_padre_id,
    padre.nombre_proyecto AS nombre_proyecto_padre,
    mp.estado,
    mp.fecha_registro
FROM movil_proyecto mp
LEFT JOIN movil_proyecto padre ON mp.proyecto_padre_id = padre.id_movil_proyecto
WHERE mp.proyecto_padre_id IS NOT NULL
ORDER BY mp.id_movil_proyecto DESC;

-- 3. Ver registros en proyecto_almacen para subproyectos
SELECT 
    pa.id_proyecto_almacen,
    pa.codigo_proyecto,
    pa.nombre_proyecto,
    pa.tipo_movil,
    pa.id_referencia,
    pa.estado,
    pa.fecha_registro
FROM proyecto_almacen pa
WHERE pa.codigo_proyecto LIKE '%-SUB-%'
ORDER BY pa.id_proyecto_almacen DESC;

-- 4. Ver el último intento de crear subproyecto
SELECT 
    mp.id_movil_proyecto,
    mp.id_persona,
    mp.nombre_proyecto,
    mp.id_responsable,
    p.nom_ape AS responsable_nombre,
    mp.proyecto_padre_id,
    mp.estado,
    mp.fecha_registro
FROM movil_proyecto mp
LEFT JOIN personal p ON mp.id_responsable = p.id_personal
ORDER BY mp.id_movil_proyecto DESC
LIMIT 5;

-- 5. Verificar si hay registros huérfanos (en movil_proyecto pero no en proyecto_almacen)
SELECT 
    mp.id_movil_proyecto,
    mp.nombre_proyecto,
    mp.proyecto_padre_id,
    'HUERFANO - No existe en proyecto_almacen' AS observacion
FROM movil_proyecto mp
LEFT JOIN proyecto_almacen pa ON pa.id_referencia = mp.id_movil_proyecto 
    AND pa.tipo_movil = 'CON_PROYECTO'
WHERE mp.proyecto_padre_id IS NOT NULL 
    AND pa.id_proyecto_almacen IS NULL;
