-- =====================================================
-- SCRIPT DE MIGRACIÓN: Reestructuración de BD
-- Fecha: 17 de Octubre, 2025
-- Descripción: Agregar campos a EMPRESA, crear PROYECTO_ALMACEN y ORDEN_PEDIDO
-- =====================================================

USE oc_compra;

-- =====================================================
-- PASO 1: MODIFICAR TABLA EMPRESA
-- =====================================================

-- Agregar nuevas columnas a la tabla EMPRESA
ALTER TABLE EMPRESA 
  ADD COLUMN ruc VARCHAR(11) NULL COMMENT 'RUC de la empresa' AFTER razon_social,
  ADD COLUMN nombre_comercial VARCHAR(255) NULL COMMENT 'Nombre comercial (puede estar vacío)' AFTER ruc,
  ADD COLUMN fecha_creacion DATETIME NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la empresa' AFTER nombre_comercial,
  ADD COLUMN estado_contribuyente ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO' COMMENT 'Estado del contribuyente' AFTER fecha_creacion,
  ADD COLUMN domicilio_fiscal VARCHAR(500) NULL COMMENT 'Domicilio fiscal de la empresa' AFTER estado_contribuyente,
  ADD COLUMN actividades_economicas TEXT NULL COMMENT 'Actividades económicas' AFTER domicilio_fiscal;

-- Agregar índice para RUC (búsquedas rápidas)
ALTER TABLE EMPRESA ADD INDEX idx_ruc (ruc);

-- =====================================================
-- PASO 2: MODIFICAR/CREAR TABLA PROYECTO_ALMACEN
-- =====================================================

-- Crear tabla si NO existe (para instalaciones nuevas)
CREATE TABLE IF NOT EXISTS PROYECTO_ALMACEN (
  id_proyecto INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del proyecto',
  id_empresa INT(11) NULL COMMENT 'FK: Empresa a la que pertenece el proyecto',
  codigo_proyecto VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del proyecto',
  nombre_proyecto VARCHAR(255) NOT NULL COMMENT 'Nombre del proyecto',
  descripcion TEXT NULL COMMENT 'Descripción del proyecto',
  ubicacion VARCHAR(255) NULL COMMENT 'Ubicación física del proyecto',
  responsable VARCHAR(100) NULL COMMENT 'Responsable del proyecto',
  fecha_inicio DATE NULL COMMENT 'Fecha de inicio del proyecto',
  fecha_fin DATE NULL COMMENT 'Fecha de finalización (si aplica)',
  estado ENUM('ACTIVO', 'INACTIVO', 'FINALIZADO') DEFAULT 'ACTIVO' COMMENT 'Estado del proyecto',
  presupuesto DECIMAL(12,2) NULL COMMENT 'Presupuesto asignado',
  usuario_creacion VARCHAR(50) NULL COMMENT 'Usuario que creó el registro',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  usuario_modificacion VARCHAR(50) NULL COMMENT 'Usuario que modificó el registro',
  fecha_modificacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
  
  -- Índices
  INDEX idx_empresa (id_empresa),
  INDEX idx_codigo (codigo_proyecto),
  INDEX idx_estado (estado),
  INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabla de proyectos/almacenes asociados a empresas';

-- =====================================================
-- MODIFICAR TABLA EXISTENTE (si ya tenía datos)
-- =====================================================

-- PASO 2.1: Agregar columna id_empresa (permitiendo NULL temporalmente)
SET @columna_existe = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'PROYECTO_ALMACEN' 
    AND COLUMN_NAME = 'id_empresa'
);

SET @sql_add_column = IF(@columna_existe = 0,
  'ALTER TABLE PROYECTO_ALMACEN ADD COLUMN id_empresa INT(11) NULL COMMENT "FK: Empresa a la que pertenece el proyecto" AFTER id_proyecto',
  'SELECT "La columna id_empresa ya existe en PROYECTO_ALMACEN" AS Info'
);

PREPARE stmt FROM @sql_add_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- PASO 2.2: Asignar valores a id_empresa para registros existentes
-- IMPORTANTE: Ajusta esta lógica según tus datos reales
-- Opción 1: Asignar todos los proyectos a la primera empresa
UPDATE PROYECTO_ALMACEN 
SET id_empresa = 1 
WHERE id_empresa IS NULL;

-- PASO 2.3: Convertir la columna a NOT NULL (ahora que todos tienen valor)
ALTER TABLE PROYECTO_ALMACEN 
  MODIFY COLUMN id_empresa INT(11) NOT NULL COMMENT 'FK: Empresa a la que pertenece el proyecto';

-- PASO 2.4: Agregar Foreign Key (solo si no existe)
SET @fk_existe = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'PROYECTO_ALMACEN' 
    AND CONSTRAINT_NAME = 'fk_proyecto_empresa'
);

SET @sql_add_fk = IF(@fk_existe = 0,
  'ALTER TABLE PROYECTO_ALMACEN ADD CONSTRAINT fk_proyecto_empresa FOREIGN KEY (id_empresa) REFERENCES EMPRESA(id_empresa) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT "La foreign key fk_proyecto_empresa ya existe" AS Info'
);

PREPARE stmt FROM @sql_add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PASO 3: CREAR TABLA ORDEN_PEDIDO (CABECERA)
-- =====================================================

