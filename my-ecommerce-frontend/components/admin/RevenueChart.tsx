'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  name: string;
  revenue: number;
}

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C5A059" stopOpacity={0.35}/>
            <stop offset="95%" stopColor="#C5A059" stopOpacity={0.02}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.15} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#71717a' }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#71717a' }}
          tickFormatter={(value) => `₵${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: '1px solid rgba(197, 160, 89, 0.3)', 
            backgroundColor: 'rgba(18, 18, 18, 0.95)', 
            backdropFilter: 'blur(8px)', 
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}
          formatter={(value: any) => [`₵${Number(value).toLocaleString()}`, 'Revenue']}
          itemStyle={{ color: '#C5A059', fontFamily: 'monospace' }}
          labelStyle={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#C5A059" 
          strokeWidth={2.5} 
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
