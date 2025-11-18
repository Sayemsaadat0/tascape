"use client";

import axiousResuest from "@/lib/axiousRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type AuthBodyType = {
  name?: string;
  email: string;
  password: string;
};

    export const useRegister = () => {
    // const queryClient = useQueryClient();
    // const { data: session }: any = useSession();
    return useMutation({
        mutationFn: async (body: AuthBodyType) =>
        await axiousResuest({
            url: `api/auth/register`,
            method: "post",
            data: body,
            headers: {
            "Content-Type": "application/json",
            },
        }),
        //   onSuccess: () => {
        //     toast.success('User created successfully');
        //   },
    });
    };

export const useLogin = () => {
    return useMutation({
        mutationFn: async (body: AuthBodyType) =>
        await axiousResuest({
            url: `api/auth/login`,
            method: "post",
            data: body,
            headers: {
            "Content-Type": "application/json",
            },
        }),
    });
};