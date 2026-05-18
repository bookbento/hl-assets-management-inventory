/*
  Add multi-image support for assets.
  Keeps the legacy Asset.imageUrl column for backward compatibility and backfills
  existing primary images into the new AssetImage table.
*/

-- CreateTable
CREATE TABLE "AssetImage" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetImage_assetId_sortOrder_idx" ON "AssetImage"("assetId", "sortOrder");

-- AddForeignKey
ALTER TABLE "AssetImage" ADD CONSTRAINT "AssetImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill one image row per legacy Asset.imageUrl
INSERT INTO "AssetImage" ("id", "assetId", "url", "sortOrder", "createdAt", "updatedAt")
SELECT
  "id" || '-legacy-image',
  "id",
  "imageUrl",
  0,
  NOW(),
  NOW()
FROM "Asset"
WHERE "imageUrl" IS NOT NULL AND "imageUrl" <> '';
