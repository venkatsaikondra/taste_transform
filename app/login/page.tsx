"use client"
import React, { useState } from "react"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

 const onLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);
    // Send request
    const response = await axios.post("/api/users/login", user);
    
    // Success feedback
    toast.success(`Welcome back, ${response.data.user.username}!`);
    
    const params = new URLSearchParams(window.location.search);
    router.push(params.get('from') || '/');
  } catch (error: any) {
    // This catches "User does not exist" or "Invalid password" from the backend
    const errorMessage = error.response?.data?.error || "Authentication Failed";
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#c5fb45 1px, transparent 1px), linear-gradient(90deg, #c5fb45 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-md border border-zinc-800 bg-black/80 p-8 backdrop-blur-xl">
        {/* Tech Corner Accents */}
        <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-[#c5fb45]" />
        <div className="absolute -right-1 -bottom-1 h-4 w-4 border-r-2 border-b-2 border-[#c5fb45]" />

        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-white">USER_AUTHENTICATION</h1>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Identity verification required</p>
        </div>

        <form onSubmit={onLogin} className="space-y-6">
          <div className="group">
            <label className="text-[10px] uppercase text-[#c5fb45]">Email_Address</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="mt-1 w-full border-b border-zinc-800 bg-transparent py-2 text-white outline-none transition-all focus:border-[#c5fb45]"
              required
            />
          </div>

          <div className="group">
            <label className="text-[10px] uppercase text-[#c5fb45]">Password</label>
            <input
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="mt-1 w-full border-b border-zinc-800 bg-transparent py-2 text-white outline-none transition-all focus:border-[#c5fb45]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c5fb45] py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-[#d4ff6b] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Decrypting..." : "Initialize_Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-zinc-600">
          No records found? <Link href="/signup" className="text-white hover:text-[#c5fb45]">Sign_Up</Link>
        </p>
      </div>
    </div>
  )
}
//added changes