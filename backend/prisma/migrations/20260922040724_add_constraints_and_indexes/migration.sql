-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "NoteTag_tagId_idx" ON "NoteTag"("tagId");
