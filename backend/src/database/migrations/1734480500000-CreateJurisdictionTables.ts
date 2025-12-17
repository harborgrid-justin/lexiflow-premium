import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJurisdictionTables1734480500000 implements MigrationInterface {
  name = 'CreateJurisdictionTables1734480500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create jurisdictions table
    await queryRunner.query(`
      CREATE TABLE "jurisdictions" (
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
      )
    `);

    // Create indexes for jurisdictions
    await queryRunner.query(`CREATE INDEX "IDX_jurisdiction_system" ON "jurisdictions" ("system")`);
    await queryRunner.query(`CREATE INDEX "IDX_jurisdiction_code" ON "jurisdictions" ("code")`);
    await queryRunner.query(`CREATE INDEX "IDX_jurisdiction_region" ON "jurisdictions" ("region")`);

    // Create jurisdiction_rules table
    await queryRunner.query(`
      CREATE TABLE "jurisdiction_rules" (
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
      )
    `);

    // Create indexes for jurisdiction_rules
    await queryRunner.query(`CREATE INDEX "IDX_jurisdiction_rules_jurisdictionId" ON "jurisdiction_rules" ("jurisdictionId")`);
    await queryRunner.query(`CREATE INDEX "IDX_jurisdiction_rules_code" ON "jurisdiction_rules" ("code")`);
    await queryRunner.query(`CREATE INDEX "IDX_jurisdiction_rules_type" ON "jurisdiction_rules" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_jurisdiction_rules_isActive" ON "jurisdiction_rules" ("isActive")`);

    // Seed sample federal courts
    await queryRunner.query(`
      INSERT INTO "jurisdictions" ("name", "system", "type", "region", "code", "description", "rulesUrl", "metadata") VALUES
      ('Supreme Court of the United States', 'Federal', 'Supreme Court', 'National', 'SCOTUS', 'Highest court in the United States', 'https://www.supremecourt.gov/rules/', '{"iconColor": "text-blue-800"}'),
      ('United States Court of Appeals for the Ninth Circuit', 'Federal', 'Circuit Court', '9th Circuit', '9th Cir.', 'Federal appellate court covering the western United States', 'https://www.ca9.uscourts.gov/rules/', '{"iconColor": "text-blue-600"}'),
      ('United States District Court for the Northern District of California', 'Federal', 'District Court', 'N.D. Cal', 'N.D. Cal', 'Federal trial court in Northern California', 'https://www.cand.uscourts.gov/rules/', '{"iconColor": "text-blue-500"}'),
      ('United States Court of Appeals for the Second Circuit', 'Federal', 'Circuit Court', '2nd Circuit', '2nd Cir.', 'Federal appellate court covering New York, Connecticut, and Vermont', 'https://www.ca2.uscourts.gov/rules/', '{"iconColor": "text-blue-600"}'),
      ('United States District Court for the Southern District of New York', 'Federal', 'District Court', 'S.D.N.Y.', 'S.D.N.Y.', 'Federal trial court in Southern New York', 'https://www.nysd.uscourts.gov/rules/', '{"iconColor": "text-blue-500"}')
    `);

    // Seed sample state courts
    await queryRunner.query(`
      INSERT INTO "jurisdictions" ("name", "system", "type", "region", "code", "description", "metadata") VALUES
      ('California Supreme Court', 'State', 'Supreme Court', 'California', 'Cal. S.Ct.', 'Highest court in California state system', '{"iconColor": "text-emerald-600"}'),
      ('Superior Court of California, San Francisco County', 'State', 'Trial Court', 'San Francisco', 'SF Superior', 'Trial court for San Francisco County', '{"iconColor": "text-emerald-500"}'),
      ('New York Court of Appeals', 'State', 'Supreme Court', 'New York', 'NY Ct. App.', 'Highest court in New York state system', '{"iconColor": "text-emerald-600"}'),
      ('New York Supreme Court', 'State', 'Trial Court', 'New York', 'NY Sup. Ct.', 'General jurisdiction trial court in New York', '{"iconColor": "text-emerald-500"}')
    `);

    // Seed sample regulatory bodies
    await queryRunner.query(`
      INSERT INTO "jurisdictions" ("name", "system", "type", "description", "code", "website", "metadata") VALUES
      ('Federal Trade Commission', 'Regulatory', 'Regulatory Body', 'Protects consumers and promotes competition', 'FTC', 'https://www.ftc.gov', '{"iconColor": "text-purple-600", "status": "Active"}'),
      ('Securities and Exchange Commission', 'Regulatory', 'Regulatory Body', 'Regulates securities markets', 'SEC', 'https://www.sec.gov', '{"iconColor": "text-purple-600", "status": "Active"}'),
      ('Environmental Protection Agency', 'Regulatory', 'Regulatory Body', 'Protects human health and the environment', 'EPA', 'https://www.epa.gov', '{"iconColor": "text-green-600", "status": "Active"}')
    `);

    // Seed sample arbitration providers
    await queryRunner.query(`
      INSERT INTO "jurisdictions" ("name", "system", "type", "description", "code", "website", "metadata") VALUES
      ('American Arbitration Association', 'Arbitration', 'Arbitration Provider', 'Leading provider of alternative dispute resolution services', 'AAA', 'https://www.adr.org', '{"fullName": "American Arbitration Association", "status": "Active"}'),
      ('JAMS', 'Arbitration', 'Arbitration Provider', 'Largest private provider of mediation and arbitration', 'JAMS', 'https://www.jamsadr.com', '{"fullName": "Judicial Arbitration and Mediation Services", "status": "Active"}')
    `);

    // Seed sample rules
    await queryRunner.query(`
      INSERT INTO "jurisdiction_rules" ("jurisdictionId", "code", "name", "type", "description", "isActive")
      SELECT 
        id,
        'FRCP ' || series.n,
        'Federal Rules of Civil Procedure Rule ' || series.n,
        'Procedural',
        'Rule ' || series.n || ' of the Federal Rules of Civil Procedure',
        true
      FROM "jurisdictions"
      CROSS JOIN generate_series(1, 10) AS series(n)
      WHERE "code" = 'SCOTUS'
      LIMIT 10
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "jurisdiction_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jurisdictions"`);
  }
}
