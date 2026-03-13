"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordPlana = '1234';
    const passwordHasheada = await bcrypt.hash(passwordPlana, 10);
    const superAdmin = await prisma.administradores.upsert({
        where: { correo: 'admin@gmail.com' },
        update: {},
        create: {
            nombre: 'Claudia Ruth',
            correo: 'admin@gmail.com',
            password: passwordHasheada,
            rol: 'superAdmin',
        },
    });
    console.log('✅ Administrador de prueba creado con éxito:');
    console.log(`Correo: ${superAdmin.correo}`);
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
//# sourceMappingURL=seed.js.map