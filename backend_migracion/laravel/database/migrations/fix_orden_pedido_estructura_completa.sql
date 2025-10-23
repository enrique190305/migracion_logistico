-- =====================================================
-- SCRIPT DE MIGRACIÓN COMPLETA
-- Actualizar estructura de orden_pedido y empresa_proyecto
-- para usar id_proyecto_almacen en lugar de id_proyecto
-- =====================================================

-- PASO 1: Eliminar FKs existentes en orden_pedido (si existen)
-- =====================================================
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'oc_compra'
    AND TABLE_NAME = 'orden_pedido' 
    AND COLUMN_NAME = 'id_proyecto'
    AND REFERENCED_TABLE_NAME IS NOT NULL
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE orden_pedido DROP FOREIGN KEY ', @constraint_name),
    'SELECT "No hay FK en orden_pedido.id_proyecto" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- PASO 2: Renombrar columna id_proyecto a id_proyecto_almacen en orden_pedido
-- =====================================================
ALTER TABLE `orden_pedido` 
    CHANGE COLUMN `id_proyecto` `id_proyecto_almacen` INT NOT NULL 
    COMMENT 'FK: Proyecto almacen al que pertenece el pedido';

-- PASO 3: Eliminar FKs existentes en empresa_proyecto (si existen)
-- =====================================================
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'oc_compra'
    AND TABLE_NAME = 'empresa_proyecto' 
    AND COLUMN_NAME = 'id_proyecto'
    AND REFERENCED_TABLE_NAME IS NOT NULL
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE empresa_proyecto DROP FOREIGN KEY ', @constraint_name),
    'SELECT "No hay FK en empresa_proyecto.id_proyecto" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- PASO 4: Renombrar columna id_proyecto a id_proyecto_almacen en empresa_proyecto
-- =====================================================
ALTER TABLE `empresa_proyecto` 
    CHANGE COLUMN `id_proyecto` `id_proyecto_almacen` INT NOT NULL 
    COMMENT 'FK a proyecto_almacen';

-- PASO 5: Agregar índices para mejorar rendimiento
-- =====================================================
-- Índice en orden_pedido
ALTER TABLE `orden_pedido` 
    ADD INDEX `idx_orden_pedido_proyecto_almacen` (`id_proyecto_almacen`);

-- Índice en empresa_proyecto
ALTER TABLE `empresa_proyecto` 
    ADD INDEX `idx_empresa_proyecto_almacen` (`id_proyecto_almacen`);

-- PASO 6: Crear FKs con la nueva estructura
-- =====================================================
-- FK en orden_pedido
ALTER TABLE `orden_pedido` 
    ADD CONSTRAINT `fk_orden_pedido_proyecto_almacen` 
    FOREIGN KEY (`id_proyecto_almacen`) 
    REFERENCES `proyecto_almacen`(`id_proyecto_almacen`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE;

-- FK en empresa_proyecto
ALTER TABLE `empresa_proyecto` 
    ADD CONSTRAINT `fk_empresa_proyecto_almacen` 
    FOREIGN KEY (`id_proyecto_almacen`) 
    REFERENCES `proyecto_almacen`(`id_proyecto_almacen`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- PASO 7: Verificación de datos
-- =====================================================
-- Verificar que todos los id_proyecto_almacen en orden_pedido existen
SELECT 
    'Verificación orden_pedido' AS tabla,
    COUNT(*) AS total_registros,
    COUNT(DISTINCT op.id_proyecto_almacen) AS proyectos_distintos,
    SUM(CASE WHEN pa.id_proyecto_almacen IS NULL THEN 1 ELSE 0 END) AS registros_huerfanos
FROM orden_pedido op
LEFT JOIN proyecto_almacen pa ON op.id_proyecto_almacen = pa.id_proyecto_almacen;

-- Verificar que todos los id_proyecto_almacen en empresa_proyecto existen
SELECT 
    'Verificación empresa_proyecto' AS tabla,
    COUNT(*) AS total_registros,
    COUNT(DISTINCT ep.id_proyecto_almacen) AS proyectos_distintos,
    SUM(CASE WHEN pa.id_proyecto_almacen IS NULL THEN 1 ELSE 0 END) AS registros_huerfanos
FROM empresa_proyecto ep
LEFT JOIN proyecto_almacen pa ON ep.id_proyecto_almacen = pa.id_proyecto_almacen;

-- Mostrar estructura actualizada
SHOW CREATE TABLE orden_pedido;
SHOW CREATE TABLE empresa_proyecto;

SELECT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' AS resultado;
