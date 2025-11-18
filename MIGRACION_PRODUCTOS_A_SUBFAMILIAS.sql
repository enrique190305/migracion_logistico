-- =====================================================
-- MIGRACIÓN SEGURA: ASIGNAR SUBFAMILIAS A PRODUCTOS EXISTENTES
-- =====================================================
-- Este script asigna id_subfamilia a productos existentes
-- SIN modificar sus códigos ni afectar otros módulos
-- =====================================================

USE oc_compra;

-- Verificar productos antes de la migración
SELECT 
    'ANTES DE LA MIGRACIÓN' as estado,
    COUNT(*) as total_productos,
    SUM(CASE WHEN id_subfamilia IS NULL THEN 1 ELSE 0 END) as sin_subfamilia,
    SUM(CASE WHEN id_subfamilia IS NOT NULL THEN 1 ELSE 0 END) as con_subfamilia
FROM producto;

-- =====================================================
-- MIGRACIÓN POR TIPO DE PRODUCTO
-- =====================================================

-- 1. HERRAMIENTAS → Herramientas Manuales (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Herramientas Manuales'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'HERR'
  AND p.id_subfamilia IS NULL;

-- 2. MATERIALES → Materiales de Construcción (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Materiales de Construcción'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'MATE'
  AND p.id_subfamilia IS NULL;

-- 3. EQUIPOS → Equipos Ligeros (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Equipos Ligeros'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'EQUI'
  AND p.id_subfamilia IS NULL;

-- 4. SUMINISTROS → Suministros de Oficina (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Suministros de Oficina'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'SUMI'
  AND p.id_subfamilia IS NULL;

-- 5. ACTIVOS FIJOS → Mobiliario (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Mobiliario'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto IN ('ACTI', 'ACFI')
  AND p.id_subfamilia IS NULL;

-- 6. EQUIPOS DE PROTECCIÓN → Protección Personal (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Protección Personal'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto IN ('EPRO', 'EPROT')
  AND p.id_subfamilia IS NULL;

-- 7. PRODUCTOS DE ASEO → Productos de Aseo (si existe subfamilia específica)
UPDATE producto p
INNER JOIN familia_nueva f ON f.prefijo_codigo = 'ASEO'
INNER JOIN subfamilia s ON s.id_familia = f.id_familia
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'ASEO'
  AND p.id_subfamilia IS NULL
  AND s.id_subfamilia = (
    SELECT MIN(s2.id_subfamilia) 
    FROM subfamilia s2 
    WHERE s2.id_familia = f.id_familia
  );

-- 8. FERTILIZANTES → Fertilizantes NPK (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Fertilizantes NPK'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'FERT'
  AND p.id_subfamilia IS NULL;

-- 9. FITOSANITARIOS → Insecticidas (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Insecticidas'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'FITO'
  AND p.id_subfamilia IS NULL;

-- 10. REPUESTOS → Repuestos Mecánicos (por defecto)
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Repuestos Mecánicos'
SET p.id_subfamilia = s.id_subfamilia
WHERE p.tipo_producto = 'REPU'
  AND p.id_subfamilia IS NULL;

-- 11. ALVEOLOS → Asignar a primera subfamilia de familia correspondiente
UPDATE producto p
INNER JOIN familia_nueva f ON f.tipo_producto_legacy = p.tipo_producto
INNER JOIN subfamilia s ON s.id_familia = f.id_familia
SET p.id_subfamilia = (
    SELECT s2.id_subfamilia 
    FROM subfamilia s2 
    WHERE s2.id_familia = f.id_familia 
    LIMIT 1
)
WHERE p.tipo_producto = 'ALVEOL'
  AND p.id_subfamilia IS NULL;

-- =====================================================
-- MIGRACIÓN INTELIGENTE POR DESCRIPCIÓN
-- =====================================================

-- Productos que contengan "COMPUTADOR", "LAPTOP", "PC" → Equipos de Cómputo
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Equipos de Cómputo'
SET p.id_subfamilia = s.id_subfamilia
WHERE (
    p.descripcion LIKE '%COMPUTADOR%' 
    OR p.descripcion LIKE '%LAPTOP%'
    OR p.descripcion LIKE '%PC%'
    OR p.descripcion LIKE '%MONITOR%'
    OR p.descripcion LIKE '%TECLADO%'
    OR p.descripcion LIKE '%MOUSE%'
)
AND p.tipo_producto = 'EQUI'
AND p.id_subfamilia IS NULL;

-- Productos que contengan "ESCRITORIO", "SILLA", "MESA" → Equipos de Oficina
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Equipos de Oficina'
SET p.id_subfamilia = s.id_subfamilia
WHERE (
    p.descripcion LIKE '%ESCRITORIO%' 
    OR p.descripcion LIKE '%SILLA%'
    OR p.descripcion LIKE '%MESA%'
    OR p.descripcion LIKE '%ARCHIVADOR%'
)
AND p.tipo_producto = 'EQUI'
AND p.id_subfamilia IS NULL;

-- Productos eléctricos → Materiales Eléctricos
UPDATE producto p
INNER JOIN subfamilia s ON s.nombre_subfamilia = 'Materiales Eléctricos'
SET p.id_subfamilia = s.id_subfamilia
WHERE (
    p.descripcion LIKE '%CABLE%' 
    OR p.descripcion LIKE '%TOMACORRIENTE%'
    OR p.descripcion LIKE '%INTERRUPTOR%'
    OR p.descripcion LIKE '%FOCO%'
    OR p.descripcion LIKE '%LÁMPARA%'
)
AND p.tipo_producto = 'MATE'
AND p.id_subfamilia IS NULL;

-- =====================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- =====================================================

SELECT 
    'DESPUÉS DE LA MIGRACIÓN' as estado,
    COUNT(*) as total_productos,
    SUM(CASE WHEN id_subfamilia IS NULL THEN 1 ELSE 0 END) as sin_subfamilia,
    SUM(CASE WHEN id_subfamilia IS NOT NULL THEN 1 ELSE 0 END) as con_subfamilia
FROM producto;

-- Resumen por subfamilia
SELECT 
    f.nombre_familia as FAMILIA,
    s.nombre_subfamilia as SUBFAMILIA,
    s.prefijo_sub as CODIGO,
    COUNT(p.codigo_producto) as PRODUCTOS_ASIGNADOS
FROM subfamilia s
INNER JOIN familia_nueva f ON s.id_familia = f.id_familia
LEFT JOIN producto p ON p.id_subfamilia = s.id_subfamilia
GROUP BY f.nombre_familia, s.nombre_subfamilia, s.prefijo_sub
ORDER BY f.nombre_familia, s.nombre_subfamilia;

-- Productos que NO pudieron ser migrados (si hay alguno)
SELECT 
    codigo_producto,
    tipo_producto,
    descripcion,
    'REQUIERE ASIGNACIÓN MANUAL' as nota
FROM producto
WHERE id_subfamilia IS NULL
LIMIT 20;

SELECT '✅ MIGRACIÓN COMPLETADA - Revisa los resultados arriba' as mensaje;
