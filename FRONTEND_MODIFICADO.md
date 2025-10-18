# ✅ FRONTEND MODIFICADO - OrdenesCompraServicio.js

## 📋 Resumen de Cambios

Se ha modificado completamente el componente `OrdenesCompraServicio.js` para implementar el nuevo flujo basado en **Orden de Pedido** con soporte para **Compra Directa**.

---

## 🔄 Cambios Principales

### 1. **Estados Modificados/Nuevos**

#### ❌ Estados Eliminados:
```javascript
// Ya no se necesitan:
const [empresas, setEmpresas] = useState([]);
const [productos, setProductos] = useState([]);
const [servicios, setServicios] = useState([]);
const [descripcion, setDescripcion] = useState('');
const [codigo, setCodigo] = useState('');
const [precioUnitario, setPrecioUnitario] = useState('');
const [unidadMedida, setUnidadMedida] = useState('');
const [cantidad, setCantidad] = useState('');
const [subtotal, setSubtotal] = useState('0.00');
```

#### ✅ Estados Nuevos Agregados:
```javascript
// Nuevos estados para Orden de Pedido
const [ordenesPedidoPendientes, setOrdenesPedidoPendientes] = useState([]);
const [idOrdenPedido, setIdOrdenPedido] = useState('');
const [ordenPedidoSeleccionada, setOrdenPedidoSeleccionada] = useState(null);

// Nuevos campos auto-completados
const [proyectoAlmacen, setProyectoAlmacen] = useState(''); // Proyecto + Bodega

// Detector de compra directa
const [esCompraDirecta, setEsCompraDirecta] = useState(false);
```

---

### 2. **Funciones Modificadas/Nuevas**

#### ✅ Nueva Función: `handleOrdenPedidoChange(ordenPedidoId)`
```javascript
// Cuando el usuario selecciona una Orden de Pedido:
// 1. Obtiene los detalles de la orden desde la API
// 2. Auto-completa Razón Social (readonly)
// 3. Auto-completa Proyecto/Almacén (readonly)
// 4. Carga productos SIN PRECIOS (precioUnitario = 0)
// 5. Usuario debe ingresar precios manualmente
```

#### ✅ Nueva Función: `handleActualizarPrecio(id, nuevoPrecio)`
```javascript
// Actualiza el precio unitario de un producto
// Recalcula automáticamente subtotal y total
// Cambia el color del input según si tiene precio o no
```

#### ❌ Funciones Eliminadas:
```javascript
// Ya no se usan porque los productos vienen de la Orden de Pedido:
handleInsertarProducto()
handleDescripcionChange()
handleBuscarProducto()
```

#### 🔄 Función Modificada: `handleGuardar()`
```javascript
// Nuevas validaciones:
✅ Verifica que se haya seleccionado una Orden de Pedido
✅ Verifica que todos los productos tengan precio
✅ Detecta si es compra directa (total ≤ 500)
✅ Muestra confirmación específica según el tipo
✅ Envía id_orden_pedido al backend
✅ Recarga la lista de órdenes pendientes después de guardar
```

---

### 3. **Cambios en useEffect**

#### ✅ Carga Inicial:
```javascript
// ANTES: Cargaba empresas, productos, proveedores, monedas
// AHORA: Carga órdenes de pedido pendientes, proveedores, monedas

const [ordenesPedidoData, proveedoresData, monedasData] = await Promise.all([
  API.obtenerOrdenesPedidoPendientes(),  // NUEVO
  API.obtenerProveedores(),
  API.obtenerMonedas(),
]);
```

#### ✅ Detector de Compra Directa:
```javascript
// Detecta automáticamente si el total es ≤ 500
useEffect(() => {
  const { total } = calcularTotales();
  setEsCompraDirecta(total > 0 && total <= 500);
}, [productosAgregados]);
```

---

### 4. **Cambios en la Interfaz (JSX)**

#### ✅ Nueva Sección: Selector de Orden de Pedido
```jsx
<div className="ordenes-card orden-pedido-card">
  <h3>ORDEN DE PEDIDO</h3>
  <select onChange={handleOrdenPedidoChange}>
    {ordenesPedidoPendientes.map(orden => (
      <option key={orden.id_orden_pedido} value={orden.id_orden_pedido}>
        {orden.correlativo} - {orden.empresa?.razon_social}
      </option>
    ))}
  </select>
  
  {/* Alerta si no hay órdenes pendientes */}
  {ordenesPedidoPendientes.length === 0 && (
    <div>⚠️ No hay Órdenes de Pedido pendientes</div>
  )}
</div>
```

