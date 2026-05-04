// backend/src/assets/assets.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { QueryAssetDto } from "./dto/query-asset.dto";
import { Asset } from "@prisma/client";

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.prisma.asset.create({ data: createAssetDto });
  }

  async findAll(query: QueryAssetDto): Promise<Asset[]> {
    const {
      search,
      category,
      status,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { assignedTo: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && { category }),
      ...(status && { status }),
    };

    const orderBy = sortBy ? { [sortBy]: sortOrder || "asc" } : undefined;

    return this.prisma.asset.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID "${id}" not found`);
    }
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID "${id}" not found`);
    }
    return this.prisma.asset.update({ where: { id }, data: updateAssetDto });
  }

  async remove(id: string): Promise<Asset> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID "${id}" not found`);
    }
    return this.prisma.asset.delete({ where: { id } });
  }

  async getAssetCounts(): Promise<any> {
    const total = await this.prisma.asset.count();
    const inUse = await this.prisma.asset.count({
      where: { status: "IN_USE" },
    });
    const available = await this.prisma.asset.count({
      where: { status: "AVAILABLE" },
    });
    const maintenance = await this.prisma.asset.count({
      where: { status: "MAINTENANCE" },
    });

    // Basic aggregation for category distribution
    const categoryDistribution = await this.prisma.asset.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    });

    return {
      total,
      inUse,
      available,
      maintenance,
      categoryDistribution,
    };
  }

  // TODO: Implement CSV and PDF export logic here. This will likely involve a dedicated
  // library for CSV/PDF generation and could be an additional service or helper.
  async exportCsv(): Promise<any> {
    // Placeholder for CSV export
    return "CSV export not yet implemented.";
  }

  async exportPdf(): Promise<any> {
    // Placeholder for PDF export
    return "PDF export not yet implemented.";
  }
}
