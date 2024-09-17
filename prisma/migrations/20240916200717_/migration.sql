-- CreateTable
CREATE TABLE "Assets" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("id")
);
