-- ============================================
-- CREAR USUARIO EN BD BAPPASISTENCIA (RRHH)
-- ============================================
-- Ejecuta este script en la base de datos BAPPASISTENCIA

-- PASO 1: Verificar estructura de la tabla usuarios
SHOW COLUMNS FROM usuarios;

-- PASO 2: Ver usuarios existentes para entender el formato
SELECT * FROM usuarios LIMIT 3;

-- ============================================
-- OPCIÓN A: Si la tabla usa 'email' y 'password'
-- ============================================
INSERT INTO usuarios (
    documento,
    nombres,
    apellidos,
    email,
    password,
    rol,
    estado,
    created_at,
    updated_at
) VALUES (
    '24688462',
    'Enzo',
    'Joel',
    'enzojoel5@gmail.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'admin',
    'activo',
    NOW(),
    NOW()
);

-- ============================================
-- OPCIÓN B: Si la tabla usa 'usuario' y 'contrasena' (sin ñ)
-- ============================================
INSERT INTO usuarios (
    documento,
    nombres,
    apellidos,
    usuario,
    contrasena,
    rol,
    estado,
    created_at,
    updated_at
) VALUES (
    '24688462',
    'Enzo',
    'Joel',
    'enzojoel5@gmail.com',
    'Enzojoël.05',
    'admin',
    'activo',
    NOW(),
    NOW()
);

-- ============================================
-- OPCIÓN C: Si la tabla usa 'usuario' y 'contraseña' (con ñ)
-- ============================================
INSERT INTO usuarios (
    documento,
    nombres,
    apellidos,
    usuario,
    contraseña,
    rol,
    estado,
    created_at,
    updated_at
) VALUES (
    '24688462',
    'Enzo',
    'Joel',
    'enzojoel5@gmail.com',
    'Enzojoël.05',
    'admin',
    'activo',
    NOW(),
    NOW()
);

-- ============================================
-- VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- ============================================
SELECT * FROM usuarios WHERE documento = '24688462';
SELECT * FROM usuarios WHERE email = 'enzojoel5@gmail.com' OR usuario = 'enzojoel5@gmail.com';

-- ============================================
-- ACTUALIZAR USUARIO EXISTENTE (SI YA EXISTE)
-- ============================================
-- Si el usuario ya existe en la BD, puedes actualizar su contraseña:

-- Para password hasheado:
UPDATE usuarios 
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE documento = '24688462';

-- Para contraseña plana (sin hash):
UPDATE usuarios 
SET contrasena = 'Enzojoël.05'
WHERE documento = '24688462';

-- O con ñ:
UPDATE usuarios 
SET contraseña = 'Enzojoël.05'
WHERE documento = '24688462';

-- ============================================
-- CREDENCIALES PARA PROBAR EL LOGIN:
-- ============================================
-- Documento: 24688462
-- Contraseña: 123456789
-- 
-- En el modal de login RRHH ingresa:
-- - Número de Documento: 24688462
-- - Contraseña: 123456789
-- ============================================

-- FORMATO DEL API IDENTIFICADO:
-- POST https://bappasistencia.processmart.net/api/v1/auth/login
-- Body: { "documento": "24688462", "contrasena": "123456789" }
-- Respuesta exitosa: { "success": true, "data": { "token": "...", "usuario": {...} } }
-- 
-- NOTA: El backend NO usa bcrypt, las contraseñas se guardan en texto plano
-- Por seguridad, se recomienda implementar hash de contraseñas en producción
