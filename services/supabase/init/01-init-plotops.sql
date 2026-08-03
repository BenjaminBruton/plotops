-- PlotOps Database Initialization Script
-- This script sets up the initial database structure for the film production ERP

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom schemas
CREATE SCHEMA IF NOT EXISTS plotops;
CREATE SCHEMA IF NOT EXISTS auth_custom;

-- Set up Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- Create custom types
CREATE TYPE plotops.user_role AS ENUM (
    'producer',
    'assistant_director',
    'casting_director',
    'location_scout',
    'script_supervisor',
    'editor',
    'publicist',
    'admin'
);

CREATE TYPE plotops.project_status AS ENUM (
    'development',
    'pre_production',
    'production',
    'post_production',
    'completed',
    'cancelled'
);

CREATE TYPE plotops.scene_type AS ENUM (
    'interior',
    'exterior'
);

CREATE TYPE plotops.time_of_day AS ENUM (
    'day',
    'night',
    'dawn',
    'dusk'
);

CREATE TYPE plotops.casting_status AS ENUM (
    'open',
    'auditions',
    'callbacks',
    'cast',
    'closed'
);

CREATE TYPE plotops.location_status AS ENUM (
    'scouting',
    'pending_approval',
    'approved',
    'booked',
    'unavailable'
);

-- Create n8n database and user
CREATE DATABASE n8n;
CREATE USER n8n_user WITH PASSWORD 'n8n_password';
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_user;

-- Grant permissions to supabase roles
GRANT USAGE ON SCHEMA plotops TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA plotops TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA plotops TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA plotops TO anon, authenticated, service_role;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA plotops GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA plotops GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA plotops GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;