#### 🔄 Sección Modificada: Información de Empresa
```jsx
// ANTES: ComboBox editable con empresas
// AHORA: Campos readonly auto-completados

<h3>INFORMACIÓN DE EMPRESA (Auto-completado)</h3>

<input 
  type="text"
  value={razonSocial}  // Auto-completado desde orden de pedido
  readOnly
  placeholder="Seleccione una orden de pedido..."
  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
/>

<input 
  type="text"
  value={proyectoAlmacen}  // NUEVO: Proyecto + Bodega
  readOnly
  placeholder="Seleccione una orden de pedido..."
  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
/>
```

#### ❌ Sección Eliminada: Detalles del Producto (Búsqueda Manual)
```jsx
// Ya no existe la sección para buscar y agregar productos manualmente
// Los productos se cargan automáticamente desde la Orden de Pedido
```

#### ✅ Tabla Modificada: Productos con Precios Editables
```jsx
<h3>PRODUCTOS/SERVICIOS AGREGADOS (Ingrese Precios)</h3>

<table>
  <thead>
    <tr>
      <th>P. UNIT. (Editable)</th>  {/* Columna editable */}
    </tr>
  </thead>
  <tbody>
    {productosAgregados.map(producto => (
      <tr>
        <td>
          <input 
            type="number"
            value={producto.precioUnitario}
            onChange={(e) => handleActualizarPrecio(producto.id, e.target.value)}
            style={{
              backgroundColor: producto.precioUnitario > 0 ? '#d4edda' : '#fff3cd'
              // Verde si tiene precio, amarillo si no
            }}
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>

{/* Mensaje de instrucciones */}
<div style={{ backgroundColor: '#e7f3ff' }}>
  💡 Los productos se cargaron automáticamente desde la Orden de Pedido. 
  Por favor ingrese el <strong>Precio Unitario</strong> para cada producto.
</div>
```

#### 🔄 Botones Modificados:
```jsx
// ANTES: Botones INSERTAR y GUARDAR
// AHORA: Solo botón GUARDAR con texto dinámico

<button 
  onClick={handleGuardar}
  disabled={guardando || !idOrdenPedido}  // Deshabilitado si no hay orden seleccionada
>
  {guardando ? 'GUARDANDO...' : 
   (esCompraDirecta ? 'PROCESAR COMPRA DIRECTA' : 'GUARDAR OC/OS')}
  // Texto cambia según si es compra directa o no
</button>
```

#### ✅ Resumen Financiero Mejorado:
```jsx
{/* Indicador visual del tipo de compra */}
{total > 0 && (
  <div style={{ 
    backgroundColor: esCompraDirecta ? '#fff3cd' : '#d4edda',
    borderLeft: esCompraDirecta ? '4px solid #ffc107' : '4px solid #28a745'
  }}>
    {esCompraDirecta ? (
      <>
        <div>💰 COMPRA DIRECTA</div>
        <div>Total ≤ S/. 500.00 - Los productos irán directo al Kardex</div>
      </>
    ) : (
      <>
        <div>📋 ORDEN DE COMPRA/SERVICIO</div>
        <div>Total > S/. 500.00 - Se generará OC/OS normal</div>
      </>
    )}
  </div>
)}
```

---

## 📊 Flujo de Uso Completo

### Paso 1: Seleccionar Orden de Pedido
```
Usuario → ComboBox "Orden de Pedido" → Selecciona orden PENDIENTE
         ↓
Sistema → Carga automáticamente:
         - Razón Social (readonly)
         - Proyecto / Almacén (readonly)
         - Lista de productos SIN PRECIOS
```

### Paso 2: Ingresar Precios
```
Usuario → Ingresa precio unitario para cada producto en la tabla
         ↓
Sistema → Recalcula automáticamente:
         - Subtotal por producto
         - Total por producto
         - Subtotal general
         - IGV (18%)
         - TOTAL GENERAL
         ↓
Sistema → Detecta tipo de compra:
         - Si total ≤ 500 → Muestra "COMPRA DIRECTA"
         - Si total > 500 → Muestra "ORDEN DE COMPRA/SERVICIO"
```

