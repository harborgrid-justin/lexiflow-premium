-- Create document_reviewers table
-- Migration: create-document-reviewers-table
-- Date: 2025-12-26

CREATE TABLE IF NOT EXISTS document_reviewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    review_status VARCHAR(50) DEFAULT 'pending',
    assigned_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_document_reviewers_document 
        FOREIGN KEY (document_id) 
        REFERENCES documents(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_document_reviewers_reviewer 
        FOREIGN KEY (reviewer_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
        
    -- Unique constraint to prevent duplicate reviewer assignments
    CONSTRAINT uk_document_reviewer 
        UNIQUE (document_id, reviewer_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_document_reviewers_document_id ON document_reviewers(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviewers_reviewer_id ON document_reviewers(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_document_reviewers_status ON document_reviewers(review_status);

-- Insert some sample data for testing
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users LIMIT 1) AND EXISTS (SELECT 1 FROM documents LIMIT 1) THEN
        INSERT INTO document_reviewers (document_id, reviewer_id, review_status) 
        SELECT 
            d.id,
            u.id,
            'pending'
        FROM documents d, users u 
        WHERE d.status = 'under_review' 
        LIMIT 3
        ON CONFLICT (document_id, reviewer_id) DO NOTHING;
        
        RAISE NOTICE 'Sample document reviewer assignments created';
    ELSE
        RAISE NOTICE 'No users or documents found - skipping sample data';
    END IF;
END
$$;