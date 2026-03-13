export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  admin: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
  };
}