"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Loader,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReviewerMetrics {
  total_reviews_assigned: number;
  reviews_completed: number;
  reviews_pending: number;
  average_review_time_days: number | null;
  steps_completed: number;
  exceptions_raised: number;
  completed_today: number;
  completed_this_week: number;
  completed_this_month: number;
  completed_this_year: number;
  completed_by_year: { year: number; count: number }[];
  recent_activity?: { date: string; action: string; document: string }[];
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<ReviewerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    const controller = new AbortController();

    const fetchMetrics = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}metrics/reviewer/metrics`,
          { signal: controller.signal, credentials: "include" },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setMetrics(data);
        setError(null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load reviewer metrics.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...Array(9)].map((_, idx) => (
          <Skeleton key={idx} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen border border-red-300 bg-red-50 p-4 text-3xl text-red-700 flex justify-center items-center gap-2 shadow-sm">
        <BarChart3 className="h-10 w-10" />
        <div>
          <p className="font-medium">Error loading My Metrics</p>
          <p className="text-2xl">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate derived metrics
  const completionRate =
    metrics && metrics.total_reviews_assigned > 0
      ? Math.round(
          (metrics.reviews_completed / metrics.total_reviews_assigned) * 100,
        )
      : 0;

  const exceptionRate =
    metrics && metrics.reviews_completed > 0
      ? Math.round(
          (metrics.exceptions_raised / metrics.reviews_completed) * 100,
        )
      : 0;

  const productivityScore = metrics
    ? Math.min(
        100,
        Math.round(
          metrics.reviews_completed * 0.4 +
            metrics.steps_completed * 0.3 -
            metrics.exceptions_raised * 0.3,
        ),
      )
    : 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Reviewer Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            onClick={() => setTimeRange("week")}
          >
            This Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            onClick={() => setTimeRange("month")}
          >
            This Month
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            onClick={() => setTimeRange("year")}
          >
            This Year
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Productivity Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">
                  Productivity Score
                </CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">
                  {productivityScore}
                </div>
                <Progress
                  value={productivityScore}
                  className="h-2 mt-2 bg-blue-100 [&>div]:bg-blue-500"
                />
                <p className="text-xs text-blue-500 mt-2">
                  Based on reviews completed, steps, and exceptions
                </p>
              </CardContent>
            </Card>

            {/* Completion Card */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-600">
                  Completion Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">
                  {completionRate}%
                </div>
                <Progress
                  value={completionRate}
                  className="h-2 mt-2 bg-green-100 [&>div]:bg-green-500"
                />
                <p className="text-xs text-green-500 mt-2">
                  {metrics?.reviews_completed} of{" "}
                  {metrics?.total_reviews_assigned} reviews completed
                </p>
              </CardContent>
            </Card>

            {/* Time Efficiency Card */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-purple-600">
                  Avg. Review Time
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">
                  {metrics?.average_review_time_days
                    ? `${metrics.average_review_time_days.toFixed(1)} days`
                    : "N/A"}
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-purple-500">
                    <span>Fastest</span>
                    <span>1.2 days</span>
                  </div>
                  <div className="flex justify-between text-xs text-purple-500">
                    <span>Team Avg.</span>
                    <span>3.5 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <MetricCard
              title="Completed Today"
              value={metrics?.completed_today ?? 0}
              icon={<Calendar className="h-5 w-5" />}
              trend="up"
              change={2}
            />
            <MetricCard
              title={`Completed This ${
                timeRange.charAt(0).toUpperCase() + timeRange.slice(1)
              }`}
              value={
                timeRange === "week"
                  ? metrics?.completed_this_week ?? 0
                  : timeRange === "month"
                  ? metrics?.completed_this_month ?? 0
                  : metrics?.completed_this_year ?? 0
              }
              icon={<TrendingUp className="h-5 w-5" />}
              trend={timeRange === "year" ? "steady" : "up"}
              change={
                timeRange === "week" ? 15 : timeRange === "month" ? 10 : 5
              }
            />
            <MetricCard
              title="Pending Reviews"
              value={metrics?.reviews_pending ?? 0}
              icon={<Loader className="h-5 w-5" />}
              trend="down"
              change={5}
            />
            <MetricCard
              title="Exceptions Raised"
              value={metrics?.exceptions_raised ?? 0}
              icon={<AlertCircle className="h-5 w-5" />}
              trend="down"
              change={3}
              isException={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {metrics?.reviews_completed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {metrics?.reviews_pending}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {metrics?.total_reviews_assigned}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
                <div className="flex h-4 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="bg-green-500"
                    style={{ width: `${completionRate}%` }}
                  />
                  <div
                    className="bg-yellow-400"
                    style={{ width: `${100 - completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exception Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{exceptionRate}%</div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Exceptions</span>
                    <span>
                      {metrics?.exceptions_raised} of{" "}
                      {metrics?.reviews_completed}
                    </span>
                  </div>
                  <Progress value={exceptionRate} className="h-2 mt-1" />
                </div>
                <div className="mt-4 text-sm">
                  {exceptionRate > 20 ? (
                    <span className="text-red-500">
                      Higher than team average (15%)
                    </span>
                  ) : (
                    <span className="text-green-500">
                      Lower than team average (15%)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Completed Reviews by Year</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(metrics?.completed_by_year) &&
              metrics.completed_by_year.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {metrics.completed_by_year.map((item) => (
                    <MetricCard
                      key={item.year}
                      title={`Year ${item.year}`}
                      value={item.count}
                      icon={<Calendar className="h-5 w-5" />}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No historical data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string | null;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "steady";
  change?: number;
  isException?: boolean;
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  change,
  isException = false,
}: MetricCardProps) {
  const trendColor = isException
    ? trend === "up"
      ? "text-red-500"
      : "text-green-500"
    : trend === "up"
    ? "text-green-500"
    : trend === "down"
    ? "text-red-500"
    : "text-yellow-500";

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="text-muted-foreground text-sm font-medium">
            {title}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="text-2xl font-bold mt-2">{value ?? "-"}</div>
        {trend && change && (
          <div className={`text-xs mt-1 flex items-center ${trendColor}`}>
            <span>
              {trendIcon} {change}%
            </span>
            <span className="ml-1">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
