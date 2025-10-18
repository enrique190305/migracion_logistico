-- =====================================================
-- SCRIPT DE EJECUCIÓN LIMPIA
-- Ejecuta esto para empezar desde cero
-- =====================================================

USE oc_compra;

-- 1. Eliminar tabla intermedia si existe (para empezar limpio)
DROP TABLE IF EXISTS EMPRESA_PROYECTO;

-- 2. Asegurarse de que la columna id_empresa existe en PROYECTO_ALMACEN
-- (Ya la recreaste manualmente, este es solo un recordatorio)

-- Verificar que la columna existe
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oc_compra' 
  AND TABLE_NAME = 'PROYECTO_ALMACEN' 
  AND COLUMN_NAME = 'id_empresa';

-- Ver datos actuales
SELECT id_proyecto, nombre_proyecto, id_empresa 
FROM PROYECTO_ALMACEN 
LIMIT 10;

-- =====================================================
-- 3. AHORA EJECUTA EL SCRIPT PRINCIPAL
-- =====================================================
-- Copia y pega todo el contenido del archivo:
-- 2025_10_17_000002_crear_relacion_n_n_empresa_proyecto.sql
-- O usa: SOURCE C:\Users\Enzo\Documents\migracion_logistico\backend_migracion\laravel\database\migrations\2025_10_17_000002_crear_relacion_n_n_empresa_proyecto.sql
