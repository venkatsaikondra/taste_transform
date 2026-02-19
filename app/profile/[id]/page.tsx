import React from "react"

const UserProfile = ({ params }: any) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg text-center">
        
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          User Profile
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Welcome to your profile page
        </p>

        <div className="flex items-center justify-center gap-2 text-xl font-medium text-gray-700">
          <span>Profile ID:</span>
          <span className="rounded-xl bg-orange-500 px-4 py-1 text-black font-semibold">
            {params.id}
          </span>
        </div>

      </div>
    </div>
  )
}

export default UserProfile