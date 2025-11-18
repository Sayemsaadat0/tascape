"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";

// Define TypeScript types/interfaces for Users
export interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_count: number;
}

export interface FiltersType {
  search: string;
  role: string;
}

export interface UsersResponseType {
  success: boolean;
  message: string;
  results: UserType[];
  pagination: PaginationType;
  filters: FiltersType;
}

export const useGetUsers = () => {
  const { token } = useAuthStore();
  return useQuery<UsersResponseType>({
    queryKey: ["userList"],
    queryFn: () =>
      axiousResuest({
        url: `api/users`,
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
  });
};
