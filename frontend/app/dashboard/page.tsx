import Link from "next/link"
import { ArrowUpRight, Code2, FileCode, History, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your code reviews.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">-12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Quality Score</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+4% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Your most recent code reviews</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              {
                name: "Authentication Service",
                date: "2 hours ago",
                issues: 12,
                score: "85%",
              },
              {
                name: "API Endpoints",
                date: "Yesterday",
                issues: 8,
                score: "92%",
              },
              {
                name: "Frontend Components",
                date: "3 days ago",
                issues: 24,
                score: "68%",
              },
              {
                name: "Database Models",
                date: "1 week ago",
                issues: 5,
                score: "94%",
              },
            ].map((review) => (
              <div key={review.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{review.name}</div>
                  <div className="text-sm text-muted-foreground">{review.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-sm font-medium">{review.issues} issues</div>
                    <div className="text-sm text-muted-foreground">Score: {review.score}</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/history">View all reviews</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a new review or check your analytics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="w-full justify-start gap-2" asChild>
              <Link href="/dashboard/new-review">
                <Plus className="h-4 w-4" />
                New Code Review
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/dashboard/analytics">
                <History className="h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/dashboard/settings">
                <Code2 className="h-4 w-4" />
                Configure Review Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
