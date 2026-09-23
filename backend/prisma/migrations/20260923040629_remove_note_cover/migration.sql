/*
  Warnings:

  - You are about to drop the column `coverColor` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `coverEmoji` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "coverColor",
DROP COLUMN "coverEmoji";
