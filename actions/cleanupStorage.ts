"use server"

import { auth } from "@clerk/nextjs/server";
import { adminStorage } from "@/firebaseAdmin";
import { revalidatePath } from "next/cache";

export async function cleanupStorage() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const status = {
    success: true,
    deletedCount: 0,
    errors: [] as string[]
  };

  try {
    const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET!);
    const [files] = await bucket.getFiles({
      prefix: `users/${userId}/files/`
    });

    console.log(`Found ${files.length} files in storage for cleanup`);

    for (const file of files) {
      try {
        await file.delete();
        status.deletedCount++;
        console.log(`Deleted file: ${file.name}`);
      } catch (error: any) {
        const errorMessage = `Failed to delete file ${file.name}: ${error.message}`;
        console.error(errorMessage);
        status.errors.push(errorMessage);
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
