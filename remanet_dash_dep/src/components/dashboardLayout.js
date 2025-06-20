"use client";

import React, { useState } from "react";
import Profile from "@/components/profile";
import { FileSpreadsheet, Wind, Home, Mic,LayoutDashboardIcon } from "lucide-react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import TrueFocus from "@/components/ui/TrueFocus";
// import SplashCursor from "@/components/ui/SplashCursor";


const DashboardLayout = ({ children }) => {
  const pathname = usePathname();

  const sensors = [
    {
      icon: Home,
      color: "#41463b",
      label: "Home",
      href: "/dashboard",
    },

    {
      icon: Wind,
      color: "#4ECB71",
      label: "Cold Spray",
      href: "/sensors/ColdSpray",
    },
    // {
    //   icon: Mic,
    //   color: "#41C9E2",
    //   label: "UTP Microphone",
    //   href: "/sensors/MicData",
    // },
   
  ];


  return (
    <div className="flex h-screen bg-[#f0f0f0]">
      {/* Sidebar */}
      {/* <SplashCursor /> */}
      <div
        className={`
          flex flex-col items-center
          shadow-lg shadow-gray-300 
          transition-all duration-300 ease-in-out w-26 p-2 
        `}
      >
        <div className="flex justify-center p-4">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="REMANET Logo"
              className="h-20 w-20"
            />
          </div>
        </div>

        {/* Sensor buttons */}
        <div className="flex-1 flex flex-row items-center justify-center">
          <div className="grid grid-cols-1 gap-10">
            {sensors.map((sensor, index) => (
              <Link
                key={index}
                href={sensor.href}
                className={`
                  inline-flex items-center justify-center
                  w-12 h-12
                  shadow-lg shadow-gray-200
                  bg-white cursor-pointer rounded-full
                  hover:bg-[#f0f0f0] active:bg-[#41463b]
                  group focus:ring-4 focus:ring-[#707766] focus:outline-none
                  transition-all duration-300 ease-in-out
                  hover:scale-110
                  relative
                  ${pathname === sensor.href ? "ring-2 ring-[#41463b]" : ""}
                `}
              >
                <sensor.icon size={24} color={sensor.color} />
                {true && (
                  <span
                    className="
                    absolute left-14 
                    bg-[#41463b] text-white 
                    px-2 py-1 rounded 
                    text-sm opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                  "
                  >
                    {sensor.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="px-8 py-8 flex justify-between bg-[#f0f0f0] ">
          <div className="w-2/6 text-left">
            <div className="text-sm font-semibold text-gray-500 py-4">
              <TrueFocus
                sentence="RemaNet Dashboard"
                manualMode={false}
                blurAmount={1}
                borderColor="#41463b"
                animationDuration={1}
                pauseBetweenAnimations={1}
                glowColor="rgba(0, 255, 0, 0.6)"
              />
            </div>
            {/* <div className="text-sm text-gray-500">
              Welcome to the dashboard
            </div> */}
           
          </div>

          <div className="w-2/6">
            <Profile />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
