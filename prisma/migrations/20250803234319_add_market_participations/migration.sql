-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- CreateTable
CREATE TABLE "market_participations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "growerId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_participations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_participations_sessionId_growerId_key" ON "market_participations"("sessionId", "growerId");

-- AddForeignKey
ALTER TABLE "market_participations" ADD CONSTRAINT "market_participations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "market_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_participations" ADD CONSTRAINT "market_participations_growerId_fkey" FOREIGN KEY ("growerId") REFERENCES "Grower"("id") ON DELETE CASCADE ON UPDATE CASCADE;
