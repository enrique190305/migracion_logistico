<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden de Compra - {{ $orden->numero_oc }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            color: #333;
            padding: 30px;
            line-height: 1.4;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #1e3a8a;
        }
        
        .header h1 {
            color: #1e3a8a;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .header h2 {
            color: #1e3a8a;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .document-info {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: center;
            border: 1px solid #d1d5db;
            margin-bottom: 20px;
        }
        
        .document-info .doc-number {
            font-weight: bold;
            font-size: 11px;
            color: #1e3a8a;
        }
        
        .document-info .doc-date {
            font-size: 9px;
            color: #6b7280;
            font-style: italic;
            margin-top: 3px;
        }
        
        .info-section {
            margin-bottom: 20px;
            border: 1px solid #d1d5db;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .info-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .info-table td:first-child {
            font-weight: bold;
            background-color: #f9fafb;
            width: 120px;
            color: #374151;
        }
        
        .info-table tr:last-child td {
            border-bottom: none;
        }
        
        .section-title {
            background-color: #1e3a8a;
            color: white;
            padding: 8px 10px;
            font-weight: bold;
            font-size: 11px;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 9px;
        }
        
        .products-table thead {
            background-color: #1e3a8a;
            color: white;
        }
        
        .products-table th {
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #1e3a8a;
        }
        
        .products-table td {
            padding: 6px;
            border: 1px solid #d1d5db;
        }
        
        .products-table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals-table {
            width: 100%;
            margin-top: 10px;
            font-size: 10px;
        }
        
        .totals-table td {
            padding: 6px 10px;
            text-align: right;
        }
        
        .totals-table td:first-child {
            background-color: #eff6ff;
            font-weight: bold;
            color: #1e3a8a;
            border: 1px solid #bfdbfe;
            width: 70%;
        }
        
        .totals-table td:last-child {
            background-color: #f9fafb;
            border: 1px solid #d1d5db;
            font-weight: bold;
        }
        
        .totals-table tr:last-child td {
            background-color: #dbeafe;
            font-size: 11px;
            color: #1e3a8a;
            font-weight: bold;
            border: 2px solid #1e3a8a;
        }
        
        .conditions {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9fafb;
            border: 1px solid #d1d5db;
        }
        
        .conditions h3 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #1e3a8a;
        }
        
        .conditions ol {
            margin-left: 15px;
            font-size: 9px;
            line-height: 1.6;
        }
        
        .conditions li {
            margin-bottom: 4px;
        }
        
        .signature-section {
            margin-top: 40px;
            text-align: center;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            width: 300px;
            margin: 50px auto 5px auto;
        }
        
        .signature-name {
            font-weight: bold;
            font-size: 11px;
            margin-top: 5px;
        }
        
        .signature-title {
            font-size: 10px;
            color: #6b7280;
        }
        
        .signature-email {
            font-size: 9px;
            color: #6b7280;
            font-style: italic;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            font-size: 8px;
            color: #6b7280;
        }
        
        .atentamente {
            text-align: center;
            margin-top: 30px;
            margin-bottom: 10px;
            font-style: italic;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <!-- ENCABEZADO -->
    <div class="header">
        <h1>SISTEMA DE GESTIÓN DE MATERIALES</h1>
        <h2>ORDEN DE COMPRA</h2>
    </div>

    <!-- INFORMACIÓN DEL DOCUMENTO -->
    <div class="document-info">
        <div class="doc-number">DOCUMENTO N°: {{ $orden->numero_oc }}</div>
        <div class="doc-date">Fecha de emisión: {{ \Carbon\Carbon::parse($orden->fecha_oc)->format('d/m/Y') }}</div>
    </div>

    <!-- INFORMACIÓN GENERAL -->
    <div class="info-section">
        <table class="info-table">
            <tr>
                <td>Empresa:</td>
                <td>{{ $orden->empresa->razon_social ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Fecha:</td>
                <td>{{ \Carbon\Carbon::parse($orden->fecha_oc)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Proveedor:</td>
                <td>{{ $orden->proveedor->nombre ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>RUC:</td>
                <td>{{ $orden->proveedor->ruc ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Dirección:</td>
                <td>{{ $orden->proveedor->direccion ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Moneda:</td>
                <td>{{ $orden->moneda->nombre ?? 'SOLES' }}</td>
            </tr>
            <tr>
                <td>Fecha Requerida:</td>
                <td>{{ $orden->fecha_requerida ? \Carbon\Carbon::parse($orden->fecha_requerida)->format('d/m/Y') : 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <!-- DETALLE DE PRODUCTOS -->
    <div class="section-title">Detalle de Productos</div>
    
    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 12%;">Código</th>
                <th style="width: 35%;">Descripción</th>
                <th style="width: 10%;" class="text-center">Cantidad</th>
                <th style="width: 10%;" class="text-center">Unidad</th>
                <th style="width: 13%;" class="text-right">Precio Unitario</th>
                <th style="width: 10%;" class="text-right">Subtotal</th>
                <th style="width: 10%;" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @php
                $subtotal = 0;
            @endphp
            @foreach($orden->detalles as $detalle)
            @php
                // Obtener descripción del producto
                $producto = \App\Models\Producto::where('codigo_producto', $detalle->codigo_producto)->first();
                $descripcion = $producto ? $producto->descripcion : $detalle->codigo_producto;
                
                // Calcular valores
                $itemSubtotal = $detalle->cantidad * $detalle->precio_unitario;
                $subtotal += $itemSubtotal;
            @endphp
            <tr>
                <td>{{ $detalle->codigo_producto }}</td>
                <td>{{ $descripcion }}</td>
                <td class="text-center">{{ number_format($detalle->cantidad, 0) }}</td>
                <td class="text-center">{{ $producto ? $producto->unidad : 'UND' }}</td>
                <td class="text-right">{{ $orden->moneda->simbolo ?? 'S/' }} {{ number_format($detalle->precio_unitario, 2) }}</td>
                <td class="text-right">{{ $orden->moneda->simbolo ?? 'S/' }} {{ number_format($itemSubtotal, 2) }}</td>
                <td class="text-right">{{ $orden->moneda->simbolo ?? 'S/' }} {{ number_format($itemSubtotal, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- TOTALES -->
    <table class="totals-table">
        <tr>
            <td>Subtotal:</td>
            <td>{{ $orden->moneda->simbolo ?? 'S/' }} {{ number_format($subtotal, 2) }}</td>
        </tr>
        <tr>
            <td>IGV (18%):</td>
            <td>{{ $orden->moneda->simbolo ?? 'S/' }} {{ number_format($orden->igv, 2) }}</td>
        </tr>
        <tr>
            <td>TOTAL GENERAL:</td>
            <td>{{ $orden->moneda->simbolo ?? 'S/' }} {{ number_format($orden->total_general, 2) }}</td>
        </tr>
    </table>

    <!-- CONDICIONES COMERCIALES -->
    <div class="conditions">
        <h3>Condiciones Comerciales</h3>
        <ol>
            <li>Esta orden será válida una vez aceptada formalmente por el proveedor.</li>
            <li>El proveedor se compromete a entregar las Mercancías en la fecha y lugar pactado.</li>
            <li>La entrega de las mercancías se hará según la orden de compra en el área de logística.</li>
            <li>En caso de incumplimiento en plazo, calidad o cantidad, la empresa se reserva el derecho de rechazar la entrega e iniciar el proceso sancionador correspondiente.</li>
            <li>Los productos deberán ser enviados conforme a los requisitos establecidos en la orden, acompañados de la documentación necesaria.</li>
            <li>El pago se efectuará contra la presentación de la factura y los documentos requeridos conforme a las condiciones pactadas.</li>
            <li>Los precios incluyen impuestos y cualquier otro cargo adicional, salvo acuerdo distinto por escrito.</li>
        </ol>
    </div>

    <!-- FIRMA -->
    <div class="atentamente">
        Atentamente,
    </div>

    <div class="signature-section">
        <div class="signature-line"></div>
        <div class="signature-name">Joel Arapa Casas</div>
        <div class="signature-title">Coordinador de Logística</div>
        <div class="signature-email">jarapa@incavo.pe</div>
    </div>

    <!-- PIE DE PÁGINA -->
    <div class="footer">
        logistica@empresa.com | Tel: (01) 234 5678 | www.empresa.com<br>
        Este documento se generará automáticamente por el sistema de gestión de órdenes
    </div>
</body>
</html>
