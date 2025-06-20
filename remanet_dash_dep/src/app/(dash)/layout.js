"use client";

import DashboardLayout from "@/components/dashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (!session) {
    return null; // Don't render anything if not authenticated
  }
  return (
    <div>
      <DashboardLayout children={children} />
    </div>
  );
}
