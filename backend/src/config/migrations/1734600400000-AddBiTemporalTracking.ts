import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBiTemporalTracking1734600400000 implements MigrationInterface {
    name = 'AddBiTemporalTracking1734600400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add temporal columns to cases
        await queryRunner.query(`
            ALTER TABLE "cases" 
            ADD COLUMN valid_from timestamp without time zone NOT NULL DEFAULT now(),
            ADD COLUMN valid_to timestamp without time zone DEFAULT 'infinity'::timestamp,
            ADD COLUMN transaction_time timestamp without time zone NOT NULL DEFAULT now()
        `);

        await queryRunner.query(`CREATE INDEX idx_cases_temporal ON "cases"(id, valid_from, valid_to)`);

        // Create cases history table
        await queryRunner.query(`
            CREATE TABLE cases_history (
                history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                id uuid NOT NULL,
                case_number character varying,
                title character varying NOT NULL,
                description text,
                status character varying NOT NULL,
                priority character varying,
                client_id uuid,
                assigned_attorney_id character varying,
                filing_date date,
                close_date date,
                statute_of_limitations date,
                trial_date date,
                court character varying,
                judge character varying,
                jurisdiction character varying,
                practice_area character varying,
                case_type character varying,
                estimated_value numeric(10,2),
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                valid_from timestamp without time zone NOT NULL,
                valid_to timestamp without time zone NOT NULL,
                transaction_time timestamp without time zone NOT NULL,
                operation_type character varying NOT NULL
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_cases_history_id ON cases_history(id, valid_from DESC)`);
        await queryRunner.query(`CREATE INDEX idx_cases_history_transaction ON cases_history(transaction_time DESC)`);

        // Create trigger for cases history
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION record_case_history()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP = 'UPDATE' THEN
                    -- Close previous version
                    UPDATE cases SET valid_to = now() WHERE id = NEW.id AND valid_to = 'infinity'::timestamp;
                    
                    -- Record history
                    INSERT INTO cases_history (
                        id, case_number, title, description, status, priority, 
                        client_id, assigned_attorney_id, filing_date, close_date, 
                        statute_of_limitations, trial_date, court, judge, jurisdiction, 
                        practice_area, case_type, estimated_value, created_at, updated_at,
                        valid_from, valid_to, transaction_time, operation_type
                    ) VALUES (
                        OLD.id, OLD.case_number, OLD.title, OLD.description, OLD.status, OLD.priority,
                        OLD.client_id, OLD.assigned_attorney_id, OLD.filing_date, OLD.close_date,
                        OLD.statute_of_limitations, OLD.trial_date, OLD.court, OLD.judge, OLD.jurisdiction,
                        OLD.practice_area, OLD.case_type, OLD.estimated_value, OLD.created_at, OLD.updated_at,
                        OLD.valid_from, now(), now(), 'UPDATE'
                    );
                ELSIF TG_OP = 'DELETE' THEN
                    -- Record deletion
                    INSERT INTO cases_history (
                        id, case_number, title, description, status, priority,
                        client_id, assigned_attorney_id, filing_date, close_date,
                        statute_of_limitations, trial_date, court, judge, jurisdiction,
                        practice_area, case_type, estimated_value, created_at, updated_at,
                        valid_from, valid_to, transaction_time, operation_type
                    ) VALUES (
                        OLD.id, OLD.case_number, OLD.title, OLD.description, OLD.status, OLD.priority,
                        OLD.client_id, OLD.assigned_attorney_id, OLD.filing_date, OLD.close_date,
                        OLD.statute_of_limitations, OLD.trial_date, OLD.court, OLD.judge, OLD.jurisdiction,
                        OLD.practice_area, OLD.case_type, OLD.estimated_value, OLD.created_at, OLD.updated_at,
                        OLD.valid_from, now(), now(), 'DELETE'
                    );
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER cases_history_trigger
            AFTER UPDATE OR DELETE ON cases
            FOR EACH ROW
            EXECUTE FUNCTION record_case_history();
        `);

        // Add temporal columns to documents
        await queryRunner.query(`
            ALTER TABLE "documents"
            ADD COLUMN valid_from timestamp without time zone NOT NULL DEFAULT now(),
            ADD COLUMN valid_to timestamp without time zone DEFAULT 'infinity'::timestamp,
            ADD COLUMN transaction_time timestamp without time zone NOT NULL DEFAULT now()
        `);

        await queryRunner.query(`CREATE INDEX idx_documents_temporal ON "documents"(id, valid_from, valid_to)`);

        // Create documents history table
        await queryRunner.query(`
            CREATE TABLE documents_history (
                history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                id uuid NOT NULL,
                title character varying NOT NULL,
                description text,
                file_path character varying NOT NULL,
                file_size integer,
                mime_type character varying,
                status character varying NOT NULL,
                case_id character varying,
                uploaded_by character varying,
                tags text[],
                category character varying,
                confidential boolean,
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                valid_from timestamp without time zone NOT NULL,
                valid_to timestamp without time zone NOT NULL,
                transaction_time timestamp without time zone NOT NULL,
                operation_type character varying NOT NULL
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_documents_history_id ON documents_history(id, valid_from DESC)`);
        await queryRunner.query(`CREATE INDEX idx_documents_history_transaction ON documents_history(transaction_time DESC)`);

        // Create trigger for documents history
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION record_document_history()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP = 'UPDATE' THEN
                    UPDATE documents SET valid_to = now() WHERE id = NEW.id AND valid_to = 'infinity'::timestamp;
                    
                    INSERT INTO documents_history (
                        id, title, description, file_path, file_size, mime_type,
                        status, case_id, uploaded_by, tags, category, confidential,
                        created_at, updated_at, valid_from, valid_to, transaction_time, operation_type
                    ) VALUES (
                        OLD.id, OLD.title, OLD.description, OLD.file_path, OLD.file_size, OLD.mime_type,
                        OLD.status, OLD.case_id, OLD.uploaded_by, OLD.tags, OLD.category, OLD.confidential,
                        OLD.created_at, OLD.updated_at, OLD.valid_from, now(), now(), 'UPDATE'
                    );
                ELSIF TG_OP = 'DELETE' THEN
                    INSERT INTO documents_history (
                        id, title, description, file_path, file_size, mime_type,
                        status, case_id, uploaded_by, tags, category, confidential,
                        created_at, updated_at, valid_from, valid_to, transaction_time, operation_type
                    ) VALUES (
                        OLD.id, OLD.title, OLD.description, OLD.file_path, OLD.file_size, OLD.mime_type,
                        OLD.status, OLD.case_id, OLD.uploaded_by, OLD.tags, OLD.category, OLD.confidential,
                        OLD.created_at, OLD.updated_at, OLD.valid_from, now(), now(), 'DELETE'
                    );
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER documents_history_trigger
            AFTER UPDATE OR DELETE ON documents
            FOR EACH ROW
            EXECUTE FUNCTION record_document_history();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop documents history
        await queryRunner.query(`DROP TRIGGER IF EXISTS documents_history_trigger ON documents`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS record_document_history()`);
        await queryRunner.query(`DROP TABLE IF EXISTS documents_history`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_documents_temporal`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS valid_from, DROP COLUMN IF EXISTS valid_to, DROP COLUMN IF EXISTS transaction_time`);

        // Drop cases history
        await queryRunner.query(`DROP TRIGGER IF EXISTS cases_history_trigger ON cases`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS record_case_history()`);
        await queryRunner.query(`DROP TABLE IF EXISTS cases_history`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_cases_temporal`);
        await queryRunner.query(`ALTER TABLE "cases" DROP COLUMN IF EXISTS valid_from, DROP COLUMN IF EXISTS valid_to, DROP COLUMN IF EXISTS transaction_time`);
    }
}
