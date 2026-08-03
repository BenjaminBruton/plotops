-- PlotOps Core Schema Migration
-- Creates the main tables for the film production ERP system

BEGIN;

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

CREATE TYPE plotops.user_role AS ENUM (
    'producer',
    'director',
    'ad',
    'casting_director',
    'scout',
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
    'int',
    'ext',
    'int_ext'
);

CREATE TYPE plotops.time_of_day AS ENUM (
    'day',
    'night',
    'dawn',
    'dusk',
    'magic_hour'
);

CREATE TYPE plotops.location_status AS ENUM (
    'scouting',
    'pending',
    'secured',
    'rejected'
);

CREATE TYPE plotops.casting_status AS ENUM (
    'open',
    'callback',
    'cast',
    'closed'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations/Production Companies
CREATE TABLE plotops.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address JSONB,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles (extends auth.users)
CREATE TABLE plotops.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES plotops.organizations(id) ON DELETE CASCADE,
    role plotops.user_role NOT NULL DEFAULT 'producer',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    bio TEXT,
    avatar_url TEXT,
    phone VARCHAR(50),
    emergency_contact JSONB,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects (Films/Productions)
CREATE TABLE plotops.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES plotops.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    logline TEXT,
    synopsis TEXT,
    genre VARCHAR(100),
    status plotops.project_status DEFAULT 'development',
    budget_range VARCHAR(50),
    start_date DATE,
    end_date DATE,
    wrap_date DATE,
    script_url TEXT,
    poster_url TEXT,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- Project Team Members
CREATE TABLE plotops.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role plotops.user_role NOT NULL,
    title VARCHAR(255),
    department VARCHAR(100),
    is_lead BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    rate_per_day DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id, role)
);

-- ============================================================================
-- SCRIPT & BREAKDOWN TABLES
-- ============================================================================

-- Scenes
CREATE TABLE plotops.scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    scene_number VARCHAR(20) NOT NULL,
    scene_name VARCHAR(255),
    location_name VARCHAR(255),
    scene_type plotops.scene_type NOT NULL,
    time_of_day plotops.time_of_day NOT NULL,
    page_count DECIMAL(4,2),
    description TEXT,
    script_notes TEXT,
    estimated_duration INTEGER, -- minutes
    complexity_rating INTEGER CHECK (complexity_rating >= 1 AND complexity_rating <= 5),
    is_pickup BOOLEAN DEFAULT false,
    is_insert BOOLEAN DEFAULT false,
    script_page_start DECIMAL(4,2),
    script_page_end DECIMAL(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, scene_number)
);

-- Characters
CREATE TABLE plotops.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    age_range VARCHAR(50),
    gender VARCHAR(50),
    ethnicity VARCHAR(100),
    character_type VARCHAR(50), -- lead, supporting, under-five, extra
    wardrobe_notes TEXT,
    makeup_notes TEXT,
    special_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, name)
);

-- Scene Characters (many-to-many)
CREATE TABLE plotops.scene_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES plotops.scenes(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES plotops.characters(id) ON DELETE CASCADE,
    lines_count INTEGER DEFAULT 0,
    is_speaking BOOLEAN DEFAULT false,
    wardrobe_change BOOLEAN DEFAULT false,
    makeup_change BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scene_id, character_id)
);

-- Props and Set Pieces
CREATE TABLE plotops.props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- prop, set_piece, vehicle, weapon, etc.
    description TEXT,
    source VARCHAR(100), -- rental, purchase, build, existing
    cost DECIMAL(10,2),
    vendor VARCHAR(255),
    contact_info JSONB,
    special_requirements TEXT,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scene Props (many-to-many)
CREATE TABLE plotops.scene_props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES plotops.scenes(id) ON DELETE CASCADE,
    prop_id UUID NOT NULL REFERENCES plotops.props(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scene_id, prop_id)
);

-- ============================================================================
-- LOCATION TABLES
-- ============================================================================

