import { getPermitTypesWithRequirements } from "@/app/data/queries";
import RequirementsPanel from "@/app/_component/requirements-panel";
import PermitTypeCard from "@/app/_component/permit-type-card";
import { PermitTypeWithRequirements } from "@/types";

export default async function NewApplicationPage() {
  const permitTypes: PermitTypeWithRequirements[] =
    await getPermitTypesWithRequirements();

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* 🧭 Informative Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Which Permit Are You Interested In?
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Before applying, make sure your development type aligns with your
          area&apos;s zoning classification. This ensures smoother reviews and
          avoids rejections.
        </p>
      </div>

      {/* Permit Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {permitTypes.map((permitType: PermitTypeWithRequirements) => (
          <PermitTypeCard key={permitType.id} permitType={permitType} />
        ))}
      </div>

      <RequirementsPanel />
    </div>
  );
}
