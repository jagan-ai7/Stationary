import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchOrders } from "@/features/orders/orderSlice";
import { useEffect } from "react";

/* ---------------- HELPERS ---------------- */

// safe date key (avoids timezone + time issues)
const getDayKey = (dateStr: string) => new Date(dateStr).toISOString().split("T")[0];

// ISO-like week grouping (simple stable version)
const getWeekKey = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `Week ${week}`;
};

const getMonthKey = (dateStr: string) =>
  new Date(dateStr).toLocaleString("default", { month: "short" });

/* ---------------- CHART CARD ---------------- */

function ChartCard({
  title,
  subtitle,
  isEmpty,
  children,
}: {
  title: string;
  subtitle: string;
  isEmpty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="h-72 w-full">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children as any}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function Analytics() {
  const orders = useAppSelector((s) => s.orders.items) || [];

  const [range, setRange] = React.useState<DateRange | undefined>();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  /* ---------------- FILTER HELPERS ---------------- */

  const inRange = React.useCallback(
    (dateStr: string) => {
      if (!range?.from && !range?.to) return true;

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;

      if (range.from && d < range.from) return false;
      if (range.to && d > range.to) return false;

      return true;
    },
    [range],
  );

  /* ---------------- FILTERED BASE DATA ---------------- */

  const deliveredOrders = React.useMemo(
    () => orders.filter((o) => o.status === "delivered"),
    [orders],
  );

  const rangedDelivered = React.useMemo(
    () => deliveredOrders.filter((o) => inRange(o.date)),
    [deliveredOrders, inRange],
  );

  /* ---------------- DAILY SALES ---------------- */

  const dailyData = React.useMemo(() => {
    const map = new Map<string, number>();

    rangedDelivered.forEach((o) => {
      const day = getDayKey(o.date);
      map.set(day, (map.get(day) || 0) + o.total);
    });

    return Array.from(map.entries())
      .map(([day, sales]) => ({ day, sales }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [rangedDelivered]);

  /* ---------------- WEEKLY SALES ---------------- */

  const weeklyData = React.useMemo(() => {
    const map = new Map<string, { thisYear: number; lastYear: number }>();

    rangedDelivered.forEach((o) => {
      const d = new Date(o.date);
      const week = getWeekKey(d);
      const year = d.getFullYear();
      const currentYear = new Date().getFullYear();

      const prev = map.get(week) || { thisYear: 0, lastYear: 0 };

      if (year === currentYear) prev.thisYear += o.total;
      else prev.lastYear += o.total;

      map.set(week, prev);
    });

    return Array.from(map.entries())
      .map(([week, value]) => ({
        week,
        ...value,
      }))
      .sort((a, b) => parseInt(a.week.split(" ")[1]) - parseInt(b.week.split(" ")[1]));
  }, [rangedDelivered]);

  /* ---------------- MONTHLY SALES ---------------- */

  const monthlyData = React.useMemo(() => {
    const map = new Map<string, number>();

    rangedDelivered.forEach((o) => {
      const month = getMonthKey(o.date);
      map.set(month, (map.get(month) || 0) + o.total);
    });

    return Array.from(map.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort(
        (a, b) =>
          new Date(`${a.month} 1, 2000`).getMonth() - new Date(`${b.month} 1, 2000`).getMonth(),
      );
  }, [rangedDelivered]);

  /* ---------------- LABEL ---------------- */

  const label = range?.from
    ? range.to
      ? `${format(range.from, "LLL d, y")} – ${format(range.to, "LLL d, y")}`
      : format(range.from, "LLL d, y")
    : "Pick a date range";

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Sales performance across orders.</p>
        </div>

        {/* DATE FILTER */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-65 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {range?.from && (
            <Button variant="ghost" size="sm" onClick={() => setRange(undefined)}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* DAILY */}
      <ChartCard
        title="Daily sales"
        subtitle="Delivered orders only"
        isEmpty={dailyData.length === 0}
      >
        <LineChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="var(--primary)" />
        </LineChart>
      </ChartCard>

      {/* WEEKLY */}
      <ChartCard
        title="Weekly comparison"
        subtitle="This year vs last year"
        isEmpty={weeklyData.length === 0}
      >
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="thisYear" fill="var(--primary)" />
          <Bar dataKey="lastYear" fill="var(--muted-foreground)" />
        </BarChart>
      </ChartCard>

      {/* MONTHLY */}
      <ChartCard title="Monthly growth" subtitle="Revenue trend" isEmpty={monthlyData.length === 0}>
        <AreaChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" fill="var(--primary)" />
        </AreaChart>
      </ChartCard>
    </div>
  );
}
