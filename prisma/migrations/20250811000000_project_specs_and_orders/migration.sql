-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "dimensionsAr" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "dimensionsEn" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "materialsAr" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "materialsEn" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "keywordsAr" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "keywordsEn" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "quantity" INTEGER;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "itemsSummary" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "messages_orderNumber_key" ON "messages"("orderNumber");
