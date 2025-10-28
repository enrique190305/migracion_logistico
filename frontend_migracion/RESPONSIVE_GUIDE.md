# 📱 Guía de Diseño Responsive

## Breakpoints Implementados

El sistema ahora soporta los siguientes breakpoints para garantizar una experiencia óptima en todos los dispositivos:

### 🖥️ Escritorio
- **1920px+**: Monitores grandes (Full HD y superiores)
- **1366px - 1919px**: Laptops estándar y monitores de baja resolución
- **1024px - 1365px**: Laptops pequeñas y tablets en horizontal

### 📱 Tablets
- **768px - 1023px**: Tablets en vertical (iPad, Android tablets)

### 📱 Móviles
- **481px - 767px**: Móviles grandes (iPhone Plus, Android)
- **321px - 480px**: Móviles estándar (iPhone estándar)
- **320px**: Móviles pequeños (iPhone SE, Android compactos)

## Archivos CSS Compartidos

### 1. **ResponsiveTable.css**
Utilidades para tablas responsive. Importar en componentes con tablas:

```jsx
import '../Shared/ResponsiveTable.css';
```

**Características:**
- Scroll horizontal automático en móviles
- Ajuste de tamaños de fuente
- Botones de acción optimizados
- Indicador visual de scroll

### 2. **ResponsiveForm.css**
Utilidades para formularios responsive. Importar en componentes con formularios:

```jsx
import '../Shared/ResponsiveForm.css';
```

**Características:**
- Grids adaptativos (2, 3, 4 columnas)
- Inputs y labels optimizados
- Botones de acción responsivos
- Validaciones visuales

## Componentes Optimizados

### ✅ Completamente Responsive
1. **Layout Principal** (`Layout.css`)
   - Sidebar colapsable en móviles
   - Header adaptativo
   - Footer apilado en móviles

2. **Historiales** (`HistorialComun.css`)
   - Tablas con scroll horizontal
   - Filtros colapsables
   - Botones compactos en móviles

3. **Ingreso de Materiales** (`IngresoMateriales.css`)
   - Formularios de 1 columna en móviles
   - Tabs verticales en pantallas pequeñas
   - Tablas scrollables

4. **Órdenes de Compra/Servicio** (`OrdenesCompraServicio.css`)
   - Grid adaptativo
   - Modales responsive
   - Formularios optimizados

5. **Salida de Materiales** (`SalidaMateriales.css`)
   - Responsive completo

6. **Traslado de Materiales** (`TrasladoMateriales.css`)
   - 4 breakpoints implementados

## Mejores Prácticas

### 1. Uso de Clases Utilitarias

```jsx
// Mostrar solo en móvil
<div className="mobile-only">
  Contenido para móvil
</div>

// Mostrar solo en escritorio
<div className="desktop-only">
  Contenido para escritorio
</div>
```

### 2. Tablas Responsive

```jsx
<div className="responsive-table-wrapper">
  <table className="responsive-table">
    {/* Contenido de tabla */}
  </table>
</div>
```

### 3. Formularios Responsive

```jsx
<div className="form-grid form-grid-3">
  <div className="form-group">
    <label>Campo 1</label>
    <input type="text" />
  </div>
  {/* Más campos */}
</div>

<div className="form-actions">
  <button className="form-btn form-btn-secondary">Cancelar</button>
  <button className="form-btn form-btn-primary">Guardar</button>
</div>
```

### 4. Botones de Acción en Tablas

```jsx
<div className="table-actions">
  <button className="table-action-btn">
    <span className="btn-icon">👁️</span>
    <span className="btn-text">Ver</span>
  </button>
  <button className="table-action-btn">
    <span className="btn-icon">📄</span>
    <span className="btn-text">PDF</span>
  </button>
</div>
```

## Variables CSS Globales

Las siguientes variables están disponibles en todo el proyecto:

```css
:root {
  /* Breakpoints */
  --breakpoint-mobile-sm: 320px;
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop-sm: 1024px;
  --breakpoint-desktop-md: 1366px;
  --breakpoint-desktop-lg: 1920px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Font Sizes */
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-xxl: 24px;
}
```

## Testing Responsive

### Chrome DevTools
1. Abrir DevTools (F12)
2. Click en el ícono de dispositivo móvil (Ctrl+Shift+M)
3. Probar en:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad (768x1024)
   - iPad Pro (1024x1366)
   - Laptop con pantalla pequeña (1366x768)

### Navegadores a Probar
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS)
- ✅ Chrome Mobile (Android)

## Optimizaciones Específicas

### Pantallas de Baja Resolución (1366x768)
- Fuentes reducidas en 1-2px
- Padding/margin reducido en 20-25%
- Grids de 4 columnas → 2 columnas
- Tablas con scroll horizontal si es necesario

### Tablets (768px)
- Grids de 2-3 columnas → 1-2 columnas
- Sidebar colapsado
- Botones de acción en formato compacto
- Filtros apilados verticalmente

### Móviles (480px y menos)
- Todo en 1 columna
- Botones de ancho completo
- Tablas con scroll horizontal
- Solo íconos en botones de acción
- Fuentes reducidas progresivamente

## Soporte para iOS

Se incluyeron meta tags específicos para iOS:
- Prevención de zoom accidental en inputs (font-size: 16px mínimo)
- Barra de estado translúcida
- Soporte para PWA (agregar a pantalla principal)

## Próximas Mejoras

- [ ] Modo oscuro responsive
- [ ] Gestos touch para tablas (swipe)
- [ ] Modales adaptados a móvil
- [ ] Navegación por pestañas en móvil
- [ ] Animaciones optimizadas para rendimiento

## Notas Importantes

⚠️ **Importante para desarrollo:**
- Siempre probar en dispositivos reales cuando sea posible
- Los emuladores no siempre reflejan el comportamiento real
- Considerar velocidad de red (3G/4G) en móviles
- Optimizar imágenes y assets para móviles

✅ **El sistema ahora es completamente usable en:**
- Móviles (desde 320px)
- Tablets (768px - 1024px)
- Laptops con pantallas pequeñas (1366x768)
- Escritorios estándar (1920x1080+)