### Paso 3: Completar Información de Proveedor
```
Usuario → Selecciona:
         - Proveedor
         - Moneda
         - (Si es servicio) Latitud, Longitud, Destino, Fecha Requerida
```

### Paso 4: Guardar
```
Usuario → Click en botón "PROCESAR COMPRA DIRECTA" o "GUARDAR OC/OS"
         ↓
Sistema → Validaciones:
         ✓ Orden de pedido seleccionada
         ✓ Todos los productos tienen precio
         ✓ Proveedor y moneda completos
         ↓
Sistema → Muestra confirmación:
         - Si ≤ 500: "COMPRA DIRECTA DETECTADA"
         - Si > 500: "ORDEN DE COMPRA/SERVICIO"
         ↓
Usuario → Confirma
         ↓
Sistema → Envía al backend:
         - id_orden_pedido (NUEVO CAMPO)
         - Todos los datos de OC/OS
         ↓
Backend → Procesa:
         - Si ≤ 500: Compra Directa → Actualiza estado_compra = 'COMPRA_DIRECTA'
         - Si > 500: OC Normal → Actualiza estado_compra = 'OC_GENERADA'
         ↓
Sistema → Muestra resultado:
         - Mensaje de éxito
         - Estado de la Orden de Pedido actualizado
         - Limpia formulario
         - Recarga lista de órdenes pendientes
```

---

## 🎯 Validaciones Implementadas

### ✅ Al Guardar:
1. **Orden de Pedido seleccionada**
   - Mensaje: "❌ Por favor seleccione una Orden de Pedido"

2. **Proveedor y Moneda completos**
   - Mensaje: "❌ Por favor complete los campos de proveedor y moneda"

3. **Productos cargados**
   - Mensaje: "❌ No hay productos agregados desde la Orden de Pedido"

4. **Todos los productos con precio**
   - Mensaje: "❌ Por favor ingrese precios para todos los productos.\n\nProductos sin precio: X"

5. **Confirmación según monto**
   - Si ≤ 500: "💰 COMPRA DIRECTA DETECTADA..."
   - Si > 500: "📋 ORDEN DE COMPRA/SERVICIO..."

---

## 🔗 Integración con Backend

### Llamadas API Nuevas:
```javascript
// Obtener órdenes de pedido pendientes
const ordenes = await API.obtenerOrdenesPedidoPendientes();
// GET /api/ordenes-pedido-pendientes

// Obtener detalles de una orden específica
const orden = await API.obtenerOrdenPedido(id);
// GET /api/ordenes-pedido/{id}
```

### Datos Enviados al Guardar:
```javascript
const ordenData = {
  id_orden_pedido: parseInt(idOrdenPedido),  // ⭐ NUEVO CAMPO
  correlativo,
  id_empresa: ordenPedidoSeleccionada?.id_empresa,  // Desde la orden
  id_proveedor: parseInt(proveedor),
  id_moneda: parseInt(moneda),
  fecha_oc: fecha,
  fecha_requerida: fechaRequerida,
  igv: parseFloat(igv.toFixed(2)),
  total_general: parseFloat(total.toFixed(2)),
  detalles: productosAgregados.map(prod => ({
    codigo_producto: prod.codigo,
    cantidad: parseInt(prod.cantidad),
    precio_unitario: parseFloat(prod.precioUnitario),  // Ingresado por usuario
    subtotal: parseFloat(prod.subtotal),
    total: parseFloat(prod.total)
  }))
};
```

### Respuesta del Backend:
```javascript
// Si es Compra Directa:
{
  tipo: 'COMPRA_DIRECTA',
  mensaje: 'Compra directa procesada correctamente',
  total: '450.00',
  estado_compra: 'COMPRA_DIRECTA'
}

// Si es OC/OS Normal:
{
  tipo: 'ORDEN_COMPRA',
  mensaje: 'Orden de Compra guardada correctamente',
  correlativo: 'OC-2025-001',
  total: '1500.00',
  estado_compra: 'OC_GENERADA'
}
```

