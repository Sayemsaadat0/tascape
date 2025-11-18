"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Assigned member info type
 */
export interface AssignedMemberInfoType {
  _id: string;
  name: string;
  role: string;
  capacity: number;
  used_capacity: number;
}

/**
 * Project info type from task
 */
export interface ProjectInfoType {
  _id: string;
  name: string;
  team_id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Task type according to API response
 */
export interface TaskType {
  _id: string;
  title: string;
  description?: string;
  project_id: string;
  assigned_member?: string;
  member_id?: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Done";
  user_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  project_Info?: ProjectInfoType;
  assigned_member_info?: AssignedMemberInfoType | null;
}

export interface TasksResponseType {
  success: boolean;
  message: string;
  results: TaskType[];
}

export const useGetTasks = (projectId: string | null) => {
  const { token } = useAuthStore();
  return useQuery<TasksResponseType>({
    queryKey: ["tasksList", projectId],
    queryFn: () => {
      const url = projectId 
        ? `api/tasks?project_id=${projectId}`
        : `api/tasks`;
      return axiousResuest({
        url,
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    enabled: true, // Always enabled - can fetch all tasks or filtered by project
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  return useMutation({
    mutationFn: async (body: {
      title: string;
      description?: string;
      project_id: string;
      assigned_member?: string;
      priority: "Low" | "Medium" | "High";
      status: "Pending" | "In Progress" | "Done";
    }) =>
      await axiousResuest({
        url: `api/tasks`,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasksList", variables.project_id],
      });
    },
  });
};

export const useUpdateTask = (id: string) => {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  return useMutation({
    mutationFn: async (body: {
      title?: string;
      description?: string;
      project_id?: string;
      assigned_member?: string;
      priority?: "Low" | "Medium" | "High";
      status?: "Pending" | "In Progress" | "Done";
    }) =>
      await axiousResuest({
        url: `api/tasks/${id}`,
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
    onSuccess: (_, variables) => {
      // Invalidate tasks for the project_id if provided, otherwise invalidate all
      if (variables.project_id) {
        queryClient.invalidateQueries({
          queryKey: ["tasksList", variables.project_id],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["tasksList"] });
      }
    },
  });
};

export const useDeleteTask = (id: string, projectId?: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async () =>
      await axiousResuest({
        url: `api/tasks/${id}`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: ["tasksList", projectId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["tasksList"] });
      }
    },
  });
};

