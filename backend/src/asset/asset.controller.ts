import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto, AssignAssetDto, UnassignAssetDto } from './dto/asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads');
const { diskStorage } = require('multer');

const ensureUploadDir = () => {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
};

const uploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
    } else {
      cb(null, true);
    }
  },
};

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  create(@Body() createAssetDto: CreateAssetDto, @UploadedFile() file?: any) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.assetService.create({ ...createAssetDto, imageUrl });
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
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @UploadedFile() file?: any,
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    const shouldRemoveImage = updateAssetDto.removeImage === 'true';

    return this.assetService.update(id, {
      ...updateAssetDto,
      ...(imageUrl ? { imageUrl } : shouldRemoveImage ? { imageUrl: null } : {}),
    });
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
