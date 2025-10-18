<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Login del usuario
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'usuario' => 'required|string',
            'contraseña' => 'required|string',
        ]);

        try {
            // Buscar usuario por nombre de usuario
            $user = User::with('role')->where('usuario', $request->usuario)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 401);
            }

            // Verificar contraseña (comparación directa sin hash por ahora)
            if ($user->contraseña !== $request->contraseña) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contraseña incorrecta'
                ], 401);
            }

            // Generar token JWT
            $token = JWTAuth::fromUser($user);

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al generar token'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'nombre' => $user->nombre,
                        'usuario' => $user->usuario,
                        'id_rol' => $user->id_rol,
                        'role' => $user->role ? $user->role->descripcion : null,
                        'permissions' => $user->getPermissions()
                    ],
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener información del usuario autenticado
     */
    public function me(): JsonResponse
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'nombre' => $user->nombre,
                        'usuario' => $user->usuario,
                        'id_rol' => $user->id_rol,
                        'role' => $user->role ? $user->role->descripcion : null,
                        'permissions' => $user->getPermissions()
                    ]
                ]
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información del usuario'
            ], 500);
        }
    }

    /**
     * Logout del usuario
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'Logout exitoso'
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al hacer logout'
            ], 500);
        }
    }

    /**
     * Refrescar token
     */
    public function refresh(): JsonResponse
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al refrescar token'
            ], 401);
        }
    }

    /**
     * Verificar si el usuario tiene permisos de administrador
     */
    public function checkAdminPermissions(): JsonResponse
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $user->load('role');
            $isAdmin = $user->isAdmin();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_admin' => $isAdmin,
                    'can_access_approval_modules' => $isAdmin,
                    'user_role' => $user->role ? $user->role->descripcion : null
                ]
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar permisos'
            ], 500);
        }
    }
}