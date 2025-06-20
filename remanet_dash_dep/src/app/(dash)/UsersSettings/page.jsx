// "use client";

// import React from "react";

"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserManagementProvider from "@/components/UserManagementProvider";

const UsersSettings = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  React.useEffect(() => {
    // Client-side protection
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
    
  if (!session) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <>
      <UserManagementProvider />
    </>
  );
};

export default UsersSettings;