"use client"
import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function RequirementsPanel() {
  const [activeTab, setActiveTab] = useState("general")
  
  return (
    <div className="mt-12 border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Application Requirements Guide</h2>
      
      <div className="mb-6 flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "general" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("general")}
        >
          General Requirements
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "faq" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
          onClick={() => setActiveTab("faq")}
        >
          FAQ
        </button>
      </div>
      
      {activeTab === "general" && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What documents do I need?</AccordionTrigger>
            <AccordionContent>
              Most applications require site plans, construction drawings, and proof of ownership.
              Specific requirements vary by permit type.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How long does approval take?</AccordionTrigger>
            <AccordionContent>
              Standard permits: 5-10 business days. Complex projects requiring EPA review: 15-30 days.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      {activeTab === "faq" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Can I submit documents later?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Yes, but your application won&apos;t be processed until all required documents are submitted.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What file formats are accepted?</h3>
            <p className="text-sm text-gray-600 mt-1">
              PDF for documents, JPG/PNG for photos, DWG for CAD files.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}