"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Team member type from team_info
 */
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

/**
 * Team info type from project
 */
export interface TeamInfoType {
  _id: string;
  title: string;
  members: TeamMemberType[];
  user_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

/**
 * Project type according to API response
 */
export interface ProjectType {
  _id: string;
  name: string;
  team_id: string | null;
  user_id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  team_info: TeamInfoType | null;
}

export interface ProjectsResponseType {
  success: boolean;
  message: string;
  results: ProjectType[];
}

export const useGetProjectsList = () => {
  const { token } = useAuthStore();
  return useQuery<ProjectsResponseType>({
    queryKey: ["projectsList"],
    queryFn: () =>
      axiousResuest({
        url: `api/projects/`,
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  return useMutation({
    mutationFn: async (body: { name: string; team_id: string }) =>
      await axiousResuest({
        url: `api/projects/`,
        method: "post",
        data: {
          ...body,
          user_id: user?._id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectsList"] });
    },
  });
};

export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  return useMutation({
    mutationFn: async (body: { name?: string; team_id?: string }) =>
      await axiousResuest({
        url: `api/projects/${id}`,
        method: "patch",
        data: {
          ...body,
          user_id: user?._id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectsList"] });
    },
  });
};

export const useDeleteProject = (id: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async () =>
      await axiousResuest({
        url: `api/projects/${id}`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectsList"] });
    },
  });
};

