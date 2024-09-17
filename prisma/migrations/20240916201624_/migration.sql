/*
  Warnings:

  - You are about to drop the `Assets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Assets";

-- CreateTable
CREATE TABLE "assets_on_posts" (
    "post_id" INTEGER NOT NULL,
    "asset_id" INTEGER NOT NULL,

    CONSTRAINT "assets_on_posts_pkey" PRIMARY KEY ("post_id","asset_id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assets_on_posts" ADD CONSTRAINT "assets_on_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets_on_posts" ADD CONSTRAINT "assets_on_posts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