CREATE TABLE IF NOT EXISTS ORDEN_PEDIDO (
  id_orden_pedido INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la orden de pedido',
  correlativo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Correlativo único (ej: OP-0001)',
  id_empresa INT(11) NOT NULL COMMENT 'FK: Empresa que realiza el pedido',
  id_proyecto INT(11) NOT NULL COMMENT 'FK: Proyecto al que pertenece el pedido',
  fecha_pedido DATE NOT NULL COMMENT 'Fecha del pedido',
  observacion TEXT NULL COMMENT 'Observación general del pedido',
  estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO') 
    DEFAULT 'PENDIENTE' COMMENT 'Estado de la orden',
  prioridad ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') DEFAULT 'MEDIA' COMMENT 'Prioridad del pedido',
  fecha_requerida DATE NULL COMMENT 'Fecha en la que se requieren los productos',
  usuario_solicitante VARCHAR(100) NULL COMMENT 'Usuario que solicita',
  usuario_aprobador VARCHAR(100) NULL COMMENT 'Usuario que aprueba',
  fecha_aprobacion DATETIME NULL COMMENT 'Fecha de aprobación',
  usuario_creacion VARCHAR(50) NULL COMMENT 'Usuario que creó el registro',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  usuario_modificacion VARCHAR(50) NULL COMMENT 'Usuario que modificó',
  fecha_modificacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
  
  -- Foreign Keys
  CONSTRAINT fk_orden_pedido_empresa FOREIGN KEY (id_empresa) 
    REFERENCES EMPRESA(id_empresa) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  
  CONSTRAINT fk_orden_pedido_proyecto FOREIGN KEY (id_proyecto) 
    REFERENCES PROYECTO_ALMACEN(id_proyecto) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  
  -- Índices
  INDEX idx_correlativo (correlativo),
  INDEX idx_empresa (id_empresa),
  INDEX idx_proyecto (id_proyecto),
  INDEX idx_fecha_pedido (fecha_pedido),
  INDEX idx_estado (estado),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabla de órdenes de pedido (cabecera)';

-- =====================================================
-- PASO 4: CREAR TABLA DETALLE_ORDEN_PEDIDO (DETALLES)
-- =====================================================

CREATE TABLE IF NOT EXISTS DETALLE_ORDEN_PEDIDO (
  id_detalle_pedido INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del detalle',
  id_orden_pedido INT(11) NOT NULL COMMENT 'FK: Orden de pedido',
  codigo_producto VARCHAR(20) NOT NULL COMMENT 'FK: Código del producto',
  cantidad_solicitada DECIMAL(10,2) NOT NULL COMMENT 'Cantidad solicitada',
  cantidad_aprobada DECIMAL(10,2) NULL COMMENT 'Cantidad aprobada (puede ser menor)',
  cantidad_entregada DECIMAL(10,2) NULL DEFAULT 0 COMMENT 'Cantidad ya entregada',
  unidad VARCHAR(20) NULL COMMENT 'Unidad de medida',
  stock_actual DECIMAL(10,2) NULL COMMENT 'Stock actual al momento del pedido',
  observacion VARCHAR(255) NULL COMMENT 'Observación del producto',
  estado_linea ENUM('PENDIENTE', 'APROBADO', 'PARCIAL', 'COMPLETADO', 'CANCELADO') 
    DEFAULT 'PENDIENTE' COMMENT 'Estado de la línea del pedido',
  
  -- Foreign Keys
  CONSTRAINT fk_detalle_orden_pedido FOREIGN KEY (id_orden_pedido) 
    REFERENCES ORDEN_PEDIDO(id_orden_pedido) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT fk_detalle_producto FOREIGN KEY (codigo_producto) 
    REFERENCES PRODUCTO(codigo_producto) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  
  -- Índices
  INDEX idx_orden (id_orden_pedido),
  INDEX idx_producto (codigo_producto),
  INDEX idx_estado (estado_linea)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabla de detalles de órdenes de pedido (múltiples productos por orden)';

-- =====================================================
-- PASO 5: DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Actualizar datos existentes de EMPRESA con información de ejemplo
UPDATE EMPRESA SET 
  ruc = '20123456789',
  nombre_comercial = 'INCAVO',
  estado_contribuyente = 'ACTIVO',
  domicilio_fiscal = 'Av. Principal 123, Lima',
  actividades_economicas = 'Producción y comercialización de productos agrícolas'
WHERE id_empresa = 1;

UPDATE EMPRESA SET 
  ruc = '20987654321',
  nombre_comercial = 'GAIA',
  estado_contribuyente = 'ACTIVO',
  domicilio_fiscal = 'Jr. Comercio 456, Lima',
  actividades_economicas = 'Cultivo y exportación de frutas'
WHERE id_empresa = 2;

-- Insertar proyectos de ejemplo
INSERT INTO PROYECTO_ALMACEN 
  (id_empresa, codigo_proyecto, nombre_proyecto, descripcion, ubicacion, estado) 
VALUES
  (1, 'PRY-001', 'Almacén Central INCAVO', 'Almacén principal de materiales', 'Lima', 'ACTIVO'),
  (1, 'PRY-002', 'Proyecto Cheuca', 'Producción en Cheuca', 'Cheuca, Cusco', 'ACTIVO'),
  (2, 'PRY-003', 'Almacén GAIA Principal', 'Almacén central GAIA', 'Lima', 'ACTIVO');

-- =====================================================
-- VERIFICACIÓN DE LA ESTRUCTURA
-- =====================================================

-- Ver estructura de EMPRESA
DESCRIBE EMPRESA;

-- Ver estructura de PROYECTO_ALMACEN
DESCRIBE PROYECTO_ALMACEN;

-- Ver estructura de ORDEN_PEDIDO
DESCRIBE ORDEN_PEDIDO;

-- Ver estructura de DETALLE_ORDEN_PEDIDO
DESCRIBE DETALLE_ORDEN_PEDIDO;

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
  AND TABLE_NAME IN ('EMPRESA', 'PROYECTO_ALMACEN', 'ORDEN_PEDIDO', 'DETALLE_ORDEN_PEDIDO')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
