# 🚀 Guía de Pruebas del Sistema de Autenticación

## ✅ Pre-requisitos

1. **Servidor Laravel ejecutándose** en `http://localhost:8000`
2. **Base de datos configurada** con las tablas `LOGEO` y `ROL`
3. **Postman instalado** (o cualquier cliente HTTP)

## 📋 Pasos para Probar

### 1. Importar Colección en Postman
- Abre Postman
- Clic en "Import"
- Selecciona el archivo `Postman_Collection.json`
- La colección "Sistema Logístico - APIs" aparecerá en tu workspace

### 2. Verificar Conectividad
```http
GET http://localhost:8000/api/test
```
**Resultado esperado:** Status 200 con mensaje "API funcionando correctamente"

### 3. Preparar Datos de Prueba
Necesitas verificar qué usuarios tienes en la tabla `LOGEO`. Puedes usar estos ejemplos:

**Para Admin:**
```json
{
    "usuario": "admin",
    "contraseña": "admin123"
}
```

**Para Usuario Normal:**
```json
{
    "usuario": "usuario",
    "contraseña": "user123"
}
```

### 4. Probar Login
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
    "usuario": "admin",
    "contraseña": "admin123"
}
```

**Si es exitoso:**
- ✅ Status 200
- ✅ Recibir token JWT
- ✅ Información del usuario y permisos

**Si falla:**
- ❌ Status 401 con mensaje de error

### 5. Probar Autenticación con Token

Una vez tengas el token, úsalo en el header:
```
Authorization: Bearer {tu_token_aquí}
```

**Prueba estas rutas:**
```http
GET /api/auth/me
GET /api/auth/check-admin
GET /api/user/dashboard
```

### 6. Probar Rutas de Administrador

**Solo si el usuario es Admin (id_rol = 1):**
```http
GET /api/admin/dashboard
GET /api/admin/approval/pending
GET /api/admin/users
```

### 7. Probar Restricciones de Acceso

**Con usuario normal (id_rol = 2):**
- Intenta acceder a `/api/admin/dashboard`
- **Resultado esperado:** Status 403 - "Acceso denegado"

### 8. Probar Logout y Refresh

```http
POST /api/auth/refresh (con token válido)
POST /api/auth/logout (con token válido)
```

## 🔍 Verificaciones Importantes

### ✅ Login Exitoso
- [ ] Status 200
- [ ] Token JWT presente
- [ ] Información del usuario correcta
- [ ] Permisos según rol

### ✅ Autenticación
- [ ] Rutas protegidas requieren token
- [ ] Token inválido devuelve 401
- [ ] Token expirado devuelve 401

### ✅ Control de Roles
- [ ] Admin puede acceder a todas las rutas
- [ ] Usuario normal NO puede acceder a rutas admin
- [ ] Error 403 para acceso denegado

### ✅ Funcionalidades JWT
- [ ] Refresh token funciona
- [ ] Logout invalida el token
- [ ] Token tiene tiempo de expiración

## 🐛 Problemas Comunes y Soluciones

### Error 500 - Internal Server Error
- Verificar que el servidor Laravel esté corriendo
- Revisar logs en `storage/logs/laravel.log`
- Verificar conexión a base de datos

### Error 401 - Unauthorized
- Verificar que el token esté en el header correcto
- Verificar que el token no haya expirado
- Verificar formato: `Authorization: Bearer {token}`

### Error 403 - Forbidden
- ✅ **Comportamiento esperado** para usuarios sin permisos
- Verificar que el usuario tenga el rol correcto

### Error 422 - Validation Error
- Verificar que se envíen todos los campos requeridos
- Verificar formato JSON correcto

## 📊 Resultados Esperados por Rol

### 👑 Admin (id_rol = 1)
- ✅ Acceso a TODAS las rutas
- ✅ `can_access_approval_modules: true`
- ✅ Puede ver módulos de aprobación

### 👤 Usuario (id_rol = 2)
- ✅ Acceso a rutas `/auth/*` y `/user/*`
- ❌ NO acceso a rutas `/admin/*`
- ✅ `can_access_approval_modules: false`

## 📝 Datos de Prueba Sugeridos

Necesitarás insertar usuarios de prueba en la tabla `LOGEO`:

```sql
INSERT INTO LOGEO (id_rol, nombre, usuario, contraseña) VALUES
(1, 'Administrador Sistema', 'admin', 'admin123'),
(2, 'Usuario Normal', 'usuario', 'user123');
```

## 🎯 Próximos Pasos

Una vez que todas las pruebas pasen exitosamente:

1. **Implementar hash de contraseñas** para mayor seguridad
2. **Agregar validaciones adicionales**
3. **Implementar endpoints específicos** según necesidades del negocio
4. **Integrar con el frontend React**
5. **Agregar logs de auditoría**

¡Listo para probar! 🚀