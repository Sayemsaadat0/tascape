"use client";
import { ProjectType, useGetProjectsList } from "@/hooks/projects.hooks";
import ProjectsFilter from "./_components/ProjectsFilter";
import { useState } from "react";
import TaskManagementContainer from "./_components/TaskManagementContainer";

export default function Tasks() {
  const { data: projects, isLoading, error } = useGetProjectsList();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  );
  console.log(selectedProject);
  return (
    <div className="flex relative ">
      <div className="fixed w-44  p-2 min-h-screen bg-t-black text-white">
        <ProjectsFilter
          projects={projects?.results || []}
          isLoading={isLoading}
          error={error}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      </div>
      <div className="ml-44 w-full ">
        <TaskManagementContainer selectedProject={selectedProject} />
      </div>
    </div>
  );
}
