-- =====================================================================
-- MIGRACIÓN SIMPLIFICADA - EJECUTAR EN PHPMYADMIN
-- =====================================================================

-- Seleccionar la base de datos
USE oc_compra;

-- =====================================================================
-- PASO 1: AGREGAR CAMPOS A TABLA movil_persona
-- =====================================================================

ALTER TABLE `movil_persona` 
ADD COLUMN `nom_ape` VARCHAR(100) NULL COMMENT 'Nombre completo de la persona' AFTER `id_responsable`,
ADD COLUMN `dni` CHAR(8) NULL COMMENT 'DNI de la persona' AFTER `nom_ape`,
ADD COLUMN `ciudad` VARCHAR(100) NULL COMMENT 'Ciudad de residencia' AFTER `dni`,
ADD COLUMN `observaciones` TEXT NULL COMMENT 'Observaciones adicionales' AFTER `ciudad`,
ADD COLUMN `firma` LONGBLOB NULL COMMENT 'Imagen de la firma digital' AFTER `observaciones`;

-- =====================================================================
-- PASO 2: ACTUALIZAR STORED PROCEDURE
-- =====================================================================

DROP PROCEDURE IF EXISTS `sp_crear_movil_persona`;

DELIMITER $$

CREATE PROCEDURE `sp_crear_movil_persona` (
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
    
    SET v_nombre_proyecto = p_nom_ape;
    
    START TRANSACTION;
    
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

-- =====================================================================
-- LISTO! Ahora prueba crear un móvil sin proyecto desde la aplicación
-- =====================================================================
