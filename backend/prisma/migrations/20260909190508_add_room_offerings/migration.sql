-- CreateEnum
CREATE TYPE "PricingPeriod" AS ENUM ('AcademicYear', 'Semester', 'Month');

-- DropForeignKey
ALTER TABLE "Tenancy" DROP CONSTRAINT "Tenancy_hostelId_fkey";

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "roomOfferingId" TEXT;

-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN     "address" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ALTER COLUMN "pricePerYear" DROP NOT NULL,
ALTER COLUMN "roomType" DROP NOT NULL,
ALTER COLUMN "availability" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tenancy" ADD COLUMN     "roomOfferingId" TEXT,
ALTER COLUMN "hostelId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RoomOffering" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "pricingPeriod" "PricingPeriod" NOT NULL DEFAULT 'AcademicYear',
    "bedsPerRoom" INTEGER,
    "totalRooms" INTEGER,
    "availableRooms" INTEGER,
    "availability" "Availability" NOT NULL DEFAULT 'Available',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomOffering_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomOffering_hostelId_idx" ON "RoomOffering"("hostelId");

-- CreateIndex
CREATE INDEX "RoomOffering_roomType_idx" ON "RoomOffering"("roomType");

-- CreateIndex
CREATE INDEX "RoomOffering_price_idx" ON "RoomOffering"("price");

-- CreateIndex
CREATE INDEX "RoomOffering_availability_idx" ON "RoomOffering"("availability");

-- CreateIndex
CREATE INDEX "Enquiry_roomOfferingId_idx" ON "Enquiry"("roomOfferingId");

-- CreateIndex
CREATE INDEX "Tenancy_roomOfferingId_idx" ON "Tenancy"("roomOfferingId");

-- AddForeignKey
ALTER TABLE "RoomOffering" ADD CONSTRAINT "RoomOffering_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_roomOfferingId_fkey" FOREIGN KEY ("roomOfferingId") REFERENCES "RoomOffering"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenancy" ADD CONSTRAINT "Tenancy_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenancy" ADD CONSTRAINT "Tenancy_roomOfferingId_fkey" FOREIGN KEY ("roomOfferingId") REFERENCES "RoomOffering"("id") ON DELETE SET NULL ON UPDATE CASCADE;
