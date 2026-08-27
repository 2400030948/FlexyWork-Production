'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { month: 'Mar', seekers: 1200, workers: 150, gigs: 400 },
  { month: 'Apr', seekers: 1600, workers: 190, gigs: 520 },
  { month: 'May', seekers: 2100, workers: 220, gigs: 680 },
  { month: 'Jun', seekers: 2800, workers: 260, gigs: 790 },
  { month: 'Jul', seekers: 3600, workers: 290, gigs: 810 },
  { month: 'Aug', seekers: 4500, workers: 320, gigs: 828 }
];

export default function AdminCharts() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[260px] w-full flex items-center justify-center bg-stone-50 border border-stone-150 rounded-2xl animate-pulse">
        <span className="text-xxs font-bold text-ink-subtle uppercase tracking-wider">Loading Admin Analytics...</span>
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={mockData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
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
          <Legend 
            wrapperStyle={{ fontSize: '10px', fontWeight: 650, paddingTop: '10px' }}
          />
          <Bar name="Gigs Volume" dataKey="gigs" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar name="Active Workers" dataKey="workers" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
