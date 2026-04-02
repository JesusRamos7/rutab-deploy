import { Controller, Get, Post, Body, Param, Patch, Delete, GatewayTimeoutException } from "@nestjs/common";
import { OrdersService } from './orders.service';
import { Roles } from "src/common/decorators/roles.decorator";
import { CreateOrdersDto } from "./dto/create-orders.dto";

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @Roles('superAdmin', 'logístico')
    create(@Body() createOrdersDto: CreateOrdersDto) {
        return this.ordersService.create(createOrdersDto);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Get(':id')
    @Roles('superAdmin', 'logístico')
    update(
        @Param(':id') id: string,
        @Body() updateOrderDto: Partial<CreateOrdersDto>,
    ) {
        return this.ordersService.update(id, updateOrderDto);
    }

}