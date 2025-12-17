-- Create calendar_events table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events("startDate");
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events("caseId");

-- Add some sample data for testing
INSERT INTO calendar_events (title, "eventType", "startDate", "endDate", description, "caseId")
VALUES 
  ('Discovery Deadline', 'Deadline', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '7 days', 'Complete all discovery by this date', 'CASE-001'),
  ('Court Hearing', 'Hearing', CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP + INTERVAL '14 days', 'Preliminary hearing', 'CASE-002')
ON CONFLICT DO NOTHING;
