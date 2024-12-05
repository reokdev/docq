"use server";

import { adminDb, adminStorage } from "@/firebaseAdmin";
import { indexName } from "@/lib/langchain";
import pineconeClient from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteDocument(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const status = {
    embeddings: false,
    firestore: false,
    storage: false
  };

  try {
    // Step 1: Delete embeddings (if they exist)
    try {
      const index = await pineconeClient.index(indexName);
      // Query first to check if vectors exist
      const queryResponse = await index.namespace(docId).query({
        vector: new Array(1536).fill(0), // Default dimension for text-embedding-ada-002
        topK: 1,
        includeMetadata: true
      });
      
      if (queryResponse.matches.length > 0) {
        await index.namespace(docId).deleteAll();
      }
      status.embeddings = true;
    } catch (pineconeError: any) {
      // Don't fail the whole deletion if Pinecone deletion fails
      console.warn("Pinecone deletion warning:", pineconeError.message);
      // Still mark as true since absence of vectors is not a failure
      status.embeddings = true;
    }

    // Step 2: Delete from Firestore
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .doc(docId)
      .delete();
    status.firestore = true;

    // Step 3: Delete from Storage
    await adminStorage
      .bucket(process.env.FIREBASE_STORAGE_BUCKET!)
      .file(`users/${userId}/files/${docId}`)
      .delete();
    status.storage = true;

    revalidatePath("/dashboard");
    return { success: true, status };
  } catch (error: any) {
    console.error("Server-side deletion error:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error occurred", 
      status 
    };
  }
}