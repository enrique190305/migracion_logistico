-- ===================================================================
-- ACTUALIZACIÓN: Procedimiento almacenado sp_crear_movil_persona
-- Fecha: 2025-10-29
-- Descripción: Incluye parámetros para datos personales
-- ===================================================================

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
    
    -- ✅ Usar el nombre de la persona registrada (p_nom_ape)
    SET v_nombre_proyecto = p_nom_ape;
    
    START TRANSACTION;
    
    -- ✅ Insertar con TODOS los campos incluidos los nuevos
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

-- ===================================================================
-- NOTAS:
-- - Ahora acepta datos personales directamente
-- - El nombre del proyecto es el nombre de la persona (nom_ape)
-- - id_responsable puede ser NULL o referencia a un supervisor
-- ===================================================================
