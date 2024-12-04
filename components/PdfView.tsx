'use client'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './ui/button';
import { Loader2Icon, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useEffect } from 'react';

// Explicitly set the worker source with a full HTTPS URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({ url }: { url: string }) {
    // state
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [file, setFile] = useState<Blob | null>(null);
    const [rotation, setRotation] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch PDF');
                const file = await response.blob();
                setFile(file);
            } catch (error) {
                console.error('Error loading PDF:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFile();
    }, [url]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    return (
        <div className="flex flex-col items-center w-full">
            {/* Controls */}
            <div className="flex gap-2 mb-4">
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="relative w-full">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2Icon className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                )}

                {file && (
                    <Document
                        loading={
                            <div className="flex justify-center">
                                <Loader2Icon className="h-8 w-8 animate-spin text-teal-600" />
                            </div>
                        }
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        rotate={rotation}
                        className="flex flex-col items-center"
                    >
                        <Page
                            className="shadow-lg"
                            pageNumber={pageNumber}
                            scale={scale}
                            loading={
                                <div className="h-[600px] w-full flex items-center justify-center">
                                    <Loader2Icon className="h-8 w-8 animate-spin text-teal-600" />
                                </div>
                            }
                        />
                        {numPages && (
                            <p className="mt-4 text-sm text-gray-500">
                                Page {pageNumber} of {numPages}
                            </p>
                        )}
                    </Document>
                )}
            </div>
        </div>
    )
}

export default PdfView
