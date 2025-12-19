-- Make clientId nullable in cases table
ALTER TABLE cases ALTER COLUMN "clientId" DROP NOT NULL;
