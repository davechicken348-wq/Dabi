-- CreateEnum
CREATE TYPE "TenancyStatus" AS ENUM ('Pending', 'Active', 'Ended');

-- CreateTable
CREATE TABLE "Tenancy" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "hostelName" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "beds" INTEGER NOT NULL DEFAULT 1,
    "occupantName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "moveInDate" TIMESTAMP(3),
    "moveOutDate" TIMESTAMP(3),
    "status" "TenancyStatus" NOT NULL DEFAULT 'Pending',
    "source" TEXT NOT NULL DEFAULT 'self',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tenancy_hostelId_idx" ON "Tenancy"("hostelId");

-- CreateIndex
CREATE INDEX "Tenancy_status_idx" ON "Tenancy"("status");

-- CreateIndex
CREATE INDEX "Tenancy_createdAt_idx" ON "Tenancy"("createdAt");

-- AddForeignKey
ALTER TABLE "Tenancy" ADD CONSTRAINT "Tenancy_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
