-- CreateTable
CREATE TABLE "public"."Disease" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "crops" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "prevention" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disease_pkey" PRIMARY KEY ("id")
);
