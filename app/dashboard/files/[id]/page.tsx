'use client'

import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const fileId = params.id as string

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">File Details</h1>
      <div className="space-y-2">
        <p><span className="font-semibold">File ID:</span> {fileId}</p>
      </div>
    </div>
  )
}