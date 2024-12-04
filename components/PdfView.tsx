'use client'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './ui/button';
import { Loader2Icon, RotateCw, ZoomIn, ZoomOut, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Check if user is selecting text
    const isSelectingText = () => {
        const selection = window.getSelection();
        return selection && selection.toString().length > 0;
    };

    // Calculate bounds to keep document in view
    const getBoundedPosition = (x: number, y: number) => {
        if (!containerRef.current) return { x, y };
        
        const container = containerRef.current;
        const bounds = container.getBoundingClientRect();
        const maxX = bounds.width * (scale - 1) / 2;
        const maxY = bounds.height * (scale - 1) / 2;

        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y))
        };
    };

    // Reset position with animation if out of bounds
    const snapToBounds = () => {
        const bounded = getBoundedPosition(position.x, position.y);
        if (bounded.x !== position.x || bounded.y !== position.y) {
            setPosition(bounded);
        }
    };

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

    const handleReset = () => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    const handlePrevPage = () => {
        setPageNumber(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setPageNumber(prev => {
            if (numPages == null) return prev; 
            return Math.min(prev + 1, numPages);
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent dragging if user is selecting text or not zoomed in
        if (scale <= 1 || isSelectingText()) return;

        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;

        const newPosition = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        };

        const bounded = getBoundedPosition(newPosition.x, newPosition.y);
        setPosition(bounded);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            snapToBounds();
        }
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            snapToBounds();
        }
    };

    // Reset position when scale changes
    useEffect(() => {
        setPosition({ x: 0, y: 0 });
    }, [scale]);

    return (
        <div className="flex flex-col items-center w-full h-[calc(100vh-8rem)] select-none relative mt-16">
            {/* Controls - fixed at top with better mobile visibility */}
            <div className="flex gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md fixed top-20 left-1/2 -translate-x-1/2 z-10 max-w-[90vw] overflow-x-auto">
                <Button variant="outline" size="icon" onClick={handleZoomOut} className="shrink-0">
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomIn} className="shrink-0">
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleRotate} className="shrink-0">
                    <RotateCw className="h-4 w-4" />
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleReset}
                    disabled={scale === 1 && rotation === 0 && position.x === 0 && position.y === 0}
                    className="shrink-0"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* PDF container with fixed height */}
            <div 
                ref={containerRef}
                className="w-full h-full overflow-hidden"
            >
                <div 
                    className={`cursor-${scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'} h-full flex items-center justify-center`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{ 
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                    }}
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[600px]">
                            <Loader2Icon className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex justify-center items-center min-h-[600px]">
                                    <Loader2Icon className="h-6 w-6 animate-spin" />
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                rotate={rotation}
                                loading={
                                    <div className="flex justify-center items-center min-h-[600px]">
                                        <Loader2Icon className="h-6 w-6 animate-spin" />
                                    </div>
                                }
                            />
                        </Document>
                    )}
                </div>
            </div>

            {/* Page navigation - fixed at bottom with better mobile visibility */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md flex items-center gap-2 max-w-[90vw] overflow-x-auto z-10">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevPage}
                    disabled={pageNumber <= 1}
                    className="shrink-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <p className="text-sm whitespace-nowrap px-1">
                    Page {pageNumber} of {numPages}
                </p>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={pageNumber >= numPages}
                    className="shrink-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default PdfView
