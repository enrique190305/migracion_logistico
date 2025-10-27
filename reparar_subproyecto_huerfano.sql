-- Script para reparar el subproyecto huérfano
-- Este script crea el registro faltante en proyecto_almacen para el subproyecto id_movil_proyecto = 33

START TRANSACTION;

-- 1. Insertar el registro en proyecto_almacen para el subproyecto
INSERT INTO proyecto_almacen (
    tipo_movil,
    id_referencia,
    id_empresa,
    id_bodega,
    id_reserva,
    nombre_proyecto,
    fecha_registro,
    estado
)
SELECT 
    'CON_PROYECTO' AS tipo_movil,
    mp.id_movil_proyecto AS id_referencia,
    mp.id_empresa,
    mp.id_bodega,
    mp.id_reserva,
    mp.nombre_proyecto,
    mp.fecha_registro,
    mp.estado
FROM movil_proyecto mp
WHERE mp.id_movil_proyecto = 33
AND NOT EXISTS (
    SELECT 1 FROM proyecto_almacen pa 
    WHERE pa.id_referencia = mp.id_movil_proyecto 
    AND pa.tipo_movil = 'CON_PROYECTO'
);

-- 2. Obtener el ID del registro recién insertado
SET @nuevo_id_proyecto_almacen = LAST_INSERT_ID();

-- 3. Generar el código del subproyecto
UPDATE proyecto_almacen pa
INNER JOIN movil_proyecto mp ON pa.id_referencia = mp.id_movil_proyecto
INNER JOIN empresa e ON pa.id_empresa = e.id_empresa
INNER JOIN bodega b ON pa.id_bodega = b.id_bodega
INNER JOIN reserva r ON pa.id_reserva = r.id_reserva
SET pa.codigo_proyecto = CONCAT(
    UPPER(SUBSTRING(e.razon_social, 1, 3)), '-',
    UPPER(SUBSTRING(b.nombre, 1, 3)), '-',
    UPPER(SUBSTRING(r.tipo_reserva, 1, 3)), '-',
    'SUB-',
    LPAD(pa.id_proyecto_almacen, 4, '0')
)
WHERE pa.id_proyecto_almacen = @nuevo_id_proyecto_almacen;

-- 4. Verificar el resultado
SELECT 
    pa.id_proyecto_almacen,
    pa.codigo_proyecto,
    pa.nombre_proyecto,
    pa.tipo_movil,
    pa.id_referencia,
    mp.proyecto_padre_id,
    padre.nombre_proyecto AS proyecto_padre_nombre,
    pa.estado
FROM proyecto_almacen pa
INNER JOIN movil_proyecto mp ON pa.id_referencia = mp.id_movil_proyecto
LEFT JOIN movil_proyecto padre ON mp.proyecto_padre_id = padre.id_movil_proyecto
WHERE pa.id_proyecto_almacen = @nuevo_id_proyecto_almacen;

-- Si todo se ve bien, ejecuta COMMIT;
-- Si hay algún error, ejecuta ROLLBACK;
COMMIT;
