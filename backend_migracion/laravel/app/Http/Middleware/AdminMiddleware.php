<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Verificar que el token sea válido y obtener el usuario
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que el usuario sea administrador
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo administradores pueden acceder a este módulo.'
                ], 403);
            }

            return $next($request);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de autenticación'
            ], 500);
        }
    }
}
