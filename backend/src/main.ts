import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // 1. Importa esto
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Agrega esta configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Remueve campos que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si mandan campos de más
    transform: true,            // Convierte tipos (ej: string a number) automáticamente
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // En producción tomará la variable, en local permitirá todo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
  console.log(`Backend corriendo en: http://localhost:3000`);
}
bootstrap();