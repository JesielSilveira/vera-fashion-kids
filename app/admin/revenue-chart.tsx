"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function RevenueChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((stats) => {
        const formatted = Object.entries(stats).map(
          ([date, total]) => ({
            date,
            total,
          })
        )
        setData(formatted)
      })
  }, [])

  return (
    <div className="h-80 rounded-lg border p-4">
      <h3 className="mb-4 font-semibold">
        Receita por dia
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
