-- Create jurisdictions table
CREATE TABLE IF NOT EXISTS "jurisdictions" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(255) NOT NULL,
  "system" varchar(50) NOT NULL CHECK ("system" IN ('Federal', 'State', 'Regulatory', 'International', 'Arbitration', 'Local')),
  "type" varchar(100) NOT NULL,
  "region" varchar(255),
  "description" text,
  "website" varchar(500),
  "rulesUrl" varchar(500),
  "code" varchar(100),
  "metadata" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for jurisdictions
CREATE INDEX IF NOT EXISTS "IDX_jurisdiction_system" ON "jurisdictions" ("system");
CREATE INDEX IF NOT EXISTS "IDX_jurisdiction_code" ON "jurisdictions" ("code");
CREATE INDEX IF NOT EXISTS "IDX_jurisdiction_region" ON "jurisdictions" ("region");

-- Create jurisdiction_rules table
CREATE TABLE IF NOT EXISTS "jurisdiction_rules" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "jurisdictionId" uuid NOT NULL,
  "code" varchar(100) NOT NULL,
  "name" varchar(500) NOT NULL,
  "type" varchar(50) NOT NULL CHECK ("type" IN ('Procedural', 'Evidentiary', 'Civil', 'Criminal', 'Administrative', 'Local', 'Standing Order', 'Practice Guide')),
  "description" text,
  "fullText" text,
  "url" varchar(500),
  "citations" jsonb,
  "effectiveDate" date,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "FK_jurisdiction_rules_jurisdictionId" FOREIGN KEY ("jurisdictionId") 
    REFERENCES "jurisdictions"("id") ON DELETE CASCADE
);

-- Create indexes for jurisdiction_rules
CREATE INDEX IF NOT EXISTS "IDX_jurisdiction_rules_jurisdictionId" ON "jurisdiction_rules" ("jurisdictionId");
CREATE INDEX IF NOT EXISTS "IDX_jurisdiction_rules_code" ON "jurisdiction_rules" ("code");
CREATE INDEX IF NOT EXISTS "IDX_jurisdiction_rules_type" ON "jurisdiction_rules" ("type");
CREATE INDEX IF NOT EXISTS "IDX_jurisdiction_rules_isActive" ON "jurisdiction_rules" ("isActive");

-- Seed sample federal courts
INSERT INTO "jurisdictions" ("name", "system", "type", "region", "code", "description", "rulesUrl", "metadata")
SELECT * FROM (VALUES
  ('Supreme Court of the United States', 'Federal', 'Supreme Court', 'National', 'SCOTUS', 'Highest court in the United States', 'https://www.supremecourt.gov/rules/', '{"iconColor": "text-blue-800"}'::jsonb),
  ('United States Court of Appeals for the Ninth Circuit', 'Federal', 'Circuit Court', '9th Circuit', '9th Cir.', 'Federal appellate court covering the western United States', 'https://www.ca9.uscourts.gov/rules/', '{"iconColor": "text-blue-600"}'::jsonb),
  ('United States District Court for the Northern District of California', 'Federal', 'District Court', 'N.D. Cal', 'N.D. Cal', 'Federal trial court in Northern California', 'https://www.cand.uscourts.gov/rules/', '{"iconColor": "text-blue-500"}'::jsonb),
  ('United States Court of Appeals for the Second Circuit', 'Federal', 'Circuit Court', '2nd Circuit', '2nd Cir.', 'Federal appellate court covering New York, Connecticut, and Vermont', 'https://www.ca2.uscourts.gov/rules/', '{"iconColor": "text-blue-600"}'::jsonb),
  ('United States District Court for the Southern District of New York', 'Federal', 'District Court', 'S.D.N.Y.', 'S.D.N.Y.', 'Federal trial court in Southern New York', 'https://www.nysd.uscourts.gov/rules/', '{"iconColor": "text-blue-500"}'::jsonb)
) AS v("name", "system", "type", "region", "code", "description", "rulesUrl", "metadata")
WHERE NOT EXISTS (SELECT 1 FROM "jurisdictions" WHERE "code" = v."code");

