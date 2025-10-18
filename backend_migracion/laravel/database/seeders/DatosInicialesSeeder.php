<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatosInicialesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insertar Monedas
        DB::table('monedas')->insert([
            [
                'codigo' => 'PEN',
                'nombre' => 'Soles',
                'simbolo' => 'S/',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'codigo' => 'USD',
                'nombre' => 'Dólares',
                'simbolo' => '$',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Datos de ejemplo - Empresas
        DB::table('empresas')->insert([
            [
                'razon_social' => 'Constructora El Sol S.A.C.',
                'ruc' => '20123456789',
                'direccion' => 'Av. Industrial 123, Lima',
                'telefono' => '01-4567890',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'razon_social' => 'Inversiones Perú Lima S.A.',
                'ruc' => '20987654321',
                'direccion' => 'Jr. Los Constructores 456, Callao',
                'telefono' => '01-7890123',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'razon_social' => 'Grupo Empresarial Norte E.I.R.L.',
                'ruc' => '20456789123',
                'direccion' => 'Av. Tomás Valle 789, Lima',
                'telefono' => '01-2345678',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Datos de ejemplo - Proveedores
        DB::table('proveedores')->insert([
            [
                'nombre' => 'Distribuidora de Materiales del Norte S.A.C.',
                'ruc' => '20111222333',
                'direccion' => 'Av. Industrial 123, Lima',
                'contacto' => 'Juan Pérez',
                'celular' => '987654321',
                'correo' => 'ventas@distribuidoranorte.com',
                'forma_pago' => '30 días',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Comercial Ferretera Central S.A.',
                'ruc' => '20444555666',
                'direccion' => 'Jr. Los Constructores 456, Callao',
                'contacto' => 'María García',
                'celular' => '912345678',
                'correo' => 'contacto@ferreteracentral.com',
                'forma_pago' => '15 días',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Importaciones y Servicios Técnicos E.I.R.L.',
                'ruc' => '20777888999',
                'direccion' => 'Av. Tomás Valle 789, Lima',
                'contacto' => 'Carlos López',
                'celular' => '998877665',
                'correo' => 'servicios@importacionestec.com',
                'forma_pago' => '45 días',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Datos de ejemplo - Productos
        DB::table('productos')->insert([
            [
                'codigo_producto' => 'CEM-001',
                'descripcion' => 'Cemento Sol Tipo I x 42.5kg',
                'unidad' => 'BLS',
                'precio_unitario' => 25.50,
                'stock' => 500,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'codigo_producto' => 'FIE-002',
                'descripcion' => 'Fierro de Construcción 1/2"',
                'unidad' => 'VAR',
                'precio_unitario' => 35.00,
                'stock' => 200,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'codigo_producto' => 'ARE-003',
                'descripcion' => 'Arena Gruesa m³',
                'unidad' => 'M3',
                'precio_unitario' => 80.00,
                'stock' => 50,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'codigo_producto' => 'PIE-004',
                'descripcion' => 'Piedra Chancada 1/2"',
                'unidad' => 'M3',
                'precio_unitario' => 90.00,
                'stock' => 40,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'codigo_producto' => 'LAD-005',
                'descripcion' => 'Ladrillo King Kong 18 huecos',
                'unidad' => 'MLL',
                'precio_unitario' => 650.00,
                'stock' => 100,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'codigo_producto' => 'TUB-006',
                'descripcion' => 'Tubo PVC 2" SAL',
                'unidad' => 'UND',
                'precio_unitario' => 15.50,
                'stock' => 300,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        echo "✅ Datos iniciales insertados correctamente\n";
        echo "📊 2 Monedas\n";
        echo "🏢 3 Empresas de ejemplo\n";
        echo "📦 3 Proveedores de ejemplo\n";
        echo "📋 6 Productos de ejemplo\n";
    }
}
