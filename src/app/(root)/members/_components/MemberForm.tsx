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
  useCreateMember,
  useUpdateMember,
  type MemberType,
} from "@/hooks/members.hooks";
import { Edit3, Plus } from "lucide-react";

interface MemberFormProps {
  instance?: MemberType | null;
  iconOnly?: boolean;
}

const MemberValidation = () =>
  yup.object().shape({
    name: yup.string().required("This Field is Required"),
    role: yup.string().required("This Field is Required"),
    capacity: yup
      .number()
      .nullable()
      .typeError("Capacity must be a number")
      .required("This Field is Required")
      .min(0, "Capacity must be 0 or greater"),
    used_capacity: yup
      .number()
      .nullable()
      .typeError("Used Capacity must be a number")
      .min(0, "Used Capacity must be 0 or greater"),
  });

const MemberForm: React.FC<MemberFormProps> = ({ instance = null, iconOnly = false }) => {
  const [open, setOpen] = useState(false);
  const createMember = useCreateMember();
  const updateMember = useUpdateMember(instance?._id || "temp");

  const isEditMode = !!instance;

  const {
    handleChange,
    values,
    touched,
    errors,
    handleSubmit,
    resetForm,
    setValues,
  } = useFormik({
    initialValues: {
      name: instance?.name || "",
      role: instance?.role || "",
      capacity: instance?.capacity ?? null,
      used_capacity: instance?.used_capacity ?? null,
    },
    validationSchema: MemberValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      try {
        const payload = {
          name: data.name,
          role: data.role,
          capacity: data.capacity !== null ? Number(data.capacity) : 0,
          used_capacity: isEditMode
            ? data.used_capacity !== null
              ? Number(data.used_capacity)
              : 0
            : 0,
        };

        if (isEditMode) {
          const result = await updateMember.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Member updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update member");
          }
        } else {
          const result = await createMember.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Member created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create member");
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
        role: instance.role || "",
        capacity: instance.capacity ?? null,
        used_capacity: instance.used_capacity ?? null,
      });
    } else if (!instance && open) {
      setValues({
        name: "",
        role: "",
        capacity: null,
        used_capacity: null,
      });
    }
  }, [instance, open, setValues]);

  const isLoading = isEditMode
    ? updateMember.isPending
    : createMember.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger  asChild>
        {isEditMode ? (
          <button className="text-green-600 cursor-pointer  ">
            <Edit3 className="w-5 h-5" />
          </button>
        ) : iconOnly ? (
          <button className="text-t-gray p-2.5 rounded-full border border-t-gray cursor-pointer hover:text-t-orange transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <Button className="rounded-full cursor-pointer bg-t-black hover:bg-t-orange-light text-t-gray hover:text-black font-semibold">
            Create Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black  text-white max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {isEditMode ? "Edit Member" : "Create Member"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <Label htmlFor="name" className="text-sm mx-3 text-white/60">
            Name
          </Label>
          <TextInput
            id="name"
            type="text"
            name="name"
            onChange={handleChange}
            value={values.name}
            error={
              Boolean(errors.name) && touched.name ? errors.name : undefined
            }
            placeholder="Member name"
          />

          <Label htmlFor="role" className="text-sm mx-3 text-white/60">
            Role
          </Label>
          <TextInput
            id="role"
            type="text"
            name="role"
            onChange={handleChange}
            value={values.role}
            error={
              Boolean(errors.role) && touched.role ? errors.role : undefined
            }
            placeholder="Member role"
          />

          <Label htmlFor="capacity" className="text-sm mx-3 text-white/60">
            Capacity
          </Label>
          <TextInput
            id="capacity"
            type="number"
            name="capacity"
            onChange={handleChange}
            value={values.capacity ?? ""}
            error={
              Boolean(errors.capacity) && touched.capacity
                ? errors.capacity
                : undefined
            }
            placeholder="Capacity"
          />
  

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
                ? "Update Member"
                : "Create Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberForm;
