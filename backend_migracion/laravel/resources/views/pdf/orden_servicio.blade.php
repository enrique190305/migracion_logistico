<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden de Servicio - {{ $orden->numero_os }}</title>
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
            border-bottom: 3px solid #7c2d12;
        }
        
        .header h1 {
            color: #7c2d12;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .header h2 {
            color: #7c2d12;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .document-info {
            background-color: #fef3c7;
            padding: 10px;
            text-align: center;
            border: 1px solid #fbbf24;
            margin-bottom: 20px;
        }
        
        .document-info .doc-number {
            font-weight: bold;
            font-size: 11px;
            color: #7c2d12;
        }
        
        .document-info .doc-date {
            font-size: 9px;
            color: #92400e;
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
            background-color: #fef3c7;
            width: 120px;
            color: #374151;
        }
        
        .info-table tr:last-child td {
            border-bottom: none;
        }
        
        .section-title {
            background-color: #7c2d12;
            color: white;
            padding: 8px 10px;
            font-weight: bold;
            font-size: 11px;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 9px;
        }
        
        .services-table thead {
            background-color: #7c2d12;
            color: white;
        }
        
        .services-table th {
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #7c2d12;
        }
        
        .services-table td {
            padding: 6px;
            border: 1px solid #d1d5db;
        }
        
        .services-table tbody tr:nth-child(even) {
            background-color: #fef3c7;
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
            background-color: #fef3c7;
            font-weight: bold;
            color: #7c2d12;
            border: 1px solid #fbbf24;
            width: 70%;
        }
        
        .totals-table td:last-child {
            background-color: #fef9c3;
            border: 1px solid #fbbf24;
            font-weight: bold;
        }
        
        .totals-table tr:last-child td {
            background-color: #fed7aa;
            font-size: 11px;
            color: #7c2d12;
            font-weight: bold;
            border: 2px solid #7c2d12;
        }
        
        .conditions {
            margin-top: 20px;
            padding: 15px;
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
        }
        
        .conditions h3 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #7c2d12;
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
        <h2>ORDEN DE SERVICIO</h2>
    </div>

    <!-- INFORMACIÓN DEL DOCUMENTO -->
    <div class="document-info">
        <div class="doc-number">DOCUMENTO N°: {{ $orden->numero_os }}</div>
        <div class="doc-date">Fecha de emisión: {{ \Carbon\Carbon::parse($orden->fecha_os)->format('d/m/Y') }}</div>
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
                <td>{{ \Carbon\Carbon::parse($orden->fecha_os)->format('d/m/Y') }}</td>
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
            @if($orden->proveedor && $orden->proveedor->numero_cuenta)
            <tr>
                <td>Número de Cuenta:</td>
                <td><strong>{{ $orden->proveedor->numero_cuenta }}</strong></td>
            </tr>
            @endif
            @if($orden->proveedor && $orden->proveedor->banco)
            <tr>
                <td>Banco:</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        @if($orden->proveedor->banco->logo_banco)
                            <img src="{{ public_path('storage/' . $orden->proveedor->banco->logo_banco) }}" 
                                 alt="{{ $orden->proveedor->banco->nombre_banco }}" 
                                 style="height: 25px; width: auto; object-fit: contain;"
                                 onerror="this.style.display='none'">
                        @endif
                        <strong>{{ $orden->proveedor->banco->nombre_banco }}</strong>
                    </div>
                </td>
            </tr>
            @endif
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

    <!-- DETALLE DE SERVICIOS -->
    <div class="section-title">Detalle de Servicios</div>
    
    <table class="services-table">
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
                // Calcular valores
                $itemSubtotal = $detalle->cantidad * $detalle->precio_unitario;
                $subtotal += $itemSubtotal;
            @endphp
            <tr>
                <td>{{ $detalle->codigo_servicio }}</td>
                <td>{{ $detalle->descripcion }}</td>
                <td class="text-center">{{ number_format($detalle->cantidad, 0) }}</td>
                <td class="text-center">{{ $detalle->unidad }}</td>
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
            <li>El proveedor se compromete a entregar los servicios en la fecha y lugar pactado.</li>
            <li>La prestación del servicio se hará según la orden de servicio en el área de logística.</li>
            <li>En caso de incumplimiento en plazo, calidad o cantidad, la empresa se reserva el derecho de rechazar la entrega e iniciar el proceso sancionador correspondiente.</li>
            <li>Los servicios deberán ser prestados conforme a los requisitos establecidos en la orden, acompañados de la documentación necesaria.</li>
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
