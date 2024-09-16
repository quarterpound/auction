/*
  Warnings:

  - Added the required column `bid_increment` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "bid_increment" DOUBLE PRECISION NOT NULL;
