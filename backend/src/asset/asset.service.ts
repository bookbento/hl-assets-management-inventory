import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto, AssignAssetDto, UnassignAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: createAssetDto,
    });
  }

  async findAll(query: any = {}) {
    const { search, category, status, sortBy, sortOrder, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          employeeAssets: {
            where: { returnDate: null },
            include: { employee: true },
          },
        },
        orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit),
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSummary() {
    const [total, inUse, available, maintenance, categoryDistribution] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { status: 'IN_USE' } }),
      this.prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.asset.count({ where: { status: 'MAINTENANCE' } }),
      this.prisma.asset.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
    ]);

    return {
      total,
      inUse,
      available,
      maintenance,
      categoryDistribution,
    };
  }

  findOne(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        employeeAssets: {
          include: { employee: true },
        },
      },
    });
  }

  update(id: string, updateAssetDto: UpdateAssetDto) {
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  remove(id: string) {
    return this.prisma.asset.delete({
      where: { id },
    });
  }

  async assign(assignAssetDto: AssignAssetDto) {
    const { employeeId, assetId } = assignAssetDto;

    // Check if asset is already assigned and not returned
    const existingAssignment = await this.prisma.employee_Assets.findFirst({
      where: {
        assetId,
        returnDate: null,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('Asset is already assigned and not yet returned');
    }

    return this.prisma.employee_Assets.create({
      data: {
        employeeId,
        assetId,
        assignedDate: new Date(),
      },
    });
  }

  async unassign(unassignAssetDto: UnassignAssetDto) {
    const { assetId } = unassignAssetDto;

    const assignment = await this.prisma.employee_Assets.findFirst({
      where: {
        assetId,
        returnDate: null,
      },
    });

    if (!assignment) {
      throw new BadRequestException('Asset is not currently assigned');
    }

    return this.prisma.employee_Assets.update({
      where: { id: assignment.id },
      data: {
        returnDate: new Date(),
      },
    });
  }
}
