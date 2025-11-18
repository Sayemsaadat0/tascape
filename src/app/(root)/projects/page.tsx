"use client";

import {
  useGetProjectsList,
  useDeleteProject,
  type ProjectType,
} from "@/hooks/projects.hooks";
import DashboardTable, {
  type DashboardTableColumn,
} from "@/components/core/DashboardTable";
import React from "react";
import DeleteAction from "@/components/core/actions/DeleteAction";
import { toast } from "sonner";
import ProjectForm from "./_components/ProjectForm";
import { formatDatestamp } from "@/lib/utils";

const ProjectActionCell: React.FC<{ project: ProjectType }> = ({
  project,
}) => {
  const deleteProject = useDeleteProject(project._id);
  const handleDeleteSubmit = async () => {
    await deleteProject.mutateAsync();
    toast.success("Project deleted successfully");
  };

  return (
    <div className="flex items-center gap-2">
      <ProjectForm instance={project} />
      <DeleteAction
        handleDeleteSubmit={handleDeleteSubmit}
        isLoading={deleteProject.isPending}
        isOnlyIcon={true}
      />
    </div>
  );
};

const ProjectsPage = () => {
  const { data: projects, isLoading, error } = useGetProjectsList();

  // Helper function to truncate name to 10 characters
  const truncateName = (name: string) => {
    if (name.length > 10) {
      return name.substring(0, 10) + "...";
    }
    return name;
  };

  const ProjectsColumn: DashboardTableColumn[] = [
    {
      title: "Name",
      dataKey: "name",
      row: (data: ProjectType) => <p className="text-black">{data?.name}</p>,
    },
    {
      title: "Team",
      dataKey: "team",
      row: (data: ProjectType) => (
        <p className="text-black">
          {data?.team_info?.title || "No team assigned"}
        </p>
      ),
    },
    {
      title: "Members",
      dataKey: "members",
      row: (data: ProjectType) => {
        const members = data?.team_info?.members || [];
        if (members.length === 0) {
          return <p className="text-black text-sm">No members</p>;
        }
        return (
          <div className="flex flex-wrap gap-2 max-w-[400px]">
            {members.map((member) => (
              <span
                key={member._id}
                className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-black border border-gray-200"
              >
                {truncateName(member.name)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: "Created At",
      dataKey: "createdAt",
      row: (data: ProjectType) => (
        <p className="text-black">
          {data?.createdAt ? formatDatestamp(data.createdAt) : "-"}
        </p>
      ),
    },
    {
      title: "Action",
      dataKey: "action",
      row: (data: ProjectType) => (
        <div className="flex justify-end">
          <ProjectActionCell project={data} />
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 p-5">
        <p className="text-white/60">Failed to load projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-t-black mb-4">
          Projects
          {projects?.results?.length ? ` (${projects.results.length})` : ""}
        </h1>
        <div>
          <ProjectForm />
        </div>
      </div>

      <DashboardTable
        columns={ProjectsColumn}
        isLoading={isLoading}
        data={projects?.results || []}
      />
    </div>
  );
};

export default ProjectsPage;
