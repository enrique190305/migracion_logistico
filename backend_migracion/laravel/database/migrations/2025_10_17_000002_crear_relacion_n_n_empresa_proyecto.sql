-- =====================================================
-- MIGRACIÓN: Relación N:N entre EMPRESA y PROYECTO
-- Fecha: 17 de Octubre, 2025
-- Descripción: Crear tabla intermedia EMPRESA_PROYECTO
-- =====================================================

USE oc_compra;

-- =====================================================
-- PASO 1: ELIMINAR FOREIGN KEY ACTUAL (1:N)
-- =====================================================

-- Verificar si existe la FK y eliminarla
SET @fk_existe = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'PROYECTO_ALMACEN' 
    AND CONSTRAINT_NAME = 'fk_proyecto_empresa'
);

SET @sql_drop_fk = IF(@fk_existe > 0,
  'ALTER TABLE PROYECTO_ALMACEN DROP FOREIGN KEY fk_proyecto_empresa',
  'SELECT "Foreign key no existe, continuando..." AS Info'
);

PREPARE stmt FROM @sql_drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PASO 2: ELIMINAR COLUMNA id_empresa DE PROYECTO_ALMACEN
-- =====================================================

-- Verificar si existe la columna
SET @columna_existe = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'oc_compra' 
    AND TABLE_NAME = 'PROYECTO_ALMACEN' 
    AND COLUMN_NAME = 'id_empresa'
);

SET @sql_drop_column = IF(@columna_existe > 0,
  'ALTER TABLE PROYECTO_ALMACEN DROP COLUMN id_empresa',
  'SELECT "Columna id_empresa no existe, continuando..." AS Info'
);

PREPARE stmt FROM @sql_drop_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PASO 3: CREAR TABLA INTERMEDIA EMPRESA_PROYECTO
-- =====================================================

