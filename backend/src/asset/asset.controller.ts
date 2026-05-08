import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto, AssignAssetDto, UnassignAssetDto } from './dto/asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetService.create(createAssetDto);
  }

  @Get('summary')
  getSummary() {
    return this.assetService.getSummary();
  }

  @Get()
  findAll(@Query() query: any) {
    return this.assetService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetService.update(id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(id);
  }

  @Post('assign')
  assign(@Body() assignAssetDto: AssignAssetDto) {
    return this.assetService.assign(assignAssetDto);
  }

  @Post('unassign')
  unassign(@Body() unassignAssetDto: UnassignAssetDto) {
    return this.assetService.unassign(unassignAssetDto);
  }
}
