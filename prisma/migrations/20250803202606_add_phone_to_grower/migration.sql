/*
  Warnings:

  - A unique constraint covering the columns `[siret]` on the table `Grower` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GrowerStockValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CopySourceType" AS ENUM ('MARKET', 'DELIVERY');

-- CreateEnum
CREATE TYPE "CopyTargetType" AS ENUM ('MARKET', 'DELIVERY');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ALTER COLUMN "password" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Grower" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "siret" TEXT;

-- CreateTable
CREATE TABLE "GrowerStockUpdate" (
    "id" TEXT NOT NULL,
    "growerId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "currentStock" INTEGER,
    "reason" TEXT NOT NULL,
    "status" "GrowerStockValidationStatus" NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "newStock" INTEGER NOT NULL,
    "processedDate" TIMESTAMP(3),
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowerStockUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panyen_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "showInStore" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "panyen_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panyen_components" (
    "id" TEXT NOT NULL,
    "panyenProductId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panyen_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "MarketStatus" NOT NULL DEFAULT 'UPCOMING',
    "description" TEXT,
    "location" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "recurringDay" INTEGER,
    "timezone" TEXT DEFAULT 'America/Martinique',
    "autoCreateTime" TEXT DEFAULT '20:00',

    CONSTRAINT "market_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "marketSessionId" TEXT NOT NULL,
    "growerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_copy_history" (
    "id" TEXT NOT NULL,
    "sourceType" "CopySourceType" NOT NULL,
    "targetType" "CopyTargetType" NOT NULL,
    "sourceProductId" TEXT,
    "targetProductId" TEXT,
    "marketProductId" TEXT,
    "productId" TEXT,
    "copiedBy" TEXT NOT NULL,
    "copiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "product_copy_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grower_siret_key" ON "Grower"("siret");

-- AddForeignKey
ALTER TABLE "GrowerStockUpdate" ADD CONSTRAINT "GrowerStockUpdate_growerId_fkey" FOREIGN KEY ("growerId") REFERENCES "Grower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowerStockUpdate" ADD CONSTRAINT "GrowerStockUpdate_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panyen_components" ADD CONSTRAINT "panyen_components_panyenProductId_fkey" FOREIGN KEY ("panyenProductId") REFERENCES "panyen_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panyen_components" ADD CONSTRAINT "panyen_components_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panyen_components" ADD CONSTRAINT "panyen_components_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_products" ADD CONSTRAINT "market_products_marketSessionId_fkey" FOREIGN KEY ("marketSessionId") REFERENCES "market_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_products" ADD CONSTRAINT "market_products_growerId_fkey" FOREIGN KEY ("growerId") REFERENCES "Grower"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_copy_history" ADD CONSTRAINT "product_copy_history_marketProductId_fkey" FOREIGN KEY ("marketProductId") REFERENCES "market_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_copy_history" ADD CONSTRAINT "product_copy_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
