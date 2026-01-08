/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `Map` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the `Element` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MapElements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpaceElements` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mapId` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MapElements" DROP CONSTRAINT "MapElements_elementId_fkey";

-- DropForeignKey
ALTER TABLE "MapElements" DROP CONSTRAINT "MapElements_mapId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceElements" DROP CONSTRAINT "SpaceElements_elementId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceElements" DROP CONSTRAINT "SpaceElements_spaceId_fkey";

-- AlterTable
ALTER TABLE "Map" DROP COLUMN "thumbnail",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "thumbnail",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mapId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Element";

-- DropTable
DROP TABLE "MapElements";

-- DropTable
DROP TABLE "SpaceElements";

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
