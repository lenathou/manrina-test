/*
  Warnings:

  - You are about to drop the `GrowerStock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GrowerStock" DROP CONSTRAINT "GrowerStock_growerId_fkey";

-- DropForeignKey
ALTER TABLE "GrowerStock" DROP CONSTRAINT "GrowerStock_productId_fkey";

-- DropForeignKey
ALTER TABLE "GrowerStock" DROP CONSTRAINT "GrowerStock_variantId_fkey";

-- DropTable
DROP TABLE "GrowerStock";

-- CreateTable
CREATE TABLE "GrowerProduct" (
    "id" TEXT NOT NULL,
    "growerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowerProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrowerProduct_growerId_variantId_key" ON "GrowerProduct"("growerId", "variantId");

-- AddForeignKey
ALTER TABLE "GrowerProduct" ADD CONSTRAINT "GrowerProduct_growerId_fkey" FOREIGN KEY ("growerId") REFERENCES "Grower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowerProduct" ADD CONSTRAINT "GrowerProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowerProduct" ADD CONSTRAINT "GrowerProduct_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
