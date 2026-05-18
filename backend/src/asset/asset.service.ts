import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto, AssignAssetDto, UnassignAssetDto } from './dto/asset.dto';

type AssetImageInput = {
  imageUrl?: string | null;
  imageUrls?: string[];
  removeImage?: boolean | string;
};

const assetIncludes = {
  employeeAssets: {
    include: { employee: true },
  },
  assetImages: {
    orderBy: {
      sortOrder: 'asc' as const,
    },
  },
};

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}
  private assetImageTableExists: boolean | null = null;

  private dedupeImages(images: Array<string | null | undefined>) {
    return [...new Set(images.filter(Boolean) as string[])];
  }

  private async hasAssetImageTable() {
    if (this.assetImageTableExists !== null) {
      return this.assetImageTableExists;
    }

    const result = await this.prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT to_regclass('public."AssetImage"') IS NOT NULL AS "exists"
    `;

    this.assetImageTableExists = Boolean(result[0]?.exists);
    return this.assetImageTableExists;
  }

  private normalizeImages(asset: any) {
    const assetImages = asset.assetImages || [];
    const legacyImage = asset.imageUrl ? [{ url: asset.imageUrl, sortOrder: -1 }] : [];
    const images = [...legacyImage, ...assetImages].map((image) => image.url);
    const uniqueImages = this.dedupeImages(images);

    return {
      ...asset,
      images: uniqueImages,
    };
  }

  async create(createAssetDto: CreateAssetDto & AssetImageInput) {
    const { imageUrls = [], imageUrl, ...payload } = createAssetDto;
    const images = this.dedupeImages([imageUrl, ...imageUrls]);
    const supportsMultiImages = await this.hasAssetImageTable();
    const include = {
      employeeAssets: {
        include: { employee: true },
      },
      ...(supportsMultiImages ? { assetImages: assetIncludes.assetImages } : {}),
    };

    const asset = await this.prisma.asset.create({
      data: {
        ...payload,
        imageUrl: images[0] || null,
        assetImages: supportsMultiImages && images.length
          ? {
              create: images.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include,
    });

    return this.normalizeImages(asset);
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

    const supportsMultiImages = await this.hasAssetImageTable();

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          employeeAssets: {
            where: { returnDate: null },
            include: { employee: true },
          },
          ...(supportsMultiImages ? { assetImages: assetIncludes.assetImages } : {}),
        },
        orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit),
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: data.map((asset) => this.normalizeImages(asset)),
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
    return this.hasAssetImageTable().then((supportsMultiImages) =>
      this.prisma.asset.findUnique({
        where: { id },
        include: {
          employeeAssets: {
            include: { employee: true },
          },
          ...(supportsMultiImages ? { assetImages: assetIncludes.assetImages } : {}),
        },
      }).then((asset) => (asset ? this.normalizeImages(asset) : null)),
    );
  }

  async update(id: string, updateAssetDto: UpdateAssetDto & AssetImageInput) {
    const { imageUrls = [], imageUrl, removeImage, ...payload } = updateAssetDto;
    const newImages = this.dedupeImages([imageUrl, ...imageUrls]);
    const supportsMultiImages = await this.hasAssetImageTable();

    const asset = await this.prisma.$transaction(async (tx) => {
      if (removeImage && supportsMultiImages) {
        await tx.assetImage.deleteMany({
          where: { assetId: id },
        });
      }

      const updated = await tx.asset.update({
        where: { id },
        data: {
          ...payload,
          ...(removeImage ? { imageUrl: null } : {}),
          ...(newImages[0] ? { imageUrl: newImages[0] } : {}),
        },
        include: {
          employeeAssets: {
            include: { employee: true },
          },
          ...(supportsMultiImages ? { assetImages: assetIncludes.assetImages } : {}),
        },
      });

      if (supportsMultiImages && newImages.length) {
        const startOrder = removeImage ? 0 : updated.assetImages.length;
        await tx.assetImage.createMany({
          data: newImages.map((url, index) => ({
            assetId: id,
            url,
            sortOrder: startOrder + index,
          })),
        });
      }

      return tx.asset.findUnique({
        where: { id },
        include: {
          employeeAssets: {
            include: { employee: true },
          },
          ...(supportsMultiImages ? { assetImages: assetIncludes.assetImages } : {}),
        },
      });
    });

    return asset ? this.normalizeImages(asset) : null;
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
