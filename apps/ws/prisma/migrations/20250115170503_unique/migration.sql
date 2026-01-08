/*
  Warnings:

  - A unique constraint covering the columns `[userId,spaceId]` on the table `UserSpace` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_space_unique";

-- CreateIndex
CREATE UNIQUE INDEX "UserSpace_userId_spaceId_key" ON "UserSpace"("userId", "spaceId");
