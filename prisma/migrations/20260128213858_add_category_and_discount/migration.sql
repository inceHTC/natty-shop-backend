-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'kadin',
ADD COLUMN     "isDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oldPrice" DOUBLE PRECISION,
ALTER COLUMN "description" DROP NOT NULL;
