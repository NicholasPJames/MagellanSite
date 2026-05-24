-- Deals table
CREATE TABLE deals (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    founders TEXT,
    linkedins TEXT,
    other_links TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    deal_id BIGINT REFERENCES deals(id) ON DELETE CASCADE,
    author TEXT DEFAULT 'Anonymous',
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies: only authenticated users can read/write
CREATE POLICY "Authenticated users can read deals"
    ON deals FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert deals"
    ON deals FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update deals"
    ON deals FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete deals"
    ON deals FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read comments"
    ON comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (true);
