import { getPermitTypesWithRequirements } from "@/app/data/queries";
import RequirementsPanel from "@/app/_component/requirements-panel";
import PermitTypeCard from "@/app/_component/permit-type-card";
import { PermitTypeWithRequirements } from "@/types";

const SHORT_FORM_TYPES = [
  "sign_permit",
  "subdivision",
  "temporary_structure",
  "fittings_installation",
  "hoarding",
  "sand_weaning",
];

export default async function NewApplicationPage() {
  const permitTypes: PermitTypeWithRequirements[] = await getPermitTypesWithRequirements();

  // Group permit types by duration
  const shortFormPermits = permitTypes.filter(permit => 
    SHORT_FORM_TYPES.includes(permit.id)
  );
  const longFormPermits = permitTypes.filter(permit => 
    !SHORT_FORM_TYPES.includes(permit.id)
  );

  return (
    <div className="px-6 py-8 bg-white">
      {/* 🧭 Informative Header */}
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Start Your Permit Application</h1>
        <p className="text-lg text-gray-600">
          Select the type of permit that matches your project needs. We&apos;ve organized them by processing time to help you plan accordingly.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            💡 <span className="font-medium">Tip:</span> Before applying, verify your project aligns with local zoning regulations to avoid delays.
          </p>
        </div>
      </div>

      {/* Quick Permits Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-1 bg-green-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Quick Permits</h2>
          <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Typically processed in 1-2 weeks
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortFormPermits.map((permitType) => (
            <PermitTypeCard key={permitType.id} permitType={permitType} variant="quick" />
          ))}
        </div>
      </section>

      {/* Comprehensive Permits Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-1 bg-blue-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Comprehensive Permits</h2>
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Typically processed in 4-8 weeks
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {longFormPermits.map((permitType) => (
            <PermitTypeCard key={permitType.id} permitType={permitType} variant="comprehensive" />
          ))}
        </div>
      </section>

      <RequirementsPanel />
    </div>
  );
}