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
    e.preventDefault()
    try {
      setLoading(true)
      const response = await axios.post("/api/users/login", user)
      toast.success("Login successful!")
      router.push("/profile") // Redirect to profile or dashboard
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 shadow-2xl shadow-gray-200/50">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black">Welcome to <span className="text-orange-500">WALL</span></h1>
          <p className="mt-2 text-sm text-gray-500">Please sign in to your account.</p>
        </div>

        <form onSubmit={onLogin} className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
            <input
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:bg-gray-200"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          New here? <Link href="/signup" className="font-bold text-black hover:text-orange-600">Create an account</Link>
        </p>
      </div>
    </div>
  )
}