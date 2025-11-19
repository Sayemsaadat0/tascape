"use client";

import React, { useMemo } from "react";
import { useGetActivityLogs } from "@/hooks/activity.hooks";
import DashboardTable, {
  type DashboardTableColumn,
} from "@/components/core/DashboardTable";
import { formatDatestamp } from "@/lib/utils";

interface ActivityLog {
  id: string;
  activity_message: string;
  task_name: string;
  assigned_from_name: string;
  assigned_to_name: string;
  task_id: string;
  project_id: string;
  timestamp: string;
  formatted_time: string;
}

const RecentReassignment: React.FC = () => {
  const { data: activityLogs, isLoading, error } = useGetActivityLogs();

  const recentActivities = useMemo(
    () => (activityLogs?.result || []).slice(0, 5),
    [activityLogs]
  );

  const ActivityColumn: DashboardTableColumn[] = [
    {
      title: "Activity",
      dataKey: "activity",
      row: (data: ActivityLog) => (
        <p className="text-black">{data?.activity_message}</p>
      ),
    },
    {
      title: "Time",
      dataKey: "time",
      row: (data: ActivityLog) => (
        <div className="space-y-1">
          {data?.timestamp && (
            <p className="text-black">{formatDatestamp(data.timestamp)}</p>
          )}
          {data?.formatted_time && (
            <p className="text-black/60 text-sm">{data.formatted_time}</p>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-t-black">
            Recent  Re-assignments
          </h2>
          <p className="text-sm text-gray-500">Latest 10 entries</p>
        </div>
        <p className="text-sm text-red-500">Failed to load re-assignments.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-t-black">
          Recent 5 Re-assignments
        </h2>
        <p className="text-sm text-gray-500">Latest 10 entries</p>
      </div>
      <DashboardTable
        columns={ActivityColumn}
        isLoading={isLoading}
        data={recentActivities}
      />
    </div>
  );
};

export default RecentReassignment;


