-- Add paid_amount column to worker_attendance table
-- Run this in Supabase SQL Editor to update existing database

alter table public.worker_attendance
add column if not exists paid_amount numeric(12,2) not null default 0;
