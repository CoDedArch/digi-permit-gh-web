// components/analytics/CostAreaChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  cost?: number;
  area?: number;
}

const CostAreaChart = ({ cost = 0, area = 0 }: Props) => {
  const data = [
    {
      name: "Cost vs Area",
      "Estimated Cost": cost,
      "Construction Area": area,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Estimated Cost" fill="#8884d8" />
        <Bar dataKey="Construction Area" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CostAreaChart;
