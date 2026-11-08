'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OrdersData {
  name: string;
  orders: number;
}

export default function OrdersChart({ data }: { data: OrdersData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          allowDecimals={false}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(197, 160, 89, 0.08)' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: '1px solid rgba(197, 160, 89, 0.3)', 
            backgroundColor: 'rgba(18, 18, 18, 0.95)', 
            backdropFilter: 'blur(8px)', 
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}
          formatter={(value: any) => [`${value} orders`, 'Orders']}
          itemStyle={{ color: '#C5A059', fontFamily: 'monospace' }}
          labelStyle={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}
        />
        <Bar 
          dataKey="orders" 
          fill="#C5A059" 
          radius={[6, 6, 0, 0]} 
          barSize={24} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
