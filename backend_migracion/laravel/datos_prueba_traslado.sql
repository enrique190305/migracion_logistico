-- ===================================================================
-- SCRIPT DE DATOS DE PRUEBA PARA TRASLADO DE MATERIALES
-- ===================================================================
-- Este script crea datos de prueba para poder probar la funcionalidad
-- de traslado de materiales sin necesidad de tener datos reales
-- ===================================================================

-- PASO 1: Crear dos proyectos de prueba para trasladar entre ellos
-- ===================================================================

INSERT INTO `proyecto_almacen` (
    `tipo_movil`, 
    `id_referencia`, 
    `id_empresa`, 
    `id_bodega`, 
    `id_reserva`, 
    `codigo_proyecto`, 
    `nombre_proyecto`, 
    `descripcion`, 
    `fecha_registro`, 
    `estado`
) VALUES 
(
    'CON_PROYECTO',
    999,
    1,
    1,
    1,
    'TEST-ORIGEN',
    'ALMACÉN PRUEBA ORIGEN',
    'Proyecto de prueba para traslado de materiales - ORIGEN',
    '2025-10-24',
    'ACTIVO'
),
(
    'CON_PROYECTO',
    998,
    1,
    1,
    1,
    'TEST-DESTINO',
    'ALMACÉN PRUEBA DESTINO',
    'Proyecto de prueba para traslado de materiales - DESTINO',
    '2025-10-24',
    'ACTIVO'
);

-- PASO 2: Insertar movimientos de INGRESO en el kardex para el proyecto origen
-- ===================================================================
-- Estos productos tendrán stock disponible para trasladar

INSERT INTO `movimiento_kardex` (
    `fecha`, 
    `tipo_movimiento`, 
    `codigo_producto`, 
    `descripcion`, 
    `unidad`, 
    `cantidad`, 
    `proyecto`, 
    `documento`, 
    `precio_unitario`, 
    `observaciones`
) VALUES 
-- Producto 1: Cemento
(
    '2025-10-20 10:00:00',
    'INGRESO',
    'MAT-001',
    'CEMENTO TIPO I BOLSA 42.5 KG',
    'BOL',
    100.00,
    'ALMACÉN PRUEBA ORIGEN',
    'INVENTARIO INICIAL',
    25.50,
    'Stock inicial de prueba'
),

-- Producto 2: Fierro
(
    '2025-10-20 10:05:00',
    'INGRESO',
    'MAT-002',
    'FIERRO CORRUGADO 1/2 PULGADA',
    'VAR',
    50.00,
    'ALMACÉN PRUEBA ORIGEN',
    'INVENTARIO INICIAL',
    32.00,
    'Stock inicial de prueba'
),

-- Producto 3: Arena
(
    '2025-10-20 10:10:00',
    'INGRESO',
    'MAT-003',
    'ARENA GRUESA M3',
    'M3',
    25.00,
    'ALMACÉN PRUEBA ORIGEN',
    'INVENTARIO INICIAL',
    45.00,
    'Stock inicial de prueba'
),

-- Producto 4: Pintura
(
    '2025-10-20 10:15:00',
    'INGRESO',
    'MAT-004',
    'PINTURA LATEX BLANCO GALON',
    'GLN',
    30.00,
    'ALMACÉN PRUEBA ORIGEN',
    'INVENTARIO INICIAL',
    55.00,
    'Stock inicial de prueba'
),

-- Producto 5: Clavos
(
    '2025-10-20 10:20:00',
    'INGRESO',
    'MAT-005',
    'CLAVOS DE 3 PULGADAS KG',
    'KG',
    75.00,
    'ALMACÉN PRUEBA ORIGEN',
    'INVENTARIO INICIAL',
    8.50,
    'Stock inicial de prueba'
);

-- ===================================================================
-- INSTRUCCIONES DE USO:
-- ===================================================================
-- 1. Ejecuta este script en tu base de datos MySQL
-- 2. Recarga la página del frontend
-- 3. Selecciona "ALMACÉN PRUEBA ORIGEN" como proyecto origen
-- 4. Deberías ver 5 productos con stock disponible
-- 5. Selecciona "ALMACÉN PRUEBA DESTINO" como proyecto destino
-- 6. Haz el traslado de prueba
-- ===================================================================

-- Para verificar que se insertaron correctamente:
SELECT * FROM proyecto_almacen WHERE codigo_proyecto LIKE 'TEST-%';
SELECT * FROM movimiento_kardex WHERE proyecto = 'ALMACÉN PRUEBA ORIGEN';

-- ===================================================================
-- PARA LIMPIAR LOS DATOS DE PRUEBA (ejecutar después de probar):
-- ===================================================================
-- DELETE FROM movimiento_kardex WHERE proyecto IN ('ALMACÉN PRUEBA ORIGEN', 'ALMACÉN PRUEBA DESTINO');
-- DELETE FROM traslado_materiales WHERE proyecto_origen = 'ALMACÉN PRUEBA ORIGEN' OR proyecto_destino = 'ALMACÉN PRUEBA DESTINO';
-- DELETE FROM proyecto_almacen WHERE codigo_proyecto LIKE 'TEST-%';
-- ===================================================================
