"use client";

import React from "react";
import { useGetTasks, type TaskType } from "@/hooks/tasks.hooks";
import { ProjectType } from "@/hooks/projects.hooks";
import TaskForm from "./TaskForm";
import DeleteAction from "@/components/core/actions/DeleteAction";
import { useDeleteTask } from "@/hooks/tasks.hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDatestamp } from "@/lib/utils";

interface TaskManagementContainerProps {
  selectedProject: ProjectType | null;
}

const TaskCard: React.FC<{
  task: TaskType;
  project: ProjectType | null;
}> = ({ task, project }) => {
  // Use project from task if available, otherwise use passed project
  const taskProject = task.project_Info ? {
    _id: task.project_Info._id,
    name: task.project_Info.name,
    team_info: null, // project_Info doesn't include team_info
  } as ProjectType : project;
  const deleteTask = useDeleteTask(task._id, taskProject?._id);
  const handleDeleteSubmit = async () => {
    await deleteTask.mutateAsync();
    toast.success("Task deleted successfully");
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };


  // Calculate days since creation
  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Today" : `${diffDays}d`;
  };

  return (
    <div className="bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-200">
      {/* Client Name */}
      {taskProject?.name && (
        <div className="text-gray-500 text-[10px] mb-1.5">
          Client: {taskProject.name}
        </div>
      )}

      {/* Title and Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-gray-900 text-sm font-medium flex-1 leading-tight">
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <TaskForm instance={task} project={taskProject} iconOnly />
          <DeleteAction
            handleDeleteSubmit={handleDeleteSubmit}
            isLoading={deleteTask.isPending}
            isOnlyIcon={true}
          />
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: Member, Badge, and Metadata */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {task.assigned_member_info ? (
            <>
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-[10px] font-medium">
                  {task.assigned_member_info.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border flex-shrink-0 ${getPriorityBadgeColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </>
          ) : (
            <span className="text-gray-400 text-xs">Unassigned</span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] flex-shrink-0">
          {task.createdAt && (
            <span>{getDaysAgo(task.createdAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskColumn: React.FC<{
  title: string;
  tasks: TaskType[];
  project: ProjectType | null;
  status: "Pending" | "In Progress" | "Done";
}> = ({ title, tasks, project: selectedProject, status }) => {
  return (
    <div
      className="flex flex-col h-[calc(100vh-150px)]  rounded-lg p-3"
    >
      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200 mb-2">
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        <span
          className="bg-white text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm"
        >
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto ">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-6">
            No tasks
          </div>
        ) : (
          tasks.map((task) => {
            // Use project from task if available, otherwise use selected project
            const taskProject = task.project_Info ? {
              _id: task.project_Info._id,
              name: task.project_Info.name,
              team_info: null,
            } as ProjectType : selectedProject;
            return (
              <TaskCard key={task._id} task={task} project={taskProject} />
            );
          })
        )}
      </div>

    </div>
  );
};

const TaskManagementContainer: React.FC<TaskManagementContainerProps> = ({
  selectedProject,
}) => {
  const { data: tasksData, isLoading, error } = useGetTasks(
    selectedProject?._id || null
  );

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
            <Button className="bg-t-orange-light hover:bg-t-orange text-black font-medium text-sm px-4 py-2 rounded-full">
              Re-assign
            </Button>
          )}
          <TaskForm project={selectedProject} />
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
        <div className="grid grid-cols-3 gap-3 max-w-4xl">
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
