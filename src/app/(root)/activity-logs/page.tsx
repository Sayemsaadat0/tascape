"use client";

import { useGetActivityLogs } from "@/hooks/activity.hooks";
import DashboardTable, {
  type DashboardTableColumn,
} from "@/components/core/DashboardTable";
import React from "react";
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

const ActivityLogsPage = () => {
  const { data: activityLogs, isLoading, error } = useGetActivityLogs();

  const ActivityColumn: DashboardTableColumn[] = [
    {
      title: "Activity",
      dataKey: "activity",
      row: (data: ActivityLog, rowIndex: number) => (
        <p className="text-black">{data?.activity_message}</p>
      ),
    },
    {
      title: "Time",
      dataKey: "time",
      row: (data: ActivityLog, rowIndex: number) => (
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
      <div className="flex justify-center items-center h-64">
        <p className="text-white/60">Failed to load activity logs</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-t-black mb-4">
        Activity Logs{" "}
        {activityLogs?.result?.length ? `(${activityLogs.result.length})` : ""}
      </h1>

      <DashboardTable
        columns={ActivityColumn}
        isLoading={isLoading}
        data={activityLogs?.result || []}
      />
    </div>
  );
};

export default ActivityLogsPage;
