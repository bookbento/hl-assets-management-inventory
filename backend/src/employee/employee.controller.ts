import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
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

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  create(@Body() createEmployeeDto: CreateEmployeeDto, @UploadedFile() file?: any) {
    const avatarUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.employeeService.create({ ...createEmployeeDto, avatarUrl });
  }

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @UploadedFile() file?: any,
  ) {
    const avatarUrl = file ? `/uploads/${file.filename}` : undefined;
    const shouldRemoveAvatar = updateEmployeeDto.removeAvatar === 'true';

    return this.employeeService.update(id, {
      ...updateEmployeeDto,
      ...(avatarUrl ? { avatarUrl } : shouldRemoveAvatar ? { avatarUrl: null } : {}),
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
