// src/database/prisma/seed-chofer.ts

/*
  Para ejecutar esta semilla debes modificar el package.json,
  debes buscar este bloque:

  "prisma": {
      "seed": "ts-node src/database/prisma/seed.ts",
      "schema": "src/database/prisma/schema.prisma"
    },

    y modificas el seed.ts por seed-chofer.ts
*/

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Datos de prueba
  const correo = 'chofer@gmail.com';
  const passwordPlana = '123456';

  // Hash de la contraseña
  const passwordHasheada = await bcrypt.hash(passwordPlana, 10);

  // Upsert para garantizar idempotencia
  const chofer = await prisma.choferes.upsert({
    where: { correo: correo },
    update: {},
    create: {
      nombre: 'Derek Luna',
      correo: correo,
      password: passwordHasheada,
      licencia: 'ABC123456',
      telefono: '555-123-456',
      foto_perfil_url: null, // Opcional, puedes agregar una URL si quieres
    },
  });

  console.log('✅ Chofer de prueba creado con éxito:');
  console.log(`Nombre: ${chofer.nombre}`);
  console.log(`Correo: ${chofer.correo}`);
  console.log(`Password: ${passwordPlana}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
