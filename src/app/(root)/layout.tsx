import { AdminLayout } from "@/components/core/layout/AdminLayout";
import AuthProvider from "@/provider/AuthProvider";
import React from "react";
import NextTopLoader from "nextjs-toploader";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <NextTopLoader color="#ffae17" easing="ease" showSpinner={false} />
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
};

export default layout;
