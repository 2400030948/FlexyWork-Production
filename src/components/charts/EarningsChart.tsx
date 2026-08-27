'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  day: string;
  earnings: number;
  coopEarnings: number;
}

const mockData: ChartData[] = [
  { day: 'Mon', earnings: 1200, coopEarnings: 800 },
  { day: 'Tue', earnings: 1800, coopEarnings: 1200 },
  { day: 'Wed', earnings: 800, coopEarnings: 400 },
  { day: 'Thu', earnings: 2400, coopEarnings: 1500 },
  { day: 'Fri', earnings: 1500, coopEarnings: 900 },
  { day: 'Sat', earnings: 3200, coopEarnings: 2000 },
  { day: 'Sun', earnings: 1100, coopEarnings: 600 }
];

export default function EarningsChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[240px] w-full flex items-center justify-center bg-stone-50 border border-stone-150 rounded-2xl animate-pulse">
        <span className="text-xxs font-bold text-ink-subtle uppercase tracking-wider">Loading Analytics Chart...</span>
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={mockData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCoop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888888', fontSize: 10, fontWeight: 650 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888888', fontSize: 10, fontWeight: 650 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid #eaeaea', 
              fontSize: '11px',
              fontFamily: 'sans-serif'
            }}
          />
          <Area 
            name="Personal Gigs"
            type="monotone" 
            dataKey="earnings" 
            stroke="#6366f1" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorEarnings)" 
          />
          <Area 
            name="Cooperative Gigs"
            type="monotone" 
            dataKey="coopEarnings" 
            stroke="#10b981" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorCoop)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
