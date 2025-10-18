-- =====================================================
-- MIGRACIÓN: Vincular Órdenes de Compra/Servicio con Órdenes de Pedido
-- Fecha: 18 de Octubre, 2025
-- Descripción: Agregar campos para relacionar OC/OS con Órdenes de Pedido
--              e implementar lógica de compra directa
-- =====================================================

USE oc_compra;

-- =====================================================
-- PASO 1: AGREGAR CAMPO A ORDEN_COMPRA
-- =====================================================

-- Verificar si existe la columna
SET @columna_existe = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_COMPRA' 
    AND COLUMN_NAME = 'id_orden_pedido'
);

-- Agregar columna si no existe
SET @sql_add_column_oc = IF(@columna_existe = 0,
  'ALTER TABLE ORDEN_COMPRA ADD COLUMN id_orden_pedido INT(11) NULL AFTER id_empresa',
  'SELECT "Columna id_orden_pedido ya existe en ORDEN_COMPRA" AS Info'
);

PREPARE stmt FROM @sql_add_column_oc;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar FK si no existe
SET @fk_oc_existe = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_COMPRA' 
    AND CONSTRAINT_NAME = 'fk_oc_orden_pedido'
);

SET @sql_add_fk_oc = IF(@fk_oc_existe = 0,
  'ALTER TABLE ORDEN_COMPRA ADD CONSTRAINT fk_oc_orden_pedido FOREIGN KEY (id_orden_pedido) REFERENCES ORDEN_PEDIDO(id_orden_pedido) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT "FK fk_oc_orden_pedido ya existe" AS Info'
);

PREPARE stmt FROM @sql_add_fk_oc;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PASO 2: AGREGAR CAMPO A ORDEN_SERVICIO
-- =====================================================

-- Verificar si existe la columna
SET @columna_existe_os = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_SERVICIO' 
    AND COLUMN_NAME = 'id_orden_pedido'
);

-- Agregar columna si no existe
SET @sql_add_column_os = IF(@columna_existe_os = 0,
  'ALTER TABLE ORDEN_SERVICIO ADD COLUMN id_orden_pedido INT(11) NULL AFTER id_empresa',
  'SELECT "Columna id_orden_pedido ya existe en ORDEN_SERVICIO" AS Info'
);

PREPARE stmt FROM @sql_add_column_os;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar FK si no existe
SET @fk_os_existe = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_SERVICIO' 
    AND CONSTRAINT_NAME = 'fk_os_orden_pedido'
);

SET @sql_add_fk_os = IF(@fk_os_existe = 0,
  'ALTER TABLE ORDEN_SERVICIO ADD CONSTRAINT fk_os_orden_pedido FOREIGN KEY (id_orden_pedido) REFERENCES ORDEN_PEDIDO(id_orden_pedido) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT "FK fk_os_orden_pedido ya existe" AS Info'
);

PREPARE stmt FROM @sql_add_fk_os;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PASO 3: AGREGAR CAMPO estado_compra A ORDEN_PEDIDO
-- =====================================================

-- Verificar si existe la columna
SET @columna_estado_compra = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_PEDIDO' 
    AND COLUMN_NAME = 'estado_compra'
);

-- Agregar columna si no existe
SET @sql_add_estado_compra = IF(@columna_estado_compra = 0,
  'ALTER TABLE ORDEN_PEDIDO ADD COLUMN estado_compra VARCHAR(20) NULL DEFAULT "SIN_PROCESAR" AFTER estado',
  'SELECT "Columna estado_compra ya existe en ORDEN_PEDIDO" AS Info'
);

PREPARE stmt FROM @sql_add_estado_compra;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar registros existentes
UPDATE ORDEN_PEDIDO 
SET estado_compra = 'SIN_PROCESAR' 
WHERE estado_compra IS NULL;

-- =====================================================
-- PASO 4: AGREGAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice en ORDEN_COMPRA
SET @indice_oc = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_COMPRA' 
    AND INDEX_NAME = 'idx_orden_pedido'
);

SET @sql_indice_oc = IF(@indice_oc = 0,
  'ALTER TABLE ORDEN_COMPRA ADD INDEX idx_orden_pedido (id_orden_pedido)',
  'SELECT "Índice idx_orden_pedido ya existe en ORDEN_COMPRA" AS Info'
);

PREPARE stmt FROM @sql_indice_oc;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en ORDEN_SERVICIO
SET @indice_os = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_SERVICIO' 
    AND INDEX_NAME = 'idx_orden_pedido'
);

SET @sql_indice_os = IF(@indice_os = 0,
  'ALTER TABLE ORDEN_SERVICIO ADD INDEX idx_orden_pedido (id_orden_pedido)',
  'SELECT "Índice idx_orden_pedido ya existe en ORDEN_SERVICIO" AS Info'
);

PREPARE stmt FROM @sql_indice_os;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en ORDEN_PEDIDO
SET @indice_estado_compra = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'ORDEN_PEDIDO' 
    AND INDEX_NAME = 'idx_estado_compra'
);

SET @sql_indice_estado_compra = IF(@indice_estado_compra = 0,
  'ALTER TABLE ORDEN_PEDIDO ADD INDEX idx_estado_compra (estado_compra)',
  'SELECT "Índice idx_estado_compra ya existe en ORDEN_PEDIDO" AS Info'
);

PREPARE stmt FROM @sql_indice_estado_compra;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- VERIFICACIÓN DE LA ESTRUCTURA
-- =====================================================

-- Ver columnas agregadas en ORDEN_COMPRA
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oc_compra' 
  AND TABLE_NAME = 'ORDEN_COMPRA' 
  AND COLUMN_NAME = 'id_orden_pedido';

-- Ver columnas agregadas en ORDEN_SERVICIO
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oc_compra' 
  AND TABLE_NAME = 'ORDEN_SERVICIO' 
  AND COLUMN_NAME = 'id_orden_pedido';

-- Ver columnas agregadas en ORDEN_PEDIDO
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oc_compra' 
  AND TABLE_NAME = 'ORDEN_PEDIDO' 
  AND COLUMN_NAME = 'estado_compra';

-- Ver foreign keys
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'oc_compra'
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND (TABLE_NAME = 'ORDEN_COMPRA' OR TABLE_NAME = 'ORDEN_SERVICIO')
  AND REFERENCED_TABLE_NAME = 'ORDEN_PEDIDO'
ORDER BY TABLE_NAME;

-- =====================================================
-- RESUMEN
-- =====================================================

SELECT '✅ Migración completada exitosamente' AS Resultado;
SELECT 'Las Órdenes de Compra y Servicio ahora pueden vincularse con Órdenes de Pedido' AS Info;
