-- Convert all existing primary keys from CUID format to UUID format while keeping
-- every foreign-key relationship and many-to-many link aligned to the new IDs.
BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TEMP TABLE "Owner_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "Owner";

CREATE TEMP TABLE "Hostel_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "Hostel";

CREATE TEMP TABLE "Facility_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "Facility";

CREATE TEMP TABLE "RoomOffering_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "RoomOffering";

CREATE TEMP TABLE "Enquiry_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "Enquiry";

CREATE TEMP TABLE "Tenancy_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "Tenancy";

CREATE TEMP TABLE "Deal_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "Deal";

CREATE TEMP TABLE "Admin_id_map" AS
SELECT "id" AS "old_id", gen_random_uuid()::text AS "new_id"
FROM "Admin";

-- Update the parent rows first so child references can be rewritten to the new PK values.
UPDATE "Owner" AS o
SET "id" = om."new_id"
FROM "Owner_id_map" AS om
WHERE o."id" = om."old_id";

UPDATE "Facility" AS f
SET "id" = fm."new_id"
FROM "Facility_id_map" AS fm
WHERE f."id" = fm."old_id";

UPDATE "Hostel" AS h
SET "id" = hm."new_id"
FROM "Hostel_id_map" AS hm
WHERE h."id" = hm."old_id";

UPDATE "RoomOffering" AS ro
SET "id" = rom."new_id"
FROM "RoomOffering_id_map" AS rom
WHERE ro."id" = rom."old_id";

UPDATE "Enquiry" AS e
SET "id" = em."new_id"
FROM "Enquiry_id_map" AS em
WHERE e."id" = em."old_id";

UPDATE "Tenancy" AS t
SET "id" = tm."new_id"
FROM "Tenancy_id_map" AS tm
WHERE t."id" = tm."old_id";

UPDATE "Deal" AS d
SET "id" = dm."new_id"
FROM "Deal_id_map" AS dm
WHERE d."id" = dm."old_id";

UPDATE "Admin" AS a
SET "id" = am."new_id"
FROM "Admin_id_map" AS am
WHERE a."id" = am."old_id";

-- Update all foreign keys to reference the new UUID ids.
UPDATE "Hostel" AS h
SET "ownerId" = om."new_id"
FROM "Owner_id_map" AS om
WHERE h."ownerId" = om."old_id";

UPDATE "RoomOffering" AS ro
SET "hostelId" = hm."new_id"
FROM "Hostel_id_map" AS hm
WHERE ro."hostelId" = hm."old_id";

UPDATE "Enquiry" AS e
SET "hostelId" = hm."new_id"
FROM "Hostel_id_map" AS hm
WHERE e."hostelId" = hm."old_id";

UPDATE "Enquiry" AS e
SET "roomOfferingId" = rom."new_id"
FROM "RoomOffering_id_map" AS rom
WHERE e."roomOfferingId" = rom."old_id";

UPDATE "Tenancy" AS t
SET "hostelId" = hm."new_id"
FROM "Hostel_id_map" AS hm
WHERE t."hostelId" = hm."old_id";

UPDATE "Tenancy" AS t
SET "roomOfferingId" = rom."new_id"
FROM "RoomOffering_id_map" AS rom
WHERE t."roomOfferingId" = rom."old_id";

UPDATE "Deal" AS d
SET "hostelId" = hm."new_id"
FROM "Hostel_id_map" AS hm
WHERE d."hostelId" = hm."old_id";

UPDATE "_HostelFacilities" AS hf
SET "A" = fm."new_id"
FROM "Facility_id_map" AS fm
WHERE hf."A" = fm."old_id";

UPDATE "_HostelFacilities" AS hf
SET "B" = hm."new_id"
FROM "Hostel_id_map" AS hm
WHERE hf."B" = hm."old_id";

ALTER TABLE "Owner" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Hostel" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Facility" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "RoomOffering" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Enquiry" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Tenancy" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Deal" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Admin" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

DROP TABLE "Owner_id_map";
DROP TABLE "Hostel_id_map";
DROP TABLE "Facility_id_map";
DROP TABLE "RoomOffering_id_map";
DROP TABLE "Enquiry_id_map";
DROP TABLE "Tenancy_id_map";
DROP TABLE "Deal_id_map";
DROP TABLE "Admin_id_map";

COMMIT;