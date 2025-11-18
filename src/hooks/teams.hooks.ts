"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export interface TeamMemberType {
  _id: string;
  name: string;
  role: string;
  capacity: number;
  used_capacity: number;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TeamType {
  _id: string;
  title: string;
  members: TeamMemberType[];
  user_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface TeamsResponseType {
  success: boolean;
  message: string;
  results: TeamType[];
}

export const useGetTeamsList = () => {
  const { token } = useAuthStore();
  return useQuery<TeamsResponseType>({
    queryKey: ["teamsList"],
    queryFn: () =>
      axiousResuest({
        url: `api/teams`,
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async (body: { title: string; members: string[] }) =>
      await axiousResuest({
        url: `api/teams`,
        method: "post",
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamsList"] });
    },
  });
};

export const useUpdateTeam = (id: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async (body: { title?: string; members?: string[] }) =>
      await axiousResuest({
        url: `api/teams/${id}`,
        method: "patch",
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamsList"] });
    },
  });
};

export const useDeleteTeam = (id: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async () =>
      await axiousResuest({
        url: `api/teams/${id}`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamsList"] });
    },
  });
};

