-- CreateTable
CREATE TABLE "administradores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT,
    "foto_perfil_url" TEXT,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choferes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "licencia" TEXT,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "foto_perfil_url" TEXT,

    CONSTRAINT "choferes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "coordenadas" geography NOT NULL,
    "codigo" TEXT,
    "contacto" TEXT,
    "estatus" TEXT DEFAULT 'Activo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_ruta" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ruta_id" UUID,
    "pedido_id" UUID,
    "orden_entrega" INTEGER,
    "comentarios" TEXT,

    CONSTRAINT "detalles_ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID,
    "foto_url" TEXT,
    "firma_url" TEXT,
    "coordenadas_entrega" geography,
    "fecha_hora" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_rastreo" (
    "id" SERIAL NOT NULL,
    "ruta_id" UUID,
    "coordenadas" geography,
    "fecha_hora" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_rastreo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidencias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ruta_id" UUID,
    "tipo" TEXT,
    "descripcion" TEXT,
    "foto_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID,
    "descripcion_carga" TEXT,
    "codigo_rastreo" TEXT,
    "estado_pedido" TEXT DEFAULT 'pendiente',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rutas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vehiculo_id" UUID,
    "chofer_id" UUID,
    "creado_por" UUID,
    "fecha_programada" DATE,
    "distancia_total_estimada" DECIMAL,
    "tiempo_estimado_entrega" TIMESTAMPTZ(6),
    "estatus_ruta" TEXT DEFAULT 'borrador',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "placas" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "rendimiento_combustible" DECIMAL,
    "estatus" TEXT DEFAULT 'disponible',
    "foto_unidad_url" TEXT,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administradores_correo_key" ON "administradores"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "choferes_correo_key" ON "choferes"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_correo_key" ON "clientes"("correo");

-- CreateIndex
CREATE INDEX "historial_rastreo_coordenadas_idx" ON "historial_rastreo" USING GIST ("coordenadas");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placas_key" ON "vehiculos"("placas");

-- AddForeignKey
ALTER TABLE "detalles_ruta" ADD CONSTRAINT "detalles_ruta_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalles_ruta" ADD CONSTRAINT "detalles_ruta_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_rastreo" ADD CONSTRAINT "historial_rastreo_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_chofer_id_fkey" FOREIGN KEY ("chofer_id") REFERENCES "choferes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "administradores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
