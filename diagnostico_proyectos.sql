-- Script para diagnosticar por qué no aparecen los proyectos

-- 1. Verificar si hay proyectos en proyecto_almacen
SELECT 
    COUNT(*) AS total_proyectos,
    SUM(CASE WHEN tipo_movil = 'CON_PROYECTO' THEN 1 ELSE 0 END) AS con_proyecto,
    SUM(CASE WHEN tipo_movil = 'SIN_PROYECTO' THEN 1 ELSE 0 END) AS sin_proyecto
FROM proyecto_almacen
WHERE estado = 'ACTIVO';

-- 2. Ver todos los proyectos activos
SELECT 
    id_proyecto_almacen,
    codigo_proyecto,
    nombre_proyecto,
    tipo_movil,
    id_referencia,
    estado,
    fecha_registro
FROM proyecto_almacen
WHERE estado = 'ACTIVO'
ORDER BY id_proyecto_almacen DESC;

-- 3. Verificar si existe la vista vista_proyectos_almacen
SHOW TABLES LIKE 'vista_proyectos_almacen';

-- 4. Si existe la vista, ver su contenido
SELECT * FROM vista_proyectos_almacen
WHERE estado = 'ACTIVO'
LIMIT 10;

-- 5. Verificar la estructura de proyecto_almacen
DESCRIBE proyecto_almacen;

-- 6. Ver si el subproyecto reparado está en proyecto_almacen
SELECT 
    pa.id_proyecto_almacen,
    pa.codigo_proyecto,
    pa.nombre_proyecto,
    pa.tipo_movil,
    pa.id_referencia,
    mp.proyecto_padre_id
FROM proyecto_almacen pa
LEFT JOIN movil_proyecto mp ON pa.id_referencia = mp.id_movil_proyecto 
    AND pa.tipo_movil = 'CON_PROYECTO'
WHERE pa.id_referencia = 33
OR mp.id_movil_proyecto = 33;
