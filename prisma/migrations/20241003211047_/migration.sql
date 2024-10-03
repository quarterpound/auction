/*
  Warnings:

  - The primary key for the `assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `assets_on_posts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `bids` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `case_messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `passwords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `posts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_favorites` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "assets_on_posts" DROP CONSTRAINT "assets_on_posts_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "assets_on_posts" DROP CONSTRAINT "assets_on_posts_post_id_fkey";

-- DropForeignKey
ALTER TABLE "bids" DROP CONSTRAINT "bids_post_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_category_id_fkey";

-- DropForeignKey
ALTER TABLE "user_favorites" DROP CONSTRAINT "user_favorites_post_id_fkey";

-- AlterTable
ALTER TABLE "assets" DROP CONSTRAINT "assets_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "assets_id_seq";

-- AlterTable
ALTER TABLE "assets_on_posts" DROP CONSTRAINT "assets_on_posts_pkey",
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ALTER COLUMN "asset_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "assets_on_posts_pkey" PRIMARY KEY ("post_id", "asset_id");

-- AlterTable
ALTER TABLE "bids" DROP CONSTRAINT "bids_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "bids_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "bids_id_seq";

-- AlterTable
ALTER TABLE "case_messages" DROP CONSTRAINT "case_messages_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_messages_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "case_messages_id_seq";

-- AlterTable
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "category_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "categories_id_seq";

-- AlterTable
ALTER TABLE "passwords" DROP CONSTRAINT "passwords_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "passwords_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "passwords_id_seq";

-- AlterTable
ALTER TABLE "posts" DROP CONSTRAINT "posts_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "category_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "posts_id_seq";

-- AlterTable
ALTER TABLE "user_favorites" DROP CONSTRAINT "user_favorites_pkey",
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets_on_posts" ADD CONSTRAINT "assets_on_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets_on_posts" ADD CONSTRAINT "assets_on_posts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
