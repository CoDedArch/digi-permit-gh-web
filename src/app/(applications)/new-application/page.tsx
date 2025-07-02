import { getPermitTypesWithRequirements } from "@/app/data/queries"
import RequirementsPanel from "@/app/_component/requirements-panel"
import PermitTypeCard from "@/app/_component/permit-type-card"
import { PermitTypeWithRequirements } from "@/types"


export default async function NewApplicationPage() {
  const permitTypes: PermitTypeWithRequirements[] = await getPermitTypesWithRequirements()
  
  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {permitTypes.map((permitType: PermitTypeWithRequirements) => (
          <PermitTypeCard 
            key={permitType.id}
            permitType={permitType}
          />
        ))}
      </div>

      <RequirementsPanel />
    </div>
  )
}