-- Locations
CREATE TABLE plotops.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    coordinates POINT, -- PostGIS point for lat/lng
    location_type VARCHAR(100), -- studio, practical, exterior, etc.
    status plotops.location_status DEFAULT 'scouting',
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    cost_per_day DECIMAL(10,2),
    availability_notes TEXT,
    parking_info TEXT,
    power_info TEXT,
    restroom_info TEXT,
    catering_space TEXT,
    special_requirements TEXT,
    permits_required BOOLEAN DEFAULT false,
    permit_notes TEXT,
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scene Locations (many-to-many)
CREATE TABLE plotops.scene_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES plotops.scenes(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES plotops.locations(id) ON DELETE CASCADE,
    setup_time INTEGER, -- minutes
    shoot_time INTEGER, -- minutes
    wrap_time INTEGER, -- minutes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scene_id, location_id)
);

-- ============================================================================
-- CASTING TABLES
-- ============================================================================

-- Casting Calls
CREATE TABLE plotops.casting_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    character_id UUID REFERENCES plotops.characters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    audition_sides TEXT,
    status plotops.casting_status DEFAULT 'open',
    submission_deadline TIMESTAMP WITH TIME ZONE,
    audition_start_date DATE,
    audition_end_date DATE,
    callback_date DATE,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actors/Talent
CREATE TABLE plotops.actors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50),
    agent_name VARCHAR(255),
    agent_contact VARCHAR(255),
    headshot_url TEXT,
    reel_url TEXT,
    resume_url TEXT,
    height VARCHAR(20),
    weight VARCHAR(20),
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    age_range VARCHAR(50),
    union_status VARCHAR(100), -- SAG-AFTRA, non-union, etc.
    special_skills TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auditions
CREATE TABLE plotops.auditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    casting_call_id UUID NOT NULL REFERENCES plotops.casting_calls(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES plotops.actors(id) ON DELETE CASCADE,
    audition_date TIMESTAMP WITH TIME ZONE,
    audition_type VARCHAR(50), -- initial, callback, screen_test
    audition_video_url TEXT,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    is_callback BOOLEAN DEFAULT false,
    is_cast BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Casting (final assignments)
CREATE TABLE plotops.character_casting (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES plotops.characters(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES plotops.actors(id) ON DELETE CASCADE,
    rate_per_day DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    contract_signed BOOLEAN DEFAULT false,
    wardrobe_fitting_date DATE,
    special_requirements TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON plotops.organizations(slug);

-- User Profiles
CREATE INDEX idx_user_profiles_organization_id ON plotops.user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON plotops.user_profiles(role);

-- Projects
CREATE INDEX idx_projects_organization_id ON plotops.projects(organization_id);
CREATE INDEX idx_projects_status ON plotops.projects(status);
CREATE INDEX idx_projects_slug ON plotops.projects(organization_id, slug);

-- Project Members
CREATE INDEX idx_project_members_project_id ON plotops.project_members(project_id);
CREATE INDEX idx_project_members_user_id ON plotops.project_members(user_id);

-- Scenes
CREATE INDEX idx_scenes_project_id ON plotops.scenes(project_id);
CREATE INDEX idx_scenes_scene_number ON plotops.scenes(project_id, scene_number);

-- Characters
CREATE INDEX idx_characters_project_id ON plotops.characters(project_id);

-- Scene Characters
CREATE INDEX idx_scene_characters_scene_id ON plotops.scene_characters(scene_id);
CREATE INDEX idx_scene_characters_character_id ON plotops.scene_characters(character_id);

-- Props
CREATE INDEX idx_props_project_id ON plotops.props(project_id);
CREATE INDEX idx_props_category ON plotops.props(category);

-- Locations
CREATE INDEX idx_locations_project_id ON plotops.locations(project_id);
CREATE INDEX idx_locations_status ON plotops.locations(status);
CREATE INDEX idx_locations_coordinates ON plotops.locations USING GIST(coordinates);

-- Casting
CREATE INDEX idx_casting_calls_project_id ON plotops.casting_calls(project_id);
CREATE INDEX idx_casting_calls_status ON plotops.casting_calls(status);
CREATE INDEX idx_auditions_casting_call_id ON plotops.auditions(casting_call_id);
CREATE INDEX idx_auditions_actor_id ON plotops.auditions(actor_id);

COMMIT;