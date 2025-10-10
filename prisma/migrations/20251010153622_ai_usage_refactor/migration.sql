/*
  Warnings:

  - Added the required column `tokenType` to the `AiUsage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TokenType" AS ENUM ('INPUT', 'OUTPUT');

-- AlterTable
ALTER TABLE "public"."AiUsage" ADD COLUMN     "tokenType" "public"."TokenType" NOT NULL;
