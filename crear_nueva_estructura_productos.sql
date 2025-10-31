-- =====================================================
-- SCRIPT: NUEVA ESTRUCTURA DE FAMILIA, SUBFAMILIA Y PRODUCTOS
-- Fecha: 30 de octubre de 2025
-- Descripción: Reestructuración completa del sistema de productos
-- =====================================================

-- =====================================================
-- PASO 1: RESPALDAR TABLA ANTIGUA
-- =====================================================

-- Eliminar respaldo anterior si existe
DROP TABLE IF EXISTS `familia_old_backup`;

-- Renombrar tabla antigua de familia
ALTER TABLE `familia` RENAME TO `familia_old_backup`;

-- =====================================================
-- PASO 2: CREAR NUEVAS TABLAS
-- =====================================================

-- TABLA: FAMILIA (Categorías Principales)
CREATE TABLE `familia` (
    `id_familia` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre_familia` VARCHAR(50) NOT NULL,
    `prefijo_codigo` VARCHAR(10) NOT NULL UNIQUE,
    `descripcion` VARCHAR(200) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `fecha_modificacion` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_prefijo (prefijo_codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de familias de productos - Categorías principales';

-- TABLA: SUBFAMILIA (Divisiones Internas)
CREATE TABLE `subfamilia` (
    `id_subfamilia` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre_subfamilia` VARCHAR(50) NOT NULL,
    `id_familia` INT NOT NULL,
    `prefijo_sub` VARCHAR(10) NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `fecha_modificacion` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_familia) REFERENCES familia(id_familia) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY unique_prefijo_familia (id_familia, prefijo_sub),
    INDEX idx_familia (id_familia),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de subfamilias - Divisiones internas de cada familia';

-- TABLA: PRODUCTOS (Crear nueva tabla)
-- NOTA: Si existe una tabla 'productos' anterior, elimínala manualmente antes de ejecutar este script
-- DROP TABLE IF EXISTS `productos`;

CREATE TABLE `productos` (
    `id_producto` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo_producto` VARCHAR(50) NOT NULL UNIQUE,
    `id_subfamilia` INT NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL,
    `unidad_medida` VARCHAR(10) NOT NULL,
    `observacion` VARCHAR(255) NULL,
    `id_bodega` INT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    `consumible` ENUM('SI', 'NO') DEFAULT 'SI',
    `stock_minimo` DECIMAL(10,2) DEFAULT 0,
    `stock_maximo` DECIMAL(10,2) DEFAULT 0,
    `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `fecha_modificacion` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_subfamilia) REFERENCES subfamilia(id_subfamilia) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_bodega) REFERENCES bodega(id_bodega) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_codigo (codigo_producto),
    INDEX idx_subfamilia (id_subfamilia),
    INDEX idx_estado (estado),
    INDEX idx_bodega (id_bodega)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de productos con código auto-generado según familia y subfamilia';

-- =====================================================
-- PASO 3: MIGRAR DATOS DE FAMILIA ANTIGUA A NUEVA
-- =====================================================

INSERT INTO `familia` (nombre_familia, prefijo_codigo, descripcion, estado) VALUES
('Activos Fijos', 'ACTI', 'Equipos y maquinaria de larga duración', 'ACTIVO'),
('Alveol', 'ALVE', 'Productos tipo alveol', 'ACTIVO'),
('Aseo', 'ASEO', 'Productos de limpieza y aseo', 'ACTIVO'),
('Bandejas', 'BAND', 'Bandejas de diversos tipos', 'ACTIVO'),
('Cajas', 'CAJA', 'Empaques tipo caja', 'ACTIVO'),
('Equipos de Protección', 'EPRO', 'EPPs y equipos de seguridad', 'ACTIVO'),
('Etiquetas', 'ETIQ', 'Etiquetas de identificación', 'ACTIVO'),
('Fertilizantes', 'FERT', 'Productos fertilizantes', 'ACTIVO'),
('Fitosanitarios', 'FITO', 'Productos fitosanitarios y agroquímicos', 'ACTIVO'),
('Herramientas', 'HERR', 'Herramientas de trabajo', 'ACTIVO'),
('Lubricantes', 'LUBR', 'Aceites y lubricantes', 'ACTIVO'),
('Mantenimiento', 'MANT', 'Productos para mantenimiento', 'ACTIVO'),
('Materia Prima', 'MPRI', 'Materias primas', 'ACTIVO'),
('Producto Final', 'PFIN', 'Productos terminados', 'ACTIVO'),
('Repuestos', 'REPU', 'Repuestos y componentes', 'ACTIVO'),
('Suministros Generales', 'SUGE', 'Suministros diversos', 'ACTIVO'),
('Suministros', 'SUMI', 'Suministros operativos', 'ACTIVO');

