import { useLogin } from './hooks/useLogin';

export const ModuloAuth = () => {
  // Extraemos las variables y funciones de nuestro controlador (hook)
  const { correo, setCorreo, password, setPassword, error, handleSubmit } = useLogin();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#123a5d', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '3rem 2rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#000000', fontSize: '1.8rem' }}>Bienvenido</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#666' }}>Ingresa tus credenciales</p>
        </div>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="correo" style={{ color: '#000000', fontWeight: 'bold', fontSize: '0.9rem' }}>Correo Electrónico</label>
          <input 
            id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required 
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '1rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="password" style={{ color: '#000000', fontWeight: 'bold', fontSize: '0.9rem' }}>Contraseña</label>
          <input 
            id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '1rem' }}
          />
        </div>
        
        <button type="submit" style={{ padding: '0.8rem', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem', fontWeight: 'bold', fontSize: '1rem', transition: 'opacity 0.2s' }}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};