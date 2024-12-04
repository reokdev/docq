'use client'

import Documents from "@/components/Documents"

function Dashboard() {
  return (
    <div className="h-full max-w-7xl mx-auto">
      <h1 className="text-2xl font-extralight p-5 text-teal-700 bg-slate-100">Documents</h1>
      <Documents />
    </div>
  )
}

export default Dashboard
