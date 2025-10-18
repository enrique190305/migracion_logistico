-- =====================================================
-- SCRIPT DE VERIFICACIÓN POST-MIGRACIÓN
-- Fecha: 17 de Octubre, 2025
-- Descripción: Verificar que la reestructuración se haya ejecutado correctamente
-- =====================================================

USE oc_compra;

-- =====================================================
-- 1. VERIFICAR COLUMNAS NUEVAS EN TABLA EMPRESA
-- =====================================================

SELECT 
  'Verificación EMPRESA' AS Verificacion,
  COLUMN_NAME AS Columna,
  COLUMN_TYPE AS Tipo,
  IS_NULLABLE AS Permite_NULL,
  COLUMN_DEFAULT AS Valor_Default,
  COLUMN_COMMENT AS Comentario
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME = 'EMPRESA'
  AND COLUMN_NAME IN ('ruc', 'nombre_comercial', 'fecha_creacion', 'estado_contribuyente', 'domicilio_fiscal', 'actividades_economicas')
ORDER BY ORDINAL_POSITION;

-- Debe mostrar 6 columnas nuevas

-- =====================================================
-- 2. VERIFICAR ESTRUCTURA DE PROYECTO_ALMACEN
-- =====================================================

SELECT 
  'Verificación PROYECTO_ALMACEN' AS Verificacion,
  COLUMN_NAME AS Columna,
  COLUMN_TYPE AS Tipo,
  IS_NULLABLE AS Permite_NULL,
  COLUMN_KEY AS Clave,
  COLUMN_COMMENT AS Comentario
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME = 'PROYECTO_ALMACEN'
ORDER BY ORDINAL_POSITION;

-- Debe mostrar id_empresa como segunda columna (NOT NULL)

-- =====================================================
-- 3. VERIFICAR FOREIGN KEYS (LO MÁS IMPORTANTE)
-- =====================================================

SELECT 
  TABLE_NAME AS Tabla,
  CONSTRAINT_NAME AS Nombre_FK,
  COLUMN_NAME AS Columna,
  REFERENCED_TABLE_NAME AS Tabla_Referenciada,
  REFERENCED_COLUMN_NAME AS Columna_Referenciada
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'oc_compra'
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME IN ('PROYECTO_ALMACEN', 'ORDEN_PEDIDO', 'DETALLE_ORDEN_PEDIDO')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Debe mostrar:
-- PROYECTO_ALMACEN -> fk_proyecto_empresa -> EMPRESA
-- ORDEN_PEDIDO -> fk_orden_pedido_empresa -> EMPRESA
-- ORDEN_PEDIDO -> fk_orden_pedido_proyecto -> PROYECTO_ALMACEN
-- DETALLE_ORDEN_PEDIDO -> fk_detalle_orden_pedido -> ORDEN_PEDIDO
-- DETALLE_ORDEN_PEDIDO -> fk_detalle_producto -> PRODUCTO

-- =====================================================
-- 4. VERIFICAR ÍNDICES CREADOS
-- =====================================================

SELECT 
  TABLE_NAME AS Tabla,
  INDEX_NAME AS Nombre_Indice,
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS Columnas,
  INDEX_TYPE AS Tipo,
  NON_UNIQUE AS No_Unico
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME IN ('EMPRESA', 'PROYECTO_ALMACEN', 'ORDEN_PEDIDO', 'DETALLE_ORDEN_PEDIDO')
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- 5. VERIFICAR DATOS EN PROYECTO_ALMACEN
-- =====================================================

SELECT 
  id_proyecto,
  id_empresa,
  nombre_proyecto,
  bodega,
  estado
FROM PROYECTO_ALMACEN
ORDER BY id_proyecto;

-- TODOS los registros deben tener id_empresa con valor (NO NULL)

-- =====================================================
-- 6. VERIFICAR QUE LAS TABLAS NUEVAS EXISTEN
-- =====================================================

SELECT 
  TABLE_NAME AS Tabla,
  ENGINE AS Motor,
  TABLE_ROWS AS Filas_Aprox,
  CREATE_TIME AS Fecha_Creacion,
  TABLE_COMMENT AS Comentario
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME IN ('EMPRESA', 'PROYECTO_ALMACEN', 'ORDEN_PEDIDO', 'DETALLE_ORDEN_PEDIDO')
ORDER BY TABLE_NAME;

-- Debe mostrar las 4 tablas

-- =====================================================
-- 7. VALIDAR INTEGRIDAD REFERENCIAL
-- =====================================================

-- Verificar que todos los id_empresa en PROYECTO_ALMACEN existan en EMPRESA
SELECT 
  'Integridad PROYECTO_ALMACEN -> EMPRESA' AS Verificacion,
  COUNT(*) AS Total_Proyectos,
  COUNT(DISTINCT p.id_empresa) AS Empresas_Distintas,
  GROUP_CONCAT(DISTINCT e.razon_social SEPARATOR ', ') AS Empresas_Vinculadas
FROM PROYECTO_ALMACEN p
LEFT JOIN EMPRESA e ON p.id_empresa = e.id_empresa;

-- Debe mostrar que TODOS los proyectos tienen empresa válida

-- =====================================================
-- 8. RESUMEN FINAL
-- =====================================================

SELECT 
  '✅ EMPRESA - Nuevas columnas' AS Item,
  COUNT(*) AS Cantidad
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME = 'EMPRESA'
  AND COLUMN_NAME IN ('ruc', 'nombre_comercial', 'fecha_creacion', 'estado_contribuyente', 'domicilio_fiscal', 'actividades_economicas')

UNION ALL

SELECT 
  '✅ PROYECTO_ALMACEN - Columna id_empresa',
  COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME = 'PROYECTO_ALMACEN'
  AND COLUMN_NAME = 'id_empresa'

UNION ALL

SELECT 
  '✅ Foreign Keys creadas',
  COUNT(*)
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'oc_compra'
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME IN ('PROYECTO_ALMACEN', 'ORDEN_PEDIDO', 'DETALLE_ORDEN_PEDIDO')

UNION ALL

SELECT 
  '✅ Tabla ORDEN_PEDIDO existe',
  COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME = 'ORDEN_PEDIDO'

UNION ALL

SELECT 
  '✅ Tabla DETALLE_ORDEN_PEDIDO existe',
  COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'oc_compra'
  AND TABLE_NAME = 'DETALLE_ORDEN_PEDIDO'

UNION ALL

SELECT 
  '✅ Proyectos con id_empresa asignado',
  COUNT(*)
FROM PROYECTO_ALMACEN
WHERE id_empresa IS NOT NULL;

-- =====================================================
-- RESULTADO ESPERADO DEL RESUMEN:
-- =====================================================
-- ✅ EMPRESA - Nuevas columnas: 6
-- ✅ PROYECTO_ALMACEN - Columna id_empresa: 1
-- ✅ Foreign Keys creadas: 5
-- ✅ Tabla ORDEN_PEDIDO existe: 1
-- ✅ Tabla DETALLE_ORDEN_PEDIDO existe: 1
-- ✅ Proyectos con id_empresa asignado: [número de proyectos]
