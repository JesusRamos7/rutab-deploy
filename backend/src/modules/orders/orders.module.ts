import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";

@Module({
    imports:[
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secreto_temporal',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [OrdersController],
    providers: [OrdersService, JwtStrategy],
    exports: [PassportModule, JwtStrategy]
})
export class OrdersModule {}