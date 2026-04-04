BEGIN;

-- =========================
-- ADMIN - Utiliza el archivo backend/src/database/prisma/seed.ts
-- =========================


-- =========================
-- CHOFERES 
-- =========================
INSERT INTO choferes (id, nombre, correo, password)
VALUES 
(gen_random_uuid(), 'Chofer 1', 'chofer1@test.com', crypt('123456', gen_salt('bf'))),
(gen_random_uuid(), 'Chofer 2', 'chofer2@test.com', crypt('123456', gen_salt('bf')));

-- =========================
-- VEHICULOS
-- =========================
INSERT INTO vehiculos (id, placas, marca, modelo)
VALUES 
(gen_random_uuid(), 'ABC-123', 'Nissan', 'NP300'),
(gen_random_uuid(), 'XYZ-789', 'Toyota', 'Hilux');

-- =========================
-- CLIENTES (60)
-- =========================
INSERT INTO clientes (id, nombre, direccion, coordenadas, correo)
SELECT 
    gen_random_uuid(),
    'Cliente ' || i,
    'Dirección ' || i || ', Villahermosa',
    ST_SetSRID(ST_MakePoint(
        -92.9475 + (random() * 0.1 - 0.05), 
        17.9895 + (random() * 0.1 - 0.05)   
    ), 4326)::geography,
    'cliente' || i || '@email.com'  -- Correo aleatorio
FROM generate_series(1, 60) AS i;

-- =========================
-- RUTAS
-- =========================
INSERT INTO rutas (id, vehiculo_id, chofer_id, creado_por, fecha_programada, estatus_ruta)
VALUES
(gen_random_uuid(), 
 (SELECT id FROM vehiculos LIMIT 1 OFFSET 0),
 (SELECT id FROM choferes LIMIT 1 OFFSET 0),
 (SELECT id FROM administradores LIMIT 1),
 CURRENT_DATE, 'borrador'),

(gen_random_uuid(),
 (SELECT id FROM vehiculos LIMIT 1 OFFSET 1),
 (SELECT id FROM choferes LIMIT 1 OFFSET 1),
 (SELECT id FROM administradores LIMIT 1),
 CURRENT_DATE, 'borrador');

-- =========================
-- PEDIDOS (60)
-- =========================
INSERT INTO pedidos (id, cliente_id, descripcion_carga, codigo_rastreo)
SELECT 
    gen_random_uuid(), -- id único
    id,                -- id del cliente
    'Carga de cliente ' || row_number() OVER (), -- descripción
    'TRACK' || lpad(row_number() OVER ()::text, 4, '0') -- código de rastreo único
FROM clientes
LIMIT 60;

-- =========================
-- RUTA 1 (Primeros 30 pedidos)
-- =========================
INSERT INTO detalles_ruta (ruta_id, pedido_id, orden_entrega)
SELECT 
    (SELECT id FROM rutas LIMIT 1 OFFSET 0),
    p.id,
    ROW_NUMBER() OVER (ORDER BY p.id)
FROM pedidos p
ORDER BY p.id
LIMIT 30;

-- =========================
-- RUTA 2 (Siguientes 30 pedidos)
-- =========================
INSERT INTO detalles_ruta (ruta_id, pedido_id, orden_entrega)
SELECT 
    (SELECT id FROM rutas LIMIT 1 OFFSET 1),
    p.id,
    ROW_NUMBER() OVER (ORDER BY p.id)
FROM pedidos p
ORDER BY p.id
OFFSET 30 LIMIT 30;

COMMIT;