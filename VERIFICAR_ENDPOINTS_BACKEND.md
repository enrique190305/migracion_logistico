# 🔍 Verificar Endpoints del Backend RRHH

## ❗ PROBLEMA ACTUAL

El frontend está intentando usar estos endpoints:
```
GET  /programacion/trabajadores
GET  /programacion/horarios
GET  /programacion/dia/{fecha}
POST /programacion/guardar
POST /programacion/asignar-masivo
DELETE /programacion/limpiar/{fecha}
GET  /programacion/estadisticas/{fecha}
```

Pero **NO SABEMOS** si estos endpoints existen en el backend de bappasistencia.

---

## ✅ SOLUCIÓN: Verificar qué endpoints existen

### Opción 1: Consultar con el equipo de backend

Pregunta al equipo de backend:
1. ¿Existen los endpoints de `/programacion/*`?
2. ¿Qué formato esperan?
3. ¿Están protegidos con autenticación?

### Opción 2: Probar directamente con curl/Postman

```bash
# Obtener trabajadores
curl -X GET \
  "https://bappasistencia.processmart.net/api/v1/programacion/trabajadores" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Accept: application/json"

# Obtener horarios
curl -X GET \
  "https://bappasistencia.processmart.net/api/v1/programacion/horarios" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Accept: application/json"

# Guardar asignaciones
curl -X POST \
  "https://bappasistencia.processmart.net/api/v1/programacion/guardar" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "asignaciones": [
      {
        "id_usuario": 235,
        "id_horario": 1,
        "fecha": "2025-12-06"
      }
    ]
  }'
```

### Opción 3: Revisar las rutas del backend

Si tienes acceso al código del backend bappasistencia, busca:

```
routes/api.php
```

Y verifica si existen rutas como:
```php
Route::prefix('programacion')->group(function () {
    Route::get('/trabajadores', ...);
    Route::get('/horarios', ...);
    Route::post('/guardar', ...);
});
```

---

## 🔧 MIENTRAS TANTO: Usar Mock Data

Si los endpoints **NO existen** o están en desarrollo, puedes:

1. Usar datos mock temporalmente
2. Pedir al backend que implemente los endpoints
3. Implementar los endpoints tú mismo si tienes acceso

### Para activar Mock Data:

Crea las funciones mock en `rrhh.service.js`:

```javascript
// Datos mock de prueba
const trabajadoresMock = [
  { id_usuario: 235, documento: '24688462', nombres: 'Enzo5', apellidos: 'Joel5' },
  // ... más trabajadores
];

const horariosMock = [
  { id_horario: 1, nombre: 'T1', hora_entrada: '06:00', hora_salida: '18:00' },
  { id_horario: 2, nombre: 'T2', hora_entrada: '07:00', hora_salida: '19:00' },
  { id_horario: 3, nombre: 'Descanso', hora_entrada: null, hora_salida: null }
];
```

---

## 📋 CHECKLIST: ¿Qué hacer ahora?

- [ ] **PASO 1**: Verifica si `/programacion/trabajadores` existe
  - Prueba: `https://bappasistencia.processmart.net/api/v1/programacion/trabajadores`
  - Con token: `93|WVaxN3lowWI6N6Zxf6nzkI0sUd5rUY91rcDwfsOT7d498dec`
  
- [ ] **PASO 2**: Verifica si `/programacion/horarios` existe
  - Prueba: `https://bappasistencia.processmart.net/api/v1/programacion/horarios`
  
- [ ] **PASO 3**: Verifica si `/programacion/guardar` existe
  - Método: POST
  - Body esperado: `{ asignaciones: [...] }`

- [ ] **PASO 4**: Si NO existen, decide:
  - ¿Crear los endpoints en el backend?
  - ¿Usar otra tabla/endpoint existente?
  - ¿Usar mock data temporalmente?

---

## 🎯 ALTERNATIVA: Usar endpoints existentes

Si en el backend YA EXISTEN otros endpoints para usuarios y horarios, podemos usar esos:

```javascript
// En lugar de /programacion/trabajadores
// Usar: /usuarios (que ya sabemos que existe)

export const getTrabajadores = async () => {
  const response = await rrhhApi.get('/usuarios');
  // Filtrar solo usuarios con rol trabajador
  return {
    data: {
      data: response.data.filter(u => u.rol?.id_rol === 1) // Ajustar según tu lógica
    }
  };
};
```

---

## 💡 RECOMENDACIÓN

**ANTES DE CONTINUAR**, necesitas:

1. 🔍 **Verificar** qué endpoints existen en bappasistencia
2. 📝 **Documentar** el formato esperado
3. 🔧 **Ajustar** el frontend según la realidad del backend

¿Quieres que te ayude a probar los endpoints con el token que tienes?
