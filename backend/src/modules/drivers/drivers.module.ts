import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { DriversService } from "./drivers.service";
import { DriversController } from "./drivers.controller";

@Module({
    imports:[
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secreto_temporal',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [DriversController],
    providers: [DriversService, JwtStrategy],
    exports: [PassportModule, JwtStrategy]
})
export class DriversModule {}