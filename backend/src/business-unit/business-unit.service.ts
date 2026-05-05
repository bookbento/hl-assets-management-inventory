import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessUnitDto, UpdateBusinessUnitDto } from './dto/business-unit.dto';

@Injectable()
export class BusinessUnitService {
  constructor(private prisma: PrismaService) {}

  create(createBusinessUnitDto: CreateBusinessUnitDto) {
    return this.prisma.businessUnit.create({
      data: createBusinessUnitDto,
    });
  }

  findAll() {
    return this.prisma.businessUnit.findMany({
      include: { 
        departments: {
          include: {
            jobTitles: true
          }
        },
        _count: { select: { employees: true } } 
      },
    });
  }

  findOne(id: string) {
    return this.prisma.businessUnit.findUnique({
      where: { id },
    });
  }

  update(id: string, updateBusinessUnitDto: UpdateBusinessUnitDto) {
    return this.prisma.businessUnit.update({
      where: { id },
      data: updateBusinessUnitDto,
    });
  }

  remove(id: string) {
    return this.prisma.businessUnit.delete({
      where: { id },
    });
  }
}
