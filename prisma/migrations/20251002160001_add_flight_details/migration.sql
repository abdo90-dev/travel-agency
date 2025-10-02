/*
  Warnings:

  - You are about to drop the column `destination` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "destination",
DROP COLUMN "origin",
ADD COLUMN     "airline" TEXT,
ADD COLUMN     "arrival_time" TIMESTAMP(3),
ADD COLUMN     "departure_time" TIMESTAMP(3),
ADD COLUMN     "destination_city" TEXT,
ADD COLUMN     "destination_code" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "extras" JSONB,
ADD COLUMN     "flight_number" TEXT,
ADD COLUMN     "origin_city" TEXT,
ADD COLUMN     "origin_code" TEXT;
