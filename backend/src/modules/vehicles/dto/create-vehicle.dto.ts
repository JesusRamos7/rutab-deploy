// src/modules/vehicles/dto/create-vehicle.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Matches,
} from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para la creación de vehículos.
 * Define las reglas de validación que el motor de NestJS aplicará antes de
 * permitir que los datos lleguen al servicio de base de datos.
 */
export class CreateVehicleDto {
  /** * Identificador oficial de la unidad (Placas).
   * * Validación: Debe cumplir con el formato estándar (ej. ABC-123-A).
   * * RegEx: Tres letras mayúsculas, guion, tres números, guion y una letra mayúscula.
   */
  @IsString()
  @IsNotEmpty({ message: 'Las placas son obligatorias' })
  @Matches(/^[A-Z]{3}-[0-9]{3}-[A-Z]{1}$/, {
    message: 'Formato de placa inválido (Ejemplo esperado: ABC-123-A)',
  })
  placas: string;

  /** Fabricante del vehículo (opcional durante el registro inicial) */
  @IsString()
  @IsOptional()
  marca?: string;

  /** Modelo o línea comercial del vehículo */
  @IsString()
  @IsOptional()
  modelo?: string;

  /** * Eficiencia de consumo (km/L).
   * Validado como valor numérico para permitir cálculos logísticos en el backend.
   */
  @IsNumber()
  @IsOptional()
  rendimiento_combustible?: number;

  /** * Estado operativo de la unidad.
   * Por defecto suele ser 'disponible' si no se especifica.
   */
  @IsString()
  @IsOptional()
  estatus?: string;

  /** URL o referencia a la imagen de la unidad almacenada en el servidor de archivos */
  @IsString()
  @IsOptional()
  foto_unidad_url?: string;
}
