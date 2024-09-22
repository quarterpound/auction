/*
  Warnings:

  - A unique constraint covering the columns `[post_id,asset_id]` on the table `assets_on_posts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "assets_on_posts_post_id_asset_id_key" ON "assets_on_posts"("post_id", "asset_id");
