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
  useCreateProject,
  useUpdateProject,
  type ProjectType,
} from "@/hooks/projects.hooks";
import { useGetTeamsList } from "@/hooks/teams.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Plus } from "lucide-react";

interface ProjectFormProps {
  instance?: ProjectType | null;
  iconOnly?: boolean;
}

const ProjectValidation = () =>
  yup.object().shape({
    name: yup.string().required("This Field is Required"),
    team_id: yup
      .string()
      .required("This Field is Required")
      .min(1, "This Field is Required"),
  });

const ProjectForm: React.FC<ProjectFormProps> = ({
  instance = null,
  iconOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(instance?._id || "temp");
  const { data: teamsData } = useGetTeamsList();

  const isEditMode = !!instance;

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
      name: instance?.name || "",
      team_id: instance?.team_id || "",
    },
    validationSchema: ProjectValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      try {
        const payload = {
          name: data.name,
          team_id: data.team_id,
        };

        if (isEditMode) {
          const result = await updateProject.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Project updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update project");
          }
        } else {
          const result = await createProject.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Project created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create project");
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

  useEffect(() => {
    if (instance && open) {
      setValues({
        name: instance.name || "",
        team_id: instance.team_id || "",
      });
    } else if (!instance && open) {
      setValues({
        name: "",
        team_id: "",
      });
    }
  }, [instance, open, setValues]);

  const isLoading = isEditMode
    ? updateProject.isPending
    : createProject.isPending;

  const teamOptions =
    teamsData?.results?.map((team) => ({
      value: team._id,
      label: team.title,
    })) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <button className="text-green-600 cursor-pointer">
            <Edit3 className="w-5 h-5" />
          </button>
        ) : iconOnly ? (
          <button className="text-t-gray p-2.5 rounded-full border border-t-gray cursor-pointer hover:text-t-orange transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <Button className="rounded-full cursor-pointer bg-t-black hover:bg-t-orange-light text-t-gray hover:text-black font-semibold">
            Create Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {isEditMode ? "Edit Project" : "Create Project"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form
          onSubmit={(e) => {
            // Mark all fields as touched before submit to show validation errors
            setTouched({
              name: true,
              team_id: true,
            });
            handleSubmit(e);
          }}
          className="space-y-3 mt-4"
        >
          <Label htmlFor="name" className="text-sm mx-3 text-white/60">
            Name
          </Label>
          <TextInput
            id="name"
            type="text"
            name="name"
            onChange={handleChange}
            value={values.name}
            className="h-9"
            error={
              Boolean(errors.name) && touched.name ? errors.name : undefined
            }
            placeholder="Project name"
          />

          <div className="flex-1">
            <Label
              htmlFor="team_id"
              className="text-sm mx-3 mb-2 text-white/60"
            >
              Team
            </Label>
            <div >
              <Select
                value={values.team_id || undefined}
                onValueChange={(value) => {
                  setFieldValue("team_id", value, false);
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-full border-gray-300 ">
                  <SelectValue placeholder="Select a team..." />
                </SelectTrigger>
                <SelectContent className="bg-t-gray text-t-black">
                  {teamOptions.map((team) => (
                    <SelectItem key={team.value}  value={team.value}>
                      {team.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.team_id && touched.team_id && (
                <p className="text-orange-400 px-2 pt-2">{errors.team_id}</p>
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
                ? "Update Project"
                : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;

