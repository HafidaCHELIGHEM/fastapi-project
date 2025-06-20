"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import RotatingText from "@/components/RotatingText";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

export function EditUserForm({ userId, userData, onSuccess, className }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const triggerRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "",
      });
    }
  }, [userData, form]);

  // Handle dialog close
  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Reset form when dialog closes
      form.reset({
        name: userData?.name || "",
        email: userData?.email || "",
        role: userData?.role || "",
      });
    }
    setOpen(newOpen);
  };

  async function onSubmit(data) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              responseData.message || "User with this email already exists",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: responseData.message || "Failed to update user",
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Update user error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error connecting to the server",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          if (form.formState.isSubmitting) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (form.formState.isSubmitting) {
            e.preventDefault();
          }
        }}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center text-3xl justify-center gap-2">
            Edit
            <RotatingText
              texts={["User.", "Account.", "Details.", "Profile."]}
              mainClassName="px-2 sm:px-2 md:px-3 bg-[#41463b] text-white overflow-hidden py-0.5 sm:py-1 max-w-1/2 md:py-2 justify-center rounded-xl"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn("grid items-start gap-4 ", className)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    onOpenChange={(open) => {
                      if (!open && triggerRef.current) {
                        triggerRef.current.focus();
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Role</SelectLabel>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                variant="outline"
                className="inline-flex items-center justify-center text-white w-16 h-16 shadow-2xl shadow-black-500 bg-[#41463b] cursor-pointer rounded-full hover:bg-slate-500 hover:text-white group"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Edit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
