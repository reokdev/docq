'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
    CircleArrowDown,
    RocketIcon,
} from 'lucide-react'


function FileUploader() {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Add your file handling logic here
        console.log(acceptedFiles);
    }, [])
    const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({ onDrop })
    return (
        <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
            <div {...getRootProps()}
                className={`p-10 border-teal-600 border-2 border-dashed mt-10 w-[90%] text-teal-600 rounded-lg h-96 flex items-center justify-center ${isFocused || isDragAccept ? 'bg-teal-300' : 'bg-teal-100'}`}
            >
                <input {...getInputProps()} />
                <div className='flex flex-col justify-center items-center'>
                    {
                        isDragActive ? (
                            <>
                                <RocketIcon className="h-16 w-16 animate-ping" />
                                <p>Drop the files here ...</p>
                            </>
                        ) : (
                            <>
                                <CircleArrowDown className="h-16 w-16 animate-bounce" />
                                <p>Drag & drop some files here, or click to select files</p>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default FileUploader
