"use client";

import { useReviewerQueue } from "@/components/UseReviewerQueue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ReviewQueuePage() {
  const { data, loading } = useReviewerQueue();
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  const filteredData =
    priorityFilter === "all"
      ? data
      : data.filter((item) => item.priority === priorityFilter);

  return (
    <div className="space-y-8 p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Queue</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Button
            variant={priorityFilter === "all" ? "default" : "outline"}
            onClick={() => setPriorityFilter("all")}
          >
            All
          </Button>
          <Button
            variant={priorityFilter === "high" ? "destructive" : "outline"}
            onClick={() => setPriorityFilter("high")}
          >
            High
          </Button>
          <Button
            variant={priorityFilter === "medium" ? "secondary" : "outline"}
            onClick={() => setPriorityFilter("medium")}
          >
            Medium
          </Button>
          <Button
            variant={priorityFilter === "low" ? "ghost" : "outline"}
            onClick={() => setPriorityFilter("low")}
          >
            Low
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permit #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days in Queue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center px-6 py-8">
                  <Loader2 className="animate-spin w-5 h-5 mx-auto text-gray-400" />
                  <div>Loading applications...</div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center px-6 py-6 text-gray-500">
                  No applications match this filter.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.permit_id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.permit_no}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.type}</td>
                  <td className="px-6 py-4 text-gray-700">{item.applicant}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.days_in_queue} days
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        item.priority === "high"
                          ? "destructive"
                          : item.priority === "medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {item.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/review/permit/${item.permit_id}`}>
                      <Button size="sm">Review</Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
