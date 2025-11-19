"use client";

import React, { useMemo, useState } from "react";
import { useGetMemberSummary } from "@/hooks/members.hooks";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TeamMemberSummary: React.FC = () => {
  const { data, isLoading, error } = useGetMemberSummary();
  const [showAll, setShowAll] = useState(false);

  const members = useMemo(() => data?.results || [], [data]);
  const visibleMembers = useMemo(
    () => (showAll ? members : members.slice(0, 5)),
    [members, showAll]
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4"
            >
              <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-40 rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((__, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="h-3 w-full rounded bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
        Failed to load team member summary.
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="max-w-4xl rounded-[32px] border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm">
      
        <h2 className="text-xl font-semibold text-t-black">No team members yet</h2>
        <p className="mt-2 text-sm text-gray-500">
          Add team members to track their capacity and workload here.
        </p>
      </div>
    );
  }

  const getCapacityState = (member: { capacity: number | null; used_capacity: number | null }) => {
    const capacity = member.capacity ?? 0;
    const used = member.used_capacity ?? 0;
    if (capacity <= 0) return { isOverloaded: false, badgeClass: "bg-gray-200 text-gray-600", text: `${used}/${capacity} capacity` };
    const utilization = used / capacity;
    if (used > capacity) {
      return {
        isOverloaded: true,
        badgeClass: "bg-red-100 text-red-700 border border-red-200",
        text: `${used}/${capacity} capacity`,
        utilizationText: `${Math.round(utilization * 100)}% used`,
      };
    }
    if (utilization >= 0.8) {
      return {
        isOverloaded: false,
        badgeClass: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        text: `${used}/${capacity} capacity`,
        utilizationText: `${Math.round(utilization * 100)}% used`,
      };
    }
    return {
      isOverloaded: false,
      badgeClass: "bg-t-orange-light/40 text-t-black border border-t-orange-light/60",
      text: `${used}/${capacity} capacity`,
      utilizationText: `${Math.round(utilization * 100)}% used`,
    };
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-t-black">
            Team Member Summary
          </h2>
          <p className="text-sm text-gray-500">
            Overview of capacity and current assignments
          </p>
        </div>
        {members.length > 5 && (
          <Button
            variant="outline"
            className="rounded-full border-t-black text-t-black"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
      <Accordion type="multiple" className="space-y-3">
        {visibleMembers.map((member) => (
          <AccordionItem
            key={member.member_id}
            value={member.member_id}
            className="border border-gray-200 rounded-2xl bg-white shadow-sm px-1"
          >
            <AccordionTrigger className="px-3 py-4">
              <div className="flex flex-1 flex-col gap-1 text-left">
                <p className="text-base font-semibold text-gray-900">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
              {(() => {
                const capacityState = getCapacityState(member);
                return (
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-semibold rounded-full px-3 py-1 ${capacityState.badgeClass}`}
                    >
                      {capacityState.text}
                    </span>
                    {capacityState.utilizationText && (
                      <span className="text-xs text-gray-400">
                        {capacityState.utilizationText}
                      </span>
                    )}
                  </div>
                );
              })()}
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Tasks
                </p>
                {member.tasks.length === 0 ? (
                  <p className="text-sm text-gray-500">No tasks assigned.</p>
                ) : (
                  member.tasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3 space-y-1"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {task.task_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{task.project_name}</span>
                        <span className="text-gray-300">•</span>
                        <span className="rounded-full bg-white px-2 py-0.5 font-medium text-t-black">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TeamMemberSummary;

