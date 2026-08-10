-- Contracts Management System
-- Schema: PUBLIC
-- Comprehensive contract tracking for actors, crew, vendors, and locations

-- Contract Types Enum
CREATE TYPE contract_type AS ENUM ('actor', 'crew', 'vendor', 'location', 'other');

-- Contract Status Enum
CREATE TYPE contract_status AS ENUM ('draft', 'pending_signature', 'signed', 'countersigned', 'executed', 'expired', 'terminated');

-- Payment Status Enum
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue');

-- Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Contract Details
  contract_number VARCHAR(50) UNIQUE,
  contract_type contract_type NOT NULL DEFAULT 'actor',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Parties
  actor_id UUID REFERENCES public.actors(id) ON DELETE SET NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  vendor_name VARCHAR(255),
  contracting_party_name VARCHAR(255) NOT NULL, -- Name of the person/company
  contracting_party_email VARCHAR(255),
  contracting_party_phone VARCHAR(50),
  
  -- Contract Status
  status contract_status NOT NULL DEFAULT 'draft',
  
  -- Dates
  start_date DATE,
  end_date DATE,
  signature_date DATE,
  countersignature_date DATE,
  
  -- Financial Terms
  contract_amount DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  payment_schedule TEXT, -- JSON or text describing payment schedule
  payment_status payment_status DEFAULT 'pending',
  
  -- Documents
  contract_pdf_url TEXT, -- S3/Storage URL for uploaded contract
  signed_pdf_url TEXT, -- S3/Storage URL for signed contract
  
  -- E-Signature Integration
  esignature_provider VARCHAR(50), -- 'docusign', 'hellosign', 'adobe_sign', etc.
  esignature_envelope_id VARCHAR(255), -- External service envelope/document ID
  esignature_status VARCHAR(50),
  esignature_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes and Metadata
  notes TEXT,
  terms_and_conditions TEXT,
  special_provisions TEXT,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract Payments Table (for tracking payment milestones)
CREATE TABLE IF NOT EXISTS public.contract_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  
  -- Payment Details
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE,
  paid_date DATE,
  payment_method VARCHAR(50), -- 'check', 'wire', 'ach', 'paypal', etc.
  reference_number VARCHAR(100),
  
  -- Status
  status payment_status DEFAULT 'pending',
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract Documents Table (for additional attachments)
CREATE TABLE IF NOT EXISTS public.contract_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  
  -- Document Details
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50), -- 'w9', 'i9', 'insurance', 'addendum', etc.
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(100),
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create Indexes
CREATE INDEX idx_contracts_project ON public.contracts(project_id);
CREATE INDEX idx_contracts_actor ON public.contracts(actor_id);
CREATE INDEX idx_contracts_character ON public.contracts(character_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_type ON public.contracts(contract_type);
CREATE INDEX idx_contract_payments_contract ON public.contract_payments(contract_id);
CREATE INDEX idx_contract_payments_status ON public.contract_payments(status);
CREATE INDEX idx_contract_documents_contract ON public.contract_documents(contract_id);

-- Auto-generate contract numbers
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_number IS NULL THEN
    NEW.contract_number := 'CNTR-' || 
      TO_CHAR(NOW(), 'YYYY') || '-' || 
      LPAD(NEXTVAL('contract_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS contract_number_seq START 1;

CREATE TRIGGER generate_contract_number_trigger
BEFORE INSERT ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION generate_contract_number();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at_trigger
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION update_contracts_updated_at();

CREATE TRIGGER contract_payments_updated_at_trigger
BEFORE UPDATE ON public.contract_payments
FOR EACH ROW
EXECUTE FUNCTION update_contracts_updated_at();

-- RLS Policies
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;

-- Contracts RLS
CREATE POLICY "Users can view contracts for their projects"
  ON public.contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = contracts.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create contracts for their projects"
  ON public.contracts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update contracts for their projects"
  ON public.contracts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = contracts.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete contracts for their projects"
  ON public.contracts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = contracts.project_id
      AND created_by = auth.uid()
    )
  );

-- Contract Payments RLS
CREATE POLICY "Users can view payments for their contracts"
  ON public.contract_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.projects p ON c.project_id = p.id
      WHERE c.id = contract_payments.contract_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage payments for their contracts"
  ON public.contract_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.projects p ON c.project_id = p.id
      WHERE c.id = contract_payments.contract_id
      AND p.created_by = auth.uid()
    )
  );

-- Contract Documents RLS
CREATE POLICY "Users can view documents for their contracts"
  ON public.contract_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.projects p ON c.project_id = p.id
      WHERE c.id = contract_documents.contract_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage documents for their contracts"
  ON public.contract_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.projects p ON c.project_id = p.id
      WHERE c.id = contract_documents.contract_id
      AND p.created_by = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE public.contracts IS 'Master contracts table for actors, crew, vendors, and locations';
COMMENT ON TABLE public.contract_payments IS 'Payment milestones and tracking for contracts';
COMMENT ON TABLE public.contract_documents IS 'Additional documents attached to contracts';
COMMENT ON COLUMN public.contracts.esignature_provider IS 'Third-party e-signature service used';
COMMENT ON COLUMN public.contracts.payment_schedule IS 'JSON or text describing payment terms (e.g., "50% upfront, 50% on completion")';
