-- Add edited_at column for tracking edits
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Allow authenticated users to update comments
CREATE POLICY "Authenticated users can update comments"
    ON comments FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to delete comments
CREATE POLICY "Authenticated users can delete comments"
    ON comments FOR DELETE
    TO authenticated
    USING (true);
