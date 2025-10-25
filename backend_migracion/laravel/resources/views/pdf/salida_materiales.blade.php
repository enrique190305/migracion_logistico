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
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }

        .container {
            padding: 20px;
        }

        /* ENCABEZADO */
        .header {
            border: 2px solid #667eea;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f8f9ff;
        }

        .header-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .header-subtitle {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }

        .numero-salida {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #764ba2;
            padding: 8px;
            background-color: #fff;
            border: 2px dashed #764ba2;
            margin-top: 10px;
        }

        /* INFORMACIÓN GENERAL */
        .info-section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #fafafa;
        }

        .info-section-title {
            font-size: 14px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #667eea;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-top: 10px;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 5px 10px 5px 0;
            width: 30%;
            color: #555;
        }

        .info-value {
            display: table-cell;
            padding: 5px 0;
            color: #333;
        }

        /* TABLA DE PRODUCTOS */
        .productos-section {
            margin-bottom: 20px;
        }

        .productos-title {
            font-size: 14px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f8f9ff;
            border-left: 4px solid #667eea;
        }

        .productos-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .productos-table thead {
            background-color: #667eea;
            color: white;
        }

        .productos-table th {
            padding: 10px 8px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
            border: 1px solid #667eea;
        }

        .productos-table td {
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 10px;
        }

        .productos-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .productos-table tbody tr:hover {
            background-color: #f0f0f0;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        /* OBSERVACIONES */
        .observaciones-section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 10px;
            background-color: #fffbf0;
        }

        .observaciones-title {
            font-weight: bold;
            color: #f39c12;
            margin-bottom: 5px;
        }

        .observaciones-text {
            color: #666;
            font-size: 10px;
            line-height: 1.5;
        }

        /* FIRMAS */
        .firmas-section {
            margin-top: 40px;
            display: table;
            width: 100%;
        }

        .firma-box {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            padding: 10px;
        }

        .firma-linea {
            border-top: 2px solid #333;
            margin: 60px 20px 5px 20px;
        }

        .firma-label {
            font-size: 10px;
            font-weight: bold;
            color: #555;
        }

        .firma-sublabel {
            font-size: 9px;
            color: #999;
        }

        /* FOOTER */
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 9px;
            color: #999;
        }

        /* TOTALES */
        .total-productos {
            text-align: right;
            padding: 10px;
            background-color: #f8f9ff;
            border: 2px solid #667eea;
            margin-top: 10px;
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- ENCABEZADO -->
        <div class="header">
            <div class="header-title">📦 Salida de Materiales</div>
            <div class="header-subtitle">Sistema de Gestión Logística</div>
            <div class="numero-salida">N° {{ $salida->numero_salida }}</div>
        </div>

        <!-- INFORMACIÓN GENERAL -->
        <div class="info-section">
            <div class="info-section-title">📋 INFORMACIÓN GENERAL</div>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">📅 Fecha de Salida:</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($salida->fecha_salida)->format('d/m/Y') }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🏭 Proyecto:</div>
                    <div class="info-value">{{ $salida->proyecto_almacen }}</div>
                </div>
            </div>
        </div>

        <!-- INFORMACIÓN DEL TRABAJADOR -->
        <div class="info-section">
            <div class="info-section-title">👤 INFORMACIÓN DEL TRABAJADOR</div>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Nombre Completo:</div>
                    <div class="info-value">{{ $salida->trabajador }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">DNI:</div>
                    <div class="info-value">{{ $salida->dni ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Área:</div>
                    <div class="info-value">{{ $salida->area ?? 'N/A' }}</div>
                </div>
            </div>
        </div>

        <!-- DETALLE DE MATERIALES -->
        <div class="productos-section">
            <div class="productos-title">📦 DETALLE DE MATERIALES ENTREGADOS</div>
            
            <table class="productos-table">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 5%;">N°</th>
                        <th style="width: 15%;">Código</th>
                        <th style="width: 35%;">Descripción</th>
                        <th class="text-center" style="width: 10%;">Cantidad</th>
                        <th class="text-center" style="width: 10%;">Unidad</th>
                        <th style="width: 25%;">Observación</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($detalles as $index => $detalle)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td style="font-weight: bold; color: #667eea;">{{ $detalle->codigo_producto }}</td>
                        <td>{{ $detalle->descripcion }}</td>
                        <td class="text-center" style="font-weight: bold;">{{ number_format($detalle->cantidad, 2) }}</td>
                        <td class="text-center">{{ $detalle->unidad_medida }}</td>
                        <td style="font-size: 9px;">{{ $detalle->observacion_general ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="total-productos">
                Total de productos: {{ count($detalles) }} item(s)
            </div>
        </div>

        <!-- OBSERVACIONES GENERALES -->
        @if($salida->observaciones)
        <div class="observaciones-section">
            <div class="observaciones-title">📝 OBSERVACIONES GENERALES:</div>
            <div class="observaciones-text">{{ $salida->observaciones }}</div>
        </div>
        @endif

        <!-- FIRMAS -->
        <div class="firmas-section">
            <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-label">ENTREGADO POR</div>
                <div class="firma-sublabel">Almacén</div>
            </div>
            <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-label">RECIBIDO POR</div>
                <div class="firma-sublabel">{{ $salida->trabajador }}</div>
            </div>
            <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-label">AUTORIZADO POR</div>
                <div class="firma-sublabel">Jefe de Proyecto</div>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>
                <strong>Usuario que registró:</strong> {{ $salida->usuario_registro ?? 'Sistema' }} |
                <strong>Fecha de registro:</strong> {{ \Carbon\Carbon::parse($salida->fecha_registro)->format('d/m/Y H:i:s') }}
            </p>
            <p style="margin-top: 5px;">
                <strong>PDF generado el:</strong> {{ $fecha_generacion }}
            </p>
            <p style="margin-top: 5px; font-style: italic;">
                Sistema de Gestión Logística - Salida de Materiales
            </p>
        </div>

    </div>
</body>
</html>
