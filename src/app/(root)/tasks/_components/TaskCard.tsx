"use client";

import React from "react";
import { TaskType } from "@/hooks/tasks.hooks";
import { ProjectType } from "@/hooks/projects.hooks";
import TaskForm from "./TaskForm";
import DeleteAction from "@/components/core/actions/DeleteAction";
import ViewTaskDetails from "./ViewTaskDetails";
import { useDeleteTask } from "@/hooks/tasks.hooks";
import { toast } from "sonner";
import { Clock3, Building2, Layers } from "lucide-react";

interface TaskCardProps {
  task: TaskType;
  project: ProjectType | null;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, project }) => {
  const taskProject = task.project_Info
    ? ({
        _id: task.project_Info._id,
        name: task.project_Info.name,
        team_info: null,
      } as ProjectType)
    : project;

  const deleteTask = useDeleteTask(task._id);

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

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Today" : `${diffDays}d`;
  };

  const memberInitial =
    task.assigned_member_info?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium border ${getPriorityBadgeColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-[11px] font-medium">
            <Layers className="h-3.5 w-3.5 text-gray-500" />
            {task.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
          <Clock3 className="h-3.5 w-3.5" />
          {task.createdAt && <span>{getDaysAgo(task.createdAt)}</span>}
        </div>
      </div>

      {taskProject?.name && (
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <Building2 className="h-3.5 w-3.5 text-gray-400" />
          {taskProject.name}
        </div>
      )}

      <div>
        <h3 className="text-gray-900 text-base font-semibold leading-tight">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-gray-600 text-sm mt-1 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
            {memberInitial}
          </div>
          <span className="text-xs text-gray-500">
            {task.assigned_member_info?.name || "Unassigned"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ViewTaskDetails task={task} project={taskProject} />
          <TaskForm instance={task} project={taskProject} iconOnly />
          <DeleteAction
            handleDeleteSubmit={handleDeleteSubmit}
            isLoading={deleteTask.isPending}
            isOnlyIcon
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

