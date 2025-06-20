// import { useState, useEffect } from "react";
// import * as React from "react";
// import { cn } from "@/lib/utils";
// import { useMediaQuery } from "@/hooks/use-media-query";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2 } from "lucide-react";

// export function UserFormDialog({
//   mode = "create", // or 'edit'
//   userId = null,
//   initialData = null,
//   onSuccess,
//   trigger,
// }) {
//   const [open, setOpen] = React.useState(false);
//   const isDesktop = useMediaQuery("(min-width: 768px)");

//   const content = (
//     <>
//       <DialogHeader>
//         <DialogTitle className="flex items-center text-3xl justify-center gap-2">
//           {mode === "create" ? "Add" : "Edit"}
//           <span className="px-2 bg-[#41463b] text-white rounded-xl">User</span>
//         </DialogTitle>
//       </DialogHeader>
//       <UserForm
//         mode={mode}
//         userId={userId}
//         initialData={initialData}
//         onSuccess={() => {
//           setOpen(false);
//           onSuccess?.();
//         }}
//       />
//     </>
//   );

//   if (isDesktop) {
//     return (
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>{trigger}</DialogTrigger>
//         <DialogContent className="sm:max-w-[425px]">{content}</DialogContent>
//       </Dialog>
//     );
//   }

//   return (
//     <Drawer open={open} onOpenChange={setOpen}>
//       <DrawerTrigger asChild>{trigger}</DrawerTrigger>
//       <DrawerContent>
//         <DrawerHeader className="text-left">
//           <DrawerTitle>{mode === "create" ? "Add" : "Edit"} User</DrawerTitle>
//           <DrawerDescription>Fill in the details below.</DrawerDescription>
//         </DrawerHeader>
//         <div className="px-4">{content}</div>
//         <DrawerFooter className="pt-2">
//           <DrawerClose asChild>
//             <Button variant="outline">Cancel</Button>
//           </DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }

// function UserForm({ className, mode, userId, initialData, onSuccess }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "",
//   });
//   const { toast } = useToast();
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   console.log("user", userId);
//   console.log("user", userId);

//   useEffect(() => {
//     if (mode === "edit" && initialData) {
//       setFormData({
//         ...initialData,
//         password: "", // Don't populate password in edit mode
//       });
//     }
//   }, [mode, initialData]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const payload = { ...formData };
//     if (mode === "edit" && !payload.password) {
//       delete payload.password; // Don't send password if not changed
//     }

//     try {
//       const endpoint =
//         mode === "create" ? "api/register" : `api/users/${userId}`;
//       const method = mode === "create" ? "POST" : "PUT";

//       const res = await fetch(endpoint, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (res.status === 409) {
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: data.message,
//         });
//         return;
//       }

//       if (res.status === 422) {
//         setFieldErrors(data.errors);
//         const errorMessages = Object.values(data.errors).join("\n");
//         toast({
//           variant: "destructive",
//           title: "Validation Error",
//           description: errorMessages,
//         });
//         return;
//       }

//       if (res.status === 404) {
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: data.message,
//         });
//         return;
//       }

//       if (res.ok) {
//         toast({
//           variant: "default",
//           title: "Success",
//           description: `User ${
//             mode === "create" ? "added" : "updated"
//           } successfully!`,
//         });
//         if (mode === "create") {
//           setFormData({
//             name: "",
//             email: "",
//             password: "",
//             role: "",
//           });
//         }
//         setFieldErrors({});
//         onSuccess?.();
//       }
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "There was an error connecting to the server",
//       });
//       console.error("Error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <form
//       className={cn("grid items-start gap-4", className)}
//       onSubmit={handleSubmit}
//     >
//       <div className="grid gap-2">
//         <Label htmlFor="name">Username *</Label>
//         <Input
//           id="name"
//           value={formData.name}
//           onChange={handleChange}
//           type="text"
//           placeholder="Full Name"
//           required
//           name="name"
//           disabled={isLoading}
//         />
//         {fieldErrors.name && (
//           <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
//         )}
//       </div>

//       <div className="grid gap-2">
//         <Label htmlFor="email">Email *</Label>
//         <Input
//           id="email"
//           value={formData.email}
//           onChange={handleChange}
//           type="email"
//           placeholder="Email"
//           required
//           name="email"
//           disabled={isLoading}
//         />
//         {fieldErrors.email && (
//           <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
//         )}
//       </div>

//       <div className="grid gap-2">
//         <Label htmlFor="password">
//           Password {mode === "edit" && "(Leave blank to keep current)"}
//         </Label>
//         <Input
//           id="password"
//           value={formData.password}
//           onChange={handleChange}
//           type="password"
//           placeholder="Password"
//           required={mode === "create"}
//           name="password"
//           disabled={isLoading}
//         />
//         {fieldErrors.password && (
//           <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
//         )}
//       </div>

//       <div className="grid gap-2">
//         <Label htmlFor="role">Role *</Label>
//         <Select
//           id="role"
//           name="role"
//           value={formData.role}
//           onValueChange={(value) =>
//             handleChange({ target: { name: "role", value } })
//           }
//           disabled={isLoading}
//           required
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select a Role" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectGroup>
//               <SelectLabel>Role</SelectLabel>
//               <SelectItem value="user">User</SelectItem>
//               <SelectItem value="admin">Admin</SelectItem>
//             </SelectGroup>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="flex items-center justify-center">
//         <Button
//           type="submit"
//           disabled={isLoading}
//           variant="outline"
//           className="inline-flex items-center justify-center text-white w-16 h-16 shadow-2xl shadow-black-500 bg-[#41463b] cursor-pointer rounded-full hover:bg-slate-500 hover:text-white group"
//         >
//           {isLoading ? (
//             <Loader2 className="h-4 w-4 animate-spin" />
//           ) : mode === "create" ? (
//             "Add"
//           ) : (
//             "Save"
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }
