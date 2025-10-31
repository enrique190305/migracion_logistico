-- =====================================================
-- SCRIPT: CREAR TABLA BANCO Y RELACIÓN CON PROVEEDOR
-- Fecha: 30 de octubre de 2025
-- Descripción: Crear tabla banco con logos y relacionarla con proveedores
-- =====================================================

-- 1. CREAR TABLA BANCO
CREATE TABLE IF NOT EXISTS `banco` (
  `id_banco` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_banco` VARCHAR(100) NOT NULL UNIQUE,
  `codigo_banco` VARCHAR(10) NULL COMMENT 'Código del banco según SBS',
  `logo_banco` TEXT NULL COMMENT 'Ruta o base64 del logo del banco',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_banco`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. AGREGAR CAMPO id_banco A TABLA PROVEEDOR
ALTER TABLE `proveedor` 
ADD COLUMN `id_banco` BIGINT UNSIGNED NULL AFTER `servicio`;

-- 3. CREAR FOREIGN KEY
ALTER TABLE `proveedor`
ADD CONSTRAINT `fk_proveedor_banco` 
FOREIGN KEY (`id_banco`) 
REFERENCES `banco`(`id_banco`) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 4. INSERTAR BANCOS PRINCIPALES DE PERÚ
INSERT INTO `banco` (`nombre_banco`, `codigo_banco`, `logo_banco`, `activo`, `created_at`, `updated_at`) VALUES
('BCP - Banco de Crédito del Perú', '002', 'bancos/bcp.png', 1, NOW(), NOW()),
('BBVA Perú', '011', 'bancos/bbva.png', 1, NOW(), NOW()),
('Scotiabank Perú', '009', 'bancos/scotiabank.png', 1, NOW(), NOW()),
('Interbank', '003', 'bancos/interbank.png', 1, NOW(), NOW()),
('Banco Pichincha', '012', 'bancos/pichincha.png', 1, NOW(), NOW()),
('BanBif', '038', 'bancos/banbif.png', 1, NOW(), NOW()),
('Banco GNB', '053', 'bancos/gnb.png', 1, NOW(), NOW()),
('Banco Falabella', '801', 'bancos/falabella.png', 1, NOW(), NOW()),
('Banco Ripley', '802', 'bancos/ripley.png', 1, NOW(), NOW()),
('Banco Azteca', '803', 'bancos/azteca.png', 1, NOW(), NOW()),
('Caja Arequipa', '805', 'bancos/caja_arequipa.png', 1, NOW(), NOW()),
('Caja Huancayo', '806', 'bancos/caja_huancayo.png', 1, NOW(), NOW()),
('Caja Cusco', '807', 'bancos/caja_cusco.png', 1, NOW(), NOW()),
('Banco de la Nación', '018', 'bancos/banco_nacion.png', 1, NOW(), NOW()),
('Otros', '999', 'bancos/otros.png', 1, NOW(), NOW());

-- 5. VERIFICAR LOS DATOS INSERTADOS
SELECT * FROM `banco` ORDER BY `id_banco`;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
