"use client";

import { useState } from "react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AiOutlineUserAdd } from "react-icons/ai";
import { Loader2 } from "lucide-react";

import RotatingText from "@/components/RotatingText";
export function DrawerDialog({onRefresh}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-center pb-4">
          <Button
            variant="outline"
            className="inline-flex items-center justify-center w-24 h-24 shadow-2xl text-xl shadow-black-500 bg-[#41463b] cursor-pointer rounded-full hover:bg-slate-500 group "
          >
            <AiOutlineUserAdd
              color="white"
              className="w-8 h-8 group-hover:animate-spin"
            />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-3xl justify-center gap-2">
            Add
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
        <AddUserForm onRefresh={onRefresh} />
      </DialogContent>
    </Dialog>
  );
}

function AddUserForm({ className,onRefresh }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const { toast } = useToast();
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password || !role) {
      toast({
        variant: "warning",
        title: "Registration Error",
        description: "All fields are necessary.",
      });
      return;
    } else {
      try {
        const res = await fetch("api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        });

        const data = await res.json();

        if (res.status === 409) {
          toast({
            variant: "destructive",
            title: "Registration Error",
            description: data.message,
          });
          return;
        }

        if (res.status === 422) {
          setFieldErrors(data.errors);
          // Handle validation errors hh
          const errorMessages = Object.values(data.errors).join("\n");
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: errorMessages,
          });
          return;
        }

        if (res.ok) {
          const form = e.target;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          form.reset();
          setEmail("");
          setPassword("");
          setName("");
          setRole("");
          setFieldErrors({});
          onRefresh();
          toast({
            variant: "default",
            title: "Success",
            description: "User added successful!",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              data.message || "An error occurred during registration",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was an error connecting to the server",
        });
        console.error("Error during registration:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form
      className={cn("grid items-start gap-4", className)}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Full Name"
          required
          name="name"
          disabled={isLoading}
        />
        {fieldErrors.name && (
          <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          placeholder="Email"
          required
          name="email"
          disabled={isLoading}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
          name="password"
          disabled={isLoading}
        />
        {fieldErrors.password && (
          <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="role">Role *</Label>

        <Select
          name="role"
          value={role}
          onValueChange={setRole}
          disabled={isLoading}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Role" name="role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-center">
        <Button
          type="submit"
          disabled={isLoading}
          variant="outline"
          className="inline-flex items-center justify-center text-white w-16 h-16 shadow-2xl shadow-black-500 bg-[#41463b] cursor-pointer rounded-full hover:bg-slate-500 hover:text-white group "
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </form>
  );
}

export default DrawerDialog;
