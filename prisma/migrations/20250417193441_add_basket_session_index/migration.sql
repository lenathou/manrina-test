-- AlterTable
ALTER TABLE "BasketSession" ADD COLUMN     "orderIndex" SERIAL NOT NULL;

-- CreateIndex
CREATE INDEX "BasketSession_orderIndex_idx" ON "BasketSession"("orderIndex");
