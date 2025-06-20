"use client";

import React from "react";
import InfiniteMenu from "@/components/ui/InfiniteMenu";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  const items = [
    {
      image: "/images/coldspray.jpg",
      link: "/sensors/ColdSpray",
      title: "Cold Spray",
      description: "Find out the cold spray dashboard",},
    {
      image: "/images/mic1.png",
      link: "/sensors/ColdSpray",
      title: "UTP Microphone",
      description: "Find out the Mic dashboard",
    },
    

  ];


  return (
    <div>
      {session ? (
        <div className="w-full h-full flex items-center justify-center bg-[#f0f0f0] overflow-hidden">
          <div className="w-full max-w-7xl px-4">
            <InfiniteMenu items={items} />
          </div>
        </div>
      ) : (
        <p>Access Denied</p>
      )}
    </div>

  );
};

export default Home;
