// "use client";
// import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
// import { Card } from "@/components/ui/card";
// import LoginForm from "@/components/LoginForm";
// import AnimatedBeamDemo from "@/components/animated-beam";

// export default function HeroWithCanvasReveal() {
//   return (
//     <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
//       {/* Canvas Reveal Effect Background */}
//       <div className="absolute inset-0">
//         <CanvasRevealEffect
//           animationSpeed={2}
//           containerClassName="bg-black"
//           colors={[
//             [65, 70, 59], // Base color #41463b
//             [71, 77, 65], // Slightly lighter
//             [78, 84, 71], // Even lighter
//           ]}
//           dotSize={3}
//           opacities={[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1]}
//         />
//         {/* Overlay gradient for better text visibility */}
//         <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
//       </div>

//       {/* Hero Content */}
//       <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
//         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
//           Welcome to RemaNet
//         </h1>
//         <p className="text-lg sm:text-xl text-gray-200 mb-8">
//           Digital Platform for Real Data Management
//         </p>
//         <div className="relative z-10 w-full max-w-5xl px-4">
//           <Card className="w-full p-0 overflow-hidden">
//             <div className="grid lg:grid-cols-2 gap-0">
//               <LoginForm />
//               <div className="p-6 sm:p-8 lg:p-10 space-y-6">
//                 <AnimatedBeamDemo />
//               </div>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { Card } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import AnimatedBeamDemo from "@/components/animated-beam";

export default function HeroWithCanvasReveal() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Canvas Reveal Effect Background */}
      <div className="absolute inset-0">
        <CanvasRevealEffect
          animationSpeed={2}
          containerClassName="bg-black"
          colors={[
            [65, 70, 59], // Base color #41463b
            [71, 77, 65], // Slightly lighter
            [78, 84, 71], // Even lighter
          ]}
          dotSize={3}
          opacities={[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1]}
        />
        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
          Welcome to RemaNet
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-8">
          Digital Platform for ColdSpray Real Time Data Monitoring
        </p>
        <div className="relative z-10 w-full max-w-5xl px-4">
          <Card className="w-full p-0 overflow-hidden  ">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="sm:p-8 lg:p-10 space-y-6 bg-gray-50 h-full">
                <LoginForm />
              </div>

              <div className="sm:p-8 lg:p-10 space-y-6 bg-gray-50 h-full">
                {/* <h2 className="text-2xl font-bold text-center mb-4">
                  Connect with RemaNet
                </h2>
                <p className="text-gray-600 text-center ">
                  All your services in one place.
                </p> */}
                <AnimatedBeamDemo />
              </div>
            </div>
          </Card>
        </div>
      </div>
      <footer className="absolute bottom-0 left-0 right-0 text-center text-gray-200 p-4">
        <p className="text-sm">
          &copy; 2025 LGIPM. All rights reserved.
        </p>
      </footer> 
    </div>
  );
}
