import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";
import Link from "next/link";
import { title } from "process";
import { deleteDocument } from '@/actions/deleteDocument';
import FilesList from './FilesList';

export default async function FilesPage() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: Please sign in to continue");
  }

  const filesSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .get();

  const files = filesSnapshot.docs.map(doc => ({ id: doc.id, title: doc.data().name, ...doc.data() }));

  return <FilesList files={files} />;
}