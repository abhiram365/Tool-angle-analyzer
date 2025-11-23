import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult } from '../types';
import { MaximizeIcon } from './icons/MaximizeIcon';
import { CloseIcon } from './icons/CloseIcon';

const ANGLE_COLORS = {
  RAKE: '#34d399',      // emerald-400
  RELIEF: '#60a5fa',     // blue-400
  CUTTING_EDGE: '#facc15', // yellow-400
  DEFAULT: '#a78bfa',         // violet-400
};

const getAngleColor = (angleName: string) => {
    const lowerName = angleName.toLowerCase();
    if (lowerName.includes('rake')) return ANGLE_COLORS.RAKE;
    if (lowerName.includes('relief')) return ANGLE_COLORS.RELIEF;
    if (lowerName.includes('cutting edge')) return ANGLE_COLORS.CUTTING_EDGE;
    return ANGLE_COLORS.DEFAULT;
};

interface AnnotationsProps {
    imgWidth: number;
    imgHeight: number;
    results: AnalysisResult[];
    highlightedAngle: string | null;
}

const Annotations: React.FC<AnnotationsProps> = ({ imgWidth, imgHeight, results, highlightedAngle }) => {
    if (imgWidth === 0 || imgHeight === 0) return null;

    const scaleFactor = imgWidth / 1000; // Scale text and strokes based on image size

    return (
        <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={imgWidth}
            height={imgHeight}
            viewBox={`0 0 ${imgWidth} ${imgHeight}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            {results.map((result, index) => {
                if (!result.coordinates) return null;

                const { vertex, point1, point2 } = result.coordinates;
                const color = getAngleColor(result.angleName);
                
                const isHighlighted = result.angleName === highlightedAngle;
                const isDimmed = highlightedAngle !== null && !isHighlighted;

                // Position text label near the vertex
                const textX = vertex.x + 10 * scaleFactor;
                const textY = vertex.y - 10 * scaleFactor;
                const textLabel = `${result.angleName}: ${result.measuredValue}°`;
                const fontSize = Math.max(10, 14 * scaleFactor);
                const textWidth = textLabel.length * (fontSize * 0.55); // Estimate text width

                return (
                    <g key={index} className={`transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}>
                        <line x1={vertex.x} y1={vertex.y} x2={point1.x} y2={point1.y} stroke={color} strokeWidth={isHighlighted ? Math.max(3, 4 * scaleFactor) : Math.max(1.5, 2 * scaleFactor)} strokeDasharray={isHighlighted ? 'none' : `${Math.max(3, 4*scaleFactor)} ${Math.max(2, 2*scaleFactor)}`} />
                        <line x1={vertex.x} y1={vertex.y} x2={point2.x} y2={point2.y} stroke={color} strokeWidth={isHighlighted ? Math.max(3, 4 * scaleFactor) : Math.max(1.5, 2 * scaleFactor)} strokeDasharray={isHighlighted ? 'none' : `${Math.max(3, 4*scaleFactor)} ${Math.max(2, 2*scaleFactor)}`} />
                        <circle cx={vertex.x} cy={vertex.y} r={isHighlighted ? Math.max(4, 6 * scaleFactor) : Math.max(3, 4 * scaleFactor)} fill={color} className={isHighlighted ? 'stroke-2 stroke-white' : ''}/>
                        
                        <rect x={textX - 4 * scaleFactor} y={textY - (fontSize + 2 * scaleFactor)} width={textWidth + 8 * scaleFactor} height={fontSize + 6 * scaleFactor} fill={isHighlighted ? color : 'rgba(0,0,0,0.7)'} rx="4" className="transition-colors duration-300"/>
                        <text
                            x={textX}
                            y={textY}
                            fill={isHighlighted ? '#000000' : '#ffffff'}
                            fontSize={fontSize}
                            fontWeight="bold"
                            className="transition-colors duration-300"
                            style={{ paintOrder: 'stroke', stroke: isHighlighted ? 'none' : '#000000', strokeWidth: '2px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}
                        >
                           {textLabel}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};


interface AnnotatedImageProps {
  src: string;
  results: AnalysisResult[];
  highlightedAngle: string | null;
}

export const AnnotatedImage: React.FC<AnnotatedImageProps> = ({ src, results, highlightedAngle }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
    const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const modalImgRef = useRef<HTMLImageElement>(null);

    const getScaledCoordinates = (coords: AnalysisResult[], scale: number) => {
      if (scale === 0) return coords;
      return coords.map(res => ({
        ...res,
        coordinates: res.coordinates ? {
          vertex: { x: res.coordinates.vertex.x * scale, y: res.coordinates.vertex.y * scale },
          point1: { x: res.coordinates.point1.x * scale, y: res.coordinates.point1.y * scale },
          point2: { x: res.coordinates.point2.x * scale, y: res.coordinates.point2.y * scale },
        } : res.coordinates,
      }));
    };

    useEffect(() => {
      const img = new Image();
      img.src = src;

      const setContainerDimensions = () => {
        if (containerRef.current && img.naturalWidth > 0) {
          const containerWidth = containerRef.current.offsetWidth;
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          setDimensions({
            width: containerWidth,
            height: containerWidth / aspectRatio,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        }
      };
      
      img.onload = setContainerDimensions;
      if(img.complete) setContainerDimensions();

      const observer = new ResizeObserver(setContainerDimensions);
      if(containerRef.current) observer.observe(containerRef.current);
      
      return () => {
        if (containerRef.current) observer.unobserve(containerRef.current);
      };
    }, [src]);

    useEffect(() => {
        if (!isModalOpen || !modalImgRef.current) return;
        
        const setModalImageDimensions = () => {
            if (modalImgRef.current) {
                setModalDimensions({
                    width: modalImgRef.current.offsetWidth,
                    height: modalImgRef.current.offsetHeight,
                });
            }
        };
        
        const img = modalImgRef.current;
        img.onload = setModalImageDimensions;
        if(img.complete) setModalImageDimensions();

        const observer = new ResizeObserver(setModalImageDimensions);
        observer.observe(img);

        return () => observer.unobserve(img);
    }, [isModalOpen]);


    const scale = dimensions.naturalWidth > 0 ? dimensions.width / dimensions.naturalWidth : 0;
    const scaledResults = getScaledCoordinates(results, scale);
    
    const modalScale = dimensions.naturalWidth > 0 ? modalDimensions.width / dimensions.naturalWidth : 0;
    const modalScaledResults = getScaledCoordinates(results, modalScale);

    return (
        <>
            <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 group">
                <img src={src} alt="Tool drawing for analysis" className="w-full h-auto object-contain block" />
                <Annotations imgWidth={dimensions.width} imgHeight={dimensions.height} results={scaledResults} highlightedAngle={highlightedAngle} />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-opacity opacity-0 group-hover:opacity-100"
                    title="View fullscreen"
                >
                    <MaximizeIcon />
                </button>
            </div>

            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="relative w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img ref={modalImgRef} src={src} alt="Annotated tool drawing" className="max-w-full max-h-full object-contain pointer-events-none" />
                        <Annotations imgWidth={modalDimensions.width} imgHeight={modalDimensions.height} results={modalScaledResults} highlightedAngle={null} />
                    </div>
                     <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white"
                        title="Close"
                    >
                        <CloseIcon />
                    </button>
                </div>
            )}
        </>
    );
};