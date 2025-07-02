// schemas/application.ts
import { z } from "zod"

export const createApplicationSchema = z.object({
  permitTypeId: z.string(),
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  projectDescription: z.string().optional(),
  projectAddress: z.string().min(5, "Address must be at least 5 characters"),
  parcelNumber: z.string().optional(),
  zoningDistrict: z.string().optional(),
  estimatedCost: z.number().min(0, "Cost cannot be negative"),
  constructionArea: z.number().min(0, "Area cannot be negative"),
  expectedStartDate: z.date().optional(),
  expectedEndDate: z.date().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})