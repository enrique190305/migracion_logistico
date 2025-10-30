-- =====================================================================
-- SCRIPT DE MIGRACIÓN COMPLETO
-- Fecha: 2025-10-29
-- Descripción: Migración completa para agregar campos personales a 
--              movil_persona y actualizar stored procedure
-- =====================================================================

USE oc_compra;

-- =====================================================================
-- PARTE 1: AGREGAR CAMPOS A TABLA movil_persona
-- =====================================================================

ALTER TABLE `movil_persona` 
ADD COLUMN `nom_ape` VARCHAR(100) NULL COMMENT 'Nombre completo de la persona' AFTER `id_responsable`,
ADD COLUMN `dni` CHAR(8) NULL COMMENT 'DNI de la persona' AFTER `nom_ape`,
ADD COLUMN `ciudad` VARCHAR(100) NULL COMMENT 'Ciudad de residencia' AFTER `dni`,
ADD COLUMN `observaciones` TEXT NULL COMMENT 'Observaciones adicionales' AFTER `ciudad`,
ADD COLUMN `firma` LONGBLOB NULL COMMENT 'Imagen de la firma digital' AFTER `observaciones`;

-- Verificar estructura
SELECT 
    'Verificación de estructura de movil_persona' as mensaje,
    COUNT(*) as total_columnas
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'oc_compra' 
  AND TABLE_NAME = 'movil_persona';

SHOW COLUMNS FROM `movil_persona`;

-- =====================================================================
-- PARTE 2: ACTUALIZAR STORED PROCEDURE
-- =====================================================================

DROP PROCEDURE IF EXISTS `sp_crear_movil_persona`;

DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_movil_persona` (
    IN `p_id_persona` INT,
    IN `p_id_empresa` INT,
    IN `p_id_bodega` INT,
    IN `p_id_reserva` INT,
    IN `p_id_responsable` INT,
    IN `p_nom_ape` VARCHAR(100),
    IN `p_dni` CHAR(8),
    IN `p_ciudad` VARCHAR(100),
    IN `p_observaciones` TEXT,
    IN `p_firma` LONGBLOB,
    IN `p_fecha_registro` DATE
)
BEGIN
    DECLARE v_id_movil_persona INT;
    DECLARE v_id_proyecto_almacen INT;
    DECLARE v_nombre_proyecto VARCHAR(200);
    DECLARE v_codigo_generado VARCHAR(50);
    
    -- Usar el nombre de la persona registrada (p_nom_ape)
    SET v_nombre_proyecto = p_nom_ape;
    
    START TRANSACTION;
    
    -- Insertar con TODOS los campos incluidos los nuevos
    INSERT INTO movil_persona (
        id_persona,
        id_empresa, 
        id_bodega, 
        id_reserva, 
        id_responsable,
        nom_ape,
        dni,
        ciudad,
        observaciones,
        firma,
        fecha_registro, 
        estado
    ) VALUES (
        p_id_persona,
        p_id_empresa,
        p_id_bodega,
        p_id_reserva,
        p_id_responsable,
        p_nom_ape,
        p_dni,
        p_ciudad,
        p_observaciones,
        p_firma,
        p_fecha_registro,
        'ACTIVO'
    );
    
    SET v_id_movil_persona = LAST_INSERT_ID();
    
    -- Crear registro en proyecto_almacen
    INSERT INTO proyecto_almacen (
        tipo_movil,
        id_referencia,
        id_empresa,
        id_bodega,
        id_reserva,
        nombre_proyecto,
        fecha_registro,
        estado
    ) VALUES (
        'SIN_PROYECTO',
        v_id_movil_persona,
        p_id_empresa,
        p_id_bodega,
        p_id_reserva,
        v_nombre_proyecto,
        p_fecha_registro,
        'ACTIVO'
    );
    
    SET v_id_proyecto_almacen = LAST_INSERT_ID();
    
    -- Generar código único
    SET v_codigo_generado = CONCAT('PROJ-', LPAD(v_id_proyecto_almacen, 4, '0'));
    
    UPDATE proyecto_almacen 
    SET codigo_proyecto = v_codigo_generado 
    WHERE id_proyecto_almacen = v_id_proyecto_almacen;
    
    COMMIT;
    
    SELECT 
        v_id_proyecto_almacen as id_proyecto_almacen, 
        v_codigo_generado as codigo_proyecto,
        v_id_movil_persona as id_movil_persona;
END$$

DELIMITER ;

-- Verificar procedimiento
SHOW PROCEDURE STATUS WHERE Name = 'sp_crear_movil_persona';

-- =====================================================================
-- PARTE 3: PRUEBA DE FUNCIONAMIENTO (OPCIONAL)
-- =====================================================================

-- Comentar las siguientes líneas si no desea ejecutar la prueba

/*
-- Prueba: Crear un móvil persona de prueba
CALL sp_crear_movil_persona(
    1,              -- id_persona (usuario que registra)
    1,              -- id_empresa
    1,              -- id_bodega
    1,              -- id_reserva
    NULL,           -- id_responsable (NULL para móvil sin proyecto)
    'PRUEBA MIGRACIÓN', -- nom_ape
    '12345678',     -- dni
    'Lima',         -- ciudad
    'Registro de prueba post-migración', -- observaciones
    NULL,           -- firma (sin imagen por ahora)
    CURDATE()       -- fecha_registro
);

-- Verificar resultado
SELECT * FROM movil_persona ORDER BY id_movil_persona DESC LIMIT 1;
SELECT * FROM proyecto_almacen ORDER BY id_proyecto_almacen DESC LIMIT 1;

-- IMPORTANTE: Si es solo prueba, eliminar los registros
-- DELETE FROM proyecto_almacen WHERE nombre_proyecto = 'PRUEBA MIGRACIÓN';
-- DELETE FROM movil_persona WHERE nom_ape = 'PRUEBA MIGRACIÓN';
*/

-- =====================================================================
-- RESUMEN DE LA MIGRACIÓN
-- =====================================================================

SELECT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' as RESULTADO;

SELECT 
    'movil_persona' as tabla,
    COUNT(*) as total_columnas,
    GROUP_CONCAT(COLUMN_NAME ORDER BY ORDINAL_POSITION) as columnas
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'oc_compra' 
  AND TABLE_NAME = 'movil_persona'
  AND COLUMN_NAME IN ('nom_ape', 'dni', 'ciudad', 'observaciones', 'firma')
GROUP BY TABLE_NAME;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
