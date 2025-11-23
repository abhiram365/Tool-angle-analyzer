
import React, { useState, useRef, useEffect } from 'react';
import { Point } from '../types';

interface CalibrationToolProps {
    src: string;
    onConfirmCalibration: (offset: number) => void;
    onCancel: () => void;
}

export const CalibrationTool: React.FC<CalibrationToolProps> = ({ src, onConfirmCalibration, onCancel }) => {
    const [points, setPoints] = useState<Point[]>([]);
    const [imageRect, setImageRect] = useState({ width: 0, height: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const [knownAngle, setKnownAngle] = useState<string>('90');
    const [calculatedAngle, setCalculatedAngle] = useState<number | null>(null);

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (points.length >= 3) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPoints([...points, { x, y }]);
    };

    useEffect(() => {
        if (points.length === 3) {
            // Calculate angle (P2 is vertex)
            const p1 = points[0];
            const p2 = points[1]; // Vertex
            const p3 = points[2];

            const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
            const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
            
            let deg = (angle1 - angle2) * (180 / Math.PI);
            deg = Math.abs(deg);
            if (deg > 180) deg = 360 - deg;
            
            setCalculatedAngle(parseFloat(deg.toFixed(1)));
        }
    }, [points]);

    const handleConfirm = () => {
        if (calculatedAngle === null) return;
        const target = parseFloat(knownAngle);
        if (isNaN(target)) return;

        const offset = target - calculatedAngle;
        onConfirmCalibration(offset);
    };

    const resetPoints = () => {
        setPoints([]);
        setCalculatedAngle(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row shadow-2xl border border-zinc-200 dark:border-zinc-700">
                
                <div className="relative flex-grow bg-zinc-100 dark:bg-black flex items-center justify-center p-4 overflow-hidden">
                    <div className="relative cursor-crosshair inline-block">
                        <img 
                            ref={imgRef}
                            src={src} 
                            alt="Calibration" 
                            className="max-h-[70vh] object-contain select-none"
                            onClick={handleImageClick}
                            onLoad={(e) => setImageRect({ width: e.currentTarget.width, height: e.currentTarget.height })}
                        />
                        <svg className="absolute top-0 left-0 pointer-events-none w-full h-full">
                            {points.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
                            ))}
                            {points.length > 1 && (
                                <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} stroke="#ef4444" strokeWidth="2" />
                            )}
                            {points.length > 2 && (
                                <line x1={points[1].x} y1={points[1].y} x2={points[2].x} y2={points[2].y} stroke="#ef4444" strokeWidth="2" />
                            )}
                        </svg>
                    </div>
                </div>

                <div className="w-full md:w-80 p-6 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Calibrate Angle</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                            Click 3 points to define an angle on the image (Point 1, Vertex, Point 2), then enter its known value.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300">
                            <span>Points Selected:</span>
                            <span>{points.length} / 3</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${(points.length / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    {calculatedAngle !== null && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">Measured on Image:</div>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{calculatedAngle}°</div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Actual Known Angle (°):
                        </label>
                        <input 
                            type="number" 
                            value={knownAngle}
                            onChange={(e) => setKnownAngle(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                         {points.length > 0 && points.length < 3 && (
                             <button onClick={resetPoints} className="w-full py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                Reset Points
                            </button>
                        )}
                        
                        <button 
                            onClick={handleConfirm}
                            disabled={points.length !== 3}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                        >
                            Apply Calibration
                        </button>
                        <button 
                            onClick={onCancel}
                            className="w-full py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
