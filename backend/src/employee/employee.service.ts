import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { username, password, role, ...employeeData } = createEmployeeDto;

    const employee = await this.prisma.employee.create({
      data: employeeData,
    });

    if (username && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.userLogin.create({
        data: {
          username,
          password: hashedPassword,
          role: role || 'user',
          employeeId: employee.id,
        },
      });
    }

    return this.findOne(employee.id);
  }

  findAll() {
    return this.prisma.employee.findMany({
      include: {
        businessUnit: true,
        department: true,
        jobTitle: true,
        userLogin: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        _count: {
          select: { employeeAssets: true }
        }
      },
    });
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        businessUnit: true,
        department: true,
        jobTitle: true,
        userLogin: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        employeeAssets: {
          include: {
            asset: true,
          },
        },
      },
    });
  }

  update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
