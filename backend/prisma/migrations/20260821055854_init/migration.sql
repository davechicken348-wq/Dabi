-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('Available', 'Limited', 'Full');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('New', 'Contacted', 'Resolved');

-- CreateTable
CREATE TABLE "Hostel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "pricePerYear" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "availability" "Availability" NOT NULL DEFAULT 'Available',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT NOT NULL DEFAULT '/images/hostel-placeholder.svg',
    "note" TEXT,
    "distanceFromSTU" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "school" TEXT,
    "hostelId" TEXT,
    "hostelName" TEXT,
    "roomType" TEXT,
    "moveInDate" TIMESTAMP(3),
    "message" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "hostelId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HostelFacilities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Hostel_ownerId_idx" ON "Hostel"("ownerId");

-- CreateIndex
CREATE INDEX "Hostel_availability_idx" ON "Hostel"("availability");

-- CreateIndex
CREATE INDEX "Hostel_verified_idx" ON "Hostel"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "Owner"("email");

-- CreateIndex
CREATE INDEX "Owner_active_idx" ON "Owner"("active");

-- CreateIndex
CREATE INDEX "Enquiry_hostelId_idx" ON "Enquiry"("hostelId");

-- CreateIndex
CREATE INDEX "Enquiry_status_idx" ON "Enquiry"("status");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_code_key" ON "Deal"("code");

-- CreateIndex
CREATE INDEX "Deal_hostelId_idx" ON "Deal"("hostelId");

-- CreateIndex
CREATE INDEX "Deal_active_idx" ON "Deal"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_key_key" ON "Facility"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_HostelFacilities_AB_unique" ON "_HostelFacilities"("A", "B");

-- CreateIndex
CREATE INDEX "_HostelFacilities_B_index" ON "_HostelFacilities"("B");

-- AddForeignKey
ALTER TABLE "Hostel" ADD CONSTRAINT "Hostel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HostelFacilities" ADD CONSTRAINT "_HostelFacilities_A_fkey" FOREIGN KEY ("A") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HostelFacilities" ADD CONSTRAINT "_HostelFacilities_B_fkey" FOREIGN KEY ("B") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
