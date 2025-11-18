import { AdminLayout } from "@/components/core/layout/AdminLayout";
import AuthProvider from "@/provider/AuthProvider";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
};

export default layout;