-- Seed sample state courts
INSERT INTO "jurisdictions" ("name", "system", "type", "region", "code", "description", "metadata")
SELECT * FROM (VALUES
  ('California Supreme Court', 'State', 'Supreme Court', 'California', 'Cal. S.Ct.', 'Highest court in California state system', '{"iconColor": "text-emerald-600"}'::jsonb),
  ('Superior Court of California, San Francisco County', 'State', 'Trial Court', 'San Francisco', 'SF Superior', 'Trial court for San Francisco County', '{"iconColor": "text-emerald-500"}'::jsonb),
  ('New York Court of Appeals', 'State', 'Supreme Court', 'New York', 'NY Ct. App.', 'Highest court in New York state system', '{"iconColor": "text-emerald-600"}'::jsonb),
  ('New York Supreme Court', 'State', 'Trial Court', 'New York', 'NY Sup. Ct.', 'General jurisdiction trial court in New York', '{"iconColor": "text-emerald-500"}'::jsonb)
) AS v("name", "system", "type", "region", "code", "description", "metadata")
WHERE NOT EXISTS (SELECT 1 FROM "jurisdictions" WHERE "code" = v."code");

-- Seed sample regulatory bodies
INSERT INTO "jurisdictions" ("name", "system", "type", "description", "code", "website", "metadata")
SELECT * FROM (VALUES
  ('Federal Trade Commission', 'Regulatory', 'Regulatory Body', 'Protects consumers and promotes competition', 'FTC', 'https://www.ftc.gov', '{"iconColor": "text-purple-600", "status": "Active"}'::jsonb),
  ('Securities and Exchange Commission', 'Regulatory', 'Regulatory Body', 'Regulates securities markets', 'SEC', 'https://www.sec.gov', '{"iconColor": "text-purple-600", "status": "Active"}'::jsonb),
  ('Environmental Protection Agency', 'Regulatory', 'Regulatory Body', 'Protects human health and the environment', 'EPA', 'https://www.epa.gov', '{"iconColor": "text-green-600", "status": "Active"}'::jsonb)
) AS v("name", "system", "type", "description", "code", "website", "metadata")
WHERE NOT EXISTS (SELECT 1 FROM "jurisdictions" WHERE "code" = v."code");

-- Seed sample arbitration providers
INSERT INTO "jurisdictions" ("name", "system", "type", "description", "code", "website", "metadata")
SELECT * FROM (VALUES
  ('American Arbitration Association', 'Arbitration', 'Arbitration Provider', 'Leading provider of alternative dispute resolution services', 'AAA', 'https://www.adr.org', '{"fullName": "American Arbitration Association", "status": "Active"}'::jsonb),
  ('JAMS', 'Arbitration', 'Arbitration Provider', 'Largest private provider of mediation and arbitration', 'JAMS', 'https://www.jamsadr.com', '{"fullName": "Judicial Arbitration and Mediation Services", "status": "Active"}'::jsonb)
) AS v("name", "system", "type", "description", "code", "website", "metadata")
WHERE NOT EXISTS (SELECT 1 FROM "jurisdictions" WHERE "code" = v."code");

-- Seed sample rules (only if SCOTUS exists and has no rules yet)
INSERT INTO "jurisdiction_rules" ("jurisdictionId", "code", "name", "type", "description", "isActive")
SELECT 
  j.id,
  'FRCP ' || series.n,
  'Federal Rules of Civil Procedure Rule ' || series.n,
  'Procedural'::varchar,
  'Rule ' || series.n || ' of the Federal Rules of Civil Procedure',
  true
FROM "jurisdictions" j
CROSS JOIN generate_series(1, 10) AS series(n)
WHERE j."code" = 'SCOTUS'
  AND NOT EXISTS (
    SELECT 1 FROM "jurisdiction_rules" r 
    WHERE r."jurisdictionId" = j.id AND r."code" = 'FRCP ' || series.n
  )
LIMIT 10;

-- Record migration
INSERT INTO "migrations" ("timestamp", "name")
SELECT 1734480500000, 'CreateJurisdictionTables1734480500000'
WHERE NOT EXISTS (
  SELECT 1 FROM "migrations" WHERE "name" = 'CreateJurisdictionTables1734480500000'
);
