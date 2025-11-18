"use client";

import { useGetUsers, type UserType } from "@/hooks/users.hooks";
import DashboardTable, {
  type DashboardTableColumn,
} from "@/components/core/DashboardTable";
import { formatDatestamp } from "@/lib/utils";

const UsersPage = () => {
  const { data: users, isLoading, error } = useGetUsers();

  const UsersColumn: DashboardTableColumn[] = [
    {
      title: "Name",
      dataKey: "name",
      row: (data: UserType) => (
        <p className="text-black">{data?.name}</p>
      ),
    },
    {
      title: "Email",
      dataKey: "email",
      row: (data: UserType) => (
        <p className="text-black">{data?.email}</p>
      ),
    },
    {
      title: "Role",
      dataKey: "role",
      row: (data: UserType) => (
        <p className="text-black">{data?.role}</p>
      ),
    },
    {
      title: "Created At",
      dataKey: "createdAt",
      row: (data: UserType) => (
        <p className="text-black">
          {data?.createdAt ? formatDatestamp(data.createdAt) : "-"}
        </p>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 p-5">
        <p className="text-white/60">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold text-t-black mb-4">
        User Management
        {users?.pagination?.total_count
          ? `(${users.pagination.total_count})`
          : ""}
      </h1>

      <DashboardTable
        columns={UsersColumn}
        isLoading={isLoading}
        data={users?.results || []}
      />
    </div>
  );
};

export default UsersPage;