-- =====================================================
-- PASO 4: CREAR SUBFAMILIAS POR DEFECTO
-- =====================================================

-- Para cada familia, crear una subfamilia general
INSERT INTO `subfamilia` (nombre_subfamilia, id_familia, prefijo_sub, descripcion, estado) 
SELECT 
    CONCAT(nombre_familia, ' - General') as nombre_subfamilia,
    id_familia,
    'GEN' as prefijo_sub,
    'Subfamilia general' as descripcion,
    'ACTIVO' as estado
FROM familia;

-- Subfamilias específicas para Empaques (Cajas)
INSERT INTO `subfamilia` (nombre_subfamilia, id_familia, prefijo_sub, descripcion, estado) VALUES
('Cajas de Cartón', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'CAJA'), 'CART', 'Cajas de cartón', 'ACTIVO'),
('Cajas Plásticas', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'CAJA'), 'PLAS', 'Cajas de plástico', 'ACTIVO'),
('Cajas de Madera', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'CAJA'), 'MADE', 'Cajas de madera', 'ACTIVO');

-- Subfamilias específicas para Herramientas
INSERT INTO `subfamilia` (nombre_subfamilia, id_familia, prefijo_sub, descripcion, estado) VALUES
('Herramientas Manuales', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'HERR'), 'MANU', 'Herramientas de mano', 'ACTIVO'),
('Herramientas Eléctricas', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'HERR'), 'ELEC', 'Herramientas eléctricas', 'ACTIVO'),
('Herramientas de Jardín', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'HERR'), 'JARD', 'Herramientas de jardinería', 'ACTIVO');

-- Subfamilias específicas para Fertilizantes
INSERT INTO `subfamilia` (nombre_subfamilia, id_familia, prefijo_sub, descripcion, estado) VALUES
('Fertilizantes NPK', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'FERT'), 'NPK', 'Fertilizantes NPK', 'ACTIVO'),
('Fertilizantes Orgánicos', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'FERT'), 'ORGA', 'Fertilizantes orgánicos', 'ACTIVO'),
('Fertilizantes Foliares', (SELECT id_familia FROM familia WHERE prefijo_codigo = 'FERT'), 'FOLI', 'Fertilizantes foliares', 'ACTIVO');

-- =====================================================
-- PASO 5: CREAR FUNCIÓN PARA GENERAR CÓDIGO
-- =====================================================

DELIMITER $$

DROP FUNCTION IF EXISTS fn_generar_codigo_producto$$

CREATE FUNCTION fn_generar_codigo_producto(p_id_subfamilia INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE v_prefijo_familia VARCHAR(10);
    DECLARE v_prefijo_sub VARCHAR(10);
    DECLARE v_ultimo_numero INT;
    DECLARE v_codigo_generado VARCHAR(50);
    
    -- Obtener prefijos de familia y subfamilia
    SELECT f.prefijo_codigo, s.prefijo_sub
    INTO v_prefijo_familia, v_prefijo_sub
    FROM subfamilia s
    INNER JOIN familia f ON s.id_familia = f.id_familia
    WHERE s.id_subfamilia = p_id_subfamilia;
    
    -- Obtener el último número usado en esta subfamilia
    SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(codigo_producto, '-', -1) AS UNSIGNED)), 0)
    INTO v_ultimo_numero
    FROM productos
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
-- PASO 6: CREAR TRIGGER PARA AUTO-GENERAR CÓDIGO
-- =====================================================

