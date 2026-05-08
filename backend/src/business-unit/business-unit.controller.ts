import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessUnitService } from './business-unit.service';
import { CreateBusinessUnitDto, UpdateBusinessUnitDto } from './dto/business-unit.dto';

@Controller('business-unit')
@UseGuards(JwtAuthGuard)
export class BusinessUnitController {
  constructor(private readonly businessUnitService: BusinessUnitService) {}

  @Post()
  create(@Body() createBusinessUnitDto: CreateBusinessUnitDto) {
    return this.businessUnitService.create(createBusinessUnitDto);
  }

  @Get()
  findAll() {
    return this.businessUnitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessUnitService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusinessUnitDto: UpdateBusinessUnitDto) {
    return this.businessUnitService.update(id, updateBusinessUnitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessUnitService.remove(id);
  }
}
