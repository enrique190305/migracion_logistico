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
            font-size: 12px;
            color: #333;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 15px;
        }
        
        .header h1 {
            color: #667eea;
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .header h2 {
            color: #764ba2;
            font-size: 18px;
            font-weight: normal;
        }
        
        .info-section {
            margin-bottom: 25px;
        }
        
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        
        .info-row {
            display: table-row;
        }
        
        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 8px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            width: 150px;
        }
        
        .info-value {
            display: table-cell;
            padding: 8px;
            border: 1px solid #dee2e6;
        }
        
        .section-title {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
            font-size: 14px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        table thead {
            background-color: #667eea;
            color: white;
        }
        
        table th {
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }
        
        table td {
            padding: 8px;
            border: 1px solid #dee2e6;
            font-size: 11px;
        }
        
        table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #dee2e6;
        }
        
        .signature-box {
            display: inline-block;
            width: 45%;
            text-align: center;
            margin-top: 40px;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 5px;
        }
        
        .total-productos {
            background-color: #e3f2fd;
            padding: 10px;
            margin-top: 10px;
            font-weight: bold;
            text-align: right;
        }
        
        .page-number {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <!-- ENCABEZADO -->
    <div class="header">
        <h1>TRASLADO DE MATERIALES</h1>
        <h2>N° {{ $traslado->id_traslado }}</h2>
    </div>

    <!-- INFORMACIÓN GENERAL -->
    <div class="info-section">
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Fecha Traslado:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($traslado->fecha_traslado)->format('d/m/Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Usuario:</div>
                <div class="info-value">{{ $traslado->usuario }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Estado:</div>
                <div class="info-value">{{ $traslado->estado }}</div>
            </div>
        </div>
    </div>

    <!-- PROYECTOS / RESERVAS -->
    <div class="section-title">INFORMACIÓN DE ORIGEN Y DESTINO</div>
    <div class="info-section">
        <div class="info-grid">
            @if(isset($traslado->bodega_origen))
            <div class="info-row">
                <div class="info-label">Bodega Origen:</div>
                <div class="info-value">{{ $traslado->bodega_origen }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Reserva Origen:</div>
                <div class="info-value">{{ $traslado->reserva_origen_nombre ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Bodega Destino:</div>
                <div class="info-value">{{ $traslado->bodega_destino }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Reserva Destino:</div>
                <div class="info-value">{{ $traslado->reserva_destino_nombre ?? 'N/A' }}</div>
            </div>
            @else
            <div class="info-row">
                <div class="info-label">Proyecto Origen:</div>
                <div class="info-value">{{ $traslado->proyecto_origen }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Proyecto Destino:</div>
                <div class="info-value">{{ $traslado->proyecto_destino }}</div>
            </div>
            @endif
            @if(isset($traslado->observaciones) && $traslado->observaciones)
            <div class="info-row">
                <div class="info-label">Observaciones:</div>
                <div class="info-value">{{ $traslado->observaciones }}</div>
            </div>
            @endif
        </div>
    </div>

    <!-- DETALLE DE PRODUCTOS -->
    <div class="section-title">DETALLE DE PRODUCTOS TRASLADADOS</div>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 15%;">Código</th>
                <th style="width: 40%;">Descripción</th>
                <th style="width: 15%;" class="text-center">Cantidad</th>
                <th style="width: 10%;" class="text-center">Unidad</th>
                <th style="width: 15%;">Observaciones</th>
            </tr>
        </thead>
        <tbody>
            @php
                $detallesArray = isset($detalles) ? $detalles : $traslado->detalles;
            @endphp
            @foreach($detallesArray as $index => $detalle)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $detalle->codigo_producto }}</td>
                <td>{{ $detalle->descripcion }}</td>
                <td class="text-right">{{ number_format($detalle->cantidad, 2) }}</td>
                <td class="text-center">{{ $detalle->unidad }}</td>
                <td>{{ $detalle->observaciones ?: '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-productos">
        Total de productos trasladados: {{ is_array($detallesArray) || is_object($detallesArray) ? count((array)$detallesArray) : 0 }} items
    </div>

    <!-- PIE DE PÁGINA CON FIRMAS -->
    <div class="footer">
        <table style="border: none;">
            <tr>
                <td style="width: 50%; border: none; text-align: center;">
                    <div class="signature-box">
                        <div class="signature-line">
                            <strong>Entregado por</strong><br>
                            {{ $traslado->usuario }}<br>
                            {{ $traslado->bodega_origen ?? $traslado->proyecto_origen }}
                        </div>
                    </div>
                </td>
                <td style="width: 50%; border: none; text-align: center;">
                    <div class="signature-box">
                        _________________________<br>
                        <strong>Recibido por</strong>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- NÚMERO DE PÁGINA -->
    <div class="page-number">
        Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>
