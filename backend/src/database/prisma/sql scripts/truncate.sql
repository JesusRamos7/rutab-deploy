BEGIN;

-- Vaciar todas las tablas respetando las FK
TRUNCATE TABLE
    public.ubicacion_actual,
	public.trayectos_finalizados,
    public.detalles_ruta,
    public.evidencias,
    public.incidencias,
    public.pedidos,
    public.rutas,
    public.vehiculos,
    public.choferes,
    public.clientes,
    public.administradores
    CASCADE;

COMMIT;