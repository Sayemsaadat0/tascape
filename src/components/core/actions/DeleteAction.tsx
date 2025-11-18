"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

type DeleteActionProps = {
  handleDeleteSubmit: Function;
  isLoading?: boolean;
  isOnlyIcon?: boolean;
};

const DeleteAction: React.FC<DeleteActionProps> = ({
  handleDeleteSubmit,
  isLoading,
  isOnlyIcon,
}) => {
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      await handleDeleteSubmit();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      if (err.errors && Array.isArray(err.errors)) {
        for (const key of err.errors) {
          console.error(key);
        }
      }
    }
  }, [handleDeleteSubmit]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer text-red-400 hover:opacity-80 transition-opacity"
      >
        {isOnlyIcon ? (
          <Trash2 className="w-4 h-4" />
        ) : (
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </div>
        )}
      </div>
      <AlertDialogContent className="bg-t-black text-white max-w-xs p-6">
        <AlertDialogTitle className="sr-only">
          Delete Confirmation
        </AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-500/10 p-3 rounded-full">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Are you sure?</h3>
            <p className="text-sm text-white/60">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full  cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={handleDelete}
              className="flex-1 cursor-pointer rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAction;
