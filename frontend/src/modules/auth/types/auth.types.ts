// En auth.types.ts
export interface LoginCredentials {
  correo: string;
  password: string;
  tipoAcceso: 'ADMIN' | 'CHOFER'; // <- Agrega esto
}

export interface LoginResponse {
  access_token: string;
  tipo: string;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
    foto_perfil_url?: string;
  };
}