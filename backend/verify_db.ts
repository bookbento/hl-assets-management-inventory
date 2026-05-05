import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const assetCount = await prisma.asset.count();
    const assets = await prisma.asset.findMany({
      include: {
        employeeAssets: {
          include: { employee: true }
        }
      }
    });
    console.log(`Total Assets: ${assetCount}`);
    console.dir(assets, { depth: null });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
