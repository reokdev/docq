"use client";

import React from 'react';
import Link from 'next/link';
import { deleteDocument } from '@/actions/deleteDocument';
import { deleteAllDocuments } from '@/actions/deleteAllDocuments';
import { cleanupStorage } from '@/actions/cleanupStorage';
import useSubscription from '@/hooks/useSubscription';
import { FileText, Trash2, ExternalLink, Trash } from 'lucide-react';

interface File {
  id: string;
  title: string;
}

interface FilesListProps {
  files: File[];
}

const FilesList: React.FC<FilesListProps> = ({ files }) => {
  const { hasActiveMembership, loading } = useSubscription();

  const deleteFile = async (fileId: string) => {
    console.log("Checking membership status for deletion:", { hasActiveMembership, loading });
    
    if (loading) {
      console.log('Still loading membership status...');
      return;
    }

    if (!hasActiveMembership) {
      alert("Document deletion is a PRO feature. Please upgrade to delete documents.");
      return;
    }

    console.log("Initiating deletion for file:", fileId);
    const userConfirmed = confirm("Are you sure you want to delete this document?");
    
    if (userConfirmed) {
      try {
        const result = await deleteDocument(fileId);
        if (result.success) {
          console.log("Deletion completed successfully:", result.status);
          window.location.reload();
        } else {
          console.error("Deletion failed:", result.error);
          console.log("Deletion status:", result.status);
          alert(`Failed to delete document: ${result.error}`);
        }
      } catch (error: any) {
        console.error("Error during deletion:", error);
        alert(`Error deleting document: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const deleteAllFiles = async () => {
    const userConfirmed = confirm("Are you sure you want to delete ALL documents? This action cannot be undone.");
    
    if (userConfirmed) {
      try {
        const result = await deleteAllDocuments();
        if (result.success) {
          console.log(`Successfully deleted ${result.deletedCount} documents`);
          window.location.reload();
        } else {
          console.error("Deletion failed:", result.errors);
          alert(`Failed to delete all documents: ${result.errors.join(", ")}`);
        }
      } catch (error: any) {
        console.error("Error deleting all files:", error);
        alert(`Error deleting all documents: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const handleCleanupStorage = async () => {
    const userConfirmed = confirm("This will clean up any orphaned files in storage. Continue?");
    
    if (userConfirmed) {
      try {
        const result = await cleanupStorage();
        if (result.success) {
          console.log(`Successfully cleaned up ${result.deletedCount} files from storage`);
          window.location.reload();
        } else {
          console.error("Cleanup failed:", result.errors);
          alert(`Failed to clean up storage: ${result.errors.join(", ")}`);
        }
      } catch (error: any) {
        console.error("Error cleaning up storage:", error);
        alert(`Error cleaning up storage: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Documents</h2>
        <div className="flex items-center space-x-2">
          {/* Cleanup Storage Button */}
          {hasActiveMembership && (
            <button
              onClick={handleCleanupStorage}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Cleanup Storage</span>
            </button>
          )}
          {/* Delete All Documents Button */}
          {files.length > 0 && hasActiveMembership && (
            <button
              onClick={deleteAllFiles}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <Trash className="h-5 w-5" />
              <span>Delete All</span>
            </button>
          )}
        </div>
      </div>
      {files.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 font-medium">{file.title}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  href={`/dashboard/files/${file.id}`}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="View document"
                >
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                </Link>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                  title="Delete document"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesList;