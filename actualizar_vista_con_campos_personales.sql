-- =====================================================================
-- ACTUALIZAR VISTA PARA INCLUIR CAMPOS PERSONALES
-- Fecha: 2025-10-29
-- Descripción: Recrear vista_proyectos_almacen con campos de movil_persona
-- =====================================================================

USE oc_compra;

-- Eliminar la vista anterior
DROP VIEW IF EXISTS `vista_proyectos_almacen`;

-- Recrear la vista CON campos personales
CREATE VIEW `vista_proyectos_almacen` AS
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
    r.tipo_reserva AS reserva_tipo,
    -- ✅ NUEVOS CAMPOS PERSONALES (para móviles SIN proyecto)
    mp.nom_ape,
    mp.dni,
    mp.ciudad,
    mp.observaciones,
    mp.firma
FROM proyecto_almacen pa
INNER JOIN empresa e ON pa.id_empresa = e.id_empresa
INNER JOIN bodega b ON pa.id_bodega = b.id_bodega
INNER JOIN reserva r ON pa.id_reserva = r.id_reserva
LEFT JOIN movil_persona mp ON pa.tipo_movil = 'SIN_PROYECTO' AND pa.id_referencia = mp.id_movil_persona;

-- Verificar que se recreó correctamente
SELECT '✅ Vista actualizada con campos personales' AS resultado;

-- Mostrar estructura de la vista
DESCRIBE vista_proyectos_almacen;

-- Ver ejemplo de móvil SIN proyecto con datos personales
SELECT 
    id_proyecto_almacen,
    codigo_proyecto,
    nombre_proyecto,
    tipo_movil,
    nom_ape,
    dni,
    ciudad
FROM vista_proyectos_almacen
WHERE tipo_movil = 'SIN_PROYECTO'
ORDER BY id_proyecto_almacen DESC
LIMIT 5;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
