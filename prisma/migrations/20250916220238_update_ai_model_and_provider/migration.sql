/*
  Warnings:

  - You are about to drop the column `active` on the `AiModel` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `AiProvider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AiModel" DROP COLUMN "active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."AiProvider" DROP COLUMN "active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
