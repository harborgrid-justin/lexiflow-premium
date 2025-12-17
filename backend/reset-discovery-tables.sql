-- Drop discovery-related tables to reset schema
DROP TABLE IF EXISTS "privilege_log_entries" CASCADE;
DROP TABLE IF EXISTS "legal_holds" CASCADE;
DROP TABLE IF EXISTS "esi_sources" CASCADE;
DROP TABLE IF EXISTS "depositions" CASCADE;
DROP TABLE IF EXISTS "discovery_requests" CASCADE;

-- TypeORM will recreate these tables with proper foreign keys
