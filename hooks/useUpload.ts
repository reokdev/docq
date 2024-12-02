'use client'

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export enum StatusText {
    UPLOADING = 'Uploading',
    UPLOADED = 'File uploaded successfully',
    SAVING = 'Saving file to database',
    GENERATING = 'Generating summary',
}

export type Status = StatusText[keyof StatusText];

function useUpload() {
    const [progress, setProgress] = useState<number | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [status, setStatus] = useState<StatusText | null>(null);
    const { user } = useUser();
    const router = useRouter();

    const handleUpload = async (file: File) => {
        if (!user || !file) return;

        const fileIdToUpload = uuidv4();
        const storageRef = ref(storage, `users/${user.id}/files/${fileIdToUpload}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progressPercent = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setStatus(StatusText.UPLOADING);
                setProgress(progressPercent);
            },
            (error) => {
                console.error("Error uploading file:", error);
            },
            async () => {
                setStatus(StatusText.UPLOADED);
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setStatus(StatusText.SAVING);
                
                await setDoc(doc(db, 'users', user.id, 'files', fileIdToUpload), {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: downloadURL,
                    storagePath: `users/${user.id}/files/${fileIdToUpload}`,
                    createdAt: new Date().toISOString(),
                })

                setStatus(StatusText.GENERATING);
                setFileId(fileIdToUpload);
            }
        );
    }
    return { progress, status, fileId, handleUpload }
}

export default useUpload
