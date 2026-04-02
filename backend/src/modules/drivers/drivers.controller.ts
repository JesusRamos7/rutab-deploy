import { Controller, Get, Post, Body, Param, Patch, Delete } from "@nestjs/common";
import { DriversService } from './drivers.service'
import { CreateDriverDto } from "./dto/create-drivers.dto";
import { Roles } from 'src/common/decorators/roles.decorator'

@Controller('drivers')
export class DriversController {
    constructor(private readonly driversService: DriversService) {}

    @Post()
    @Roles('superAdmin', 'logístico')
    create(@Body() CreateDriverDto: CreateDriverDto) {
        return this.driversService.create(CreateDriverDto);
    }

    @Get()
    findAll() {
        return this.driversService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.driversService.findOne(id);
    }

    @Patch(':id')
    @Roles('superAdmin', 'logístico')
    update(@Param('id') id: string, @Body() updateDto: Partial<CreateDriverDto>) {
        return this.driversService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles('superAdmin')
    remove(@Param('id') id: string) {
        return this.driversService.remove(id);
    }
}
