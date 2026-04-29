import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateIncidentStatusDto {
  @IsString()
  @IsNotEmpty()
  estado: string;
}