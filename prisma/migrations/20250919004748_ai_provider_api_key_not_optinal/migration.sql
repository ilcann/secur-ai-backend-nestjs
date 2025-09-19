/*
  Warnings:

  - Made the column `apiKey` on table `AiProvider` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."AiProvider" ALTER COLUMN "apiKey" SET NOT NULL;
