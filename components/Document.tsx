"use client";

import { useRouter } from "next/navigation";
import byteSize from "byte-size";
import { DownloadCloud, Trash2Icon } from "lucide-react";
import useSubscription from "@/hooks/useSubscription";
import { useEffect } from "react";
import { Button } from "./ui/button";

function Document({
  id,
  name,
  size,
  downloadUrl,
}: {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
}) {
  console.log('Document Component - Rendering');
  const router = useRouter();
  const { hasActiveMembership, loading } = useSubscription();

  useEffect(() => {
    console.log('Document Component - Membership Status:', {
      hasActiveMembership,
      loading,
      id,
      name
    });
  }, [hasActiveMembership, loading, id, name]);

  return (
    <div className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-indigo-600 hover:text-white cursor-pointer group">
      <div
        className="flex-1"
        onClick={() => {
          router.push(`/dashboard/files/${id}`);
        }}
      >
        <p className="font-semibold line-clamp-2">{name}</p>
        <p className="text-sm text-gray-500 group-hover:text-indigo-100">
          {byteSize(size).value} KB
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-2 justify-end">
        <Button
          variant="outline"
          disabled={loading}
        >
          <Trash2Icon className="h-6 w-6 text-red-500" />
          {!hasActiveMembership && (
            <span className="text-red-500 ml-2">PRO Feature</span>
          )}
        </Button>

        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-blue-600 hover:text-white rounded-full transition-all"
        >
          <DownloadCloud className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
export default Document;