// src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Llave de metadatos utilizada para identificar rutas de acceso público.
 * Consumida principalmente por el Reflector dentro de los Guards de autenticación.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador personalizado `@Public()`.
 * * Permite omitir la validación global de JWT en controladores o métodos específicos.
 * Utiliza el API de metadatos de NestJS para marcar la ruta como exenta de seguridad.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
