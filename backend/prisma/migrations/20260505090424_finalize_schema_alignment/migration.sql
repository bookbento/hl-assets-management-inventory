/*
  Warnings:

  - You are about to drop the column `statusId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the `Status` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('LAPTOP', 'MONITOR', 'PERIPHERAL', 'NETWORKING', 'MOBILE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_statusId_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "statusId",
ADD COLUMN     "category" "AssetCategory" NOT NULL,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "serialNumber" TEXT NOT NULL,
ADD COLUMN     "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "warrantyExpiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "Status";

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");
