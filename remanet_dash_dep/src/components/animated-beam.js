"use client";

import { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import Image from "next/image";

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function AnimatedBeamDemo() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);
  const div5Ref = useRef(null);
  const div6Ref = useRef(null);
  const div7Ref = useRef(null);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg "
      ref={containerRef}
    >
      <div className="flex size-full max-h-[300px] max-w-lg flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}
          className="size-16"
          >
            <Image
              src="/Images/ditex.png"
              alt="RemaNet"
              width={32}
              height={32}
              
            />
          </Circle>
          <Circle ref={div5Ref}
          className="size-16">
            <Image
              src="/Images/deep42.png"
              alt="deep42"
              width={42}
              height={42}
            />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ></Circle>
          <Circle ref={div4Ref} className="size-16">
            <Image
              src="/Images/logo.png"
              alt="RemaNet"
              width={32}
              height={32}
            />
          </Circle>
          <Circle className></Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref} className="size-16">
            <Image
              src="/Images/Univ-Lorraine.png"
              alt="Univ-Lorraine"
              width={42}
              height={42}
            />
          </Circle>
          <Circle ref={div7Ref} className="size-16">
            <Image src="/Images/ftj.jpg" alt="FTJ" width={42} height={42} />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        gradientStartColor="#41463b"
        gradientStopColor="#4e544a"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        gradientStartColor="#41463b"
        gradientStopColor="#4e544a"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        gradientStartColor="#41463b"
        gradientStopColor="#4e544a"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
        gradientStartColor="#41463b"
        gradientStopColor="#4e544a"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
        gradientStartColor="#41463b"
        gradientStopColor="#4e544a"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse
        gradientStartColor="#41463b"
        gradientStopColor="#4e544a"
      />
    </div>
  );
}