CREATE TABLE IF NOT EXISTS EMPRESA_PROYECTO (
  id_empresa_proyecto INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la relación',
  id_empresa INT(11) NOT NULL COMMENT 'FK: Empresa participante',
  id_proyecto INT(11) NOT NULL COMMENT 'FK: Proyecto',
  fecha_asignacion DATE NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de asignación',
  observaciones TEXT NULL COMMENT 'Observaciones sobre la participación',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  usuario_creacion VARCHAR(50) NULL COMMENT 'Usuario que creó el registro',
  fecha_modificacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
  usuario_modificacion VARCHAR(50) NULL COMMENT 'Usuario que modificó',
  
  -- Foreign Keys
  CONSTRAINT fk_ep_empresa FOREIGN KEY (id_empresa) 
    REFERENCES EMPRESA(id_empresa) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT fk_ep_proyecto FOREIGN KEY (id_proyecto) 
    REFERENCES PROYECTO_ALMACEN(id_proyecto) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  -- Restricción: Una empresa no puede estar duplicada en el mismo proyecto
  UNIQUE KEY unique_empresa_proyecto (id_empresa, id_proyecto),
  
  -- Índices
  INDEX idx_empresa (id_empresa),
  INDEX idx_proyecto (id_proyecto),
  INDEX idx_fecha_asignacion (fecha_asignacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabla intermedia N:N entre empresas y proyectos';

-- =====================================================
-- PASO 4: MIGRAR DATOS EXISTENTES (si los hay)
-- =====================================================

-- Si ya tenías datos en PROYECTO_ALMACEN con id_empresa, 
-- puedes migrarlos manualmente aquí. Ejemplo:

-- INSERT INTO EMPRESA_PROYECTO (id_empresa, id_proyecto, porcentaje_participacion, es_principal)
-- SELECT id_empresa, id_proyecto, 100.00, 1
-- FROM PROYECTO_ALMACEN_OLD
-- WHERE id_empresa IS NOT NULL;

-- =====================================================
-- PASO 5: DATOS DE EJEMPLO
-- =====================================================

-- Asignar proyectos existentes a empresas
-- Proyecto 1: INCAVO
INSERT INTO EMPRESA_PROYECTO (id_empresa, id_proyecto, fecha_asignacion)
VALUES (1, 1, CURDATE())
ON DUPLICATE KEY UPDATE fecha_asignacion = CURDATE();

-- Proyecto 2: Compartido entre INCAVO y GAIA
INSERT INTO EMPRESA_PROYECTO (id_empresa, id_proyecto, fecha_asignacion)
VALUES 
  (1, 2, CURDATE()),
  (2, 2, CURDATE())
ON DUPLICATE KEY UPDATE fecha_asignacion = CURDATE();

-- Proyecto 3: GAIA
INSERT INTO EMPRESA_PROYECTO (id_proyecto, id_empresa, fecha_asignacion)
SELECT p.id_proyecto, 2, CURDATE()
FROM PROYECTO_ALMACEN p
WHERE p.nombre_proyecto LIKE '%GAIA%'
  AND NOT EXISTS (
    SELECT 1 FROM EMPRESA_PROYECTO ep 
    WHERE ep.id_proyecto = p.id_proyecto
  )
LIMIT 1
ON DUPLICATE KEY UPDATE fecha_asignacion = CURDATE();

-- Asignar todos los demás proyectos sin asignación a empresa 1 por defecto
INSERT INTO EMPRESA_PROYECTO (id_proyecto, id_empresa, fecha_asignacion)
SELECT p.id_proyecto, 1, CURDATE()
FROM PROYECTO_ALMACEN p
WHERE NOT EXISTS (
  SELECT 1 FROM EMPRESA_PROYECTO ep WHERE ep.id_proyecto = p.id_proyecto
);

-- =====================================================
-- PASO 6: MODIFICAR ORDEN_PEDIDO
-- =====================================================

-- Ahora ORDEN_PEDIDO solo necesita id_proyecto
-- La empresa se obtiene a través de EMPRESA_PROYECTO

-- Opcional: Si quieres mantener id_empresa en ORDEN_PEDIDO
-- para saber qué empresa específica hace el pedido (en caso de proyecto compartido)
-- puedes dejarlo. De lo contrario, quítalo:

-- ALTER TABLE ORDEN_PEDIDO DROP FOREIGN KEY fk_orden_pedido_empresa;
-- ALTER TABLE ORDEN_PEDIDO DROP COLUMN id_empresa;

-- =====================================================
-- VERIFICACIÓN DE LA ESTRUCTURA
-- =====================================================

-- Ver estructura de EMPRESA_PROYECTO
DESCRIBE EMPRESA_PROYECTO;

-- Ver relaciones
SELECT 
  e.razon_social AS Empresa,
  p.nombre_proyecto AS Proyecto,
  ep.fecha_asignacion AS Asignacion
FROM EMPRESA_PROYECTO ep
JOIN EMPRESA e ON ep.id_empresa = e.id_empresa
JOIN PROYECTO_ALMACEN p ON ep.id_proyecto = p.id_proyecto
ORDER BY p.nombre_proyecto, e.razon_social;

-- Ver proyectos con múltiples empresas
SELECT 
  p.nombre_proyecto,
  COUNT(DISTINCT ep.id_empresa) AS Num_Empresas,
  GROUP_CONCAT(e.razon_social ORDER BY ep.porcentaje_participacion DESC SEPARATOR ', ') AS Empresas_Participantes
FROM PROYECTO_ALMACEN p
LEFT JOIN EMPRESA_PROYECTO ep ON p.id_proyecto = ep.id_proyecto
LEFT JOIN EMPRESA e ON ep.id_empresa = e.id_empresa
GROUP BY p.id_proyecto, p.nombre_proyecto
ORDER BY Num_Empresas DESC, p.nombre_proyecto;

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
  AND TABLE_NAME = 'EMPRESA_PROYECTO'
ORDER BY TABLE_NAME, ORDINAL_POSITION;
