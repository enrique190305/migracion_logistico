# 📋 API CRUD de Empresas - Guía para Thunder Client

## 🔗 Base URL
```
http://localhost:8000/api/empresas
```

---

## 📝 ENDPOINTS DISPONIBLES

### 1. ✅ LISTAR TODAS LAS EMPRESAS
**Método:** `GET`  
**URL:** `http://localhost:8000/api/empresas`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_empresa": 1,
      "razon_social": "CONSTRUCTORA ABC S.A.C.",
      "ruc": "20123456789",
      "nombre_comercial": "ABC Construcciones",
      "fecha_creacion": "2024-01-15",
      "estado_contribuyente": "ACTIVO",
      "domicilio_fiscal": "Av. Principal 123, Lima",
      "actividades_economicas": "Construcción de edificios"
    }
  ],
  "message": "Empresas obtenidas correctamente"
}
```

---

### 2. 🔍 OBTENER UNA EMPRESA ESPECÍFICA
**Método:** `GET`  
**URL:** `http://localhost:8000/api/empresas/{id}`

**Ejemplo:** `http://localhost:8000/api/empresas/1`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_empresa": 1,
    "razon_social": "CONSTRUCTORA ABC S.A.C.",
    "ruc": "20123456789",
    "nombre_comercial": "ABC Construcciones",
    "fecha_creacion": "2024-01-15",
    "estado_contribuyente": "ACTIVO",
    "domicilio_fiscal": "Av. Principal 123, Lima",
    "actividades_economicas": "Construcción de edificios"
  },
  "message": "Empresa encontrada correctamente"
}
```

**Respuesta no encontrada (404):**
```json
{
  "success": false,
  "message": "Empresa no encontrada"
}
```

---

### 3. ➕ CREAR UNA NUEVA EMPRESA
**Método:** `POST`  
**URL:** `http://localhost:8000/api/empresas`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "razon_social": "CONSTRUCTORA XYZ S.A.C.",
  "ruc": "20987654321",
  "nombre_comercial": "XYZ Construcciones",
  "fecha_creacion": "2024-10-31",
  "estado_contribuyente": "ACTIVO",
  "domicilio_fiscal": "Jr. Los Constructores 456, Lima",
  "actividades_economicas": "Construcción de obras civiles y edificaciones"
}
```

**Campos obligatorios:**
- ✅ `razon_social` (string, máx. 255 caracteres)
- ✅ `ruc` (string, máx. 11 caracteres, único)

**Campos opcionales:**
- `nombre_comercial` (string, máx. 255 caracteres)
- `fecha_creacion` (date, formato: YYYY-MM-DD)
- `estado_contribuyente` (string, máx. 100 caracteres)
- `domicilio_fiscal` (string)
- `actividades_economicas` (string)

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id_empresa": 2,
    "razon_social": "CONSTRUCTORA XYZ S.A.C.",
    "ruc": "20987654321",
    "nombre_comercial": "XYZ Construcciones",
    "fecha_creacion": "2024-10-31",
    "estado_contribuyente": "ACTIVO",
    "domicilio_fiscal": "Jr. Los Constructores 456, Lima",
    "actividades_economicas": "Construcción de obras civiles y edificaciones"
  },
  "message": "Empresa creada exitosamente"
}
```

**Respuesta error validación (422):**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": {
    "razon_social": ["El campo razón social es obligatorio."],
    "ruc": ["El RUC ya ha sido registrado."]
  }
}
```

---

### 4. ✏️ ACTUALIZAR UNA EMPRESA
**Método:** `PUT`  
**URL:** `http://localhost:8000/api/empresas/{id}`

**Ejemplo:** `http://localhost:8000/api/empresas/2`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "razon_social": "CONSTRUCTORA XYZ PERU S.A.C.",
  "nombre_comercial": "XYZ Construcciones Perú",
  "estado_contribuyente": "ACTIVO",
  "domicilio_fiscal": "Av. Nueva Dirección 789, Lima",
  "actividades_economicas": "Construcción de obras civiles, edificaciones y servicios relacionados"
}
```

**Nota:** Puedes enviar solo los campos que deseas actualizar.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_empresa": 2,
    "razon_social": "CONSTRUCTORA XYZ PERU S.A.C.",
    "ruc": "20987654321",
    "nombre_comercial": "XYZ Construcciones Perú",
    "fecha_creacion": "2024-10-31",
    "estado_contribuyente": "ACTIVO",
    "domicilio_fiscal": "Av. Nueva Dirección 789, Lima",
    "actividades_economicas": "Construcción de obras civiles, edificaciones y servicios relacionados"
  },
  "message": "Empresa actualizada exitosamente"
}
```

