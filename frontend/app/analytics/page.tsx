"use client"

import { useState } from "react"
import { BarChart, Calendar, LineChart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
} from "@/components/ui/chart"
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from "next/link"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d")

  const issueData = [
    { name: "Jan", Security: 21, Performance: 14, BestPractices: 35 },
    { name: "Feb", Security: 15, Performance: 18, BestPractices: 27 },
    { name: "Mar", Security: 12, Performance: 23, BestPractices: 30 },
    { name: "Apr", Security: 18, Performance: 25, BestPractices: 22 },
    { name: "May", Security: 24, Performance: 18, BestPractices: 28 },
    { name: "Jun", Security: 16, Performance: 14, BestPractices: 32 },
  ]

  const qualityScoreData = [
    { name: "Jan", score: 68 },
    { name: "Feb", score: 72 },
    { name: "Mar", score: 75 },
    { name: "Apr", score: 78 },
    { name: "May", score: 82 },
    { name: "Jun", score: 85 },
  ]

  const reviewsPerProjectData = [
    { name: "Authentication", value: 24 },
    { name: "API", value: 18 },
    { name: "Frontend", value: 32 },
    { name: "Database", value: 14 },
    { name: "Utils", value: 8 },
  ]

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
            <span className="font-bold">CodeReview</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your code quality metrics and review history.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs defaultValue="overview" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Issues
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant={dateRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setDateRange("7d")}>
              7d
            </Button>
            <Button variant={dateRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setDateRange("30d")}>
              30d
            </Button>
            <Button variant={dateRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setDateRange("90d")}>
              90d
            </Button>
            <Button variant="outline" size="icon" className="ml-2">
              <Calendar className="h-4 w-4" />
              <span className="sr-only">Date range</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsContent value="overview" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">96</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">+4% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">-12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Issues Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Code Quality Score</CardTitle>
                  <CardDescription>Your code quality score over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer>
                      <Chart data={qualityScoreData}>
                        <ChartGrid />
                        <ChartXAxis dataKey="name" />
                        <ChartYAxis />
                        <ChartLine dataKey="score" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                        <ChartArea dataKey="score" fill="#10b981" fillOpacity={0.2} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </Chart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reviews per Project</CardTitle>
                  <CardDescription>Number of reviews by project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer>
                      <Chart data={reviewsPerProjectData}>
                        <ChartGrid />
                        <ChartXAxis dataKey="name" />
                        <ChartYAxis />
                        <ChartBar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </Chart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Breakdown of issues found in your code</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer>
                    <Chart data={issueData}>
                      <ChartGrid />
                      <ChartXAxis dataKey="name" />
                      <ChartYAxis />
                      <ChartBar dataKey="Security" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <ChartBar dataKey="Performance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <ChartBar dataKey="BestPractices" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend>
                        <ChartLegendItem name="Security" color="#ef4444" />
                        <ChartLegendItem name="Performance" color="#f59e0b" />
                        <ChartLegendItem name="Best Practices" color="#3b82f6" />
                      </ChartLegend>
                    </Chart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
} 