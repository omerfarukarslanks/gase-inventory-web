"use client";

import { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { salesWeekly, stockByCategory, monthlyTrend } from "@/components/dashboard/data";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

function fmtCurrency(n: number) {
  return `₺${n.toLocaleString("tr-TR")}`;
}

function fmtNumber(n: number) {
  return n.toLocaleString("tr-TR");
}

type ChartValueType = "currency" | "number";

function getValueFormatter(valueType: ChartValueType) {
  return valueType === "currency" ? fmtCurrency : fmtNumber;
}

function DefaultTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number }>;
  label?: string;
  formatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-glow">
      <div className="mb-2 text-sm font-semibold text-text">{label}</div>
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-sm" style={{ background: item.color }} />
            <span className="text-text2">{item.name}:</span>
            <span className="font-semibold text-text">
              {formatter(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeeklySalesChart() {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesWeekly}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.18} />
              <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `₺${fmt(value)}`}
          />

          <Tooltip content={<DefaultTooltip formatter={fmtCurrency} />} />

          <Area
            type="monotone"
            dataKey="satis"
            name="Satış"
            stroke="rgb(var(--primary))"
            fill="url(#salesGrad)"
            strokeWidth={2.5}
          />
          <Area
            type="monotone"
            dataKey="iade"
            name="İade"
            stroke="rgb(var(--error))"
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart() {
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stockByCategory}
            cx="50%"
            cy="50%"
            innerRadius={46}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {stockByCategory.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyBarChart() {
  return (
    <div className="h-[230px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyTrend} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis
            dataKey="ay"
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `₺${fmt(value)}`}
          />

          <Tooltip content={<DefaultTooltip formatter={fmtCurrency} />} />
          <Bar
            dataKey="gelir"
            name="Gelir"
            fill="rgb(var(--primary))"
            radius={[6, 6, 0, 0]}
            barSize={16}
          />
          <Bar
            dataKey="gider"
            name="Gider"
            fill="rgb(var(--accent))"
            radius={[6, 6, 0, 0]}
            barSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type TrendAreaChartPoint = {
  label: string;
  primary: number;
  secondary?: number;
};

export function TrendAreaChart({
  data,
  primaryLabel,
  secondaryLabel,
  valueType = "currency",
  height = 260,
}: {
  data: TrendAreaChartPoint[];
  primaryLabel: string;
  secondaryLabel?: string;
  valueType?: ChartValueType;
  height?: number;
}) {
  const gradientId = useId().replace(/:/g, "");
  const formatter = getValueFormatter(valueType);
  const hasSecondary =
    Boolean(secondaryLabel) && data.some((item) => Math.abs(item.secondary ?? 0) > 0);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.18} />
              <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              valueType === "currency" ? `₺${fmt(value)}` : fmt(value)
            }
          />
          <Tooltip content={<DefaultTooltip formatter={formatter} />} />

          <Area
            type="monotone"
            dataKey="primary"
            name={primaryLabel}
            stroke="rgb(var(--primary))"
            fill={`url(#${gradientId})`}
            strokeWidth={2.4}
          />
          {hasSecondary && (
            <Area
              type="monotone"
              dataKey="secondary"
              name={secondaryLabel}
              stroke="rgb(var(--warning))"
              fill="none"
              strokeWidth={1.7}
              strokeDasharray="4 4"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export type CompareBarChartPoint = {
  label: string;
  primary: number;
  secondary: number;
};

export function CompareBarChart({
  data,
  primaryLabel,
  secondaryLabel,
  valueType = "currency",
  height = 260,
}: {
  data: CompareBarChartPoint[];
  primaryLabel: string;
  secondaryLabel: string;
  valueType?: ChartValueType;
  height?: number;
}) {
  const formatter = getValueFormatter(valueType);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              valueType === "currency" ? `₺${fmt(value)}` : fmt(value)
            }
          />
          <Tooltip content={<DefaultTooltip formatter={formatter} />} />
          <Bar
            dataKey="primary"
            name={primaryLabel}
            fill="rgb(var(--primary))"
            radius={[6, 6, 0, 0]}
            barSize={14}
          />
          <Bar
            dataKey="secondary"
            name={secondaryLabel}
            fill="rgb(var(--accent))"
            radius={[6, 6, 0, 0]}
            barSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type RingStatusChartDatum = {
  name: string;
  value: number;
  color: string;
};

export function RingStatusChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: RingStatusChartDatum[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<DefaultTooltip formatter={fmtNumber} />} />
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[rgb(var(--muted))] text-xs"
          >
            {centerLabel}
          </text>
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[rgb(var(--text))] text-sm font-semibold"
          >
            {centerValue}
          </text>
          <text
            x="50%"
            y="66%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[rgb(var(--muted))] text-[10px]"
          >
            Toplam {fmtNumber(total)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
