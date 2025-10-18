# 🔧 CORRECCIÓN: Estructura de Datos API vs Frontend

## 🐛 Problema Detectado

Los campos se mostraban como **"N/A"** al seleccionar una Orden de Pedido porque el **frontend esperaba una estructura de datos diferente** a la que realmente devuelve el backend.

---

## 📊 Estructura Real del Backend

### **Endpoint:** `GET /api/ordenes/ordenes-pedido/{id}`

**Respuesta JSON:**
```json
{
  "id_orden_pedido": 1,
  "correlativo": "OP-0001",
  "id_empresa": 1,
  "razon_social": "INCAVO S.A.C",           // ✅ Directamente en el objeto
  "id_proyecto": 1,
  "proyecto_nombre": "CHEUCA",               // ✅ Directamente en el objeto
  "proyecto_bodega": "ALMACÉN CENTRAL",      // ✅ Directamente en el objeto
  "fecha_pedido": "2025-10-18",
  "observacion": "Urgente",
  "estado": "PENDIENTE",
  "detalles": [
    {
      "id_detalle": 1,
      "codigo_producto": "FIT-0001",         // ✅ Directamente en detalle
      "descripcion": "SILICON (ADHERENTE)",  // ✅ Directamente en detalle
      "unidad_medida": "LT",                 // ✅ Directamente en detalle
      "cantidad_solicitada": 10,
      "observacion": null
    }
  ]
}
```

---

## ❌ Lo Que Esperaba el Frontend (INCORRECTO)

```javascript
// ❌ ANTES (Estructura anidada que NO existe)
setRazonSocial(ordenData.empresa?.razon_social || 'N/A');

const proyecto = ordenData.proyecto;
const proyectoTexto = `${proyecto.nombre_proyecto} - ${proyecto.bodega}`;

const productosDesdeOrden = ordenData.detalles?.map(detalle => ({
  codigo: detalle.producto?.codigo,
  descripcion: detalle.producto?.descripcion,
  unidad: detalle.producto?.unidad
}));
```

**Problema:**
- ❌ `ordenData.empresa` no existe → `undefined?.razon_social` → 'N/A'
- ❌ `ordenData.proyecto` no existe → `undefined.nombre_proyecto` → 'N/A'
- ❌ `detalle.producto` no existe → `undefined?.codigo` → 'N/A'

---

## ✅ Estructura Corregida (CORRECTA)

```javascript
// ✅ AHORA (Usando propiedades directas)
setRazonSocial(ordenData.razon_social || 'N/A');

const proyectoTexto = `${ordenData.proyecto_nombre} - ${ordenData.proyecto_bodega}`;

const productosDesdeOrden = ordenData.detalles?.map(detalle => ({
  codigo: detalle.codigo_producto,
  descripcion: detalle.descripcion,
  unidad: detalle.unidad_medida,
  cantidad: detalle.cantidad_solicitada
}));
```

---

## 🔄 Cambios Realizados en el Frontend

### **Archivo:** `OrdenesCompraServicio.js`

### **1. Auto-completado de Razón Social**

```javascript
// ANTES
setRazonSocial(ordenData.empresa?.razon_social || 'N/A');

// AHORA
setRazonSocial(ordenData.razon_social || 'N/A');
```

---

### **2. Auto-completado de Proyecto/Almacén**

```javascript
// ANTES
const proyecto = ordenData.proyecto;
if (proyecto) {
  const proyectoTexto = `${proyecto.nombre_proyecto || 'N/A'} - ${proyecto.bodega || 'N/A'}`;
  setProyectoAlmacen(proyectoTexto);
} else {
  setProyectoAlmacen('N/A');
}

// AHORA
if (ordenData.proyecto_nombre && ordenData.proyecto_bodega) {
  const proyectoTexto = `${ordenData.proyecto_nombre} - ${ordenData.proyecto_bodega}`;
  setProyectoAlmacen(proyectoTexto);
} else {
  setProyectoAlmacen('N/A');
}
```

---

### **3. Carga de Productos desde Detalles**

```javascript
// ANTES
const productosDesdeOrden = ordenData.detalles?.map((detalle, index) => ({
  id: Date.now() + index,
  codigo: detalle.producto?.codigo || 'N/A',                    // ❌
  descripcion: detalle.producto?.descripcion || 'Sin descripción', // ❌
  cantidad: parseFloat(detalle.cantidad) || 0,                  // ❌
  unidad: detalle.producto?.unidad || 'UND',                    // ❌
  // ...
})) || [];

// AHORA
const productosDesdeOrden = ordenData.detalles?.map((detalle, index) => ({
  id: Date.now() + index,
  codigo: detalle.codigo_producto || 'N/A',                     // ✅
  descripcion: detalle.descripcion || 'Sin descripción',        // ✅
  cantidad: parseFloat(detalle.cantidad_solicitada) || 0,       // ✅
  unidad: detalle.unidad_medida || 'UND',                       // ✅
  precioUnitario: 0,
  subtotal: 0,
  total: 0,
  editable: true
})) || [];
```

