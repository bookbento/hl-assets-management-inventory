import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignLicenseDto,
  CreateLicenseDto,
  UnassignLicenseDto,
  UpdateLicenseDto,
} from './dto/license.dto';

const parseMoney = (value: string | number | null | undefined) => {
  if (typeof value === 'number') {
    return value;
  }

  return Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysUntil = (expiryDate: Date, referenceDate = new Date()) => {
  const start = startOfDay(referenceDate);
  const end = startOfDay(expiryDate);

  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

@Injectable()
export class LicenseService {
  constructor(private prisma: PrismaService) {}

  private formatLicense(license: any) {
    const assignments = license.assignments || [];
    const usedSeats = assignments.length;
    const availableSeats = Math.max(license.totalSeats - usedSeats, 0);
    const usagePercent = license.totalSeats > 0 ? Math.round((usedSeats / license.totalSeats) * 100) : 0;

    return {
      ...license,
      usedSeats,
      availableSeats,
      usagePercent,
      assignments: assignments.map((assignment: any) => ({
        id: assignment.id,
        assignedDate: assignment.assignedDate,
        employee: assignment.employee,
      })),
    };
  }

  async create(createLicenseDto: CreateLicenseDto) {
    return this.prisma.license.create({
      data: createLicenseDto,
    });
  }

  async findAll() {
    const licenses = await this.prisma.license.findMany({
      include: {
        assignments: {
          include: {
            employee: {
              include: {
                department: true,
                businessUnit: true,
              },
            },
          },
          orderBy: {
            assignedDate: 'asc',
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return licenses.map((license) => this.formatLicense(license));
  }

  async getSummary() {
    const licenses = await this.prisma.license.findMany({
      include: {
        assignments: true,
      },
    });

    const now = startOfDay();
    const inThirtyDays = startOfDay();
    inThirtyDays.setDate(now.getDate() + 30);

    const total = licenses.length;
    const active = licenses.filter((license) => license.status === 'ACTIVE').length;
    const expiringSoon = licenses.filter((license) => {
      const expiryDate = new Date(license.expiryDate);
      return expiryDate >= now && expiryDate <= inThirtyDays;
    }).length;
    const assignedSeats = licenses.reduce((sum, license) => sum + license.assignments.length, 0);
    const availableSeats = licenses.reduce(
      (sum, license) => sum + Math.max(license.totalSeats - license.assignments.length, 0),
      0,
    );
    const annualCostTotal = licenses.reduce((sum, license) => sum + parseMoney(license.annualCost), 0);

    return {
      total,
      active,
      expiringSoon,
      assignedSeats,
      availableSeats,
      annualCostTotal,
    };
  }

  async getExpiringSoon(days = 30) {
    const now = startOfDay();
    const until = startOfDay();
    until.setDate(now.getDate() + days);

    const licenses = await this.prisma.license.findMany({
      where: {
        expiryDate: {
          gte: now,
          lte: until,
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return licenses.map((license) => {
      const daysLeft = daysUntil(license.expiryDate, now);

      return {
        id: license.id,
        name: license.name,
        vendor: license.vendor,
        type: license.type,
        status: license.status,
        expiryDate: license.expiryDate,
        daysLeft,
        urgency:
          daysLeft <= 7
            ? 'critical'
            : daysLeft <= 14
              ? 'warning'
              : 'soon',
      };
    });
  }

  async findOne(id: string) {
    const license = await this.prisma.license.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            employee: {
              include: {
                department: true,
                businessUnit: true,
              },
            },
          },
          orderBy: {
            assignedDate: 'asc',
          },
        },
      },
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    return this.formatLicense(license);
  }

  async update(id: string, updateLicenseDto: UpdateLicenseDto) {
    if (typeof updateLicenseDto.totalSeats === 'number') {
      const existing = await this.prisma.license.findUnique({
        where: { id },
        include: { assignments: true },
      });

      if (!existing) {
        throw new NotFoundException('License not found');
      }

      if (updateLicenseDto.totalSeats < existing.assignments.length) {
        throw new BadRequestException('Total seats cannot be less than assigned seats');
      }
    }

    return this.prisma.license.update({
      where: { id },
      data: updateLicenseDto,
    });
  }

  async remove(id: string) {
    return this.prisma.license.delete({
      where: { id },
    });
  }

  async assign(licenseId: string, assignLicenseDto: AssignLicenseDto) {
    const license = await this.prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        assignments: true,
      },
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: assignLicenseDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (license.assignments.length >= license.totalSeats) {
      throw new BadRequestException('No available seats for this license');
    }

    const existingAssignment = license.assignments.find(
      (assignment) => assignment.employeeId === assignLicenseDto.employeeId,
    );

    if (existingAssignment) {
      throw new BadRequestException('Employee already has this license assigned');
    }

    return this.prisma.licenseAssignment.create({
      data: {
        licenseId,
        employeeId: assignLicenseDto.employeeId,
      },
    });
  }

  async unassign(licenseId: string, unassignLicenseDto: UnassignLicenseDto) {
    const assignment = await this.prisma.licenseAssignment.findUnique({
      where: { id: unassignLicenseDto.assignmentId },
    });

    if (!assignment || assignment.licenseId !== licenseId) {
      throw new NotFoundException('License assignment not found');
    }

    await this.prisma.licenseAssignment.delete({
      where: { id: assignment.id },
    });

    return { success: true };
  }
}
