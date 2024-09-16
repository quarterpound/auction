/*
  Warnings:

  - Added the required column `user_id` to the `bids` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bids" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
