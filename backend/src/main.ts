import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitamos CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // En producción tomará la variable, en local permitirá todo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
  console.log(`Backend corriendo en: http://localhost:3000`);
}
bootstrap();