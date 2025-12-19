import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeUserProfileJsonb1734600700000 implements MigrationInterface {
    name = 'NormalizeUserProfileJsonb1734600700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_certifications junction table
        await queryRunner.query(`
            CREATE TABLE user_certifications (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id character varying NOT NULL,
                certification_name character varying NOT NULL,
                issuing_organization character varying,
                issue_date date,
                expiration_date date,
                credential_id character varying,
                credential_url character varying,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT fk_user_certifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_user_certifications_user ON user_certifications(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_user_certifications_expiration ON user_certifications(expiration_date) WHERE expiration_date IS NOT NULL`);

        // Create user_languages table
        await queryRunner.query(`
            CREATE TABLE user_languages (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id character varying NOT NULL,
                language_name character varying NOT NULL,
                proficiency character varying CHECK (proficiency IN ('Native', 'Fluent', 'Professional', 'Limited', 'Basic')),
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT fk_user_languages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT unique_user_language UNIQUE (user_id, language_name)
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_user_languages_user ON user_languages(user_id)`);

        // Create user_practice_areas table
        await queryRunner.query(`
            CREATE TABLE user_practice_areas (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id character varying NOT NULL,
                practice_area_name character varying NOT NULL,
                years_experience integer CHECK (years_experience >= 0),
                is_primary boolean DEFAULT false,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT fk_user_practice_areas_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT unique_user_practice_area UNIQUE (user_id, practice_area_name)
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_user_practice_areas_user ON user_practice_areas(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_user_practice_areas_primary ON user_practice_areas(user_id, is_primary) WHERE is_primary = true`);

        // Create user_publications table
        await queryRunner.query(`
            CREATE TABLE user_publications (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id character varying NOT NULL,
                title character varying NOT NULL,
                publication_type character varying CHECK (publication_type IN ('Article', 'Book', 'Chapter', 'Paper', 'Blog')),
                publisher character varying,
                publication_date date,
                url character varying,
                description text,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT fk_user_publications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_user_publications_user ON user_publications(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_user_publications_date ON user_publications(publication_date DESC)`);

        // Create user_awards table
        await queryRunner.query(`
            CREATE TABLE user_awards (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id character varying NOT NULL,
                award_name character varying NOT NULL,
                issuing_organization character varying,
                award_date date,
                description text,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT fk_user_awards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_user_awards_user ON user_awards(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_user_awards_date ON user_awards(award_date DESC)`);

        // Create user_professional_memberships table
        await queryRunner.query(`
            CREATE TABLE user_professional_memberships (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id character varying NOT NULL,
                organization_name character varying NOT NULL,
                membership_type character varying,
                start_date date,
                end_date date,
                is_current boolean DEFAULT true,
                position character varying,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT fk_user_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_user_memberships_user ON user_memberships(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_user_memberships_current ON user_memberships(user_id, is_current) WHERE is_current = true`);

        // Migrate existing JSONB data to new tables
        // Note: This requires custom logic based on actual JSONB structure
        // Placeholder for data migration - actual implementation needed
        await queryRunner.query(`
            -- Migration script placeholder
            -- Actual data migration would parse JSONB and insert into new tables
            -- Example structure (adjust based on actual JSONB schema):
            /*
            INSERT INTO user_certifications (user_id, certification_name, issuing_organization)
            SELECT 
                id,
                cert->>'name',
                cert->>'organization'
            FROM user_profiles,
            jsonb_array_elements(certifications) AS cert;
            */
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS user_professional_memberships`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_awards`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_publications`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_practice_areas`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_languages`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_certifications`);
    }
}
