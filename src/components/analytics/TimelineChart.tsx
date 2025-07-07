// components/analytics/TimelineChart.tsx
"use client";

import { ApplicationDetail } from "@/app/data/queries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  app: ApplicationDetail;
}

const TimelineChart = ({ app }: Props) => {
  const data = [
    { name: "Created", date: app.created_at },
    { name: "Updated", date: app.updated_at },
    ...(app.submitted_at ? [{ name: "Submitted", date: app.submitted_at }] : []),
    ...(app.approved_at ? [{ name: "Approved", date: app.approved_at }] : []),
  ].map((item) => ({
    name: item.name,
    timestamp: new Date(item.date).getTime(),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
        />
        <YAxis hide />
        <Tooltip
          labelFormatter={(label: string) => label}
          formatter={(_: any, __: any, props: any) =>
            new Date(props.payload?.timestamp).toLocaleString()
          }
        />
        <Line type="monotone" dataKey="timestamp" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimelineChart;
