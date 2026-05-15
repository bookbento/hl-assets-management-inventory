import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AssignLicenseDto,
  CreateLicenseDto,
  UnassignLicenseDto,
  UpdateLicenseDto,
} from './dto/license.dto';
import { LicenseService } from './license.service';

@Controller('licenses')
@UseGuards(JwtAuthGuard)
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  create(@Body() createLicenseDto: CreateLicenseDto) {
    return this.licenseService.create(createLicenseDto);
  }

  @Get('summary')
  getSummary() {
    return this.licenseService.getSummary();
  }

  @Get('expiring-soon')
  getExpiringSoon() {
    return this.licenseService.getExpiringSoon();
  }

  @Get()
  findAll() {
    return this.licenseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLicenseDto: UpdateLicenseDto) {
    return this.licenseService.update(id, updateLicenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.licenseService.remove(id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() assignLicenseDto: AssignLicenseDto) {
    return this.licenseService.assign(id, assignLicenseDto);
  }

  @Post(':id/unassign')
  unassign(@Param('id') id: string, @Body() unassignLicenseDto: UnassignLicenseDto) {
    return this.licenseService.unassign(id, unassignLicenseDto);
  }
}
