-- Run this in Supabase SQL Editor to add new columns to existing tasks table
-- This is safe to run multiple times (IF NOT EXISTS)

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS skill_area text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS context text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS constraint_note text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS example text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reference jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tools text[];
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completion text default 'self_report';
