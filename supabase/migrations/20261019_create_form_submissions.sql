-- ==============================================================================
-- Migration: 20261019_create_form_submissions.sql
-- Project: Vaani — AI-Powered Multilingual Digital Form Assistant
-- Description: Production PostgreSQL table schema and strict Row Level Security (RLS)
-- ==============================================================================

-- 1. Create table for storing citizen digital form submissions
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    form_type TEXT NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 10 AND age <= 130),
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'Hindi',
    additional_details TEXT,
    fields_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_form_submissions_ref ON public.form_submissions (reference_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_phone ON public.form_submissions (phone);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON public.form_submissions (form_type);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Strict Security Policies:
-- Requirement: Citizens submit forms without needing an account (anonymous public submission).
-- But no anonymous user may ever query or read everyone else's personal citizen data!

-- Policy A: Allow public anonymous insertion with validation check
DROP POLICY IF EXISTS "Allow public anonymous insert" ON public.form_submissions;
CREATE POLICY "Allow public anonymous insert"
ON public.form_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
    length(trim(full_name)) >= 2 AND
    length(trim(phone)) >= 10 AND
    length(trim(city)) >= 1 AND
    length(trim(state)) >= 1
);

-- Policy B: Explicitly DENY public anonymous SELECT to protect citizen privacy
-- Anonymous users CANNOT read arbitrary records from this table.
DROP POLICY IF EXISTS "Deny public select" ON public.form_submissions;
CREATE POLICY "Deny public select"
ON public.form_submissions
FOR SELECT
TO anon
USING (false);

-- Policy C: Service Role (Admin backend / Edge Functions) has full access
DROP POLICY IF EXISTS "Service role full access" ON public.form_submissions;
CREATE POLICY "Service role full access"
ON public.form_submissions
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Safe verification RPC function
-- Allows a citizen to check ONLY their specific submission receipt status
-- using both the reference_id AND their 10-digit phone number as a dual-key verification.
CREATE OR REPLACE FUNCTION public.verify_submission_receipt(
    p_reference_id TEXT,
    p_phone TEXT
)
RETURNS TABLE (
    reference_id TEXT,
    form_type TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.reference_id,
        f.form_type,
        f.full_name,
        f.created_at,
        'VERIFIED_IN_DATABASE'::TEXT AS status
    FROM public.form_submissions f
    WHERE f.reference_id = p_reference_id
      AND right(regexp_replace(f.phone, '\D', '', 'g'), 10) = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
    LIMIT 1;
END;
$$;

-- Grant execution of verify function to public anon users
GRANT EXECUTE ON FUNCTION public.verify_submission_receipt(TEXT, TEXT) TO anon, authenticated;
