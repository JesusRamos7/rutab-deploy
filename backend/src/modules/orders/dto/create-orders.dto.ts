import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from "class-validator";

export enum OrderStatus {
  PENDIENTE  = 'pendiente',
  PROCESANDO = 'procesando',
  EN_RUTA    = 'en_transito',
  ENTREGADO  = 'entregado',
  CANCELADO  = 'cancelado',
}

export class CreateOrdersDto {
  
  @IsUUID()
  @IsNotEmpty() 
  cliente_id: string;

  @IsString()
  @IsNotEmpty({ message: "Necesita ingresar la descripción de la carga." })
  descripcion_carga: string;

  @IsString()
  @IsNotEmpty({ message: "El código de rastreo es obligatorio." })
  codigo_rastreo: string;

  @IsEnum(OrderStatus, {
    message: `El estado debe ser uno de los siguientes valores: ${Object.values(OrderStatus).join(', ')}`
  })
  @IsOptional() // Opcional porque Prisma pone "pendiente" por defecto
  estado_pedido?: OrderStatus;
}
