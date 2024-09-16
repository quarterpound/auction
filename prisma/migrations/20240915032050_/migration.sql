/*
  Warnings:

  - Added the required column `currency` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "currency" TEXT NOT NULL;
