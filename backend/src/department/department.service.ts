import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    const { businessUnitId, ...data } = createDepartmentDto;
    return this.prisma.department.create({
      data: {
        ...data,
        businessUnit: {
          connect: { id: businessUnitId }
        }
      },
    });
  }

  findAll() {
    return this.prisma.department.findMany({
      include: { _count: { select: { employees: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
    });
  }

  update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  remove(id: string) {
    return this.prisma.department.delete({
      where: { id },
    });
  }
}
