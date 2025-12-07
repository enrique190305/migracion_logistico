# 🔐 Credenciales de Acceso RRHH

## ✅ Usuario de Prueba Configurado

### Datos del Usuario
- **Documento (DNI)**: `24688462`
- **Nombres**: Enzo5
- **Apellidos**: Joel5
- **Correo**: enzojoel5@gmail.com
- **Teléfono**: 587423659
- **Rol**: Admin (id_rol: 3)

### Credenciales de Login
```
Documento: 24688462
Contraseña: 123456789
```

---

## 🚀 Cómo Usar el Login Dual

### Paso 1: Login Principal
1. Inicia sesión en el sistema con tu usuario normal
2. Base de datos: `oc_compra`
3. Accede a cualquier módulo del sistema (Logística, Compras, etc.)

### Paso 2: Acceder a RRHH
1. Click en el menú **"Recursos Humanos"**
2. Aparecerá el modal de autenticación adicional
3. Ingresa:
   - **Número de Documento**: `24688462`
   - **Contraseña**: `123456789`
4. Click en **"🔓 Ingresar a RRHH"**

### Paso 3: Trabajar en RRHH
- Ahora tienes acceso a todos los módulos de RRHH
- El header mostrará: "🔐 Módulo Protegido"
- Verás tu nombre: "👤 Enzo5"
- Todas las peticiones usan el token de RRHH

### Paso 4: Cerrar Sesión RRHH (Opcional)
- Click en **"🚪 Cerrar Sesión RRHH"**
- Solo cierra la sesión de RRHH
- Tu sesión principal sigue activa

---

## 🔧 Formato del API

### Endpoint de Login
```
POST https://bappasistencia.processmart.net/api/v1/auth/login
```

### Body de la Petición
```json
{
  "documento": "24688462",
  "contrasena": "123456789"
}
```

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Bienvenido al sistema",
  "data": {
    "token": "93|WVaxN3lowWI6N6Zxf6nzkI0sUd5rUY91rcDwfsOT7d498dec",
    "usuario": {
      "id_usuario": 235,
      "tipo_documento": "DNI",
      "documento": "24688462",
      "nombres": "Enzo5",
      "apellidos": "Joel5",
      "correo": "enzojoel5@gmail.com",
      "telefono": "587423659",
      "rol": {
        "id_rol": 3,
        "nombre": "Admin",
        "descripcion": "Administrador encargado de añadir, editar y eliminar"
      }
    }
  }
}
```

---

## 📦 Tokens en localStorage

### Token Principal (Sistema)
```javascript
localStorage.getItem('jwt_token')
// Para: Sistema de logística (BD oc_compra)
```

### Token RRHH
```javascript
localStorage.getItem('jwt_token_rrhh')
// Para: Módulo RRHH (BD bappasistencia)
// Ejemplo: "93|WVaxN3lowWI6N6Zxf6nzkI0sUd5rUY91rcDwfsOT7d498dec"
```

### Usuario RRHH
```javascript
JSON.parse(localStorage.getItem('usuario_rrhh'))
// Contiene: { id_usuario, documento, nombres, apellidos, correo, rol, ... }
```

---

## ⚠️ Notas Importantes

### Seguridad
- Las contraseñas se guardan en **texto plano** en la BD (no recomendado para producción)
- El token es tipo **Sanctum** de Laravel
- Se recomienda implementar bcrypt para producción

### Múltiples Usuarios
Si necesitas crear más usuarios en RRHH:

```sql
INSERT INTO usuarios (
    documento, nombres, apellidos, correo, 
    contrasena, rol, estado, created_at, updated_at
) VALUES (
    '12345678', 'Nombre', 'Apellido', 'email@ejemplo.com',
    'contraseña123', 'admin', 'activo', NOW(), NOW()
);
```

### Cambiar Contraseña
```sql
UPDATE usuarios 
SET contrasena = 'nueva_contraseña' 
WHERE documento = '24688462';
```

---

## 🐛 Troubleshooting

### Error 400: "Datos de entrada inválidos"
- ✅ **Solución**: Asegúrate de enviar `documento` y `contrasena` (sin ñ)

### Error 401: "Credenciales incorrectas"
- ✅ **Solución**: Verifica que la contraseña sea exactamente `123456789`

### Error de CORS
- ✅ **Solución**: El backend ya tiene CORS configurado correctamente

### Modal no aparece
- ✅ **Solución**: Verifica que no exista `jwt_token_rrhh` en localStorage
- Limpia con: `localStorage.removeItem('jwt_token_rrhh')`

---

## 📞 Contacto

Si tienes problemas de acceso, contacta al administrador del sistema.

**Última actualización**: Diciembre 6, 2025
