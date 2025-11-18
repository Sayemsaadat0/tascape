"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LogoIcon } from "@/components/core/icons/icons";
import Image from "next/image";

interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  fallback = (
    <div className="min-h-screen flex items-center bg-t-gray justify-center">
      <div className="text-center flex flex-col items-center">
        <Image
          className="w-10 h-10 md:w-20 md:h-20 animate-bounce"
          src="/logo/short-logo1.png"
          alt="logo"
          width={300}
          height={300}
        />
        <p className="mt-4 text-gray-600 text-2xl font-bold">Loading...</p>
      </div>
    </div>
  ),
}) => {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!user || !token) {
        router.push("/sign-in");
        return;
      }
      setIsChecking(false);
    };

    const timer = setTimeout(checkAuth, 100);

    return () => clearTimeout(timer);
  }, [user, token, router]);

  if (isChecking) {
    return <>{fallback}</>;
  }

  if (!user || !token) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthProvider;
