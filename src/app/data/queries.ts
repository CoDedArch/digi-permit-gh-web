import { PermitTypeWithRequirements, ZoningDistrict } from "@/types";

// lib/utils/uploadFile.ts
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}uploads/user-documents`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  const data = await response.json();
  return data.file_url;
}

// lib/api/getMMDAs.ts
export interface MMDA {
  id: number;
  name: string;
  type: string;
  region: string;
  contact_email?: string;
  contact_phone?: string;
  jurisdiction_boundaries?: GeoJSON.Polygon; // Add this
}

export async function getMMDAs(): Promise<MMDA[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}mmdas`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch MMDAs");
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading MMDAs:", error);
    return [];
  }
}

export async function getPermitTypesWithRequirements(): Promise<
  PermitTypeWithRequirements[]
> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/types`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Type guard function
    function isPermitTypeWithRequirements(
      data: unknown,
    ): data is PermitTypeWithRequirements[] {
      return (
        Array.isArray(data) &&
        data.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "name" in item &&
            "required_documents" in item &&
            Array.isArray(item.required_documents),
        )
      );
    }

    if (!isPermitTypeWithRequirements(data)) {
      throw new Error("Invalid data format received from API");
    }

    return data.map((permitType) => ({
      ...permitType,
      required_documents: permitType.required_documents
        .map((req) => ({
          ...req,
          document_type: {
            id: req.document_type.id,
            name: req.document_type.name,
            code: req.document_type.code ?? null,
          },
        }))
        // Sort by mandatory first if backend doesn't handle it
        .sort((a, b) => Number(b.is_mandatory) - Number(a.is_mandatory)),
    }));
  } catch (error) {
    console.error("Error fetching permit types:", error);
    throw new Error("Failed to load permit types. Please try again later.");
  }
}

type PermitType = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  base_fee: number;
  standard_duration_days: number;
};

// lib/api/getPermitTypes.ts

export async function getPermitTypes(): Promise<PermitType[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/permit-types`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch permit types");
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading permit types:", error);
    return [];
  }
}

// Utility function to fetch a single permit type by ID
export async function getPermitTypeById(
  permitTypeId: string,
): Promise<PermitTypeWithRequirements> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/types/${permitTypeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Permit type with ID ${permitTypeId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Type guard function for single permit type
    function isPermitTypeWithRequirements(
      data: unknown,
    ): data is PermitTypeWithRequirements {
      return (
        typeof data === "object" &&
        data !== null &&
        "id" in data &&
        "name" in data &&
        "required_documents" in data &&
        Array.isArray(data.required_documents)
      );
    }

    if (!isPermitTypeWithRequirements(data)) {
      throw new Error("Invalid data format received from API");
    }

    return {
      ...data,
      required_documents: data.required_documents
        .map((req) => ({
          ...req,
          document_type: {
            id: req.document_type.id,
            name: req.document_type.name,
            code: req.document_type.code ?? null,
          },
        }))
        // Sort by mandatory first if backend doesn't handle it
        .sort((a, b) => Number(b.is_mandatory) - Number(a.is_mandatory)),
    };
  } catch (error) {
    console.error(`Error fetching permit type ${permitTypeId}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to load permit type. Please try again later.",
    );
  }
}

type ApplicantType = {
  id: number;
  code: string;
  name: string;
  description?: string;
};

// lib/api/getApplicantTypes.ts

export async function getApplicantTypes(): Promise<ApplicantType[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}auth/applicant-types`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch applicant types");
    }

    const data = await response.json();
    return data; // Expected format: [{ id, code, name, description }]
  } catch (error) {
    console.error("Error fetching applicant types:", error);
    return [];
  }
}

// lib/api/getZoningDistricts.ts

export async function getZoningDistricts(): Promise<ZoningDistrict[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/zoning-districts`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch zoning districts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading zoning districts:", error);
    return [];
  }
}

export interface DocumentType {
  id: number;
  name: string;
  code: string | null;
}

export interface ZoningUseDocumentRequirement {
  id: number;
  is_mandatory: boolean;
  phase?: string;
  notes?: string;
  document_type: DocumentType;
}

export interface ZoningUse {
  id: number;
  use: string;
  zoning_district_id: number;
  requires_epa_approval: boolean;
  requires_heritage_review: boolean;
  requires_traffic_study: boolean;
  required_documents: ZoningUseDocumentRequirement[];
}

// lib/api/getZoningUses.ts

export async function getZoningUses(
  zoningDistrictId: number,
): Promise<ZoningUse[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/zoning-uses?zoning_district_id=${zoningDistrictId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch zoning uses");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching zoning uses:", error);
    return [];
  }
}

// lib/api/getDrainageTypes.ts

export async function getDrainageTypes(): Promise<
  { id: number; name: string; description?: string }[]
> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/drainage-types`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch drainage types");
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading drainage types:", error);
    return [];
  }
}

export async function getCurrentUser(): Promise<{
  authenticated: boolean;
  user_id: number;
  applicant_type_code: string;
}> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/me`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Not authenticated");
  return response.json();
}

// lib/api/getSiteConditions.ts

export async function getSiteConditions(): Promise<
  { id: number; name: string; description?: string }[]
> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/site-conditions`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch site conditions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading site conditions:", error);
    return [];
  }
}

// lib/api/getPreviousLandUses.ts

// services/permit.ts

