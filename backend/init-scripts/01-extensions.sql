-- =====================================================
-- LexiFlow AI Legal Suite - PostgreSQL Extensions
-- =====================================================
-- This script enables critical PostgreSQL extensions for
-- advanced functionality including full-text search,
-- UUID generation, cryptography, hierarchical data,
-- and key-value storage.
-- =====================================================

-- Ensure we're connected to the correct database
\echo 'Enabling PostgreSQL Extensions for LexiFlow...'

-- =====================================================
-- EXTENSION: pg_trgm (Trigram Matching)
-- =====================================================
-- Provides fuzzy string matching and similarity searches
-- Critical for: Legal document search, client name matching,
-- case number fuzzy search, attorney name lookup
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\echo '✓ pg_trgm extension enabled (trigram matching for fuzzy search)'

-- =====================================================
-- EXTENSION: uuid-ossp (UUID Generation)
-- =====================================================
-- Provides functions to generate UUIDs
-- Used for: Primary keys, unique identifiers across entities
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\echo '✓ uuid-ossp extension enabled (UUID generation)'

-- =====================================================
-- EXTENSION: pgcrypto (Cryptographic Functions)
-- =====================================================
-- Provides cryptographic functions for data security
-- Used for: Password hashing, sensitive data encryption,
-- API key hashing, secure token generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\echo '✓ pgcrypto extension enabled (cryptographic functions)'

-- =====================================================
-- EXTENSION: ltree (Hierarchical Tree Labels)
-- =====================================================
-- Provides hierarchical tree-like structures
-- Used for: Document folder hierarchies, case phase trees,
-- organizational structures, permission trees
CREATE EXTENSION IF NOT EXISTS ltree;
\echo '✓ ltree extension enabled (hierarchical tree labels)'

-- =====================================================
-- EXTENSION: hstore (Key-Value Storage)
-- =====================================================
-- Provides key-value pair storage in a single column
-- Used for: Dynamic attributes, custom fields,
-- flexible metadata storage
CREATE EXTENSION IF NOT EXISTS hstore;
\echo '✓ hstore extension enabled (key-value storage)'

-- =====================================================
-- EXTENSION: btree_gin (B-tree GIN Indexing)
-- =====================================================
-- Enables GIN indexes on scalar types for better performance
-- Used for: Composite indexes on JSONB and text fields
CREATE EXTENSION IF NOT EXISTS btree_gin;
\echo '✓ btree_gin extension enabled (B-tree GIN indexing)'

-- =====================================================
-- EXTENSION: unaccent (Remove Accents)
-- =====================================================
-- Removes accents from text for normalized searching
-- Used for: International client names, multilingual search
CREATE EXTENSION IF NOT EXISTS unaccent;
\echo '✓ unaccent extension enabled (accent removal for search)'

-- =====================================================
-- Verify all extensions are installed
-- =====================================================
\echo ''
\echo 'Installed Extensions:'
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('pg_trgm', 'uuid-ossp', 'pgcrypto', 'ltree', 'hstore', 'btree_gin', 'unaccent')
ORDER BY extname;

\echo ''
\echo '✓ All PostgreSQL extensions successfully enabled!'
