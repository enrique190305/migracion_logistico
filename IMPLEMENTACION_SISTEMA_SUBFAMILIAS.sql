-- =====================================================
-- IMPLEMENTACIÓN SISTEMA DE SUBFAMILIAS (OPCIÓN 1)
-- Fecha: 16 de noviembre de 2025
-- Descripción: Sistema dual para códigos con subfamilias
--              SIN afectar productos existentes
-- =====================================================

-- =====================================================
-- PASO 1: CREAR TABLA FAMILIA_NUEVA
-- =====================================================

CREATE TABLE `familia_nueva` (
    `id_familia` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre_familia` VARCHAR(50) NOT NULL,
    `prefijo_codigo` VARCHAR(10) NOT NULL UNIQUE,
    `tipo_producto_legacy` VARCHAR(20) NULL COMMENT 'Mapeo con sistema antiguo',
    `descripcion` VARCHAR(200) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `fecha_modificacion` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_prefijo (prefijo_codigo),
    INDEX idx_legacy (tipo_producto_legacy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Nueva estructura de familias con soporte para subfamilias';

-- =====================================================
-- PASO 2: CREAR TABLA SUBFAMILIA
-- =====================================================

CREATE TABLE `subfamilia` (
    `id_subfamilia` INT AUTO_INCREMENT PRIMARY KEY,
    `id_familia` INT NOT NULL,
    `nombre_subfamilia` VARCHAR(50) NOT NULL,
    `prefijo_sub` VARCHAR(10) NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `fecha_modificacion` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_familia) REFERENCES familia_nueva(id_familia) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY unique_prefijo_familia (id_familia, prefijo_sub),
    INDEX idx_familia (id_familia),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Subfamilias para organización detallada de productos';

-- =====================================================
-- PASO 3: AGREGAR CAMPO A TABLA PRODUCTO (OPCIONAL)
-- =====================================================

-- Agregar campo para identificar productos con subfamilia
ALTER TABLE `producto` 
ADD COLUMN `id_subfamilia` INT NULL AFTER `tipo_producto`,
ADD CONSTRAINT `fk_producto_subfamilia` 
    FOREIGN KEY (`id_subfamilia`) 
    REFERENCES `subfamilia`(`id_subfamilia`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Agregar índice
ALTER TABLE `producto` ADD INDEX idx_subfamilia (`id_subfamilia`);

-- =====================================================
-- PASO 4: POBLAR FAMILIAS NUEVAS
-- =====================================================

INSERT INTO `familia_nueva` (nombre_familia, prefijo_codigo, tipo_producto_legacy, descripcion, estado) VALUES
('Herramientas', 'HERR', 'HERR', 'Herramientas de trabajo manual y eléctrico', 'ACTIVO'),
('Materiales', 'MATE', 'MATE', 'Materiales de construcción y consumibles', 'ACTIVO'),
('Equipos', 'EQUI', 'EQUI', 'Equipos y maquinaria', 'ACTIVO'),
('Suministros', 'SUMI', 'SUMI', 'Suministros operativos generales', 'ACTIVO'),
('Activos Fijos', 'ACFI', 'ACTI', 'Activos fijos y equipos de larga duración', 'ACTIVO'),
('Equipos de Protección', 'EPRO', 'EPROT', 'EPPs y equipos de seguridad', 'ACTIVO'),
('Productos de Aseo', 'ASEO', 'ASEO', 'Productos de limpieza y aseo', 'ACTIVO'),
('Fertilizantes', 'FERT', 'FERT', 'Fertilizantes y agroquímicos', 'ACTIVO'),
('Fitosanitarios', 'FITO', 'FITO', 'Productos fitosanitarios', 'ACTIVO'),
('Repuestos', 'REPU', 'REPU', 'Repuestos y componentes', 'ACTIVO');

-- =====================================================
-- PASO 5: CREAR SUBFAMILIAS POR CATEGORÍA
-- =====================================================

-- Subfamilias para HERRAMIENTAS
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(1, 'Herramientas Manuales', 'MANU', 'Herramientas de mano', 'ACTIVO'),
(1, 'Herramientas Eléctricas', 'ELEC', 'Herramientas con motor eléctrico', 'ACTIVO'),
(1, 'Herramientas de Jardín', 'JARD', 'Herramientas para jardinería', 'ACTIVO'),
(1, 'Herramientas de Medición', 'MEDI', 'Instrumentos de medición', 'ACTIVO');

-- Subfamilias para MATERIALES
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(2, 'Materiales de Construcción', 'CONS', 'Cemento, arena, etc.', 'ACTIVO'),
(2, 'Materiales Eléctricos', 'ELEC', 'Cables, switches, etc.', 'ACTIVO'),
(2, 'Materiales de Plomería', 'PLOM', 'Tuberías, accesorios', 'ACTIVO'),
(2, 'Materiales de Pintura', 'PINT', 'Pinturas y accesorios', 'ACTIVO');

-- Subfamilias para EQUIPOS
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(3, 'Equipos Pesados', 'PESA', 'Maquinaria pesada', 'ACTIVO'),
(3, 'Equipos Ligeros', 'LIGE', 'Equipos portátiles', 'ACTIVO'),
(3, 'Equipos de Cómputo', 'COMP', 'Computadoras y periféricos', 'ACTIVO'),
(3, 'Equipos de Oficina', 'OFIC', 'Impresoras, copiadoras', 'ACTIVO');

-- Subfamilias para SUMINISTROS
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(4, 'Suministros de Oficina', 'OFIC', 'Papelería y útiles', 'ACTIVO'),
(4, 'Suministros de Limpieza', 'LIMP', 'Productos de limpieza', 'ACTIVO'),
(4, 'Suministros Médicos', 'MEDI', 'Botiquín y primeros auxilios', 'ACTIVO');

-- Subfamilias para ACTIVOS FIJOS
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(5, 'Mobiliario', 'MOBI', 'Muebles y enseres', 'ACTIVO'),
(5, 'Vehículos', 'VEHI', 'Automóviles y transporte', 'ACTIVO'),
(5, 'Maquinaria', 'MAQU', 'Maquinaria industrial', 'ACTIVO');

-- Subfamilias para EQUIPOS DE PROTECCIÓN
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(6, 'Protección Personal', 'PERS', 'Cascos, guantes, botas', 'ACTIVO'),
(6, 'Protección Respiratoria', 'RESP', 'Mascarillas, respiradores', 'ACTIVO'),
(6, 'Protección Ocular', 'OCUL', 'Gafas de seguridad', 'ACTIVO');

-- Subfamilias para FERTILIZANTES
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(8, 'Fertilizantes NPK', 'NPK', 'Fertilizantes compuestos', 'ACTIVO'),
(8, 'Fertilizantes Orgánicos', 'ORGA', 'Abonos orgánicos', 'ACTIVO'),
(8, 'Fertilizantes Foliares', 'FOLI', 'Aplicación foliar', 'ACTIVO');

-- Subfamilias para FITOSANITARIOS
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(9, 'Insecticidas', 'INSE', 'Control de insectos', 'ACTIVO'),
(9, 'Fungicidas', 'FUNG', 'Control de hongos', 'ACTIVO'),
(9, 'Herbicidas', 'HERB', 'Control de malezas', 'ACTIVO');

-- Subfamilias para REPUESTOS
INSERT INTO `subfamilia` (id_familia, nombre_subfamilia, prefijo_sub, descripcion, estado) VALUES
(10, 'Repuestos Mecánicos', 'MECA', 'Componentes mecánicos', 'ACTIVO'),
(10, 'Repuestos Eléctricos', 'ELEC', 'Componentes eléctricos', 'ACTIVO'),
(10, 'Repuestos Hidráulicos', 'HIDR', 'Componentes hidráulicos', 'ACTIVO');

-- =====================================================
-- PASO 6: CREAR VISTA PARA CONSULTAS
-- =====================================================

CREATE OR REPLACE VIEW vista_productos_con_subfamilia AS
SELECT 
    p.codigo_producto,
    p.descripcion,
    p.unidad,
    p.consumible,
    p.tipo_producto,
    p.id_subfamilia,
    s.nombre_subfamilia,
    s.prefijo_sub,
    fn.id_familia,
    fn.nombre_familia,
    fn.prefijo_codigo,
    CASE 
        WHEN p.id_subfamilia IS NOT NULL THEN 'NUEVO'
        ELSE 'ANTIGUO'
    END as sistema_codigo
FROM producto p
LEFT JOIN subfamilia s ON p.id_subfamilia = s.id_subfamilia
LEFT JOIN familia_nueva fn ON s.id_familia = fn.id_familia;

-- =====================================================
-- PASO 7: FUNCIÓN PARA GENERAR CÓDIGO AUTOMÁTICO
-- =====================================================

DELIMITER $$

DROP FUNCTION IF EXISTS fn_generar_codigo_producto_nuevo$$

CREATE FUNCTION fn_generar_codigo_producto_nuevo(p_id_subfamilia INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE v_prefijo_familia VARCHAR(10);
    DECLARE v_prefijo_sub VARCHAR(10);
    DECLARE v_ultimo_numero INT;
    DECLARE v_codigo_generado VARCHAR(50);
    
    -- Obtener prefijos de familia y subfamilia
    SELECT fn.prefijo_codigo, s.prefijo_sub
    INTO v_prefijo_familia, v_prefijo_sub
    FROM subfamilia s
    INNER JOIN familia_nueva fn ON s.id_familia = fn.id_familia
    WHERE s.id_subfamilia = p_id_subfamilia;
    
    -- Obtener el último número usado en esta subfamilia
    SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(codigo_producto, '-', -1) AS UNSIGNED)), 0)
    INTO v_ultimo_numero
    FROM producto
    WHERE id_subfamilia = p_id_subfamilia;
    
    -- Generar nuevo código: FAMILIA-SUBFAMILIA-####
    SET v_codigo_generado = CONCAT(
        v_prefijo_familia, '-',
        v_prefijo_sub, '-',
        LPAD(v_ultimo_numero + 1, 4, '0')
    );
    
    RETURN v_codigo_generado;
END$$

DELIMITER ;

-- =====================================================
-- PASO 8: CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Ver familias creadas
SELECT * FROM familia_nueva ORDER BY id_familia;

-- Ver subfamilias por familia
SELECT 
    fn.nombre_familia,
    fn.prefijo_codigo,
    s.nombre_subfamilia,
    s.prefijo_sub,
    CONCAT(fn.prefijo_codigo, '-', s.prefijo_sub, '-XXXX') as ejemplo_codigo
FROM subfamilia s
INNER JOIN familia_nueva fn ON s.id_familia = fn.id_familia
ORDER BY fn.id_familia, s.id_subfamilia;

-- Ver productos actuales (ninguno debería estar afectado)
SELECT 
    codigo_producto,
    tipo_producto,
    id_subfamilia,
    descripcion
FROM producto
LIMIT 10;

-- =====================================================
-- PASO 9: EJEMPLO DE USO
-- =====================================================

-- Ejemplo: Crear producto CON subfamilia (NUEVO SISTEMA)
-- INSERT INTO producto (codigo_producto, tipo_producto, id_subfamilia, descripcion, unidad, consumible)
-- VALUES (
--     fn_generar_codigo_producto_nuevo(1), -- ID subfamilia: Herramientas Manuales
--     'HERR',
--     1,
--     'Martillo de acero 500g',
--     'UND',
--     'NO'
-- );
-- Resultado: codigo_producto = 'HERR-MANU-0001'

-- Ejemplo: Crear producto SIN subfamilia (ANTIGUO SISTEMA - sigue funcionando)
-- INSERT INTO producto (codigo_producto, tipo_producto, descripcion, unidad, consumible)
-- VALUES (
--     'HERR-999', -- Código manual formato antiguo
--     'HERR',
--     'Martillo tradicional',
--     'UND',
--     'NO'
-- );
-- Resultado: Funciona perfectamente con todos los módulos existentes

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- NOTAS IMPORTANTES:
-- 1. Los productos existentes NO se modifican
-- 2. La tabla 'familia' antigua sigue existiendo
-- 3. Ambos sistemas conviven perfectamente
-- 4. Los módulos existentes funcionan con ambos formatos de código
-- 5. La migración a subfamilias es OPCIONAL por producto