export async function getPreviousLandUses(): Promise<
  { id: string; name: string }[]
> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/previous-land-uses`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch previous land uses");
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading previous land uses:", error);
    return [];
  }
}

export async function initiatePayment({
  amount,
  callbackUrl,
}: {
  amount: number;
  callbackUrl: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}payments/initialize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies (for auth_token)
      body: JSON.stringify({
        amount,
        callback_url: callbackUrl,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to initiate payment");
  }

  return await response.json(); // returns { authorization_url, reference }
}

export async function verifyPayment(reference: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}payments/verify?reference=${reference}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // If using cookies for auth
    },
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Payment verification failed");
  }
}

export interface DocumentType {
  id: number;
  name: string;
}

export interface ApplicationDocument {
  file_path: string;
  status: string;
  document_type: DocumentType;
}

export interface MMDA {
  id: number;
  name: string;
}

export interface Application {
  id: number;
  application_number: string;
  project_name: string;
  status: string;
  created_at: string;
  permit_type: PermitType;
  mmda: MMDA;
  documents: ApplicationDocument[];
}

// (Removed duplicate Application interface to avoid conflicts)

// query all applications relating to the user.

export async function getMyApplications(): Promise<Application[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/my-applications`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      let errorMessage = "Failed to fetch applications";

      if (contentType?.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData?.message || errorMessage;
      } else {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await res.json();

    console.log("Backend sent", data);

    if (!Array.isArray(data)) {
      throw new Error("Invalid response format");
    }

    return data as Application[];
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }

    console.error("getMyApplications error:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "An unexpected error occurred");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

import { Geometry } from "geojson";

// Extended Application interface for detailed application data
export interface ApplicationDetail {
  application_number: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "additional_info_requested"
    | "approved"
    | "rejected"
    | "inspection_pending"
    | "inspected"
    | "approval requested"
    | "issued"
    | "completed"
    | "cancelled"
    | string;

  project_name: string;
  project_description?: string;
  parking_spaces?: number;
  setbacks?: Record<string, number>;
  floor_areas?: Record<string, number>;
  site_conditions?: {
    name: string;
  }[];

  drainage_type?: {
    name: string;
  } | null;
  project_address: string;
  parcel_number?: string;

  estimated_cost?: number;
  construction_area?: number;
  expected_start_date?: string;
  expected_end_date?: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  approved_at: string;
  fire_safety_plan: string;
  waste_management_plan: string;
  latitude?: number;
  longitude?: number;
  parcel_geometry?: Geometry;
  spatial_data?: Geometry;
  project_location?: Geometry;
  gis_metadata?: Record<string, any>;

  zoning_use?: {
    use: string;
  } | null;

  zoning_district?: {
    name: string;
    code: string;
  } | null;

  previous_land_use?: {
    name: string;
  } | null;

  architect?: {
    full_name: string;
    email?: string;
    phone?: string;
    firm_name?: string;
    role?: string;
    license_number?: string;
  } | null;

  mmda: MMDA;

  applicant?: {
    full_name: string;
    email?: string;
    phone?: string;
  };

  permit_type?: {
    id: string;
    name: string;
  };

  documents?: {
    document_type: any;
    file_path: string;
    status: string;
  }[];

  payments?: {
    amount: number;
    status: string;
    purpose: string;
    payment_date: string;
    due_date?: string;
    transaction_reference: string;
  }[];
}

export interface ApplicationFormDefaults {
  project_name: string;
  project_description?: string;
  expected_start_date?: string;
  expected_end_date?: string;
  parcel_number?: string;
  project_address: string;
  parking_spaces?: number;
  setbacks?: Record<string, number>;
  floor_areas?: Record<string, number>;
  site_conditions?: Record<string, string>;
  estimated_cost?: number;
  construction_area?: number;
  fire_safety_plan: string;
  waste_management_plan: string;
}

export async function fetchApplicationDetail(applicationId: string): Promise<{
  application: ApplicationDetail;
  formDefaults: ApplicationFormDefaults;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 sec timeout

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}permits/my-applications/${applicationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      let errorMessage = "Failed to fetch application details";

      if (contentType?.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData?.message || errorMessage;
      } else {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await res.json();

    console.log("Data Returned Is", data);

    // Add your own runtime validation logic if needed
    if (!data?.id || !data.project_name) {
      throw new Error("Invalid response format");
    }

    return {
      application: data as ApplicationDetail,
      formDefaults: {
        project_name: data.project_name,
        project_description: data.project_description,
        expected_start_date: data.expected_start_date?.slice(0, 10),
        expected_end_date: data.expected_end_date?.slice(0, 10),
        parcel_number: data.parcel_number,
        project_address: data.project_address,
        parking_spaces: data.parking_spaces,
        setbacks: data.setbacks,
        floor_areas: data.floor_areas,
        site_conditions: data.site_conditions,
        estimated_cost: data.estimated_cost,
        construction_area: data.construction_area,
        fire_safety_plan: data.fire_safety_plan,
        waste_management_plan: data.waste_management_plan,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }

    console.error("fetchApplicationDetail error:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "An unexpected error occurred");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

export interface Inspection {
  id: number;
  status: string;
  scheduled_date: string; // or Date if you parse it
  application: {
    project_name: string;
  };
  inspection_officer?: {
    first_name: string;
    last_name: string;
  };
}


export async function fetchUserInspections(): Promise<Inspection[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}inspections/user`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load inspections");
  return res.json();
}
