// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Decorador personalizado `@Roles()`.
 * * Permite definir una lista de perfiles autorizados para acceder a un controlador
 * o método específico. Los metadatos aquí definidos son extraídos y validados
 * posteriormente por el Guard de autorización.
 * * @param roles - Colección de strings que representan los roles (ej. 'superAdmin', 'auditor').
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
