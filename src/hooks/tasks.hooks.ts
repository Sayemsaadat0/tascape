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

interface UseGetTasksParams {
  projectId?: string | null;
  memberId?: string | null;
  search?: string;
}

interface ReassignDetail {
  task: string;
  from: string;
  to: string;
  from_assignee: string;
  to_assignee: string;
}

interface ReassignResult {
  total_tasks: number;
  reassignments_count: number;
  reassignments: ReassignDetail[];
}

interface ReassignResponse {
  success: boolean;
  message: string;
  result?: ReassignResult;
}

export const useGetTasks = ({
  projectId = null,
  memberId = null,
  search = "",
}: UseGetTasksParams) => {
  const { token } = useAuthStore();
  return useQuery<TasksResponseType>({
    queryKey: ["tasksList", { projectId, memberId, search }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (projectId) params.set("project_id", projectId);
      if (memberId) params.set("member_id", memberId);
      if (search) params.set("search", search);
      const queryString = params.toString();
      const url = queryString ? `api/tasks?${queryString}` : `api/tasks`;
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasksList"],
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
    onSuccess: () => {
      // Invalidate tasks for the project_id if provided, otherwise invalidate all
      queryClient.invalidateQueries({ queryKey: ["tasksList"] });
    },
  });
};

export const useDeleteTask = (id: string) => {
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
      queryClient.invalidateQueries({ queryKey: ["tasksList"] });
    },
  });
};

export const useReassign = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation<ReassignResponse, Error, { projectId: string }>({
    mutationFn: async ({ projectId }) =>
      (await axiousResuest({
        url: `api/tasks/re-assign`,
        method: "post",
        data: {
          project_id: projectId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })) as ReassignResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasksList"],
      });
    },
  });
};

