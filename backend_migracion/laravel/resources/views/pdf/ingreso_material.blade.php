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
            font-family: Arial, sans-serif;
            font-size: 11px;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 10px;
        }
        .header h1 {
            font-size: 20px;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .header h2 {
            font-size: 14px;
            color: #7f8c8d;
        }
        .info-section {
            margin-bottom: 15px;
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
            width: 25%;
            padding: 5px;
            background-color: #ecf0f1;
        }
        .info-value {
            display: table-cell;
            width: 25%;
            padding: 5px;
            border-bottom: 1px solid #ddd;
        }
        .section-title {
            background-color: #3498db;
            color: white;
            padding: 8px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th {
            background-color: #34495e;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 10px;
        }
        td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .totals {
            margin-top: 20px;
            float: right;
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            border-bottom: 1px solid #ddd;
        }
        .total-row.final {
            background-color: #2c3e50;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .total-label {
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 9px;
            color: #7f8c8d;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📥 INGRESO DE MATERIAL</h1>
        <h2>{{ $ingreso->id_ingreso }}</h2>
    </div>

    <div class="section-title">📋 INFORMACIÓN GENERAL</div>
    <div class="info-grid">
        <div class="info-row">
            <div class="info-label">Orden de Compra:</div>
            <div class="info-value">{{ $ingreso->correlativo_oc ?? 'N/A' }}</div>
            <div class="info-label">Fecha Ingreso:</div>
            <div class="info-value">{{ \Carbon\Carbon::parse($ingreso->fecha_ingreso)->format('d/m/Y') }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Proveedor:</div>
            <div class="info-value">{{ $ingreso->razon_social ?? 'N/A' }}</div>
            <div class="info-label">RUC:</div>
            <div class="info-value">{{ $ingreso->ruc ?? 'N/A' }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Proyecto:</div>
            <div class="info-value">{{ $ingreso->proyecto_almacen }}</div>
            <div class="info-label">Usuario:</div>
            <div class="info-value">{{ $ingreso->usuario }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">N° Guía:</div>
            <div class="info-value">{{ $ingreso->num_guia ?? '-' }}</div>
            <div class="info-label">Factura:</div>
            <div class="info-value">{{ $ingreso->factura ?? '-' }}</div>
        </div>
        @if($ingreso->observaciones)
        <div class="info-row">
            <div class="info-label">Observaciones:</div>
            <div class="info-value" colspan="3">{{ $ingreso->observaciones }}</div>
        </div>
        @endif
    </div>

    <div class="section-title">📦 DETALLE DE PRODUCTOS</div>
    <table>
        <thead>
            <tr>
                <th width="8%">CÓDIGO</th>
                <th width="37%">DESCRIPCIÓN</th>
                <th width="10%" class="text-center">UNIDAD</th>
                <th width="12%" class="text-right">CANTIDAD</th>
                <th width="13%" class="text-right">P. UNITARIO</th>
                <th width="15%" class="text-right">TOTAL</th>
                <th width="5%"></th>
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
                <td></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span class="total-label">SUBTOTAL:</span>
            <span>S/ {{ number_format($subtotal, 2) }}</span>
        </div>
        <div class="total-row">
            <span class="total-label">IGV (18%):</span>
            <span>S/ {{ number_format($igv, 2) }}</span>
        </div>
        <div class="total-row final">
            <span class="total-label">TOTAL:</span>
            <span>S/ {{ number_format($total, 2) }}</span>
        </div>
    </div>

    <div style="clear: both;"></div>

    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
        <p>Sistema de Gestión Logística</p>
    </div>
</body>
</html>
