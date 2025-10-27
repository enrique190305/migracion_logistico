-- Script para crear o recrear la vista vista_proyectos_almacen

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS vista_proyectos_almacen;

-- 2. Crear la vista unificada de proyectos
CREATE VIEW vista_proyectos_almacen AS
SELECT 
    pa.id_proyecto_almacen,
    pa.codigo_proyecto,
    pa.nombre_proyecto,
    pa.tipo_movil,
    pa.id_referencia,
    pa.id_empresa,
    pa.id_bodega,
    pa.id_reserva,
    pa.fecha_registro,
    pa.estado,
    e.razon_social AS empresa_nombre,
    e.ruc AS empresa_ruc,
    b.nombre AS bodega_nombre,
    b.ubicacion AS bodega_ubicacion,
    r.tipo_reserva AS reserva_tipo
FROM proyecto_almacen pa
INNER JOIN empresa e ON pa.id_empresa = e.id_empresa
INNER JOIN bodega b ON pa.id_bodega = b.id_bodega
INNER JOIN reserva r ON pa.id_reserva = r.id_reserva;

-- 3. Verificar que se creó correctamente
SELECT COUNT(*) AS total_registros
FROM vista_proyectos_almacen;

-- 4. Ver algunos registros de ejemplo
SELECT * FROM vista_proyectos_almacen
ORDER BY id_proyecto_almacen DESC
LIMIT 5;
