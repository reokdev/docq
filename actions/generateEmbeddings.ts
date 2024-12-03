'use server'

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";
import { generateEmbeddingsInPineconeVectorStore } from '../lib/langchain';

export async function generateEmbeddings(docId: string) {
    const session = await auth();
    if (!session || !session.userId) {
        throw new Error('Unauthorized: Please sign in to continue');
    }

    await generateEmbeddingsInPineconeVectorStore(docId);

    revalidatePath('/dashboard');
     
    return { completed: true };
}