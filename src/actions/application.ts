// // actions/application.ts
// "use server"

// import { createApplicationSchema } from "@/schemas/application"
// import { db } from "@/lib/db"
// import { revalidatePath } from "next/cache"
// import { redirect } from "next/navigation"

// export async function createApplication(
//   values: z.infer<typeof createApplicationSchema>
// ) {
//   // Validate fields
//   const validatedFields = createApplicationSchema.safeParse(values)
  
//   if (!validatedFields.success) {
//     throw new Error("Invalid fields")
//   }

//   try {
//     // Create application in database
//     const application = await db.permitApplication.create({
//       data: {
//         permit_type_id: validatedFields.data.permitTypeId,
//         project_name: validatedFields.data.projectName,
//         project_description: validatedFields.data.projectDescription,
//         project_address: validatedFields.data.projectAddress,
//         parcel_number: validatedFields.data.parcelNumber,
//         zoning_district: validatedFields.data.zoningDistrict,
//         estimated_cost: validatedFields.data.estimatedCost,
//         construction_area: validatedFields.data.constructionArea,
//         expected_start_date: validatedFields.data.expectedStartDate,
//         expected_end_date: validatedFields.data.expectedEndDate,
//         latitude: validatedFields.data.latitude,
//         longitude: validatedFields.data.longitude,
//         status: "DRAFT",
//       },
//     })

//     revalidatePath("/applications")
//     return application
//   } catch (error) {
//     console.error("Error creating application:", error)
//     throw error
//   }
// }