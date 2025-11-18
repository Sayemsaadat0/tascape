'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DeleteIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
// import Deleteicon from '../icons/dashboard/DeleteIcon';
// import Button from '@/components/ui/button';

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
      for (const key of err.errors) {
        console.error(key);
      }
    }
  }, [handleDeleteSubmit]);

  return (
    <div className="">
      <AlertDialog open={open} onOpenChange={() => setOpen(!open)}>
        <div onClick={() => setOpen(!open)} className="cursor-pointer text-red-500 ">
          {isOnlyIcon ? (
            <div className="border p-2 hover:bg-red-100 rounded-full border-red-500 mt-1">
              <DeleteIcon />
            </div>
          ) : (
            <div className="flex items-center gap-2  ">
              <DeleteIcon /> Delete
            </div>
          )}
        </div>
        <AlertDialogContent className="py-10 dark:bg-oc-black-700">
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
          <div>
            <div className="text-oc-primary-2-500  flex justify-center pb-3">
              <DeleteIcon size={'80'} />
              <p></p>
            </div>
            <h3 className="text-w-title-3-Medium-36 text-center">Are You sure?</h3>
            <p className="text-center py-2 text-w-paragraph-regular-20">
              This action cant be undone, <br />
              all the information will be lost forever
            </p>
          </div>
          <div className="flex justify-center gap-8">
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
            >
              {isLoading ? 'Deleting' : 'Confirm'}
            </Button>
            <Button onClick={() => setOpen(false)} variant="outline">Cancel</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAction;
