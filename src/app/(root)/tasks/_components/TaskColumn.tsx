"use client";

import React from "react";
import { TaskType } from "@/hooks/tasks.hooks";
import { ProjectType } from "@/hooks/projects.hooks";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  title: string;
  tasks: TaskType[];
  project: ProjectType | null;
  status: "Pending" | "In Progress" | "Done";
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  tasks,
  project,
}) => {
  return (
    <div className="flex flex-col rounded-lg h-[60vh] sm:h-[70vh] md:h-[calc(100vh-150px)] lg:h-[calc(100vh-180px)] xl:h-[calc(100vh-200px)] 2xl:h-[calc(100vh-220px)]">
      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200 mb-2">
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        <span className="bg-white text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto ">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-6">No tasks</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              project={
                task.project_Info
                  ? ({
                      _id: task.project_Info._id,
                      name: task.project_Info.name,
                      team_info: null,
                    } as ProjectType)
                  : project
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;

