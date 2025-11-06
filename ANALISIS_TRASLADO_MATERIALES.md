# 📋 ANÁLISIS Y SOLUCIÓN: TRASLADO DE MATERIALES

## 🔍 ANÁLISIS DE LA BASE DE DATOS

### Tablas Involucradas:

1. **`traslado_materiales`** - Encabezado del traslado
   ```sql
   - id_traslado (PK)
   - fecha_traslado
   - reserva_origen (FK → reserva)
   - id_bodega_origen (FK → bodega)
   - reserva_destino (FK → reserva)
   - id_bodega_destino (FK → bodega)
   - usuario
   - observaciones
   - fecha_creacion
   ```

2. **`detalle_traslado`** - Detalle de productos trasladados
   ```sql
   - id_detalle_traslado (PK, AUTO_INCREMENT)
   - id_traslado (FK → traslado_materiales)
   - codigo_producto (FK → producto)
   - descripcion
   - cantidad
   - unidad
   - observaciones
   ```

3. **`bodega_stock`** - Control de stock por bodega y reserva
   ```sql
   - id_stock (PK, AUTO_INCREMENT)
   - id_bodega (FK → bodega)
   - id_reserva (FK → reserva)
   - codigo_producto (FK → producto)
   - cantidad_disponible
   - cantidad_reservada
   - fecha_actualizacion
   ```

4. **`movimiento_kardex`** - Historial de movimientos
   ```sql
   - id_movimiento (PK, AUTO_INCREMENT)
   - fecha
   - tipo_movimiento (INGRESO/SALIDA)
   - codigo_producto
   - descripcion
   - unidad
   - cantidad
   - proyecto
   - id_bodega
   - documento
   - observaciones
   ```

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **No hay validación de stock vacío**
   - **Problema**: Al seleccionar bodega origen, no se valida si tiene productos
   - **Impacto**: Usuario puede intentar crear traslado sin productos disponibles

### 2. **Error al guardar traslado**
   - **Posible causa 1**: Falta el trigger `after_insert_detalle_traslado` en BD
   - **Posible causa 2**: Campos NULL en tablas relacionadas
   - **Posible causa 3**: Validación de stock insuficiente

### 3. **Error al generar PDF**
   - **Posible causa**: Vista blade no existe o tiene errores
   - **Posible causa**: Datos incompletos en consulta del traslado

## ✅ SOLUCIONES PROPUESTAS

### SOLUCIÓN 1: Validar Stock al Seleccionar Bodega Origen

**Backend** - Modificar `productosConStockReserva()`:
```php
public function productosConStockReserva($idReserva)
{
    try {
        // Verificar si la reserva existe
        $reserva = DB::table('reserva')->where('id_reserva', $idReserva)->first();
        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'La reserva seleccionada no existe'
            ], 404);
        }

        // Obtener productos con stock
        $productos = DB::table('bodega_stock as bs')
            ->join('producto as p', 'bs.codigo_producto', '=', 'p.codigo_producto')
            ->where('bs.id_reserva', $idReserva)
            ->where('bs.cantidad_disponible', '>', 0)
            ->select(
                'bs.codigo_producto',
                'p.descripcion',
                'p.unidad',
                'bs.cantidad_disponible as stock_disponible',
                'bs.cantidad_reservada'
            )
            ->orderBy('p.descripcion')
            ->get();

        // NUEVO: Validar si no hay productos
        if ($productos->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta bodega no tiene productos disponibles para trasladar',
                'data' => []
            ], 200); // 200 porque no es un error del servidor
        }

        return response()->json([
            'success' => true,
            'data' => $productos
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error al obtener productos con stock en reserva: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Error al cargar productos de la reserva: ' . $e->getMessage()
        ], 500);
    }
}
```