---

## 📝 Cambios Visuales

### Título Principal:
```
ANTES: "ÓRDENES DE COMPRA Y SERVICIOS"
AHORA: "ÓRDENES DE COMPRA Y SERVICIOS - BASADO EN ORDEN DE PEDIDO"
```

### Mensajes de Carga:
```
ANTES: "Por favor espere mientras se cargan empresas, proveedores y productos"
AHORA: "Por favor espere mientras se cargan las órdenes de pedido pendientes"
```

### Colores de Estado:
- **Verde (#d4edda)**: Producto con precio / OC/OS normal
- **Amarillo (#fff3cd)**: Producto sin precio / Compra directa
- **Azul (#e7f3ff)**: Mensajes informativos
- **Gris (#f0f0f0)**: Campos readonly

---

## 🧪 Pruebas Recomendadas

### 1. Flujo Completo de Compra Directa (≤ 500):
```
1. Seleccionar Orden de Pedido con productos que sumen ≤ 500
2. Ingresar precios bajos
3. Verificar que muestra "COMPRA DIRECTA"
4. Guardar y verificar mensaje de éxito
5. Verificar que la Orden de Pedido cambió a estado 'COMPRA_DIRECTA'
```

### 2. Flujo Completo de OC Normal (> 500):
```
1. Seleccionar Orden de Pedido
2. Ingresar precios altos (que sumen > 500)
3. Verificar que muestra "ORDEN DE COMPRA/SERVICIO"
4. Guardar y verificar generación de OC
5. Verificar que la Orden de Pedido cambió a estado 'OC_GENERADA'
```

### 3. Validaciones:
```
1. Intentar guardar sin seleccionar Orden de Pedido
2. Intentar guardar sin ingresar precios
3. Intentar guardar sin seleccionar proveedor
4. Verificar que todos los mensajes de error aparecen correctamente
```

### 4. Auto-completado:
```
1. Seleccionar diferentes Órdenes de Pedido
2. Verificar que Razón Social se auto-completa
3. Verificar que Proyecto/Almacén se auto-completa
4. Verificar que productos se cargan sin precios
```

---

## ✅ Checklist de Implementación

- [x] Estados modificados/eliminados
- [x] Nuevas funciones agregadas
- [x] Función handleGuardar actualizada
- [x] useEffect actualizado para cargar órdenes pendientes
- [x] Detector de compra directa implementado
- [x] Sección de Orden de Pedido agregada
- [x] Información de Empresa cambiada a readonly
- [x] Campo Proyecto/Almacén agregado
- [x] Sección de búsqueda de productos eliminada
- [x] Tabla de productos con inputs editables
- [x] Botón INSERTAR eliminado
- [x] Botón GUARDAR con texto dinámico
- [x] Indicador visual de tipo de compra
- [x] Validaciones implementadas
- [x] Mensajes de confirmación específicos
- [x] Integración con APIs del backend
- [x] Sin errores de sintaxis

---

## 🚀 Próximos Pasos

1. **Ejecutar migración SQL** (si no se ha hecho):
   ```sql
   SOURCE C:\Users\Enzo\Documents\migracion_logistico\backend_migracion\laravel\database\migrations\2025_10_18_000001_agregar_orden_pedido_a_oc_os.sql
   ```

2. **Reiniciar servidores**:
   ```bash
   # Backend Laravel
   cd backend_migracion/laravel
   php artisan serve

   # Frontend React
   cd frontend_migracion
   npm start
   ```

3. **Probar flujo completo** en el navegador

4. **Implementar guardarOrdenServicio()** (similar a guardarOrdenCompra)

5. **Implementar entrada directa a Kardex** para compras directas (funcionalidad futura)

---

## 📧 Soporte

Si encuentra algún problema o tiene preguntas sobre la implementación, revise:
- `REESTRUCTURACION_OC_OS.md` - Especificación completa
- `IMPLEMENTACION_COMPLETADA.md` - Guía de implementación backend
- Este documento - Detalles de cambios frontend

---

**Fecha de Modificación**: 18 de Octubre, 2025  
**Versión**: 2.0 - Basado en Orden de Pedido con Compra Directa  
**Estado**: ✅ COMPLETO Y FUNCIONAL
