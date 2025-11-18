-- ============================================
-- SCRIPT: Completar estructura de tabla prestamos_clientes
-- ============================================

-- Verificar estructura actual
DESCRIBE prestamos_clientes;

-- Agregar campos faltantes si no existen

-- 1. Campo cantidad (si no existe)
ALTER TABLE `prestamos_clientes` 
ADD COLUMN IF NOT EXISTS `cantidad` INT NOT NULL DEFAULT 1 AFTER `tipo_producto`;

-- 2. Campo condicion_inicial (si no existe)
ALTER TABLE `prestamos_clientes` 
ADD COLUMN IF NOT EXISTS `condicion_inicial` ENUM('NUEVO', 'OPERATIVO', 'CON FALLAS', 'OTROS') NOT NULL DEFAULT 'OPERATIVO' AFTER `cantidad`;

-- 3. Campo condicion_descripcion (si no existe)
ALTER TABLE `prestamos_clientes` 
ADD COLUMN IF NOT EXISTS `condicion_descripcion` VARCHAR(200) NULL AFTER `condicion_inicial`;

-- 4. Campo unidad (si no existe)
ALTER TABLE `prestamos_clientes` 
ADD COLUMN IF NOT EXISTS `unidad` VARCHAR(20) NULL AFTER `condicion_descripcion`;

-- 5. Campo observaciones (si no existe)
ALTER TABLE `prestamos_clientes` 
ADD COLUMN IF NOT EXISTS `observaciones` TEXT NULL AFTER `unidad`;

-- 6. Asegurar que id_movil_persona existe
ALTER TABLE `prestamos_clientes` 
ADD COLUMN IF NOT EXISTS `id_movil_persona` INT NULL AFTER `id_prestamo`;

-- 7. Asegurar que fecha_devolucion existe
ALTER TABLE `prestamos_clientes` 
ADD COLUMN IF NOT EXISTS `fecha_devolucion` DATETIME NULL AFTER `fecha_prestamo`;

-- 8. Modificar campo estado (asegurar que tenga los valores correctos)
ALTER TABLE `prestamos_clientes` 
MODIFY COLUMN `estado` VARCHAR(100) NOT NULL DEFAULT 'PRESTADO';

-- 9. Verificar/crear foreign key con movil_persona
ALTER TABLE `prestamos_clientes` 
DROP FOREIGN KEY IF EXISTS `fk_prestamos_movil_persona`;

ALTER TABLE `prestamos_clientes`
ADD CONSTRAINT `fk_prestamos_movil_persona` 
FOREIGN KEY (`id_movil_persona`) 
REFERENCES `movil_persona`(`id_movil_persona`) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 10. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS `idx_dni` ON `prestamos_clientes`(`dni`);
CREATE INDEX IF NOT EXISTS `idx_codigo_producto` ON `prestamos_clientes`(`codigo_producto`);
CREATE INDEX IF NOT EXISTS `idx_estado` ON `prestamos_clientes`(`estado`);
CREATE INDEX IF NOT EXISTS `idx_fecha_prestamo` ON `prestamos_clientes`(`fecha_prestamo`);

-- Verificar estructura final
DESCRIBE prestamos_clientes;

-- Ver constraints
SHOW CREATE TABLE prestamos_clientes;
