-- Script para eliminar el subproyecto huérfano y poder crear uno nuevo limpio

-- IMPORTANTE: Esto eliminará el subproyecto "proyecto num 1" (id_movil_proyecto = 33)
-- Solo ejecuta esto si quieres empezar de cero

START TRANSACTION;

-- Eliminar el registro huérfano de movil_proyecto
DELETE FROM movil_proyecto 
WHERE id_movil_proyecto = 33 
AND proyecto_padre_id IS NOT NULL;

-- Verificar que se eliminó
SELECT COUNT(*) AS subproyectos_eliminados
FROM movil_proyecto 
WHERE id_movil_proyecto = 33;

-- Si COUNT = 0, entonces se eliminó correctamente
-- Ejecuta COMMIT para confirmar
COMMIT;

-- Luego puedes crear un nuevo subproyecto desde el frontend
-- y esta vez SÍ se creará correctamente con el código nuevo
