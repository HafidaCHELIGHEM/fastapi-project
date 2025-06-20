"use client";

// import Link from "next/link";
import { useState } from "react";
// import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function RegisterForm({ showModal, setShowModal }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  // const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      setError("All fields are necessary.");
      return;
    }

    try {
      const resUserExists = await fetch("api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("User already exists.");
        return;
      }

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

      if (res.ok) {
        const form = e.target;
        form.reset();
      } else {
        Swal.fire({
          title: "Error!",
          text: "There was an error submitting the form!",
          icon: "error",
          confirmButtonColor: "#3AB4F2",
          confirmButtonText: "OK",
          background: "#e2ffff",
          width: "30%",
          heightAuto: true,
          });
        console.log("User registration failed.");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "There was an error submitting the form!",
        icon: "error",
        confirmButtonColor: "#3AB4F2",
        confirmButtonText: "OK",
        background: "#e2ffff",
        width: "30%",
        heightAuto: true,
        });
      console.log("Error during registration: ", error);
    }
  };
if (!showModal) {
    return null;
  }
  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">


        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className="border-2 border-blue-300 rounded-md px-3 py-2 text-black"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Email"
            className="border-2 border-blue-300 rounded-md px-3 py-2 text-black"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="border-2 border-blue-300 rounded-md px-3 py-2 text-black"
          />

          <select
            onChange={(e) => setRole(e.target.value)}
            className="border-2 border-blue-300 rounded-md px-3 py-2 text-black"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2">
            Register
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
