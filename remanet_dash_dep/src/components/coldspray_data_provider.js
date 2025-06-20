import ColdsprayDash from "@/components/coldsprayDash";

export default function ColdsprayData() {
  return (
    <div className="min-h-screen flex flex-col ">
      <main className="flex-grow container mx-auto px-4 py-4">
        <ColdsprayDash />
      </main>
      <footer className="bg-[#41463b] text-white py-4 ">
        <div className="container mx-auto px-2">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 LGIPM Inc.</p>
            </div>
            <div className="flex space-x-4">
              <p>Privacy Policy | Terms of Service</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
