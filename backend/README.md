# Rutab - Backend ⚙️

Núcleo del sistema construido con NestJS. Gestiona la autenticación, seguridad y el acceso a la base de datos PostgreSQL.

## 📁 Arquitectura
El proyecto sigue una estructura modular:
- `src/modules`: Contiene la lógica de negocio (Auth, Admin, Choferes, Maintenance).
- `src/database`: Infraestructura de conexión con Prisma.

## 🔑 Variables de Entorno (.env)
Necesitas crear un archivo `.env` con las siguientes llaves:
```env
DATABASE_URL="url_de_supabase_pooler"
DIRECT_URL="url_de_supabase_direct"
JWT_SECRET="tu_clave_secreta"
FRONTEND_URL="http://localhost:5173" para pruebas
FRONTEND_URL="url_de_vercel" para produccion


## Comandos Principales
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Levantar en desarrollo
npm run start:dev

# Ejecutar Seed (Usuario inicial, opcional)
npx prisma db seed