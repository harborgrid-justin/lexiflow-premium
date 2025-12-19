-- Create matters table with enums
CREATE TYPE matters_status_enum AS ENUM('ACTIVE', 'PENDING', 'ON_HOLD', 'CLOSED', 'ARCHIVED', 'CANCELLED');
CREATE TYPE matters_type_enum AS ENUM('LITIGATION', 'TRANSACTIONAL', 'ADVISORY', 'CORPORATE', 'INTELLECTUAL_PROPERTY', 'REAL_ESTATE', 'EMPLOYMENT', 'TAX', 'OTHER');
CREATE TYPE matters_priority_enum AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE matters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matterNumber VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status matters_status_enum NOT NULL DEFAULT 'ACTIVE',
    type matters_type_enum NOT NULL,
    priority matters_priority_enum NOT NULL DEFAULT 'MEDIUM',
    
    -- Client relationship
    clientId UUID,
    clientName VARCHAR(300),
    
    -- Attorney assignments
    responsibleAttorneyId UUID,
    responsibleAttorneyName VARCHAR(200),
    originatingAttorneyId UUID,
    originatingAttorneyName VARCHAR(200),
    
    -- Practice area and jurisdiction
    practiceArea VARCHAR(200),
    jurisdiction VARCHAR(200),
    venue VARCHAR(200),
    
    -- Financial information
    billingArrangement VARCHAR(100),
    hourlyRate DECIMAL(10,2),
    flatFee DECIMAL(10,2),
    contingencyPercentage DECIMAL(5,2),
    retainerAmount DECIMAL(10,2),
    estimatedValue DECIMAL(12,2),
    budgetAmount DECIMAL(12,2),
    
    -- Dates
    openedDate DATE NOT NULL,
    targetCloseDate DATE,
    actualCloseDate DATE,
    statuteOfLimitationsDate DATE,
    
    -- Matter details
    conflictCheckCompleted BOOLEAN DEFAULT false,
    conflictCheckDate DATE,
    conflictCheckNotes TEXT,
    
    -- Office location
    officeLocation VARCHAR(200),
    
    -- Relationships
    relatedMatterIds JSONB,
    opposingCounsel JSONB,
    
    -- Additional info
    tags JSONB,
    customFields JSONB,
    notes TEXT,
    internalNotes TEXT,
    
    -- Audit fields
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    createdBy UUID NOT NULL,
    updatedBy UUID
);

-- Indexes for performance
CREATE INDEX idx_matters_status ON matters(status);
CREATE INDEX idx_matters_type ON matters(type);
CREATE INDEX idx_matters_priority ON matters(priority);
CREATE INDEX idx_matters_client ON matters(clientId);
CREATE INDEX idx_matters_responsible_attorney ON matters(responsibleAttorneyId);
CREATE INDEX idx_matters_opened_date ON matters(openedDate);
CREATE INDEX idx_matters_matter_number ON matters(matterNumber);
