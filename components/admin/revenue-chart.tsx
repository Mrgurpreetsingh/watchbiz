'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

/**
 * 📊 Revenue Chart Component
 *
 * Graphique interactif des revenus mensuels avec Recharts
 */

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Find max revenue for scaling
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-luxury-black mb-1">
            {payload[0].payload.month}
          </p>
          <p className="text-lg font-bold text-gold-champagne">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={false}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }} />
        <Bar dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={60}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.revenue === maxRevenue ? '#d4af37' : '#f0e5c9'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
