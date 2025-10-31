<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrarBodegas extends Command
{
    protected $signature = 'migrar:bodegas';
    protected $description = 'Migra el sistema de almacenamiento de PROYECTOS a BODEGAS';

    public function handle()
    {
        $this->info('🚀 Iniciando migración de PROYECTOS a BODEGAS...');
        $this->newLine();

        try {
            DB::beginTransaction();

            // PASO 1: Crear tabla bodega_stock
            $this->info('📦 Paso 1: Creando tabla bodega_stock...');
            
            // Primero verificar si la tabla ya existe
            $tableExists = DB::select("SHOW TABLES LIKE 'bodega_stock'");
            if (count($tableExists) > 0) {
                $this->line('   ⚠️  Tabla bodega_stock ya existe, saltando...');
            } else {
                DB::statement("
                    CREATE TABLE `bodega_stock` (
                      `id_stock` INT PRIMARY KEY AUTO_INCREMENT,
                      `id_bodega` INT NOT NULL COMMENT 'FK a bodega donde se almacena',
                      `id_reserva` INT NOT NULL COMMENT 'FK a reserva dentro de la bodega',
                      `codigo_producto` VARCHAR(20) NOT NULL COMMENT 'FK a producto',
                      `cantidad_disponible` DECIMAL(18,2) DEFAULT 0 COMMENT 'Cantidad disponible para uso',
                      `cantidad_reservada` DECIMAL(18,2) DEFAULT 0 COMMENT 'Cantidad reservada pero no salida',
                      `fecha_ultima_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      
                      UNIQUE KEY `unique_bodega_reserva_producto` (`id_bodega`, `id_reserva`, `codigo_producto`),
                      INDEX `idx_bodega` (`id_bodega`),
                      INDEX `idx_reserva` (`id_reserva`),
                      INDEX `idx_producto` (`codigo_producto`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
                    COMMENT='Stock de productos por bodega y reserva'
                ");
                $this->line('   ✅ Tabla bodega_stock creada');
            }

            // PASO 2: Modificar tabla ingreso_material
            $this->info('📥 Paso 2: Modificando tabla ingreso_material...');
            
            // Verificar si las columnas ya existen
            $columns = DB::select("SHOW COLUMNS FROM ingreso_material WHERE Field IN ('id_bodega', 'id_reserva')");
            
            if (count($columns) == 0) {
                DB::statement("
                    ALTER TABLE `ingreso_material` 
                    ADD COLUMN `id_bodega` INT NULL COMMENT 'Bodega destino del ingreso' AFTER `proyecto_almacen`,
                    ADD COLUMN `id_reserva` INT NULL COMMENT 'Reserva destino del ingreso' AFTER `id_bodega`
                ");
                $this->line('   ✅ Columnas agregadas a ingreso_material');

                // Migrar datos
                $affected = DB::update("
                    UPDATE `ingreso_material` im
                    INNER JOIN `proyecto_almacen` pa ON im.proyecto_almacen = pa.id_proyecto_almacen
                    SET im.id_bodega = pa.id_bodega,
                        im.id_reserva = pa.id_reserva
                    WHERE im.id_bodega IS NULL
                ");
                $this->line("   ✅ Migrados {$affected} registros de ingreso_material");

                // Hacer campos obligatorios
                DB::statement("
                    ALTER TABLE `ingreso_material`
                    MODIFY COLUMN `id_bodega` INT NOT NULL,
                    MODIFY COLUMN `id_reserva` INT NOT NULL
                ");

                // Agregar foreign keys e índices
                DB::statement("
                    ALTER TABLE `ingreso_material`
                    ADD FOREIGN KEY `fk_ingreso_bodega` (`id_bodega`) REFERENCES `bodega`(`id_bodega`),
                    ADD FOREIGN KEY `fk_ingreso_reserva` (`id_reserva`) REFERENCES `reserva`(`id_reserva`),
                    ADD INDEX `idx_ingreso_bodega` (`id_bodega`),
                    ADD INDEX `idx_ingreso_reserva` (`id_reserva`)
                ");
                $this->line('   ✅ Foreign keys e índices agregados');
            } else {
                $this->line('   ⚠️  Columnas ya existen, saltando...');
            }

            // PASO 3: Modificar tabla traslado_materiales
            $this->info('🔄 Paso 3: Modificando tabla traslado_materiales...');
            
            $columnsTraslado = DB::select("SHOW COLUMNS FROM traslado_materiales WHERE Field IN ('id_bodega_origen', 'reserva_origen', 'id_bodega_destino', 'reserva_destino')");
            
            if (count($columnsTraslado) == 0) {
                DB::statement("
                    ALTER TABLE `traslado_materiales`
                    ADD COLUMN `id_bodega_origen` INT NULL COMMENT 'Bodega origen del traslado' AFTER `proyecto_origen`,
                    ADD COLUMN `reserva_origen` INT NULL COMMENT 'Reserva origen del traslado' AFTER `id_bodega_origen`,
                    ADD COLUMN `id_bodega_destino` INT NULL COMMENT 'Bodega destino del traslado' AFTER `proyecto_destino`,
                    ADD COLUMN `reserva_destino` INT NULL COMMENT 'Reserva destino del traslado' AFTER `id_bodega_destino`
                ");
                $this->line('   ✅ Columnas agregadas a traslado_materiales');

                // Migrar datos
                $affectedTraslado = DB::update("
                    UPDATE `traslado_materiales` tm
                    INNER JOIN `proyecto_almacen` pa_origen ON tm.proyecto_origen = pa_origen.id_proyecto_almacen
                    INNER JOIN `proyecto_almacen` pa_destino ON tm.proyecto_destino = pa_destino.id_proyecto_almacen
                    SET tm.id_bodega_origen = pa_origen.id_bodega,
                        tm.reserva_origen = pa_origen.id_reserva,
                        tm.id_bodega_destino = pa_destino.id_bodega,
                        tm.reserva_destino = pa_destino.id_reserva
                    WHERE tm.reserva_origen IS NULL
                ");
                $this->line("   ✅ Migrados {$affectedTraslado} registros de traslado_materiales");

                // Hacer campos obligatorios si hay datos
                if ($affectedTraslado > 0) {
                    DB::statement("
                        ALTER TABLE `traslado_materiales`
                        MODIFY COLUMN `id_bodega_origen` INT NOT NULL,
                        MODIFY COLUMN `reserva_origen` INT NOT NULL,
                        MODIFY COLUMN `id_bodega_destino` INT NOT NULL,
                        MODIFY COLUMN `reserva_destino` INT NOT NULL
                    ");
                }

                // Agregar foreign keys e índices
                DB::statement("
                    ALTER TABLE `traslado_materiales`
                    ADD FOREIGN KEY `fk_traslado_bodega_origen` (`id_bodega_origen`) REFERENCES `bodega`(`id_bodega`),
                    ADD FOREIGN KEY `fk_traslado_reserva_origen` (`reserva_origen`) REFERENCES `reserva`(`id_reserva`),
                    ADD FOREIGN KEY `fk_traslado_bodega_destino` (`id_bodega_destino`) REFERENCES `bodega`(`id_bodega`),
                    ADD FOREIGN KEY `fk_traslado_reserva_destino` (`reserva_destino`) REFERENCES `reserva`(`id_reserva`),
                    ADD INDEX `idx_traslado_bodega_origen` (`id_bodega_origen`),
                    ADD INDEX `idx_traslado_reserva_origen` (`reserva_origen`),
                    ADD INDEX `idx_traslado_bodega_destino` (`id_bodega_destino`),
                    ADD INDEX `idx_traslado_reserva_destino` (`reserva_destino`)
                ");
                $this->line('   ✅ Foreign keys e índices agregados');
            } else {
                $this->line('   ⚠️  Columnas ya existen, saltando...');
            }

            // PASO 4: Poblar bodega_stock
            $this->info('📊 Paso 4: Poblando bodega_stock con datos existentes...');
            $inserted = DB::insert("
                INSERT INTO `bodega_stock` (id_bodega, id_reserva, codigo_producto, cantidad_disponible)
                SELECT 
                    im.id_bodega,
                    im.id_reserva,
                    dim.codigo_producto,
                    SUM(dim.cantidad_recibida) as cantidad_total
                FROM `ingreso_material` im
                INNER JOIN `detalle_ingreso_material` dim ON im.id_ingreso = dim.id_ingreso
                WHERE im.id_bodega IS NOT NULL
                GROUP BY im.id_bodega, im.id_reserva, dim.codigo_producto
                ON DUPLICATE KEY UPDATE 
                    cantidad_disponible = VALUES(cantidad_disponible)
            ");
            $count = DB::table('bodega_stock')->count();
            $this->line("   ✅ Poblado bodega_stock con {$count} registros");

            // Commit de la transacción ANTES de crear triggers
            DB::commit();

            // PASO 5: Crear triggers (fuera de la transacción)
            $this->info('⚙️  Paso 5: Creando triggers...');
            
            // Trigger 1: after_insert_detalle_ingreso_material
            DB::unprepared("
                DROP TRIGGER IF EXISTS `after_insert_detalle_ingreso_material`
            ");
            
            DB::unprepared("
                CREATE TRIGGER `after_insert_detalle_ingreso_material` 
                AFTER INSERT ON `detalle_ingreso_material` 
                FOR EACH ROW
                BEGIN
                    DECLARE v_id_bodega INT;
                    DECLARE v_id_reserva INT;
                    
                    SELECT id_bodega, id_reserva INTO v_id_bodega, v_id_reserva
                    FROM ingreso_material
                    WHERE id_ingreso = NEW.id_ingreso;
                    
                    INSERT INTO bodega_stock (id_bodega, id_reserva, codigo_producto, cantidad_disponible)
                    VALUES (v_id_bodega, v_id_reserva, NEW.codigo_producto, NEW.cantidad_recibida)
                    ON DUPLICATE KEY UPDATE 
                        cantidad_disponible = cantidad_disponible + NEW.cantidad_recibida,
                        fecha_ultima_actualizacion = CURRENT_TIMESTAMP;
                END
            ");
            $this->line('   ✅ Trigger after_insert_detalle_ingreso_material creado');

            // Trigger 2: after_insert_detalle_traslado
            DB::unprepared("
                DROP TRIGGER IF EXISTS `after_insert_detalle_traslado`
            ");
            
            DB::unprepared("
                CREATE TRIGGER `after_insert_detalle_traslado`
                AFTER INSERT ON `detalle_traslado`
                FOR EACH ROW
                BEGIN
                    DECLARE v_bodega_origen INT;
                    DECLARE v_reserva_origen INT;
                    DECLARE v_bodega_destino INT;
                    DECLARE v_reserva_destino INT;
                    
                    SELECT id_bodega_origen, reserva_origen, id_bodega_destino, reserva_destino
                    INTO v_bodega_origen, v_reserva_origen, v_bodega_destino, v_reserva_destino
                    FROM traslado_materiales
                    WHERE id_traslado = NEW.id_traslado;
                    
                    UPDATE bodega_stock 
                    SET cantidad_disponible = cantidad_disponible - NEW.cantidad,
                        fecha_ultima_actualizacion = CURRENT_TIMESTAMP
                    WHERE id_bodega = v_bodega_origen 
                      AND id_reserva = v_reserva_origen 
                      AND codigo_producto = NEW.codigo_producto;
                    
                    INSERT INTO bodega_stock (id_bodega, id_reserva, codigo_producto, cantidad_disponible)
                    VALUES (v_bodega_destino, v_reserva_destino, NEW.codigo_producto, NEW.cantidad)
                    ON DUPLICATE KEY UPDATE 
                        cantidad_disponible = cantidad_disponible + NEW.cantidad,
                        fecha_ultima_actualizacion = CURRENT_TIMESTAMP;
                END
            ");
            $this->line('   ✅ Trigger after_insert_detalle_traslado creado');

            $this->newLine();
            $this->info('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
            $this->newLine();
            $this->line('Próximos pasos:');
            $this->line('1. Actualizar modelos Laravel (BodegaStock, IngresoMaterial, TrasladoMaterial)');
            $this->line('2. Actualizar controladores del backend');
            $this->line('3. Actualizar componentes del frontend');
            
            return Command::SUCCESS;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Error en la migración: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
