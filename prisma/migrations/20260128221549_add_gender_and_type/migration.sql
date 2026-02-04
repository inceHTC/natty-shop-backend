/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'kadin',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ayakkabi';
