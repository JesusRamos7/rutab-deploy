import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RouteLoaderService } from './route-loader.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('route-loader')
export class RouteLoaderController {
  constructor(private readonly routeLoaderService: RouteLoaderService) {}

  @Post('new-routes')
  @Roles('superAdmin', 'logístico')
  @UseInterceptors(FileInterceptor('file'))
  async uploadNew(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const data = this.parseCSV(file);
    return this.routeLoaderService.processNewRoutes(data, req.user.userId);
  }

  @Post('failed-orders')
  @Roles('superAdmin', 'logístico')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFailed(@UploadedFile() file: Express.Multer.File) {
    const data = this.parseCSV(file);
    return this.routeLoaderService.processUpdateFailed(data);
  }

  private parseCSV(file: Express.Multer.File): any[] {
    if (!file) throw new BadRequestException('No se ha subido ningún archivo.');

    try {
      // 1. Convertir buffer a string y LIMPIAR el BOM (caracteres invisibles de Excel)
      let content = file.buffer.toString('utf-8');
      content = content.replace(/^\uFEFF/, ''); // Elimina el BOM si existe

      // 2. Dividir por líneas y limpiar espacios/retornos
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2)
        throw new BadRequestException(
          'El archivo CSV está vacío o mal formateado.',
        );

      // 3. Función robusta para separar por comas respetando comillas
      const splitCSVLine = (line: string) => {
        const result = [];
        let curVal = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' && (i === 0 || line[i - 1] === ',' || inQuotes)) {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(curVal.trim());
            curVal = '';
          } else {
            curVal += char;
          }
        }
        result.push(curVal.trim());
        return result.map((v) => v.replace(/^"|"$/g, '').trim()); // Quitar comillas finales
      };

      // 4. Obtener encabezados y normalizar
      const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase());

      // 5. Mapear filas a objetos
      return lines.slice(1).map((line, index) => {
        const values = splitCSVLine(line);
        const obj = headers.reduce((acc, header, i) => {
          acc[header] = values[i];
          return acc;
        }, {});

        return obj;
      });
    } catch (e) {
      throw new BadRequestException('Error al procesar el CSV: ' + e.message);
    }
  }
}
