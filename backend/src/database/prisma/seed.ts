import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Definimos la contraseña en texto plano y la encriptamos (10 rondas de sal)
  const correo = "auditor@gmail.com"
  const passwordPlana = '1234';
  const passwordHasheada = await bcrypt.hash(passwordPlana, 10);

  // 2. Usamos upsert para que, si ejecutas el script 2 veces, no marque error por correo duplicado
  const superAdmin = await prisma.administradores.upsert({
    where: { correo: correo },
    update: {}, // Si ya existe, no hace nada
    create: {
      nombre: 'Jorge Gabriel',
      correo: correo,
      password: passwordHasheada,
      rol: 'auditor',
      // telefono y foto_perfil_url los dejamos vacíos por ahora ya que son "null" en tu tabla
    },
  });

  console.log('✅ Administrador de prueba creado con éxito:');
  console.log(`Correo: ${superAdmin.correo}`);
  console.log(`Password: ${passwordPlana}`); // Solo lo imprimimos para recordarlo
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });