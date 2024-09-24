/*
  Warnings:

  - Added the required column `small_height` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `small_width` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "small_height" INTEGER NOT NULL,
ADD COLUMN     "small_width" INTEGER NOT NULL;
