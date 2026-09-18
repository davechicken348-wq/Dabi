-- Add a public, human-readable slug to each hostel and backfill it for all
-- existing records while preserving uniqueness.
ALTER TABLE "Hostel"
ADD COLUMN "slug" TEXT;

WITH normalized AS (
  SELECT
    h."id",
    lower(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            coalesce(h."name", 'hostel'),
            '[^a-zA-Z0-9]+', '-', 'g'
          ),
          '^-+|-+$', '', 'g'
        ),
        '--+', '-', 'g'
      )
    ) AS base_slug
  FROM "Hostel" h
),
ranked AS (
  SELECT
    n."id",
    CASE
      WHEN n.base_slug = '' THEN 'hostel'
      ELSE n.base_slug
    END AS base_slug,
    ROW_NUMBER() OVER (PARTITION BY CASE WHEN n.base_slug = '' THEN 'hostel' ELSE n.base_slug END ORDER BY n."id") - 1 AS occurrence
  FROM normalized n
)
UPDATE "Hostel" h
SET "slug" = CASE
  WHEN r.occurrence = 0 THEN r.base_slug
  ELSE r.base_slug || '-' || r.occurrence
END
FROM ranked r
WHERE h."id" = r."id";

UPDATE "Hostel"
SET "slug" = 'hostel-' || substr(md5(random()::text), 1, 8)
WHERE "slug" IS NULL;

ALTER TABLE "Hostel"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Hostel_slug_key"
ON "Hostel"("slug");
