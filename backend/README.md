# Rutab - Backend ⚙️

Núcleo del sistema construido con NestJS. Gestiona la autenticación, seguridad, validación de datos y el acceso a la base de datos PostgreSQL mediante Prisma.

## 📁 Arquitectura
El proyecto sigue una estructura modular para facilitar la escalabilidad:
- `src/modules`: Contiene la lógica de negocio (Auth, Admin, Choferes, Maintenance).
- `src/modules/maintenance`: Módulo centralizado para la gestión de recursos (Vehículos y Clientes).
- `src/database`: Infraestructura de conexión con Prisma.

## 🔑 Variables de Envorno (.env)
Necesitas crear un archivo `.env` con las siguientes llaves:

```env
DATABASE_URL="url_de_supabase_pooler"
DIRECT_URL="url_de_supabase_direct"
SUPABASE_URL = "URL"
SUPABASE_SERVICE_ROLE_KEY= "SERVICE_ROLE_KEY"
JWT_SECRET="SECRET"
FRONTEND_URL="http://localhost:5173" # para pruebas local
# FRONTEND_URL="url_de_vercel" # para produccion
GOOGLE_MAPS_API_KEY="KEY"
ORIGEN_LAT=18.030620604081356
ORIGEN_LNG=-92.90938963591503
UPSTASH_REDIS_REST_URL="URL"
UPSTASH_REDIS_REST_TOKEN="TOKEN"


🛠️ Comandos Principales
Instalar dependencias
Nota: Incluye class-validator y class-transformer para los DTOs
npm install
npm install class-validator class-transformer

Generar cliente de Prisma
npx prisma generate

Levantar en desarrollo
npm run start:dev

Ejecutar Seed (Usuario inicial, opcional)
npx prisma db seed

🚀 Notas de Desarrollo
Validaciones: Se implementó ValidationPipe global en main.ts. Los DTOs validan formatos estrictos (ej. Placas: AAA-000-A).

CORS: Configurado para aceptar peticiones desde la URL definida en el archivo de entorno.