-- =====================================================
-- SCRIPT FINAL DE VERIFICACIÓN POST-MIGRACIÓN
-- Ejecutar después del script principal para validar
-- =====================================================

USE oc_compra;

SELECT '========================================' AS '';
SELECT '🔍 VERIFICACIÓN DE ESTRUCTURA' AS '';
SELECT '========================================' AS '';

-- 1. Verificar estructura de orden_pedido
SELECT '1️⃣ Estructura de orden_pedido:' AS '';
DESCRIBE orden_pedido;

-- 2. Verificar estructura de empresa_proyecto
SELECT '2️⃣ Estructura de empresa_proyecto:' AS '';
DESCRIBE empresa_proyecto;

SELECT '========================================' AS '';
SELECT '🔗 VERIFICACIÓN DE FOREIGN KEYS' AS '';
SELECT '========================================' AS '';

-- 3. FKs en orden_pedido
SELECT 
    '3️⃣ Foreign Keys en orden_pedido:' AS '',
    CONSTRAINT_NAME AS 'Constraint',
    COLUMN_NAME AS 'Columna',
    REFERENCED_TABLE_NAME AS 'Tabla Referenciada',
    REFERENCED_COLUMN_NAME AS 'Columna Referenciada'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'oc_compra'
AND TABLE_NAME = 'orden_pedido'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 4. FKs en empresa_proyecto
SELECT 
    '4️⃣ Foreign Keys en empresa_proyecto:' AS '',
    CONSTRAINT_NAME AS 'Constraint',
    COLUMN_NAME AS 'Columna',
    REFERENCED_TABLE_NAME AS 'Tabla Referenciada',
    REFERENCED_COLUMN_NAME AS 'Columna Referenciada'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'oc_compra'
AND TABLE_NAME = 'empresa_proyecto'
AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT '========================================' AS '';
SELECT '📊 VERIFICACIÓN DE INTEGRIDAD DE DATOS' AS '';
SELECT '========================================' AS '';

-- 5. Verificar integridad en orden_pedido
SELECT 
    '5️⃣ Integridad orden_pedido → proyecto_almacen:' AS '',
    COUNT(*) AS 'Total Órdenes',
    COUNT(DISTINCT op.id_proyecto_almacen) AS 'Proyectos Distintos',
    SUM(CASE WHEN pa.id_proyecto_almacen IS NULL THEN 1 ELSE 0 END) AS 'Registros Huérfanos'
FROM orden_pedido op
LEFT JOIN proyecto_almacen pa ON op.id_proyecto_almacen = pa.id_proyecto_almacen;

-- 6. Verificar integridad en empresa_proyecto
SELECT 
    '6️⃣ Integridad empresa_proyecto → proyecto_almacen:' AS '',
    COUNT(*) AS 'Total Relaciones',
    COUNT(DISTINCT ep.id_proyecto_almacen) AS 'Proyectos Distintos',
    SUM(CASE WHEN pa.id_proyecto_almacen IS NULL THEN 1 ELSE 0 END) AS 'Registros Huérfanos'
FROM empresa_proyecto ep
LEFT JOIN proyecto_almacen pa ON ep.id_proyecto_almacen = pa.id_proyecto_almacen;

SELECT '========================================' AS '';
SELECT '📋 DATOS DE PRUEBA' AS '';
SELECT '========================================' AS '';

-- 7. Órdenes de pedido con sus proyectos
SELECT 
    '7️⃣ Órdenes de Pedido con Proyectos:' AS '',
    op.id_orden_pedido AS 'ID Orden',
    op.correlativo AS 'Correlativo',
    op.id_proyecto_almacen AS 'ID Proyecto',
    pa.codigo_proyecto AS 'Código',
    pa.nombre_proyecto AS 'Nombre Proyecto',
    pa.tipo_movil AS 'Tipo',
    op.estado AS 'Estado Orden'
FROM orden_pedido op
INNER JOIN proyecto_almacen pa ON op.id_proyecto_almacen = pa.id_proyecto_almacen
ORDER BY op.id_orden_pedido;

-- 8. Empresas con sus proyectos
SELECT 
    '8️⃣ Empresas y sus Proyectos (primeros 10):' AS '',
    e.id_empresa AS 'ID Empresa',
    e.razon_social AS 'Razón Social',
    pa.id_proyecto_almacen AS 'ID Proyecto',
    pa.codigo_proyecto AS 'Código',
    pa.nombre_proyecto AS 'Nombre Proyecto',
    pa.tipo_movil AS 'Tipo'
FROM empresa e
INNER JOIN empresa_proyecto ep ON e.id_empresa = ep.id_empresa
INNER JOIN proyecto_almacen pa ON ep.id_proyecto_almacen = pa.id_proyecto_almacen
ORDER BY e.id_empresa, pa.id_proyecto_almacen
LIMIT 10;

SELECT '========================================' AS '';
SELECT '📈 ESTADÍSTICAS' AS '';
SELECT '========================================' AS '';

-- 9. Estadísticas generales
SELECT 
    '9️⃣ Estadísticas del Sistema:' AS '',
    (SELECT COUNT(*) FROM proyecto_almacen) AS 'Total Proyectos',
    (SELECT COUNT(*) FROM proyecto_almacen WHERE tipo_movil = 'CON_PROYECTO') AS 'Con Proyecto',
    (SELECT COUNT(*) FROM proyecto_almacen WHERE tipo_movil = 'SIN_PROYECTO') AS 'Sin Proyecto (Personas)',
    (SELECT COUNT(*) FROM orden_pedido) AS 'Total Órdenes Pedido',
    (SELECT COUNT(*) FROM empresa_proyecto) AS 'Total Relaciones Empresa-Proyecto';

-- 10. Estado de órdenes de pedido
SELECT 
    '🔟 Estado de Órdenes de Pedido:' AS '',
    estado AS 'Estado',
    COUNT(*) AS 'Cantidad',
    CONCAT(ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orden_pedido)), 1), '%') AS 'Porcentaje'
FROM orden_pedido
GROUP BY estado
ORDER BY COUNT(*) DESC;

SELECT '========================================' AS '';
SELECT '✅ VERIFICACIÓN COMPLETADA' AS '';
SELECT '========================================' AS '';

-- Mensaje final
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM orden_pedido op LEFT JOIN proyecto_almacen pa ON op.id_proyecto_almacen = pa.id_proyecto_almacen WHERE pa.id_proyecto_almacen IS NULL) = 0
        AND (SELECT COUNT(*) FROM empresa_proyecto ep LEFT JOIN proyecto_almacen pa ON ep.id_proyecto_almacen = pa.id_proyecto_almacen WHERE pa.id_proyecto_almacen IS NULL) = 0
        THEN '✅ TODAS LAS VERIFICACIONES PASARON - SISTEMA LISTO'
        ELSE '⚠️ SE ENCONTRARON REGISTROS HUÉRFANOS - REVISAR ARRIBA'
    END AS 'RESULTADO FINAL';
