'use client';

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

interface ScoreRadarChartProps {
    scores: {
        market: number;
        technical: number;
        differentiation: number;
        viability: number;
    };
    labels?: {
        market: string;
        technical: string;
        differentiation: string;
        viability: string;
    };
}

export default function ScoreRadarChart({
    scores,
    labels = {
        market: 'Market',
        technical: 'Tech',
        differentiation: 'Moat',
        viability: 'Viability'
    }
}: ScoreRadarChartProps) {

    const data = [
        {
            subject: labels.market,
            A: scores.market,
            fullMark: 100,
        },
        {
            subject: labels.technical,
            A: scores.technical,
            fullMark: 100,
        },
        {
            subject: labels.differentiation,
            A: scores.differentiation,
            fullMark: 100,
        },
        {
            subject: labels.viability,
            A: scores.viability,
            fullMark: 100,
        },
    ];

    return (
        <div className="w-full h-[300px] md:h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#475569', fontSize: 14, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Score"
                        dataKey="A"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fill="#6366f1"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Central Score Badge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <div className="text-4xl font-black text-indigo-900">
                    {(() => {
                        const m = Number(scores.market) || 0;
                        const t = Number(scores.technical) || 0;
                        const d = Number(scores.differentiation) || 0;
                        const v = Number(scores.viability) || 0;
                        const avg = (m + t + d + v) / 4;
                        return isNaN(avg) ? 0 : Math.round(avg);
                    })()}
                </div>
            </div>
        </div>
    );
}
