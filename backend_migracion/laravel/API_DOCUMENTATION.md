# 📋 Documentación de APIs - Sistema Logístico

## 🔧 Configuración Base
- **URL Base**: `http://localhost:8000/api`
- **Content-Type**: `application/json`
- **Accept**: `application/json`

---

## 🔐 Autenticación

### 1. Login
**POST** `/auth/login`

**Body:**
```json
{
    "usuario": "nombre_usuario",
    "contraseña": "password"
}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Login exitoso",
    "data": {
        "user": {
            "id": 1,
            "nombre": "Nombre Usuario",
            "usuario": "admin",
            "id_rol": 1,
            "role": "Administrador",
            "permissions": {
                "can_access_approval_modules": true,
                "is_admin": true,
                "role_id": 1,
                "role_name": "Administrador"
            }
        },
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "token_type": "bearer",
        "expires_in": 3600
    }
}
```

### 2. Obtener Usuario Actual
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "nombre": "Nombre Usuario",
            "usuario": "admin",
            "id_rol": 1,
            "role": "Administrador",
            "permissions": {
                "can_access_approval_modules": true,
                "is_admin": true,
                "role_id": 1,
                "role_name": "Administrador"
            }
        }
    }
}
```

### 3. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Logout exitoso"
}
```

### 4. Refrescar Token
**POST** `/auth/refresh`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "token_type": "bearer",
        "expires_in": 3600
    }
}
```

### 5. Verificar Permisos de Admin
**GET** `/auth/check-admin`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "is_admin": true,
        "can_access_approval_modules": true,
        "user_role": "Administrador"
    }
}
```

---

## 👤 Rutas de Usuario (Requieren Autenticación)

### 6. Dashboard Usuario
**GET** `/user/dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Acceso al dashboard de usuario",
    "data": {
        "modules": {
            "profile": true,
            "reports": true,
            "notifications": true
        }
    }
}
```

---

## 👑 Rutas de Administrador (Solo Admin)

### 7. Dashboard Admin
**GET** `/admin/dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Acceso al dashboard de administrador",
    "data": {
        "modules": {
            "user_management": true,
            "approval_modules": true,
            "system_config": true,
            "reports": true,
            "audit_logs": true
        }
    }
}
```

### 8. Aprobaciones Pendientes
**GET** `/admin/approval/pending`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Lista de aprobaciones pendientes",
    "data": {
        "pending_approvals": []
    }
}
```

### 9. Aprobar Elemento
**POST** `/admin/approval/approve/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Aprobación {id} procesada exitosamente"
}
```

### 10. Rechazar Elemento
**POST** `/admin/approval/reject/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Aprobación {id} rechazada exitosamente"
}
```

### 11. Lista de Usuarios
**GET** `/admin/users`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Lista de usuarios del sistema",
    "data": {
        "users": []
    }
}
```

---

## 🧪 Ruta de Prueba

### 12. Test API
**GET** `/test`

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "API funcionando correctamente",
    "timestamp": "2025-10-17T12:00:00.000000Z"
}
```

---

## 🚨 Códigos de Error Comunes

### 401 - No Autorizado
```json
{
    "success": false,
    "message": "Usuario no autenticado"
}
```

### 403 - Acceso Denegado
```json
{
    "success": false,
    "message": "Acceso denegado. Solo administradores pueden acceder a este módulo."
}
```

### 422 - Error de Validación
```json
{
    "success": false,
    "message": "The given data was invalid.",
    "errors": {
        "usuario": ["The usuario field is required."],
        "contraseña": ["The contraseña field is required."]
    }
}
```

---

## 📋 Flujo de Pruebas Recomendado

### 1. Verificar Conectividad
- **GET** `/test` (sin autenticación)

### 2. Probar Login
- **POST** `/auth/login` con credenciales válidas
- Guardar el token recibido

### 3. Verificar Autenticación
- **GET** `/auth/me` (con token)
- **GET** `/auth/check-admin` (con token)

### 4. Probar Rutas de Usuario
- **GET** `/user/dashboard` (con token)

### 5. Probar Rutas de Admin (solo si es admin)
- **GET** `/admin/dashboard` (con token)
- **GET** `/admin/approval/pending` (con token)
- **GET** `/admin/users` (con token)

### 6. Probar Restricciones de Acceso
- Intentar acceder a rutas admin con usuario normal
- Verificar que se devuelve error 403

### 7. Probar Logout y Refresh
- **POST** `/auth/refresh` (con token)
- **POST** `/auth/logout` (con token)

---

## 🔑 Datos de Prueba

Según la base de datos, los roles son:
- **ID 1**: Administrador
- **ID 2**: Usuario

Necesitarás verificar qué usuarios existen en la tabla `LOGEO` para probar el login.

---

## 📝 Notas Importantes

1. **Token JWT**: Incluir en el header `Authorization: Bearer {token}` para rutas protegidas
2. **Roles**: Los usuarios con `id_rol = 2` NO pueden acceder a rutas `/admin/*`
3. **Seguridad**: Las contraseñas actualmente se comparan directamente (sin hash)
4. **Tiempo de vida**: Los tokens JWT tienen una duración configurable (por defecto 60 minutos)