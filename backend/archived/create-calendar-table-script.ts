/**
 * Quick script to create the calendar_events table
 * Run with: npm run ts-node create-calendar-table-script.ts
 */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const sql = `
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    "eventType" VARCHAR NOT NULL DEFAULT 'Reminder',
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    description VARCHAR NULL,
    location VARCHAR NULL,
    attendees JSON NULL,
    "caseId" VARCHAR NULL,
    reminder VARCHAR NULL,
    completed BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events("startDate");
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events("caseId");

INSERT INTO calendar_events (title, "eventType", "startDate", "endDate", description, "caseId")
VALUES 
  ('Discovery Deadline', 'Deadline', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '7 days', 'Complete all discovery by this date', 'CASE-001'),
  ('Court Hearing', 'Hearing', CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP + INTERVAL '14 days', 'Preliminary hearing', 'CASE-002')
ON CONFLICT DO NOTHING;
`;

async function createTable() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'lexiflow_user',
    password: process.env.DB_PASSWORD || 'lexiflow_password',
    database: process.env.DB_DATABASE || 'lexiflow_db',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    
    console.log('Creating calendar_events table...');
    await dataSource.query(sql);
    
    console.log('✅ Table created successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createTable();
