// app/new-application/[permitTypeId]/page.tsx
export const dynamic = "force-dynamic";

import { getPermitTypeById, getZoningDistricts, getDrainageTypes, getSiteConditions, getMMDAs, getPreviousLandUses } from "@/app/data/queries";
import NewApplicationForm from "@/app/_component/NewApplicationForm";
// import { previousLandUses } from "@/schemas/constants";

interface PageProps {
  params: { permitTypeId: string };
}

function normalizeId<T extends { id: number }>(items: T[]): (Omit<T, "id"> & { id: string })[] {
  return items.map(({ id, ...rest }) => ({ id: String(id), ...rest }));
}

export default async function NewApplicationPage({ params }: PageProps) {
  const permitType = await getPermitTypeById(params.permitTypeId); // ✅ This is correct

  const zoningDistricts = normalizeId(await getZoningDistricts());
  const drainageTypes = normalizeId(await getDrainageTypes());
  const siteConditions = normalizeId(await getSiteConditions());
  const previousLandUses = await getPreviousLandUses();
  const mmdas = normalizeId(await getMMDAs());

  if (!permitType) return <div>Permit type not found</div>;

  return (
    <div className="px-6 py-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        New {permitType.name} Application
      </h1>
      <NewApplicationForm
        permitType={permitType}
        zoningDistricts={zoningDistricts}
        drainageTypes={drainageTypes}
        siteConditions={siteConditions}
        previousLandUses={previousLandUses}
        mmdas={mmdas}
      />
    </div>
  );
}
