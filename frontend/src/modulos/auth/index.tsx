// frontend/src/modulos/auth/index.ts
import { useLogin } from './hooks/useLogin';

export const ModuloAuth = () => {
  // Extraemos las variables, funciones y el nuevo estado isLoading
  const { 
    correo, setCorreo, 
    password, setPassword, 
    error, isLoading, 
    handleSubmit 
  } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#123a5d] p-4 font-sans">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6 animate-in fade-in zoom-in duration-300"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 m-0">Bienvenido</h2>
          <p className="text-slate-500 mt-2">Ingresa tus credenciales de administrador</p>
        </div>
        
        {/* Mensaje de error (opcional si ya usas Sonner, pero útil mantenerlo aquí visualmente) */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-center text-sm font-medium">
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="correo" className="text-slate-700 font-bold text-sm">
            Correo Electrónico
          </label>
          <input 
            id="correo" 
            type="email" 
            value={correo} 
            onChange={(e) => setCorreo(e.target.value)} 
            required 
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#123a5d] transition-all disabled:opacity-50 disabled:bg-slate-50 text-slate-700"
            placeholder="admin@empresa.com"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-slate-700 font-bold text-sm">
            Contraseña
          </label>
          <input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#123a5d] transition-all disabled:opacity-50 disabled:bg-slate-50 text-slate-700"
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3.5 mt-2 bg-[#123a5d] text-white font-bold rounded-xl hover:bg-[#0e2d4a] shadow-lg transition-all disabled:opacity-70 flex justify-center items-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              {/* Pequeño spinner SVG nativo de Tailwind */}
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  );
};