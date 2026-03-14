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


## Comandos Principales
# Instalar dependencias
npm install

# Levantar en desarrollo
npm run dev