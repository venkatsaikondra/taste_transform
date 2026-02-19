"use client";

import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter(); // ✅ hook INSIDE component

  const logOut = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1>Profile</h1>
      <hr />
      <p>Profile page</p>
      <hr />
      <button
        onClick={logOut}
        className="bg-blue-400 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        LogOut
      </button>
    </div>
  );
};

export default Page;