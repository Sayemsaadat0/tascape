"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";

// Define TypeScript types/interfaces for Activity Log
export interface ActivityLogType {
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

export interface ActivityLogsResponseType {
  success: boolean;
  message: string;
  result: ActivityLogType[];
  count: number;
}

export const useGetActivityLogs = () => {
  const { token } = useAuthStore();
  return useQuery<ActivityLogsResponseType>({
    queryKey: ["activityList"],
    queryFn: () =>
      axiousResuest({
        url: `api/activities`,
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
  });
};
