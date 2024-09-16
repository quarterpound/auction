/*
  Warnings:

  - You are about to drop the `Bids` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bids" DROP CONSTRAINT "Bids_post_id_fkey";

-- DropTable
DROP TABLE "Bids";

-- CreateTable
CREATE TABLE "bids" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
