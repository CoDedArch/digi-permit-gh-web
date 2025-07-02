export interface DocumentType {
  id: number;
  name: string;
  code: string | null;
  description?: string | null; // optional in case it's included later
}

export interface PermitDocumentRequirement {
  id: number; // ✅ include id for tracking
  is_mandatory: boolean;
  document_type: DocumentType;
  conditional_logic?: Record<string, unknown> | null;
  notes?: string | null;
  phase?: string | null;
}

export interface PermitTypeWithRequirements {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean; // optionally include if returned
  base_fee: number;
  standard_duration_days: number;
  requires_epa_approval: boolean;
  requires_heritage_review: boolean;
  required_documents: PermitDocumentRequirement[];
}


export interface ZoningDistrict {
  id: number;
  code: string;
  name: string;
  description?: string;
  max_height?: number;
  max_coverage?: number;
  min_plot_size?: number;
  color_code?: string;
  density?: string;
  parking_requirement?: string;
  setbacks?: string;
  special_notes?: string;
  population_served?: string;
  buffer_zones?: string;
}