**Frontend** - Modificar `cargarProductosDeLaReserva()`:
```javascript
const cargarProductosDeLaReserva = async (idReserva) => {
  try {
    setCargando(true);

    const respProductos = await obtenerProductosConStockReserva(idReserva);
    
    if (respProductos.success && respProductos.data.length > 0) {
      // Formatear productos
      const productosFormateados = respProductos.data.map(p => ({
        codigo: p.codigo_producto,
        descripcion: p.descripcion,
        unidad: p.unidad,
        stock: parseFloat(p.stock_disponible || 0)
      }));

      setProductos(productosFormateados);
      setDescripcionesProductos(productosFormateados.map(p => p.descripcion));
      
      // Mostrar mensaje de éxito
      mostrarMensaje('success', `✅ ${productosFormateados.length} productos disponibles`);
      
    } else {
      // MEJORADO: Mostrar mensaje claro cuando no hay productos
      setProductos([]);
      setDescripcionesProductos([]);
      mostrarMensaje('warning', '⚠️ Esta bodega no tiene productos disponibles para trasladar');
    }

  } catch (error) {
    console.error('Error al cargar productos de la reserva:', error);
    mostrarMensaje('error', '❌ Error al cargar los productos de la reserva');
  } finally {
    setCargando(false);
  }
};
```

### SOLUCIÓN 2: Verificar y Crear Trigger de Base de Datos

**Crear trigger si no existe**:
```sql
-- Verificar si existe el trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'after_insert_detalle_traslado';

-- Si no existe, crearlo:
DELIMITER $$

CREATE TRIGGER after_insert_detalle_traslado
AFTER INSERT ON detalle_traslado
FOR EACH ROW
BEGIN
    DECLARE v_id_bodega_origen INT;
    DECLARE v_id_reserva_origen INT;
    DECLARE v_id_bodega_destino INT;
    DECLARE v_id_reserva_destino INT;
    
    -- Obtener bodegas y reservas del traslado
    SELECT 
        id_bodega_origen, 
        reserva_origen,
        id_bodega_destino,
        reserva_destino
    INTO 
        v_id_bodega_origen,
        v_id_reserva_origen,
        v_id_bodega_destino,
        v_id_reserva_destino
    FROM traslado_materiales
    WHERE id_traslado = NEW.id_traslado;
    
    -- 1. RESTAR stock del origen
    UPDATE bodega_stock 
    SET 
        cantidad_disponible = cantidad_disponible - NEW.cantidad,
        fecha_actualizacion = NOW()
    WHERE 
        id_bodega = v_id_bodega_origen
        AND id_reserva = v_id_reserva_origen
        AND codigo_producto = NEW.codigo_producto;
    
    -- 2. SUMAR stock al destino (o crear registro si no existe)
    INSERT INTO bodega_stock (
        id_bodega,
        id_reserva,
        codigo_producto,
        cantidad_disponible,
        cantidad_reservada,
        fecha_actualizacion
    ) VALUES (
        v_id_bodega_destino,
        v_id_reserva_destino,
        NEW.codigo_producto,
        NEW.cantidad,
        0,
        NOW()
    )
    ON DUPLICATE KEY UPDATE
        cantidad_disponible = cantidad_disponible + NEW.cantidad,
        fecha_actualizacion = NOW();
        
END$$

DELIMITER ;
```

### SOLUCIÓN 3: Crear Vista Blade para PDF

**Crear archivo**: `backend_migracion/laravel/resources/views/pdf/traslado_materiales.blade.php`

