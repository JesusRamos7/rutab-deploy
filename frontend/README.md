# Rutab - Frontend (Panel Web) 🖥️

Interfaz administrativa construida con React y TypeScript, enfocada en una experiencia de usuario fluida y segura.

## 📐 Arquitectura
Utilizamos **Feature-Driven Architecture**:
- `src/modulos`: Módulos independientes (Auth, Inicio, etc.) con sus propios hooks, tipos y servicios.
- `src/context`: Gestión del estado global de autenticación.
- `src/layouts`: Estructura visual y barra lateral con control de roles.

## 🎨 Paleta de Colores
- **Celeste Negro:** #123a5d
- **Negro:** #000000
- **Blanco:** #ffffff

## 🔑 Variables de Entorno (.env)
Crea un archivo `.env` en la raíz de esta carpeta:
```env
VITE_API_URL="http://localhost:3000"


🛠️ Comandos Principales
Instalar dependencias
Nota: Este proyecto utiliza Tailwind CSS v4 y el plugin @tailwindcss/vite
npm install
npm install tailwindcss @tailwindcss/postcss
npm install postcss autoprefixer
npm install -D tailwindcss postcss autoprefixer
npm install @tailwindcss/vite
npm install @vitejs/plugin-react

Levantar en desarrollo
npm run dev


🚀 Notas de Diseño y Estilos
Tailwind CSS v4: La configuración de estilos se gestiona directamente desde vite.config.ts mediante el plugin oficial.

Iconografía: Se utilizan emojis y clases de Tailwind para una interfaz limpia y ligera (estilo "Creative").

Componentes: Los formularios de gestión (CRUD) se manejan mediante Modales para optimizar la experiencia de usuario.