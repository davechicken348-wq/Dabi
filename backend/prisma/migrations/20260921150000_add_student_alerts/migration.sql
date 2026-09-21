ALTER TABLE "Enquiry" ADD COLUMN "email" TEXT;

CREATE TABLE "StudentAlertSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredArea" TEXT,
    "roomType" TEXT,
    "budget" TEXT,
    "facilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentAlertSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentAlertSubscription_email_key" ON "StudentAlertSubscription"("email");
CREATE UNIQUE INDEX "StudentAlertSubscription_unsubscribeToken_key" ON "StudentAlertSubscription"("unsubscribeToken");
CREATE INDEX "StudentAlertSubscription_active_idx" ON "StudentAlertSubscription"("active");