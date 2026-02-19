"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function Signup() {
  const router = useRouter()
  const [user, setUser] = useState({ email: "", password: "", username: "" })
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [loading, setLoading] = useState(false)

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true)
      await axios.post("/api/users/signup", user)
      toast.success("Identity Registered Successfully")
      router.push("/login")
    } catch (error: any) {
      const message = error.response?.data?.error || "Registration Failure"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const isValid = user.email.includes("@") && user.password.length >= 6 && user.username.length > 0
    setButtonDisabled(!isValid)
  }, [user])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 font-mono">
      {/* Background Grid - Same as Login for consistency */}
      <div className="fixed inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#c5fb45 1px, transparent 1px), linear-gradient(90deg, #c5fb45 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-md border border-zinc-800 bg-black/80 p-8 backdrop-blur-xl">
        {/* Tech Corner Accents */}
        <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-[#c5fb45]" />
        <div className="absolute -right-1 -bottom-1 h-4 w-4 border-r-2 border-b-2 border-[#c5fb45]" />

        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-white">NEW_ENTITY_REGISTRATION</h1>
          <p className="text-xs uppercase tracking-widest text-zinc-500">System Integration Required</p>
        </div>

        <form onSubmit={onSignup} className="space-y-5">
          <div className="group">
            <label className="text-[10px] uppercase text-[#c5fb45]">Username</label>
            <input
              type="text"
              placeholder="alias_01"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="mt-1 w-full border-b border-zinc-800 bg-transparent py-2 text-sm text-white outline-none transition-all placeholder:text-zinc-700 focus:border-[#c5fb45]"
            />
          </div>

          <div className="group">
            <label className="text-[10px] uppercase text-[#c5fb45]">Email_Address</label>
            <input
              type="email"
              placeholder="user@network.com"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="mt-1 w-full border-b border-zinc-800 bg-transparent py-2 text-sm text-white outline-none transition-all placeholder:text-zinc-700 focus:border-[#c5fb45]"
            />
          </div>

          <div className="group">
            <label className="text-[10px] uppercase text-[#c5fb45]">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="mt-1 w-full border-b border-zinc-800 bg-transparent py-2 text-sm text-white outline-none transition-all placeholder:text-zinc-700 focus:border-[#c5fb45]"
            />
          </div>

          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className="w-full bg-[#c5fb45] py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-[#d4ff6b] active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {loading ? "Transmitting..." : "Initialize_Registry"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-zinc-600">
          Already synced? <Link href="/login" className="text-white hover:text-[#c5fb45]">Return_To_Login</Link>
        </p>
      </div>
    </div>
  )
}