---

## 📋 Tabla de Mapeo de Propiedades

| **Contexto** | **Frontend Esperaba (❌)** | **Backend Devuelve (✅)** |
|--------------|---------------------------|--------------------------|
| **Empresa** | `ordenData.empresa.razon_social` | `ordenData.razon_social` |
| **Proyecto Nombre** | `ordenData.proyecto.nombre_proyecto` | `ordenData.proyecto_nombre` |
| **Proyecto Bodega** | `ordenData.proyecto.bodega` | `ordenData.proyecto_bodega` |
| **Código Producto** | `detalle.producto.codigo` | `detalle.codigo_producto` |
| **Descripción** | `detalle.producto.descripcion` | `detalle.descripcion` |
| **Unidad** | `detalle.producto.unidad` | `detalle.unidad_medida` |
| **Cantidad** | `detalle.cantidad` | `detalle.cantidad_solicitada` |

---

## 🧪 Pruebas de Verificación

### **Test 1: Seleccionar Orden de Pedido**

**Pasos:**
```
1. Abrir página de Órdenes de Compra/Servicio
2. Seleccionar "OP-0001" en el dropdown "Orden de Pedido"
3. Verificar que se muestre:
   ✅ Razón Social: "INCAVO S.A.C" (no "N/A")
   ✅ Proyecto/Almacén: "CHEUCA - ALMACÉN CENTRAL" (no "N/A")
   ✅ Productos en tabla con códigos reales (no "N/A")
```

### **Test 2: Productos Cargados**

**Verificar en la tabla:**
```
✅ Código: "FIT-0001" (no "N/A")
✅ Descripción: "SILICON (ADHERENTE)" (no "Sin descripción")
✅ Cantidad: 10 (no 0)
✅ Unidad: "LT" (no "UND")
✅ Precio Unitario: 0 (editable - correcto)
```

---

## 🔍 Debugging Tips

### **Si sigue mostrando "N/A":**

1. **Abrir DevTools del navegador** (F12)
2. **Ir a la pestaña Console**
3. **Verificar la respuesta de la API:**

```javascript
// Agregar console.log temporal en handleOrdenPedidoChange:
const ordenData = await API.obtenerOrdenPedido(ordenPedidoId);
console.log('Respuesta de la API:', ordenData);
console.log('Razón Social:', ordenData.razon_social);
console.log('Proyecto:', ordenData.proyecto_nombre, ordenData.proyecto_bodega);
console.log('Detalles:', ordenData.detalles);
```

4. **Verificar que muestre:**
```
Respuesta de la API: {
  razon_social: "INCAVO S.A.C",
  proyecto_nombre: "CHEUCA",
  proyecto_bodega: "ALMACÉN CENTRAL",
  ...
}
```

---

## 🎯 Estado Actual

- ✅ **Corrección aplicada** en `OrdenesCompraServicio.js`
- ✅ **Sin errores de compilación**
- ✅ **Estructura de datos alineada** con el backend
- ⏳ **Pendiente:** Prueba en navegador

---

## 📚 Lecciones Aprendidas

### **1. Siempre Verificar la Estructura Real de la API**

Antes de asumir la estructura de datos:
```javascript
// ❌ NO asumir:
const nombre = response.data.usuario.nombre;

// ✅ Verificar primero:
console.log('Estructura:', response.data);
// Luego usar la estructura real
```

### **2. Usar Optional Chaining con Cuidado**

```javascript
// ❌ Puede ocultar errores:
const valor = obj?.nested?.deep?.value || 'default';
// Si la estructura es plana, nunca se llenará

// ✅ Usar la estructura correcta:
const valor = obj.value || 'default';
```

### **3. Documentar la Estructura de Datos**

Agregar comentarios en el código:
```javascript
// Backend devuelve: { razon_social, proyecto_nombre, proyecto_bodega, detalles: [...] }
const ordenData = await API.obtenerOrdenPedido(ordenPedidoId);
setRazonSocial(ordenData.razon_social); // ✅ Estructura documentada
```

---

## 🚀 Próximos Pasos

1. **Reiniciar el servidor frontend** (si estaba corriendo):
   ```bash
   cd C:\Users\Enzo\Documents\migracion_logistico\frontend_migracion
   npm start
   ```

2. **Probar en el navegador:**
   - Seleccionar orden de pedido
   - Verificar que ya no aparezca "N/A"
   - Confirmar que los productos se cargan correctamente

3. **Verificar datos en consola:**
   - Abrir DevTools (F12)
   - Verificar que no haya errores
   - Confirmar que la respuesta de la API coincide con el código

---

**Fecha de Corrección**: 18 de Octubre, 2025  
**Tipo de Error**: Desajuste en estructura de datos API-Frontend  
**Estado**: ✅ CORREGIDO
