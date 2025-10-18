# REESTRUCTURACIÓN: Órdenes de Compra/Servicio basadas en Órdenes de Pedido

## 📋 RESUMEN DE CAMBIOS

### 1. CONCEPTO GENERAL
- Las OC/OS ahora se generan a partir de Órdenes de Pedido en estado "PENDIENTE"
- Si el monto total ≤ 500 → **COMPRA DIRECTA** (productos van directo al Kardex)
- Si el monto total > 500 → Se genera **OC/OS** normalmente

### 2. CAMBIOS EN BASE DE DATOS

#### Tabla `ORDEN_COMPRA` - Agregar campos:
```sql
ALTER TABLE ORDEN_COMPRA 
ADD COLUMN id_orden_pedido INT(11) NULL AFTER id_empresa,
ADD CONSTRAINT fk_oc_orden_pedido 
    FOREIGN KEY (id_orden_pedido) 
    REFERENCES ORDEN_PEDIDO(id_orden_pedido);
```

#### Tabla `ORDEN_SERVICIO` - Agregar campos:
```sql
ALTER TABLE ORDEN_SERVICIO 
ADD COLUMN id_orden_pedido INT(11) NULL AFTER id_empresa,
ADD CONSTRAINT fk_os_orden_pedido 
    FOREIGN KEY (id_orden_pedido) 
    REFERENCES ORDEN_PEDIDO(id_orden_pedido);
```

#### Tabla `ORDEN_PEDIDO` - Agregar campo estado_compra:
```sql
ALTER TABLE ORDEN_PEDIDO 
ADD COLUMN estado_compra VARCHAR(20) DEFAULT 'SIN_PROCESAR' 
COMMENT 'SIN_PROCESAR, COMPRA_DIRECTA, OC_GENERADA, OS_GENERADA';
```

### 3. BACKEND - Nuevos Endpoints

#### OrdenCompraServicioController.php
- ✅ `obtenerOrdenesPedidoPendientes()` - Lista órdenes pendientes
- ✅ `obtenerOrdenPedido($id)` - Detalle de orden específica
- 🔄 `guardarOrdenCompra()` - Modificar para incluir id_orden_pedido y lógica de compra directa
- 🔄 `guardarOrdenServicio()` - Modificar para incluir id_orden_pedido y lógica de compra directa

#### Nuevas Rutas (api.php)
```php
Route::get('/ordenes-pedido-pendientes', [OrdenCompraServicioController::class, 'obtenerOrdenesPedidoPendientes']);
Route::get('/ordenes-pedido/{id}', [OrdenCompraServicioController::class, 'obtenerOrdenPedido']);
```

### 4. FRONTEND - Cambios en OrdenesCompraServicio.js

#### Nuevos Estados:
- `ordenesPedidoPendientes` - Lista de órdenes pendientes
- `ordenPedidoSeleccionada` - Orden de pedido actual
- `proyectoAlmacen` - Nombre del proyecto (readonly)

#### Nuevos Campos en UI:
**Sección: "INFORMACIÓN DE ORDEN DE PEDIDO"**
1. **Orden de Pedido** (ComboBox) - Muestra correlativos pendientes
2. **Razón Social** (readonly, autocompletado)
3. **Proyecto Almacén** (readonly, autocompletado)
4. Fecha OC/OS
5. Fecha Requerida

#### Lógica Nueva:
1. Al seleccionar Orden de Pedido:
   - Autocompleta Razón Social
   - Autocompleta Proyecto Almacén
   - Carga productos en tabla con cantidad y descripción
   - Usuario solo ingresa **Precio Unitario**

2. Al guardar:
   - Calcula monto total
   - Si total ≤ 500 → Muestra alerta "COMPRA DIRECTA - Se enviará al Kardex"
   - Si total > 500 → Genera OC/OS normal
   - Actualiza estado de Orden de Pedido a procesada

### 5. VALIDACIONES

#### Frontend:
- No permitir guardar sin Orden de Pedido seleccionada
- Validar que todos los productos tengan precio unitario
- Confirmar con usuario si es compra directa

#### Backend:
- Validar que Orden de Pedido esté en estado "PENDIENTE"
- Validar que no se haya procesado anteriormente
- Validar montos y cálculos

### 6. FLUJO COMPLETO

```
1. Usuario abre "Órdenes de Compra/Servicio"
2. Selecciona una Orden de Pedido PENDIENTE
3. Se autocompletar: Empresa, Proyecto, Productos (sin precio)
4. Usuario ingresa precios unitarios para cada producto
5. Sistema calcula subtotales y total
6. Usuario hace clic en "Guardar"
7. Sistema valida monto:
   
   SI monto ≤ 500:
   - Genera registro de "Compra Directa"
   - Envía productos directo al Kardex
   - Actualiza Orden de Pedido: estado_compra = "COMPRA_DIRECTA"
   - Actualiza Orden de Pedido: estado = "PROCESADA"
   
   SI monto > 500:
   - Genera OC/OS normal
   - Vincula id_orden_pedido
   - Actualiza Orden de Pedido: estado_compra = "OC_GENERADA" o "OS_GENERADA"
   - Orden de Pedido permanece en estado "PENDIENTE" hasta aprobación de OC/OS
```

### 7. ARCHIVOS A MODIFICAR

#### Backend:
- ✅ `app/Http/Controllers/Api/OrdenCompraServicioController.php` 
- ✅ `routes/api.php`
- 🔄 `app/Models/OrdenCompra.php` (agregar relación)
- 🔄 `app/Models/OrdenServicio.php` (agregar relación)
- 🔄 `app/Models/OrdenPedido.php` (agregar campo estado_compra)

#### Frontend:
- 🔄 `src/components/OrdenesCompraServicio/OrdenesCompraServicio.js`
- 🔄 `src/components/OrdenesCompraServicio/OrdenesCompraServicio.css`
- 🔄 `src/services/ordenesAPI.js`

#### Base de Datos:
- 🔄 `database/migrations/2025_10_18_000001_agregar_orden_pedido_a_oc_os.sql` (NUEVO)

---

## 🎯 ESTADO ACTUAL

✅ = Completado
🔄 = En Progreso
⏳ = Pendiente

- ✅ Backend: Agregados imports de modelos
- ✅ Backend: Método `obtenerOrdenesPedidoPendientes()`
- ✅ Backend: Método `obtenerOrdenPedido($id)`
- 🔄 Backend: Actualizar `guardarOrdenCompra()`
- ⏳ Backend: Actualizar `guardarOrdenServicio()`
- ⏳ Backend: Rutas API
- ⏳ Frontend: Restructuración completa de UI
- ⏳ Base de Datos: Script de migración

---

## 📝 PRÓXIMOS PASOS

1. Crear script de migración SQL
2. Actualizar métodos guardarOrdenCompra y guardarOrdenServicio
3. Actualizar rutas API
4. Reestructurar frontend completo
5. Pruebas de integración
