import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto, AssignAssetDto, UnassignAssetDto } from './dto/asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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

const extractImageUrls = (files?: { image?: any[]; images?: any[] }) => {
  const primary = files?.image?.[0];
  const gallery = files?.images || [];
  return [primary, ...gallery].filter(Boolean).map((file) => `/uploads/${file.filename}`);
};

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      uploadOptions,
    ),
  )
  create(@Body() createAssetDto: CreateAssetDto, @UploadedFiles() files?: any) {
    const imageUrls = extractImageUrls(files);
    const { removeImage, ...payload } = createAssetDto as CreateAssetDto & { removeImage?: string };
    return this.assetService.create({
      ...payload,
      imageUrls,
      imageUrl: imageUrls[0] ?? payload.imageUrl,
    });
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      uploadOptions,
    ),
  )
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @UploadedFiles() files?: any,
  ) {
    const imageUrls = extractImageUrls(files);
    const shouldRemoveImage = updateAssetDto.removeImage === 'true';
    const { removeImage, ...payload } = updateAssetDto as UpdateAssetDto & { removeImage?: string };

    return this.assetService.update(id, {
      ...payload,
      imageUrls,
      ...(imageUrls[0] ? { imageUrl: imageUrls[0] } : payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      ...(shouldRemoveImage ? { removeImage: 'true' } : {}),
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
