import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";

export function ActionAlertDialog({
  action = "delete", // or 'edit'
  onConfirm,
  userId,
  trigger, // Accept a custom trigger element
}) {
  const isDelete = action === "delete";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={isDelete ? "text-red-600" : ""}
          >
            {isDelete ? (
              <Trash2 className="mr-2 h-4 w-4" />
            ) : (
              <Edit className="mr-2 h-4 w-4" />
            )}
            {isDelete ? "Delete user" : "Edit user"}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDelete ? "Are you absolutely sure?" : "Edit User"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDelete
              ? "This action cannot be undone. This will permanently delete the user and remove their data from our servers."
              : "You are about to edit this user's information. Please confirm to continue."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(userId)}
            className={isDelete ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isDelete ? "Delete" : "Edit"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
