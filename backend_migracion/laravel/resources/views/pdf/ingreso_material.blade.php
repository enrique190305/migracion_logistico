<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ingreso de Material - {{ $ingreso->id_ingreso }}</title>
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
        
        .conditions p {
            font-size: 9px;
            line-height: 1.6;
            text-align: justify;
        }
        
        .signature-section {
            margin-top: 40px;
            text-align: center;
        }
        
        .signature-container {
            display: inline-block;
            text-align: center;
            min-width: 300px;
        }
        
        .signature-image {
            max-width: 250px;
            max-height: 80px;
            margin: 0 auto 5px auto;
            display: block;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            width: 300px;
            margin: 0 auto 5px auto;
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
        <h2>INGRESO DE MATERIAL</h2>
    </div>

    <!-- INFORMACIÓN DEL DOCUMENTO -->
    <div class="document-info">
        <div class="doc-number">DOCUMENTO N°: {{ $ingreso->id_ingreso }}</div>
        <div class="doc-date">Fecha de ingreso: {{ \Carbon\Carbon::parse($ingreso->fecha_ingreso)->format('d/m/Y') }}</div>
    </div>

    <!-- INFORMACIÓN GENERAL -->
    <div class="info-section">
        <table class="info-table">
            <tr>
                <td>Orden de Compra:</td>
                <td>{{ $ingreso->correlativo_oc ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Fecha Ingreso:</td>
                <td>{{ \Carbon\Carbon::parse($ingreso->fecha_ingreso)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Proveedor:</td>
                <td>{{ $ingreso->razon_social ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>RUC:</td>
                <td>{{ $ingreso->ruc ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Bodega:</td>
                <td>{{ $ingreso->nombre_bodega ?? $ingreso->proyecto_almacen }}</td>
            </tr>
            <tr>
                <td>Usuario:</td>
                <td>{{ $ingreso->usuario }}</td>
            </tr>
            <tr>
                <td>N° Guía:</td>
                <td>{{ $ingreso->num_guia ?? '-' }}</td>
            </tr>
            <tr>
                <td>Factura:</td>
                <td>{{ $ingreso->factura ?? '-' }}</td>
            </tr>
            @if($ingreso->observaciones)
            <tr>
                <td>Observaciones:</td>
                <td>{{ $ingreso->observaciones }}</td>
            </tr>
            @endif
        </table>
    </div>

    <!-- DETALLE DE PRODUCTOS -->
    <div class="section-title">Detalle de Productos</div>
    
    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 12%;">Código</th>
                <th style="width: 35%;">Descripción</th>
                <th style="width: 10%;" class="text-center">Unidad</th>
                <th style="width: 13%;" class="text-right">Cantidad</th>
                <th style="width: 15%;" class="text-right">Precio Unitario</th>
                <th style="width: 15%;" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($detalles as $detalle)
            <tr>
                <td>{{ $detalle->codigo_producto }}</td>
                <td>{{ $detalle->descripcion }}</td>
                <td class="text-center">{{ $detalle->unidad }}</td>
                <td class="text-right">{{ number_format($detalle->cantidad_recibida, 2) }}</td>
                <td class="text-right">S/ {{ number_format($detalle->precio_unitario ?? 0, 2) }}</td>
                <td class="text-right">S/ {{ number_format($detalle->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- TOTALES -->
    <table class="totals-table">
        <tr>
            <td>Subtotal:</td>
            <td>S/ {{ number_format($subtotal, 2) }}</td>
        </tr>
        <tr>
            <td>IGV (18%):</td>
            <td>S/ {{ number_format($igv, 2) }}</td>
        </tr>
        <tr>
            <td>TOTAL GENERAL:</td>
            <td>S/ {{ number_format($total, 2) }}</td>
        </tr>
    </table>

    <!-- DECLARACIÓN -->
    <div class="conditions">
        <h3>Declaración de Responsabilidad</h3>
        <p>Declaro que he recibido los elementos relacionados en la parte superior. Me comprometo a responder por estos elementos y en caso de pérdida o diferencias de inventario a mi cargo, autorizo a la empresa para que de mi salario y prestaciones sociales me sea descontado este valor.</p>
    </div>

    <!-- FIRMA -->
    <div class="atentamente">
        Conforme,
    </div>

    <div class="signature-section">
        <div class="signature-container">
            @if($firma_usuario)
                <!-- Mostrar imagen de firma si existe -->
                <img src="{{ $firma_usuario }}" alt="Firma" class="signature-image">
            @else
                <!-- Espacio vacío si no hay firma -->
                <div style="height: 80px;"></div>
            @endif
            <!-- Línea debajo de la firma -->
            <div class="signature-line"></div>
            <div class="signature-name">{{ $ingreso->usuario }}</div>
            <div class="signature-title">Responsable de Ingreso de Material</div>
        </div>
    </div>

    <!-- PIE DE PÁGINA -->
    <div class="footer">
        Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}<br>
        Sistema de Gestión Logística | Página 1/1
    </div>
</body>
</html>
