ALTER TABLE "Hostel"
  ADD COLUMN "updatedAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "Hostel"
SET "updatedAt" = COALESCE("createdAt", NOW());

ALTER TABLE "Hostel"
  ALTER COLUMN "updatedAt" SET NOT NULL;
