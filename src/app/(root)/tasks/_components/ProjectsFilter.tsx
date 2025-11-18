"use client";

import { ProjectType } from "@/hooks/projects.hooks";

const ProjectsFilter = ({
  projects,
  isLoading,
  error,
  selectedProject,
  setSelectedProject,
}: {
  projects: ProjectType[];
  isLoading: boolean;
  error: any;
  selectedProject: ProjectType | null;
  setSelectedProject: (project: ProjectType | null) => void;
}) => {
  if (error) {
    return (
      <div className="text-red-400 text-sm p-3">
        Error: {error.message || "Failed to load projects"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4">Projects</h3>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
          >
            <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className=" text-white mb-4">Projects</h3>
      {projects.length === 0 ? (
        <p className="text-white/60 text-sm">No projects found</p>
      ) : (
        <div className="space-y-2">
          <div
            className={`w-full px-2 py-1 text-left rounded-lg border border-white/20 transition-colors cursor-pointer
              ${
                selectedProject === null
                  ? "bg-t-gray text-black"
                  : "bg-white/10 text-t-gray"
              }`}
            onClick={() => setSelectedProject(null)}
          >
            <p
              className={`font-medium text-sm ${
                selectedProject === null ? "text-black" : "text-t-gray"
              }`}
            >
              All Tasks
            </p>
          </div>
          {projects.map((project) => {
            const isSelected = selectedProject?._id === project._id;
            return (
              <div
                key={project._id}
                className={`w-full px-2 py-1 text-left rounded-lg border border-white/20 transition-colors cursor-pointer
                  ${isSelected ? "bg-t-gray text-black" : "bg-white/10 text-t-gray"}`}
                onClick={() => setSelectedProject(project)}
              >
                <p
                  className={`font-medium text-sm line-clamp-3 ${
                    isSelected ? "text-black" : "text-t-gray"
                  }`}
                >
                  {project.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsFilter;
