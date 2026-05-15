/*
  Fix License table: add currency column and convert price/annualCost from TEXT to DOUBLE PRECISION (Float).
  The Prisma schema already defines these as Float with a currency String column,
  but the original migration created them as TEXT without a currency column.
*/

-- Add currency column with default 'USD'
ALTER TABLE "License" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

-- Convert price from TEXT to DOUBLE PRECISION
ALTER TABLE "License" ALTER COLUMN "price" TYPE DOUBLE PRECISION USING COALESCE(NULLIF(regexp_replace("price", '[^0-9.\-]', '', 'g'), ''), '0')::DOUBLE PRECISION;

-- Convert annualCost from TEXT to DOUBLE PRECISION
ALTER TABLE "License" ALTER COLUMN "annualCost" TYPE DOUBLE PRECISION USING COALESCE(NULLIF(regexp_replace("annualCost", '[^0-9.\-]', '', 'g'), ''), '0')::DOUBLE PRECISION;
