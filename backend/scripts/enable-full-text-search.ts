// scripts/enable-full-text-search.ts
import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const setupFullTextSearch = async () => {
  console.log("🔍 Starting Full-Text Search Setup...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not defined in environment variables.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("neon.tech")
      ? { rejectUnauthorized: true }
      : false, // Handle Neon SSL if needed, usually 'true' is good for production-like envs
  });

  try {
    console.log("🔌 Connecting to database...");
    await client.connect();

    console.log("📦 Enabling extensions...");
    await client.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch"');
    console.log("✅ Extensions enabled (pg_trgm, fuzzystrmatch).");

    console.log("📑 Creating GIN indexes...");

    // Title Index
    console.log('  - Creating index on "cases"("title")...');
    await client.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cases_title_trgm" ON "cases" USING GIN ("title" gin_trgm_ops)`
    );

    // Case Number Index
    console.log('  - Creating index on "cases"("case_number")...');
    await client.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cases_number_trgm" ON "cases" USING GIN ("case_number" gin_trgm_ops)`
    );

    // Description Index
    console.log('  - Creating index on "cases"("description")...');
    await client.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cases_description_trgm" ON "cases" USING GIN ("description" gin_trgm_ops)`
    );

    console.log("✅ GIN indexes created successfully.");
    console.log("🎉 Full-Text Search setup complete!");
  } catch (error) {
    console.error("❌ Error enforcing full-text search:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

setupFullTextSearch();
