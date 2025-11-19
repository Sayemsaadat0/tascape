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
  useCreateTeam,
  useUpdateTeam,
  type TeamType,
} from "@/hooks/teams.hooks";
import { useGetMembersList } from "@/hooks/members.hooks";
import { Edit3, Plus } from "lucide-react";
import MultiSelect from "@/components/core/MultiSelect";
import MemberForm from "../../members/_components/MemberForm";

interface TeamFormProps {
  instance?: TeamType | null;
  iconOnly?: boolean;
}

const TeamValidation = () =>
  yup.object().shape({
    title: yup.string().required("This Field is Required"),
    members: yup
      .array()
      .of(yup.string())
      .min(1, "At least one member is required")
      .required("Members are required"),
  });

const TeamForm: React.FC<TeamFormProps> = ({
  instance = null,
  iconOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam(instance?._id || "temp");
  const { data: membersData } = useGetMembersList();

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
  } = useFormik({
    initialValues: {
      title: instance?.title || "",
      members: instance?.members?.map((m) => m._id) || [],
    },
    validationSchema: TeamValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      try {
        const payload = {
          title: data.title,
          members: data.members,
        };

        if (isEditMode) {
          const result = await updateTeam.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Team updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update team");
          }
        } else {
          const result = await createTeam.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Team created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create team");
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
        title: instance.title || "",
        members: instance.members?.map((m) => m._id) || [],
      });
    } else if (!instance && open) {
      setValues({
        title: "",
        members: [],
      });
    }
  }, [instance, open, setValues]);

  const isLoading = isEditMode ? updateTeam.isPending : createTeam.isPending;

  // Helper function to truncate name to 10 characters
  const truncateName = (name: string) => {
    if (name.length > 10) {
      return name.substring(0, 10) + "...";
    }
    return name;
  };

  const memberOptions =
    membersData?.results?.map((member) => ({
      value: member._id,
      label: truncateName(member.name),
    })) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <button className="text-green-600 cursor-pointer">
            <Edit3 className="w-5 h-5" />
          </button>
        ) : iconOnly ? (
          <button className="text-black cursor-pointer hover:text-t-orange transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <Button className="rounded-full cursor-pointer bg-t-black hover:bg-t-orange-light text-t-gray hover:text-black font-semibold">
            Create Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {isEditMode ? "Edit Team" : "Create Team"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <Label htmlFor="title" className="text-sm mx-3 text-white/60">
            Title
          </Label>
          <TextInput
            id="title"
            type="text"
            name="title"
            onChange={handleChange}
            value={values.title}
            error={
              Boolean(errors.title) && touched.title ? errors.title : undefined
            }
            placeholder="Team title"
          />

          <div className="flex-1">
           <div className="mb-2 flex justify-between">
           <Label
              htmlFor="members"
              className="text-sm mx-3 mb-2 text-white/60"
            >
              Members
            </Label>
            <MemberForm  />
           </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <MultiSelect
                  options={memberOptions}
                  value={values.members}
                  onChange={(selected) => setFieldValue("members", selected)}
                  placeholder="Select members..."
                />
                {errors.members && touched.members && (
                  <p className="text-orange-400 px-2 pt-2">{errors.members}</p>
                )}
              </div>

              
            </div>
          </div>

          <div className="mt-5">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 cursor-pointer rounded-full bg-white hover:bg-t-orange-light text-black font-semibold"
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Team"
                : "Create Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamForm;