```php
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Traslado de Materiales - {{ $traslado->id_traslado }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
        .header h1 { font-size: 20px; color: #2c3e50; }
        .info-grid { display: table; width: 100%; margin-bottom: 10px; }
        .info-row { display: table-row; }
        .info-label { display: table-cell; font-weight: bold; width: 25%; padding: 5px; background-color: #ecf0f1; }
        .info-value { display: table-cell; width: 25%; padding: 5px; border-bottom: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background-color: #34495e; color: white; padding: 8px; text-align: left; font-size: 10px; }
        td { padding: 6px; border-bottom: 1px solid #ddd; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TRASLADO DE MATERIALES</h1>
        <h2>{{ $traslado->id_traslado }}</h2>
    </div>

    <div class="info-grid">
        <div class="info-row">
            <div class="info-label">Fecha Traslado:</div>
            <div class="info-value">{{ \Carbon\Carbon::parse($traslado->fecha_traslado)->format('d/m/Y') }}</div>
            <div class="info-label">Usuario:</div>
            <div class="info-value">{{ $traslado->usuario }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Bodega Origen:</div>
            <div class="info-value">{{ $traslado->bodega_origen }}</div>
            <div class="info-label">Bodega Destino:</div>
            <div class="info-value">{{ $traslado->bodega_destino }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Reserva Origen:</div>
            <div class="info-value">{{ $traslado->reserva_origen_nombre }}</div>
            <div class="info-label">Reserva Destino:</div>
            <div class="info-value">{{ $traslado->reserva_destino_nombre }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>CÓDIGO</th>
                <th>DESCRIPCIÓN</th>
                <th>UNIDAD</th>
                <th class="text-right">CANTIDAD</th>
                <th>OBSERVACIONES</th>
            </tr>
        </thead>
        <tbody>
            @foreach($detalles as $detalle)
            <tr>
                <td>{{ $detalle->codigo_producto }}</td>
                <td>{{ $detalle->descripcion }}</td>
                <td>{{ $detalle->unidad }}</td>
                <td class="text-right">{{ number_format($detalle->cantidad, 2) }}</td>
                <td>{{ $detalle->observaciones ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($traslado->observaciones)
    <div style="margin-top: 20px;">
        <strong>Observaciones:</strong> {{ $traslado->observaciones }}
    </div>
    @endif

    <div style="margin-top: 60px; text-align: center;">
        <div style="border-top: 1px solid #333; width: 250px; margin: 0 auto; padding-top: 5px;">
            <strong>Responsable:</strong> {{ $traslado->usuario }}
        </div>
    </div>

    <div style="text-align: center; margin-top: 20px; font-size: 9px;">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
        <p>Sistema de Gestión Logística</p>
    </div>
</body>
</html>
```

### SOLUCIÓN 4: Mejorar Método generarPDF() del Controller

```php
public function generarPDF($id)
{
    try {
        // Obtener datos del traslado con JOINs
        $traslado = DB::table('traslado_materiales as tm')
            ->leftJoin('bodega as bo', 'tm.id_bodega_origen', '=', 'bo.id_bodega')
            ->leftJoin('bodega as bd', 'tm.id_bodega_destino', '=', 'bd.id_bodega')
            ->leftJoin('reserva as ro', 'tm.reserva_origen', '=', 'ro.id_reserva')
            ->leftJoin('reserva as rd', 'tm.reserva_destino', '=', 'rd.id_reserva')
            ->select(
                'tm.*',
                'bo.nombre as bodega_origen',
                'bd.nombre as bodega_destino',
                'ro.tipo_reserva as reserva_origen_nombre',
                'rd.tipo_reserva as reserva_destino_nombre'
            )
            ->where('tm.id_traslado', $id)
            ->first();

        if (!$traslado) {
            return response()->json([
                'success' => false,
                'message' => 'Traslado no encontrado'
            ], 404);
        }

        // Obtener detalles del traslado
        $detalles = DB::table('detalle_traslado')
            ->where('id_traslado', $id)
            ->get();

        $data = [
            'traslado' => $traslado,
            'detalles' => $detalles
        ];

        $pdf = PDF::loadView('pdf.traslado_materiales', $data);
        return $pdf->stream("Traslado_{$id}.pdf");

    } catch (Exception $e) {
        Log::error('Error al generar PDF de traslado:', ['error' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'message' => 'Error al generar PDF',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

## 📝 ORDEN DE IMPLEMENTACIÓN

1. ✅ **Verificar trigger en BD** (ejecutar SQL)
2. ✅ **Actualizar método `productosConStockReserva()`** en backend
3. ✅ **Actualizar `cargarProductosDeLaReserva()`** en frontend
4. ✅ **Crear vista blade `traslado_materiales.blade.php`**
5. ✅ **Actualizar método `generarPDF()`** en controller
6. ✅ **Limpiar caché de Laravel**

## 🎯 RESULTADO ESPERADO

- ✅ Al seleccionar bodega origen sin stock: "Esta bodega no tiene productos disponibles"
- ✅ Validación de stock antes de guardar traslado
- ✅ Traslado se guarda correctamente en BD
- ✅ PDF se genera sin errores con toda la información
- ✅ Stock se actualiza automáticamente en bodega_origen y bodega_destino