DELIMITER $$

DROP TRIGGER IF EXISTS trg_before_insert_producto$$

CREATE TRIGGER trg_before_insert_producto
BEFORE INSERT ON productos
FOR EACH ROW
BEGIN
    -- Si no se proporciona código, generarlo automáticamente
    IF NEW.codigo_producto IS NULL OR NEW.codigo_producto = '' THEN
        SET NEW.codigo_producto = fn_generar_codigo_producto(NEW.id_subfamilia);
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- PASO 7: EJEMPLOS DE INSERCIÓN
-- =====================================================

-- Ejemplo 1: Insertar producto sin especificar código (se genera automáticamente)
INSERT INTO productos (id_subfamilia, descripcion, unidad_medida, consumible, estado)
VALUES 
(
    (SELECT id_subfamilia FROM subfamilia WHERE nombre_subfamilia = 'Cajas de Cartón'),
    'Caja de cartón grande 50x40x30',
    'UNIDAD',
    'SI',
    'ACTIVO'
);
-- Código generado: CAJA-CART-0001

-- Ejemplo 2: Insertar herramienta
INSERT INTO productos (id_subfamilia, descripcion, unidad_medida, consumible, estado)
VALUES 
(
    (SELECT id_subfamilia FROM subfamilia WHERE nombre_subfamilia = 'Herramientas Manuales'),
    'Martillo de acero 500g',
    'UNIDAD',
    'NO',
    'ACTIVO'
);
-- Código generado: HERR-MANU-0001

-- Ejemplo 3: Insertar fertilizante
INSERT INTO productos (id_subfamilia, descripcion, unidad_medida, consumible, estado)
VALUES 
(
    (SELECT id_subfamilia FROM subfamilia WHERE nombre_subfamilia = 'Fertilizantes NPK'),
    'Fertilizante NPK 20-20-20 x 50kg',
    'SACO',
    'SI',
    'ACTIVO'
);
-- Código generado: FERT-NPK-0001

-- =====================================================
-- PASO 8: VISTAS DE CONSULTA
-- =====================================================

-- Vista completa de productos con familia y subfamilia
CREATE OR REPLACE VIEW vista_productos_completa AS
SELECT 
    p.id_producto,
    p.codigo_producto,
    p.descripcion,
    p.unidad_medida,
    p.consumible,
    p.estado,
    p.stock_minimo,
    p.stock_maximo,
    s.id_subfamilia,
    s.nombre_subfamilia,
    s.prefijo_sub,
    f.id_familia,
    f.nombre_familia,
    f.prefijo_codigo,
    b.nombre as nombre_bodega,
    p.fecha_creacion
FROM productos p
INNER JOIN subfamilia s ON p.id_subfamilia = s.id_subfamilia
INNER JOIN familia f ON s.id_familia = f.id_familia
LEFT JOIN bodega b ON p.id_bodega = b.id_bodega
WHERE p.estado = 'ACTIVO';

-- =====================================================
-- PASO 9: VERIFICACIÓN
-- =====================================================

-- Verificar familias creadas
SELECT * FROM familia ORDER BY id_familia;

-- Verificar subfamilias creadas
SELECT 
    s.id_subfamilia,
    s.nombre_subfamilia,
    s.prefijo_sub,
    f.nombre_familia,
    f.prefijo_codigo
FROM subfamilia s
INNER JOIN familia f ON s.id_familia = f.id_familia
ORDER BY f.id_familia, s.id_subfamilia;

-- Verificar productos de ejemplo
SELECT * FROM vista_productos_completa;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
