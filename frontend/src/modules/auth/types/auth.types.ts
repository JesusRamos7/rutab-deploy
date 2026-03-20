// src/modules/auth/types/auth.types.ts

/**
 * Define las credenciales requeridas para el proceso de autenticación.
 */
export interface LoginCredentials {
  /** Identificador de usuario (E-mail) */
  correo: string;
  /** Contraseña del usuario en texto plano */
  password: string;
  /** * Discriminador de plataforma:
   * Permite al backend validar si el usuario tiene permisos para la app de administración o de choferes.
   */
  tipoAcceso: "ADMIN" | "CHOFER";
}

/**
 * Estructura de la respuesta enviada por el servidor tras un login exitoso.
 */
export interface LoginResponse {
  /** Token JWT para la autorización de peticiones HTTP */
  access_token: string;
  /** Clasificación del perfil de acceso retornado por el servidor */
  tipo: string;
  /** Información básica del perfil del usuario para el estado global de la aplicación */
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
    /** URL de la imagen de perfil almacenada en el servidor o CDN */
    foto_perfil_url?: string;
  };
}