**Respuesta no encontrada (404):**
```json
{
  "success": false,
  "message": "Empresa no encontrada"
}
```

---

### 5. ❌ ELIMINAR UNA EMPRESA
**Método:** `DELETE`  
**URL:** `http://localhost:8000/api/empresas/{id}`

**Ejemplo:** `http://localhost:8000/api/empresas/2`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Empresa eliminada exitosamente"
}
```

**Respuesta con relaciones (409 - Conflict):**
```json
{
  "success": false,
  "message": "No se puede eliminar la empresa porque tiene órdenes asociadas"
}
```

**Respuesta no encontrada (404):**
```json
{
  "success": false,
  "message": "Empresa no encontrada"
}
```

---

## 🧪 EJEMPLOS DE PRUEBA EN THUNDER CLIENT

### Ejemplo 1: Crear empresa mínima (solo campos obligatorios)
```json
{
  "razon_social": "EMPRESA DE PRUEBA S.A.C.",
  "ruc": "20111222333"
}
```

### Ejemplo 2: Crear empresa completa
```json
{
  "razon_social": "SERVICIOS GENERALES DEL PERU S.A.C.",
  "ruc": "20444555666",
  "nombre_comercial": "ServiPeru",
  "fecha_creacion": "2024-01-01",
  "estado_contribuyente": "ACTIVO",
  "domicilio_fiscal": "Calle Las Flores 123, Miraflores, Lima",
  "actividades_economicas": "Servicios de mantenimiento y reparación"
}
```

### Ejemplo 3: Actualizar solo algunos campos
```json
{
  "nombre_comercial": "ServiPeru SAC",
  "estado_contribuyente": "SUSPENDIDO"
}
```

---

## ⚠️ CÓDIGOS DE ESTADO HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - No se puede eliminar por tener relaciones |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error - Error del servidor |

---

## 🔧 VALIDACIONES APLICADAS

### Campo `ruc`:
- Máximo 11 caracteres
- Debe ser único (no puede repetirse)
- Obligatorio al crear

### Campo `razon_social`:
- Máximo 255 caracteres
- Obligatorio al crear

### Campo `nombre_comercial`:
- Máximo 255 caracteres
- Opcional

### Campo `estado_contribuyente`:
- Máximo 100 caracteres
- Opcional

### Campo `fecha_creacion`:
- Formato válido de fecha (YYYY-MM-DD)
- Opcional

---

## 🚀 CÓMO INICIAR EL SERVIDOR

Asegúrate de tener el servidor Laravel corriendo:

```bash
cd backend_migracion/laravel
php artisan serve
```

El servidor estará disponible en: `http://localhost:8000`

---

## 📌 NOTAS IMPORTANTES

1. **Protección contra eliminación:** No se puede eliminar una empresa si tiene órdenes de compra, servicio o pedido asociadas.

2. **Transacciones:** Todas las operaciones de creación, actualización y eliminación están envueltas en transacciones de base de datos.

3. **RUC único:** El sistema valida que no existan dos empresas con el mismo RUC.

4. **Timestamps:** El modelo tiene `timestamps = false`, por lo que no usa `created_at` ni `updated_at`.

5. **Relaciones del modelo:**
   - Órdenes de Compra
   - Órdenes de Servicio
   - Órdenes de Pedido
   - Proyectos (relación N:N)

---

## 🎯 FLUJO DE PRUEBA RECOMENDADO

1. **GET** `/api/empresas` - Ver lista inicial
2. **POST** `/api/empresas` - Crear una nueva empresa
3. **GET** `/api/empresas/{id}` - Ver la empresa creada
4. **PUT** `/api/empresas/{id}` - Actualizar algunos datos
5. **GET** `/api/empresas/{id}` - Verificar cambios
6. **DELETE** `/api/empresas/{id}` - Eliminar (si no tiene relaciones)

---

## 📞 SOPORTE

Si encuentras algún error, verifica:
- ✅ Servidor Laravel corriendo
- ✅ Base de datos conectada
- ✅ Tabla `empresa` existe
- ✅ Headers correctos en las peticiones
- ✅ Formato JSON válido en el body

---

**Última actualización:** 31 de octubre de 2025
