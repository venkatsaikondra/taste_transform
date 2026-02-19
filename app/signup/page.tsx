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
    e.preventDefault(); // Added to prevent default form behavior
    try {
      setLoading(true)
      const response = await axios.post("/api/users/signup", user)
      toast.success("Account created! Redirecting...")
      router.push("/login")
    } catch (error: any) {
      const message = error.response?.data?.error || "Signup failed"
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
    <div className="flex min-h-[80vh] items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 shadow-2xl shadow-gray-200/50">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black">Join The <span className="text-orange-500">WALL</span></h1>
          <p className="mt-2 text-sm text-gray-500">Create your account to get started.</p>
        </div>

        <form onSubmit={onSignup} className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Username</label>
            <input
              type="text"
              placeholder="johndoe"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already a member? <Link href="/login" className="font-bold text-black hover:text-orange-600">Log in</Link>
        </p>
      </div>
    </div>
  )
}