"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";

export interface StatsResultType {
  total_projects: number | null;
  total_tasks: number | null;
  total_members: number | null;
  total_teams: number | null;
  total_users: number | null;
  user_id: string;
  generated_at: string;
}

export interface StatsResponseType {
  result: StatsResultType;
}

export const useGetStats = () => {
  const { token } = useAuthStore();
  return useQuery<StatsResponseType>({
    queryKey: ["stats"],
    queryFn: () =>
      axiousResuest({
        url: `api/stats`,
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });
};
