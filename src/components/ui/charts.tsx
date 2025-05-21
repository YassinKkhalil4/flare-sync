
import React from "react";
import {
  Area,
  Bar,
  Line,
  Pie,
  ComposedChart,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

interface ChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      fill?: boolean;
      tension?: number;
    }>;
  };
  height?: number;
  showLegend?: boolean;
  options?: any;
}

export function AreaChart({ data, height = 300, showLegend = true, options }: ChartProps) {
  // Transform data from Chart.js format to Recharts format
  const transformedData = data.labels.map((label, index) => {
    const entry: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[index];
    });
    return entry;
  });

  const chartConfig = data.datasets.reduce((acc, dataset) => {
    acc[dataset.label] = {
      label: dataset.label,
      color: dataset.borderColor || dataset.backgroundColor,
    };
    return acc;
  }, {} as Record<string, { label: string; color?: string | string[] }>);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={transformedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {data.datasets.map((dataset, index) => (
              <linearGradient key={index} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dataset.borderColor as string} stopOpacity={0.8} />
                <stop offset="95%" stopColor={dataset.borderColor as string} stopOpacity={0.2} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="name" />
          <YAxis {...(options?.scales?.y || {})} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<ChartTooltipContent />} />
          {showLegend && <Legend content={<ChartLegendContent />} />}
          {data.datasets.map((dataset, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.borderColor as string}
              fill={dataset.fill ? `url(#color-${index})` : undefined}
              fillOpacity={0.3}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function BarChart({ data, height = 300, showLegend = true, options }: ChartProps) {
  // Transform data from Chart.js format to Recharts format
  const transformedData = data.labels.map((label, index) => {
    const entry: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[index];
    });
    return entry;
  });

  const chartConfig = data.datasets.reduce((acc, dataset) => {
    acc[dataset.label] = {
      label: dataset.label,
      color: dataset.backgroundColor,
    };
    return acc;
  }, {} as Record<string, { label: string; color?: string | string[] }>);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={transformedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" />
          <YAxis {...(options?.scales?.y || {})} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<ChartTooltipContent />} />
          {showLegend && <Legend content={<ChartLegendContent />} />}
          {data.datasets.map((dataset, index) => (
            <Bar
              key={index}
              dataKey={dataset.label}
              fill={Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function LineChart({ data, height = 300, showLegend = true, options }: ChartProps) {
  // Transform data from Chart.js format to Recharts format
  const transformedData = data.labels.map((label, index) => {
    const entry: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[index];
    });
    return entry;
  });

  const chartConfig = data.datasets.reduce((acc, dataset) => {
    acc[dataset.label] = {
      label: dataset.label,
      color: dataset.borderColor,
    };
    return acc;
  }, {} as Record<string, { label: string; color?: string | string[] }>);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={transformedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" />
          <YAxis {...(options?.scales?.y || {})} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<ChartTooltipContent />} />
          {showLegend && <Legend content={<ChartLegendContent />} />}
          {data.datasets.map((dataset, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.borderColor as string}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function PieChart({ data, height = 300, showLegend = true }: ChartProps) {
  // Transform data from Chart.js format to Recharts format
  const transformedData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
    fill: Array.isArray(data.datasets[0].backgroundColor) 
      ? data.datasets[0].backgroundColor[index]
      : data.datasets[0].backgroundColor,
  }));

  const chartConfig = data.datasets.reduce((acc, dataset, index) => {
    data.labels.forEach((label, i) => {
      acc[label] = {
        label,
        color: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : dataset.backgroundColor,
      };
    });
    return acc;
  }, {} as Record<string, { label: string; color?: string | string[] }>);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <Pie
            data={transformedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          {showLegend && <Legend content={<ChartLegendContent />} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
