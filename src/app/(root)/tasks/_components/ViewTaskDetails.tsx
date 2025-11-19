"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskType } from "@/hooks/tasks.hooks";
import { ProjectType } from "@/hooks/projects.hooks";
import { Eye, Layers, Building2, UserRound, Clock3, AlignLeft } from "lucide-react";

interface ViewTaskDetailsProps {
  task: TaskType;
  project: ProjectType | null;
}

const detailLabelClass = "text-xs uppercase tracking-wide text-white/50";
const pillClass =
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border border-white/10 bg-white/5 text-white";

const ViewTaskDetails: React.FC<ViewTaskDetailsProps> = ({ task, project }) => {
  const memberName = task.assigned_member_info?.name || "Unassigned";
  const createdDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString()
    : "Unknown";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="text-t-black p-2 rounded-full cursor-pointer hover:text-t-orange transition-colors"
          aria-label="View task details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-md border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-center text-white/60">
            Detailed task information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-3">
          <div className="flex items-center justify-center gap-2">
            <span className={`${pillClass} border-t-orange-light/50 text-t-orange-light`}>
              {task.priority}
            </span>
            <span className={pillClass}>
              <Layers className="w-4 h-4" />
              {task.status}
            </span>
          </div>

          {project?.name && (
            <div className="space-y-1">
              <p className={detailLabelClass}>Property</p>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-white/60" />
                {project.name}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className={detailLabelClass}>Assigned Member</p>
              <div className="flex items-center gap-2 text-sm">
                <UserRound className="w-4 h-4 text-white/60" />
                {memberName}
              </div>
            </div>
            <div className="space-y-1">
              <p className={detailLabelClass}>Created</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock3 className="w-4 h-4 text-white/60" />
                {createdDate}
              </div>
            </div>
          </div>

          {task.description && (
            <div className="space-y-2">
              <p className={detailLabelClass}>Description</p>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-white/60">
                  <AlignLeft className="w-4 h-4" />
                  Overview
                </div>
                {task.description}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTaskDetails;

