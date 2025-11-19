"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetTasks, useReassign } from "@/hooks/tasks.hooks";
import { ProjectType, useGetProjectsList } from "@/hooks/projects.hooks";
import TaskForm from "./TaskForm";
import { Button } from "@/components/ui/button";
import TaskColumn from "./TaskColumn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetMembersList } from "@/hooks/members.hooks";
import useDebounce from "@/hooks/useDebounce";
import { toast } from "sonner";

interface TaskManagementContainerProps {
  selectedProject: ProjectType | null;
}

const TaskManagementContainer: React.FC<TaskManagementContainerProps> = ({
  selectedProject,
}) => {
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [memberFilter, setMemberFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 1000);

  const {
    data: projectsData,
    error: projectsError,
    isLoading: isProjectsLoading,
  } = useGetProjectsList();
  const projectsList = useMemo(
    () => projectsData?.results || [],
    [projectsData]
  );

  const {
    data: membersData,
    error: membersError,
    isLoading: isMembersLoading,
  } = useGetMembersList();
  const membersList = useMemo(
    () => membersData?.results || [],
    [membersData]
  );

  const projectFromFilter = useMemo(
    () => (projectFilter ? projectsList.find((project) => project._id === projectFilter) || null : null),
    [projectFilter, projectsList]
  );
  const projectForMembers = selectedProject || projectFromFilter || null;

  const memberOptions = useMemo(() => {
    if (projectForMembers?.team_info?.members?.length) {
      return projectForMembers.team_info.members
        .map((member) => {
          const memberId = member._id || (member as any).id || "";
          return memberId
            ? {
                id: memberId,
                name: member.name,
              }
            : null;
        })
        .filter((member): member is { id: string; name: string } => Boolean(member));
    }

    return membersList.map((member) => ({
      id: member._id,
      name: member.name,
    }));
  }, [projectForMembers, membersList]);

  const resolvedMemberFilter = useMemo(() => {
    if (!memberFilter) {
      return "";
    }
    return memberOptions.some((member) => member.id === memberFilter)
      ? memberFilter
      : "";
  }, [memberFilter, memberOptions]);

  useEffect(() => {
    if (projectsError) {
      const message =
        projectsError instanceof Error
          ? projectsError.message
          : "Failed to load projects";
      toast.error(message);
    }
  }, [projectsError]);

  useEffect(() => {
    if (membersError) {
      const message =
        membersError instanceof Error
          ? membersError.message
          : "Failed to load members";
      toast.error(message);
    }
  }, [membersError]);

  const projectIdForQuery = selectedProject?._id || projectFilter || null;
  const memberIdForQuery = resolvedMemberFilter || null;

  const {
    data: tasksData,
    isLoading,
    error,
  } = useGetTasks({
    projectId: projectIdForQuery,
    memberId: memberIdForQuery,
    search: debouncedSearch,
  });
  const { mutateAsync: reassignTasks, isPending: isReassigning } = useReassign();

  const handleReassign = async () => {
    if (!selectedProject?._id) {
      return;
    }

    try {
      const result = await reassignTasks({ projectId: selectedProject._id });
      const reassignmentCount = result?.result?.reassignments_count ?? 0;

      if (reassignmentCount > 0) {
        toast.success(result?.message || "Tasks reassigned successfully");
      } else {
        toast.info("We didn't re-assign any task since every member has free capacity.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to re-assign tasks");
    }
  };

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : "Failed to load tasks";
      toast.error(message);
    }
  }, [error]);

  if (error) {
    return (
      <div className="bg-white max-w-5xl mx-auto p-8 rounded-lg text-center">
        <p className="text-red-500">Failed to load tasks</p>
      </div>
    );
  }

  const tasks = tasksData?.results || [];

  // Group tasks by status
  const pendingTasks = tasks.filter((task) => task.status === "Pending");
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
  const doneTasks = tasks.filter((task) => task.status === "Done");

  return (
    <div className=" ">
      <div className="flex justify-between bg-white items-center border-b border-gray-200 py-2 px-4">
        <div>
          <h1 className="text-xl font-medium text-black">
            {selectedProject ? selectedProject.name : "All Tasks"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-400 text-xs">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
            {selectedProject?.team_info && (
              <>
                <span className="text-gray-300 text-xs">•</span>
                <p className="text-gray-400 text-xs">
                  Team: {selectedProject.team_info.title}
                  {selectedProject.team_info.members?.length > 0 && (
                    <span className="ml-1">
                      ({selectedProject.team_info.members.length} member{selectedProject.team_info.members.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedProject && (
            <Button
              onClick={handleReassign}
              disabled={isReassigning}
              className="bg-t-orange-light hover:bg-t-orange text-black font-medium text-sm px-4 py-2 rounded-full disabled:opacity-70"
            >
              {isReassigning ? "Re-assigning..." : "Re-assign"}
            </Button>
          )}
          <TaskForm project={selectedProject} />
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-t-gray">
        <div className="flex flex-col gap-3 md:flex-wrap md:flex-row md:items-center md:justify-end">
          <div className="w-full md:w-56 md:order-1">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by task title"
              className="h-10 rounded-md  bg-white border-gray-300"
            />
          </div>

          {!selectedProject && (
            <div className="w-full md:w-32 md:order-2">
              <Select
                value={projectFilter || "__all__"}
                onValueChange={(value) =>
                  setProjectFilter(value === "__all__" ? "" : value)
                }
                disabled={isProjectsLoading}
              >
                <SelectTrigger
                  className="h-10 rounded-md border-gray-300 bg-white w-full"
                  disabled={isProjectsLoading}
                >
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="bg-white text-t-black">
                  <SelectItem className="bg-white text-t-black" value="__all__">All projects</SelectItem>
                  {projectsList.map((projectItem) => (
                    <SelectItem className="bg-white text-t-black" key={projectItem._id} value={projectItem._id}>
                      {projectItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="w-full md:w-32 md:order-3">
            <Select
              value={resolvedMemberFilter || "__all__"}
              onValueChange={(value) =>
                setMemberFilter(value === "__all__" ? "" : value)
              }
              disabled={isMembersLoading}
            >
              <SelectTrigger
                className="h-10 rounded-md border-gray-300 bg-white w-full"
                disabled={isMembersLoading}
              >
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent className="bg-white text-t-black">
                <SelectItem className="bg-white text-t-black" value="__all__">All members</SelectItem>
                {memberOptions.map((member) => (
                  <SelectItem className="bg-white text-t-black" key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-3">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 max-w-4xl">
            {[
              { status: "Pending" },
              { status: "In Progress" },
              { status: "Done" },
            ].map((col) => (
              <div
                key={col.status}
                className="flex flex-col h-[calc(100vh-300px)] bg-gray-200 rounded-lg p-3"
              >
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((card) => (
                    <div
                      key={card}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                    >
                      <div className="h-3.5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-2.5 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-2.5 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 max-w-4xl">
            <TaskColumn
              title="Pending"
              tasks={pendingTasks}
              project={selectedProject}
              status="Pending"
            />
            <TaskColumn
              title="In Progress"
              tasks={inProgressTasks}
              project={selectedProject}
              status="In Progress"
            />
            <TaskColumn
              title="Done"
              tasks={doneTasks}
              project={selectedProject}
              status="Done"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagementContainer;
