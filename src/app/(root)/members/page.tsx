"use client";

import {
  useGetMembersList,
  useDeleteMember,
  type MemberType,
} from "@/hooks/members.hooks";
import DashboardTable, {
  type DashboardTableColumn,
} from "@/components/core/DashboardTable";
import React from "react";
import DeleteAction from "@/components/core/actions/DeleteAction";
import { toast } from "sonner";
import MemberForm from "./_components/MemberForm";

const MemberActionCell: React.FC<{ member: MemberType }> = ({ member }) => {
  const deleteMember = useDeleteMember(member._id);
  const handleDeleteSubmit = async () => {
    await deleteMember.mutateAsync();
    toast.success("Member deleted successfully");
  };

  return (
    <div className="flex items-center gap-2">
      <MemberForm instance={member} />
      <DeleteAction
        handleDeleteSubmit={handleDeleteSubmit}
        isLoading={deleteMember.isPending}
        isOnlyIcon={true}
      />
    </div>
  );
};

const MembersPage = () => {
  const { data: members, isLoading, error } = useGetMembersList();

  const MembersColumn: DashboardTableColumn[] = [
    {
      title: "Name",
      dataKey: "name",
      row: (data: MemberType) => <p className="text-black">{data?.name}</p>,
    },
    {
      title: "Role",
      dataKey: "role",
      row: (data: MemberType) => <p className="text-black">{data?.role}</p>,
    },
    {
      title: "Capacity",
      dataKey: "capacity",
      row: (data: MemberType) => (
        <p className="text-black">{data?.capacity ?? 0}</p>
      ),
    },
    {
      title: "Used Capacity",
      dataKey: "used_capacity",
      row: (data: MemberType) => (
        <p className="text-black">{data?.used_capacity ?? 0}</p>
      ),
    },
    {
      title: "Action",
      dataKey: "action",
      row: (data: MemberType) => (
        <div className="flex justify-end">
          <MemberActionCell member={data} />
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white/60">Failed to load members</p>
      </div>
    );
  }

  return (
    <div className=" space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-t-black mb-4">
          Members
          {members?.results?.length ? ` (${members.results.length})` : ""}
        </h1>
        <div>
          <MemberForm  />
        </div>
      </div>

      <DashboardTable
        columns={MembersColumn}
        isLoading={isLoading}
        data={members?.results || []}
      />
    </div>
  );
};

export default MembersPage;
