-- Fix gmail_sender table for OAuth storage
-- Add unique constraint on user_email

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'gmail_sender_user_email_key'
    ) THEN
        ALTER TABLE gmail_sender ADD CONSTRAINT gmail_sender_user_email_key UNIQUE (user_email);
    END IF;
END $$;

-- Verify
SELECT * FROM gmail_sender;
