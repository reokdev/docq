"use server"

import { auth } from "@clerk/nextjs/server";
import { adminDb, adminStorage } from "@/firebaseAdmin";
import pineconeClient from "@/lib/pinecone";
import { indexName } from "@/lib/langchain";
import { revalidatePath } from "next/cache";

export async function deleteAllDocuments() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const status = {
    success: true,
    deletedCount: 0,
    errors: [] as string[]
  };

  try {
    const filesSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .get();

    const index = await pineconeClient.index(indexName);

    // Delete each document
    for (const doc of filesSnapshot.docs) {
      try {
        const docId = doc.id;

        // 1. Try to delete Pinecone embeddings if they exist
        try {
          // Query first to check if vectors exist
          const queryResponse = await index.namespace(docId).query({
            vector: new Array(1536).fill(0), // Default dimension for text-embedding-ada-002
            topK: 1,
            includeMetadata: true
          });
          
          if (queryResponse.matches.length > 0) {
            await index.namespace(docId).deleteAll();
          }
        } catch (pineconeError: any) {
          // Log but don't fail the whole process
          console.warn(`Pinecone operation warning for ${docId}:`, pineconeError.message);
        }

        // 2. Delete from Storage
        try {
          await adminStorage
            .bucket(process.env.FIREBASE_STORAGE_BUCKET!)
            .file(`users/${userId}/files/${docId}`)
            .delete();
        } catch (storageError: any) {
          console.warn(`Storage deletion warning for ${docId}:`, storageError.message);
        }

        // 3. Delete from Firestore
        await doc.ref.delete();

        status.deletedCount++;
      } catch (error: any) {
        status.errors.push(`Failed to delete document ${doc.id}: ${error.message}`);
      }
    }

    revalidatePath("/dashboard");
    return status;
  } catch (error: any) {
    status.success = false;
    status.errors.push(`General error: ${error.message}`);
    return status;
  }
}
