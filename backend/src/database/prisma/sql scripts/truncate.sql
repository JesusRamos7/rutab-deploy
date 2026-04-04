BEGIN;

-- Vaciar todas las tablas respetando las FK
TRUNCATE TABLE
    public.detalles_ruta,
    public.evidencias,
    public.historial_rastreo,
    public.incidencias,
    public.pedidos,
    public.rutas,
    public.vehiculos,
    public.choferes,
    public.clientes,
    public.administradores
    CASCADE;

COMMIT;