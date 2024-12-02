'use client'

import { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
    CircleArrowDown,
    RocketIcon,
    UploadCloudIcon,
    CheckCircleIcon,
    SaveIcon,
    BrainCircuitIcon,
    Loader2
} from 'lucide-react'
import useUpload from '@/hooks/useUpload';
import { useRouter } from 'next/navigation';
import { StatusText } from '@/hooks/useUpload';

function FileUploader() {
    const { progress, status, fileId, handleUpload } = useUpload();
    const router = useRouter();

    const getStatusIcon = () => {
        switch(status) {
            case StatusText.UPLOADING:
                return <UploadCloudIcon className="h-8 w-8 animate-bounce text-teal-600" />;
            case StatusText.UPLOADED:
                return <CheckCircleIcon className="h-8 w-8 text-teal-600" />;
            case StatusText.SAVING:
                return <SaveIcon className="h-8 w-8 text-teal-600" />;
            case StatusText.GENERATING:
                return <BrainCircuitIcon className="h-8 w-8 text-teal-600" />;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (fileId) {
            router.push(`/dashboard/files/${fileId}`);
        }
    }, [fileId, router]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            await handleUpload(file)
        } else {
            // toast notification
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({ 
        onDrop, 
        maxFiles: 1, 
        accept: { 'application/pdf': ['.pdf'] }
    })

    const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

    if (uploadInProgress) {
        return (
            <div className='mt-32 flex flex-col gap-8 items-center max-w-7xl mx-auto'>
                <div className="relative">
                    <div 
                        className={`radial-progress bg-teal-50 text-teal-600 border-4 ${
                            progress === 100 ? "border-teal-500" : "border-teal-200"
                        }`}
                        role='progressbar'
                        style={{
                            // @ts-ignore
                            '--value': progress, 
                            '--size': '12rem', 
                            '--thickness': '6px'
                        }}
                    >
                        <div className="flex flex-col items-center gap-3">
                            {getStatusIcon()}
                            <Loader2 className="h-4 w-4 animate-spin text-teal-600/50" />
                            <p className="text-sm font-medium text-teal-900">{progress}%</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className='text-lg font-semibold text-teal-900'>{status}</p>
                    <p className="text-sm text-teal-600">Please wait while we process your file</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
            <div 
                {...getRootProps()}
                className={`p-10 border-2 border-dashed mt-10 w-[90%] rounded-lg h-96 flex items-center justify-center transition-colors duration-200 ${
                    isDragActive ? 'border-teal-500 bg-teal-50' : 'border-teal-200 bg-transparent'
                } ${(isFocused || isDragAccept) ? 'border-teal-500' : ''}`}
            >
                <input {...getInputProps()} />
                <div className='flex flex-col justify-center items-center gap-4'>
                    {isDragActive ? (
                        <>
                            <RocketIcon className="h-16 w-16 animate-ping text-teal-600" />
                            <p className="text-teal-900 font-medium">Drop your PDF here ...</p>
                        </>
                    ) : (
                        <>
                            <CircleArrowDown className="h-16 w-16 text-teal-600 animate-bounce" />
                            <div className="text-center">
                                <p className="text-teal-900 font-medium">Drag & drop your PDF here</p>
                                <p className="text-sm text-teal-600">or click to browse files</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader
