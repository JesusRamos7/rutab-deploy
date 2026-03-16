import { SetMetadata } from '@nestjs/common';

// Esto nos permite etiquetar controladores o rutas con los roles permitidos
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);