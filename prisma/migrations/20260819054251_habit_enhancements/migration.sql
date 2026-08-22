-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "daysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "freezesAvailable" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "freezesUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reminderTime" TEXT;

-- AlterTable
ALTER TABLE "HabitCompletion" ADD COLUMN     "isFreeze" BOOLEAN NOT NULL DEFAULT false;
