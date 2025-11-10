<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Traslado de Materiales - {{ $traslado->id_traslado }}</title>
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
        <h2>TRASLADO DE MATERIALES</h2>
    </div>

    <!-- INFORMACIÓN DEL DOCUMENTO -->
    <div class="document-info">
        <div class="doc-number">DOCUMENTO N°: {{ $traslado->id_traslado }}</div>
        <div class="doc-date">Fecha de traslado: {{ \Carbon\Carbon::parse($traslado->fecha_traslado)->format('d/m/Y') }}</div>
    </div>

    <!-- INFORMACIÓN GENERAL -->
    <div class="info-section">
        <table class="info-table">
            <tr>
                <td>Fecha Traslado:</td>
                <td>{{ \Carbon\Carbon::parse($traslado->fecha_traslado)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Usuario:</td>
                <td>{{ $traslado->usuario }}</td>
            </tr>
            <tr>
                <td>Estado:</td>
                <td>{{ $traslado->estado }}</td>
            </tr>
            @if(isset($traslado->observaciones) && $traslado->observaciones)
            <tr>
                <td>Observaciones:</td>
                <td>{{ $traslado->observaciones }}</td>
            </tr>
            @endif
        </table>
    </div>

    <!-- INFORMACIÓN DE ORIGEN Y DESTINO -->
    <div class="section-title">Información de Origen y Destino</div>
    <div class="info-section">
        <table class="info-table">
            @if(isset($traslado->bodega_origen))
            <tr>
                <td>Bodega Origen:</td>
                <td>{{ $traslado->bodega_origen }}</td>
            </tr>
            <tr>
                <td>Reserva Origen:</td>
                <td>{{ $traslado->reserva_origen_nombre ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Bodega Destino:</td>
                <td>{{ $traslado->bodega_destino }}</td>
            </tr>
            <tr>
                <td>Reserva Destino:</td>
                <td>{{ $traslado->reserva_destino_nombre ?? 'N/A' }}</td>
            </tr>
            @else
            <tr>
                <td>Proyecto Origen:</td>
                <td>{{ $traslado->proyecto_origen }}</td>
            </tr>
            <tr>
                <td>Proyecto Destino:</td>
                <td>{{ $traslado->proyecto_destino }}</td>
            </tr>
            @endif
        </table>
    </div>

    <!-- DETALLE DE PRODUCTOS -->
    <div class="section-title">Detalle de Productos Trasladados</div>
    
    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">N°</th>
                <th style="width: 15%;">Código</th>
                <th style="width: 35%;">Descripción</th>
                <th style="width: 12%;" class="text-center">Cantidad</th>
                <th style="width: 10%;" class="text-center">Unidad</th>
                <th style="width: 23%;">Observaciones</th>
            </tr>
        </thead>
        <tbody>
            @php
                $detallesArray = isset($detalles) ? $detalles : $traslado->detalles;
            @endphp
            @foreach($detallesArray as $index => $detalle)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td><strong>{{ $detalle->codigo_producto }}</strong></td>
                <td>{{ $detalle->descripcion }}</td>
                <td class="text-center"><strong>{{ number_format($detalle->cantidad, 2) }}</strong></td>
                <td class="text-center">{{ $detalle->unidad }}</td>
                <td>{{ $detalle->observaciones ?: '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- RESUMEN -->
    <div class="summary-box">
        Total de productos trasladados: {{ is_array($detallesArray) || is_object($detallesArray) ? count((array)$detallesArray) : 0 }} item(s)
    </div>

    <!-- FIRMAS -->
    <div class="atentamente">
        Conforme con el traslado,
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">{{ $traslado->usuario }}</div>
            <div class="signature-title">Entregado por</div>
            <div style="font-size: 9px; color: #6b7280; margin-top: 3px;">{{ $traslado->bodega_origen ?? $traslado->proyecto_origen }}</div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">_____________________</div>
            <div class="signature-title">Recibido por</div>
            <div style="font-size: 9px; color: #6b7280; margin-top: 3px;">{{ $traslado->bodega_destino ?? $traslado->proyecto_destino }}</div>
        </div>
    </div>

    <!-- PIE DE PÁGINA -->
    <div class="footer">
        Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}<br>
        Sistema de Gestión Logística - Traslado de Materiales
    </div>
</body>
</html>
