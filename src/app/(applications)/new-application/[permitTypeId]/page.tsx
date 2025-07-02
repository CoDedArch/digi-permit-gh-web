// app/applications/new/[permitTypeId]/page.tsx
import {
  getPermitTypeById,
  getZoningDistricts,
  getDrainageTypes,
  getSiteConditions,
  getMMDAs,
} from "@/app/data/queries";
import NewApplicationForm from "@/app/_component/NewApplicationForm";
import { previousLandUses } from "@/schemas/constants";

function normalizeId<T extends { id: number }>(
  items: T[],
): (Omit<T, "id"> & { id: string })[] {
  return items.map(({ id, ...rest }) => ({ id: String(id), ...rest }));
}

export default async function NewApplicationPage({
  params,
}: {
  params: { permitTypeId: string };
}) {
  const permitType = await getPermitTypeById(params.permitTypeId);
  const zoningDistricts = normalizeId(await getZoningDistricts());
  const drainageTypes = normalizeId(await getDrainageTypes());
  const siteConditions = normalizeId(await getSiteConditions());
  const mmdas = normalizeId(await getMMDAs());
  // const previousLandUses = normalizeId(await getPreviousLandUses())

  if (!permitType) {
    return <div>Permit type not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
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
