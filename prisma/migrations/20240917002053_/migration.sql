/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "assets_on_posts" DROP CONSTRAINT "assets_on_posts_asset_id_fkey";

-- DropTable
DROP TABLE "Asset";

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assets_on_posts" ADD CONSTRAINT "assets_on_posts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
