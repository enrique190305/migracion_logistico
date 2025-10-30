-- ===================================================================
-- MIGRACIÓN: Agregar campos de personal a movil_persona
-- Fecha: 2025-10-29
-- Descripción: Permite registrar datos personales directamente en 
--              movil_persona sin depender de la tabla personal
-- ===================================================================

-- 1. Agregar nuevos campos a la tabla movil_persona
ALTER TABLE `movil_persona` 
ADD COLUMN `nom_ape` VARCHAR(100) NULL COMMENT 'Nombre completo de la persona' AFTER `id_responsable`,
ADD COLUMN `dni` CHAR(8) NULL COMMENT 'DNI de la persona' AFTER `nom_ape`,
ADD COLUMN `ciudad` VARCHAR(100) NULL COMMENT 'Ciudad de residencia' AFTER `dni`,
ADD COLUMN `observaciones` TEXT NULL COMMENT 'Observaciones adicionales' AFTER `ciudad`,
ADD COLUMN `firma` LONGBLOB NULL COMMENT 'Imagen de la firma digital' AFTER `observaciones`;

-- 2. Verificar estructura actualizada
SHOW COLUMNS FROM `movil_persona`;

-- ===================================================================
-- NOTAS:
-- - Los campos son NULL para permitir registros existentes
-- - El campo id_responsable mantiene la referencia al responsable del proyecto
-- - Los nuevos campos almacenan datos de la persona que será asignada al móvil
-- - NO eliminar tabla personal (se mantiene para otros usos)
-- ===================================================================
