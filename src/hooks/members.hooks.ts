"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

/** 
 * Member type according to API response
 */
export interface MemberType {
  _id: string;
  name: string;
  role: string;
  capacity: number | null;
  used_capacity: number | null;
  user_id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface MembersResponseType {
  success: boolean;
  message: string;
  results: MemberType[];
}

export const useGetMembersList = () => {
  const { token } = useAuthStore();
  return useQuery<MembersResponseType>({
    queryKey: ["membersList"],
    queryFn: () =>
      axiousResuest({
        url: `api/members/`,
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async (body: Partial<MemberType>) =>
      await axiousResuest({
        url: `api/members/`,
        method: "post",
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersList"] });
    },
  });
};

export const useUpdateMember = (id: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async (body: Partial<MemberType>) =>
      await axiousResuest({
        url: `api/members/${id}`,
        method: "patch",
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersList"] });
    },
  });
};

export const useDeleteMember = (id: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: async () =>
      await axiousResuest({
        url: `api/members/${id}`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersList"] });
    },
  });
};
