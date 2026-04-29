import React from 'react';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ 
    data, 
    width = 100, 
    height = 30, 
    color = '#6366f1' 
}) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
            {/* Last point indicator */}
            <circle 
                cx={width} 
                cy={height - ((data[data.length - 1] - min) / range) * height} 
                r="3" 
                fill={color} 
                className="animate-pulse"
            />
        </svg>
    );
};

export default Sparkline;
