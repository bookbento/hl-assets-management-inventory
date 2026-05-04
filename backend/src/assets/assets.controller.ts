// backend/src/assets/assets.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { QueryAssetDto } from "./dto/query-asset.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { Response } from "express";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // All asset management operations require ADMIN role for v1
@Controller("assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  findAll(@Query() query: QueryAssetDto) {
    return this.assetsService.findAll(query);
  }

  @Get("summary")
  getSummary() {
    return this.assetsService.getAssetCounts();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.assetsService.remove(id);
  }

  @Get("export/csv")
  async exportCsv(@Res() res: Response) {
    const csvData = await this.assetsService.exportCsv(); // This will need to generate actual CSV content
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="assets.csv"');
    res.send(csvData);
  }

  @Get("export/pdf")
  async exportPdf(@Res() res: Response) {
    const pdfBuffer = await this.assetsService.exportPdf(); // This will need to generate actual PDF content
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="assets.pdf"');
    res.send(pdfBuffer);
  }
}
