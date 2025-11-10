<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salida de Materiales - {{ $salida->numero_salida }}</title>
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
        
        .summary-box {
            background-color: #eff6ff;
            padding: 10px;
            border: 1px solid #bfdbfe;
            margin-top: 15px;
            text-align: right;
            font-weight: bold;
            color: #1e3a8a;
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
            display: table;
            width: 100%;
        }
        
        .signature-box {
            display: table-cell;
            width: 50%;
            text-align: center;
            padding: 10px;
            vertical-align: top;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            width: 250px;
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
        
        .signature-image {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 10px 0;
        }
        
        .signature-image img {
            max-width: 100%;
            max-height: 60px;
            object-fit: contain;
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
        <h2>SALIDA DE MATERIALES</h2>
    </div>

    <!-- INFORMACIÓN DEL DOCUMENTO -->
    <div class="document-info">
        <div class="doc-number">DOCUMENTO N°: {{ $salida->numero_salida }}</div>
        <div class="doc-date">Fecha de salida: {{ \Carbon\Carbon::parse($salida->fecha_salida)->format('d/m/Y') }}</div>
    </div>

    <!-- INFORMACIÓN GENERAL -->
    <div class="info-section">
        <table class="info-table">
            <tr>
                <td>Fecha de Salida:</td>
                <td>{{ \Carbon\Carbon::parse($salida->fecha_salida)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Bodega:</td>
                <td>{{ $salida->bodega }}</td>
            </tr>
            <tr>
                <td>Reserva:</td>
                <td>{{ $salida->reserva }}</td>
            </tr>
            <tr>
                <td>Responsable:</td>
                <td>{{ $salida->trabajador }}</td>
            </tr>
            <tr>
                <td>DNI:</td>
                <td>{{ $salida->dni ?? 'N/A' }}</td>
            </tr>
            @if($salida->observaciones)
            <tr>
                <td>Observaciones:</td>
                <td>{{ $salida->observaciones }}</td>
            </tr>
            @endif
        </table>
    </div>

    <!-- DETALLE DE MATERIALES -->
    <div class="section-title">Detalle de Materiales</div>
    
    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">N°</th>
                <th style="width: 15%;">Código</th>
                <th style="width: 35%;">Descripción</th>
                <th style="width: 12%;" class="text-center">Cantidad</th>
                <th style="width: 10%;" class="text-center">Unidad</th>
                <th style="width: 23%;">Observación</th>
            </tr>
        </thead>
        <tbody>
            @foreach($detalles as $index => $detalle)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td><strong>{{ $detalle->codigo_producto }}</strong></td>
                <td>{{ $detalle->descripcion }}</td>
                <td class="text-center"><strong>{{ number_format($detalle->cantidad, 2) }}</strong></td>
                <td class="text-center">{{ $detalle->unidad_medida }}</td>
                <td>{{ $detalle->observacion_general ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- RESUMEN -->
    <div class="summary-box">
        Total de productos entregados: {{ count($detalles) }} item(s)
    </div>

    <!-- DECLARACIÓN -->
    @if($salida->observaciones)
    <div class="conditions">
        <h3>Observaciones Generales</h3>
        <p>{{ $salida->observaciones }}</p>
    </div>
    @endif

    <!-- FIRMAS -->
    <div class="atentamente">
        Conforme con la entrega,
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">Admin</div>
            <div class="signature-title">Responsable de Recepción</div>
        </div>
        <div class="signature-box">
            @if($salida->firma)
            <div class="signature-image">
                <img src="data:image/png;base64,{{ $salida->firma }}" alt="Firma">
            </div>
            @else
            <div style="height: 60px;"></div>
            @endif
            <div class="signature-line"></div>
            <div class="signature-name">{{ strtoupper($salida->trabajador) }}</div>
            <div class="signature-title">Responsable de Entrega</div>
        </div>
    </div>

    <!-- PIE DE PÁGINA -->
    <div class="footer">
        Fecha de registro: {{ \Carbon\Carbon::parse($salida->fecha_registro)->format('d/m/Y H:i:s') }}<br>
        PDF generado el: {{ $fecha_generacion }}<br>
        Sistema de Gestión Logística - Salida de Materiales
    </div>
</body>
</html>
