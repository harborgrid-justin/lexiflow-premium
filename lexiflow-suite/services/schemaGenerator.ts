
export const SchemaGenerator = {
  generateDDL: (): string => {
    return `-- Auto-generated SQL Schema based on System Types
    
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    domain VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    org_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    office VARCHAR(100),
    user_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cases (
    id UUID PRIMARY KEY,
    owner_org_id UUID REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255),
    status VARCHAR(50),
    matter_type VARCHAR(50),
    filing_date DATE,
    value NUMERIC(15, 2),
    description TEXT,
    jurisdiction VARCHAR(100),
    court VARCHAR(100),
    judge VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    content TEXT,
    source_module VARCHAR(50),
    status VARCHAR(50),
    is_encrypted BOOLEAN DEFAULT FALSE,
    upload_date TIMESTAMP,
    last_modified TIMESTAMP
);

CREATE TABLE time_entries (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    user_id UUID REFERENCES users(id),
    date DATE,
    duration_minutes INTEGER,
    description TEXT,
    rate NUMERIC(10, 2),
    total_amount NUMERIC(10, 2),
    status VARCHAR(50)
);

CREATE TABLE docket_entries (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    sequence_number INTEGER,
    date DATE,
    type VARCHAR(50),
    title VARCHAR(500),
    description TEXT,
    filed_by VARCHAR(255),
    is_sealed BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_cases_client ON cases(client);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_docket_case ON docket_entries(case_id);
`;
  }
};
