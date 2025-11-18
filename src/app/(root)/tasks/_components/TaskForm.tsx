"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/core/TextInput";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCreateTask,
  useUpdateTask,
  type TaskType,
} from "@/hooks/tasks.hooks";
import { useGetMembersList } from "@/hooks/members.hooks";
import { useGetProjectsList } from "@/hooks/projects.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Plus } from "lucide-react";
import { ProjectType } from "@/hooks/projects.hooks";

interface TaskFormProps {
  instance?: TaskType | null;
  project: ProjectType | null;
  iconOnly?: boolean;
  triggerText?: string;
}

const TaskValidation = () =>
  yup.object().shape({
    title: yup.string().required("This Field is Required"),
    description: yup.string(),
    project_id: yup.string().required("This Field is Required"),
    assigned_member: yup.string(),
    priority: yup
      .string()
      .oneOf(["Low", "Medium", "High"], "Invalid priority")
      .required("This Field is Required"),
    status: yup
      .string()
      .oneOf(["Pending", "In Progress", "Done"], "Invalid status")
      .required("This Field is Required"),
  });

const TaskForm: React.FC<TaskFormProps> = ({
  instance = null,
  project,
  iconOnly = false,
  triggerText,
}) => {
  const [open, setOpen] = useState(false);
  const [capacityWarningOpen, setCapacityWarningOpen] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [overCapacityMember, setOverCapacityMember] = useState<{
    name: string;
    used_capacity: number;
    capacity: number;
  } | null>(null);
  
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(instance?._id || "temp");
  const { data: membersData } = useGetMembersList();
  const { data: projectsData } = useGetProjectsList();

  const isEditMode = !!instance;

  // Get projects list for project selector (when project is null)
  const projectsList = projectsData?.results || [];

  const {
    handleChange,
    values,
    touched,
    errors,
    handleSubmit,
    resetForm,
    setValues,
    setFieldValue,
    setTouched,
  } = useFormik({
    initialValues: {
      title: instance?.title || "",
      description: instance?.description || "",
      project_id: project?._id || instance?.project_id || "",
      assigned_member: instance?.assigned_member_info?._id || instance?.member_id || "",
      priority: (instance?.priority as "Low" | "Medium" | "High") || "Medium",
      status: (instance?.status as "Pending" | "In Progress" | "Done") || "Pending",
    },
    validationSchema: TaskValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      // Ensure project_id is set (either from prop or form value)
      const finalProjectId = project?._id || data.project_id;
      
      if (!finalProjectId) {
        toast.error("Project is required");
        setFieldValue("project_id", "", true);
        setTouched({ ...touched, project_id: true });
        return;
      }

      // Validate required fields
      if (!data.title || !data.title.trim()) {
        toast.error("Title is required");
        return;
      }

      if (!data.status) {
        toast.error("Status is required");
        return;
      }

      try {
        const payload: any = {
          title: data.title.trim(),
          description: data.description || undefined,
          project_id: finalProjectId,
          priority: data.priority,
          status: data.status,
        };
        
        // API expects assigned_member field
        if (data.assigned_member) {
          payload.assigned_member = data.assigned_member;
        }

        if (isEditMode) {
          const result = await updateTask.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Task updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update task");
          }
        } else {
          const result = await createTask.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Task created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create task");
          }
        }
      } catch (error: any) {
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((key: { attr: string; detail: string }) => {
            toast.error(`${key?.attr} - ${key?.detail}`);
          });
        } else {
          toast.error(error?.message || "An error occurred");
        }
      }
    },
  });

  // Get team members from project's team_info or selected project
  const selectedProjectForMembers = project || (values.project_id 
    ? projectsList.find(p => p._id === values.project_id) 
    : null);
  const teamMembers =
    selectedProjectForMembers?.team_info?.members?.map((member) => ({
      value: member._id,
      label: member.name,
      capacity: member.capacity,
      used_capacity: member.used_capacity,
    })) || [];

  // Handle member selection with capacity check
  const handleMemberSelection = (memberId: string) => {
    const member = teamMembers.find(m => m.value === memberId);
    
    if (member && member.used_capacity >= member.capacity) {
      // Member is at or over capacity - show warning
      setPendingMemberId(memberId);
      setOverCapacityMember({
        name: member.label,
        used_capacity: member.used_capacity,
        capacity: member.capacity,
      });
      setCapacityWarningOpen(true);
    } else {
      // Member has capacity - assign directly
      setFieldValue("assigned_member", memberId || "", false);
    }
  };

  // Handle capacity warning confirmation
  const handleCapacityWarningConfirm = () => {
    if (pendingMemberId) {
      setFieldValue("assigned_member", pendingMemberId, false);
    }
    setCapacityWarningOpen(false);
    setPendingMemberId(null);
    setOverCapacityMember(null);
  };

  // Handle capacity warning cancel
  const handleCapacityWarningCancel = () => {
    setCapacityWarningOpen(false);
    setPendingMemberId(null);
    setOverCapacityMember(null);
  };

  useEffect(() => {
    if (instance && open) {
      setValues({
        title: instance.title || "",
        description: instance.description || "",
        project_id: instance.project_id || project?._id || "",
        assigned_member: instance?.assigned_member_info?._id || instance?.member_id || "",
        priority: (instance.priority as "Low" | "Medium" | "High") || "Medium",
        status: (instance.status as "Pending" | "In Progress" | "Done") || "Pending",
      });
    } else if (!instance && open) {
      setValues({
        title: "",
        description: "",
        project_id: project?._id || "",
        assigned_member: "",
        priority: "Medium",
        status: "Pending",
      });
    }
  }, [instance, open, setValues, project]);

  const isLoading = isEditMode ? updateTask.isPending : createTask.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <button className="text-t-black cursor-pointer hover:opacity-80 transition-opacity">
            <Edit3 className="w-4 h-4" />
          </button>
        ) : iconOnly ? (
          <button className="text-t-gray p-2 rounded-full border border-t-gray cursor-pointer hover:text-t-orange transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        ) : triggerText ? (
          <button className="text-gray-600 text-xs font-medium hover:text-gray-900 transition-colors text-left py-1">
            {triggerText}
          </button>
        ) : (
          <Button className="rounded-full cursor-pointer bg-t-black hover:bg-t-orange-light text-t-gray hover:text-black font-semibold text-sm px-4 py-2">
            Create Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {isEditMode ? "Edit Task" : "Create Task"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form
          onSubmit={(e) => {
            setTouched({
              title: true,
              description: true,
              project_id: true,
              assigned_member: true,
              priority: true,
              status: true,
            });
            handleSubmit(e);
          }}
          className="space-y-3 mt-4"
        >
          {/* Project Selector - Only show if project is not provided */}
          {!project && (
            <div>
              <Label htmlFor="project_id" className="text-sm mx-3 mb-2 text-white/60">
                Project *
              </Label>
              <div>
                <Select
                  value={values.project_id || undefined}
                  onValueChange={(value) => {
                    setFieldValue("project_id", value, false);
                    // Reset assigned_member when project changes
                    setFieldValue("assigned_member", "", false);
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-full border-gray-300">
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent className="bg-t-gray text-t-black">
                    {projectsList.map((proj) => (
                      <SelectItem key={proj._id} value={proj._id}>
                        {proj.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_id && touched.project_id && (
                  <p className="text-orange-400 px-2 pt-2 text-sm">
                    {errors.project_id}
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="title" className="text-sm mx-3 text-white/60">
              Title *
            </Label>
            <TextInput
              id="title"
              type="text"
              name="title"
              onChange={handleChange}
              value={values.title}
              className="h-9"
              error={
                Boolean(errors.title) && touched.title ? errors.title : undefined
              }
              placeholder="Task title"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm mx-3 text-white/60">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              onChange={handleChange}
              value={values.description}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-white  resize-none"
              placeholder="Task description"
            />
            {errors.description && touched.description && (
              <p className="text-orange-400 px-2 pt-2 text-sm">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="assigned_member" className="text-sm mx-3 mb-2 text-white/60">
              Assigned Member
            </Label>
            <div >
              <Select
                value={values.assigned_member || undefined}
                onValueChange={(value) => {
                  if (value) {
                    handleMemberSelection(value);
                  } else {
                    setFieldValue("assigned_member", "", false);
                  }
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-full border-gray-300">
                  <SelectValue placeholder="Select a member (optional)..." />
                </SelectTrigger>
                <SelectContent className="bg-t-gray text-t-black">
                  {teamMembers.map((member) => (
                    <SelectItem key={member.value} value={member.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{member.label}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          ({member.used_capacity}/{member.capacity})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="priority" className="text-sm mx-3 mb-2 text-white/60">
              Priority *
            </Label>
            <div >
              <Select
                value={values.priority}
                onValueChange={(value) => {
                  setFieldValue("priority", value, false);
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-full border-gray-300">
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent className="bg-t-gray text-t-black">
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && touched.priority && (
                <p className="text-orange-400 px-2 pt-2 text-sm">
                  {errors.priority}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-sm mx-3 mb-2 text-white/60">
              Status *
            </Label>
            <div >
              <Select
                value={values.status}
                onValueChange={(value) => {
                  setFieldValue("status", value, false);
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-full border-gray-300">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent className="bg-t-gray text-t-black">
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && touched.status && (
                <p className="text-orange-400 px-2 pt-2 text-sm">
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 cursor-pointer rounded-full bg-white hover:bg-t-orange-light text-black font-semibold"
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Task"
                : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Capacity Warning Dialog */}
      <AlertDialog open={capacityWarningOpen} onOpenChange={setCapacityWarningOpen}>
        <AlertDialogContent className="bg-t-black text-white max-w-xs p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-center mb-2">
              Capacity Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {overCapacityMember && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">
                    {overCapacityMember.name} has {overCapacityMember.used_capacity} task{overCapacityMember.used_capacity !== 1 ? "s" : ""} but capacity is {overCapacityMember.capacity}.
                  </p>
                  <p className="text-white/60 text-sm font-medium">
                    Assign anyway?
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-4">
            <AlertDialogCancel
              onClick={handleCapacityWarningCancel}
              className="flex-1 rounded-full cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCapacityWarningConfirm}
              className="flex-1 cursor-pointer rounded-full bg-t-orange-light hover:bg-t-orange text-black font-semibold"
            >
              Assign Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default TaskForm;

