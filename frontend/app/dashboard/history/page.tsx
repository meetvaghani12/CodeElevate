'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowUpDown, FileCode, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReviewHistory() {
  const reviews = [
    {
      id: "REV-001",
      name: "Authentication Service",
      date: "2023-05-28",
      issues: 12,
      score: 85,
      status: "completed",
    },
    {
      id: "REV-002",
      name: "API Endpoints",
      date: "2023-05-27",
      issues: 8,
      score: 92,
      status: "completed",
    },
    {
      id: "REV-003",
      name: "Frontend Components",
      date: "2023-05-25",
      issues: 24,
      score: 68,
      status: "completed",
    },
    {
      id: "REV-004",
      name: "Database Models",
      date: "2023-05-21",
      issues: 5,
      score: 94,
      status: "completed",
    },
    {
      id: "REV-005",
      name: "User Authentication Flow",
      date: "2023-05-18",
      issues: 15,
      score: 78,
      status: "completed",
    },
    {
      id: "REV-006",
      name: "Payment Processing",
      date: "2023-05-15",
      issues: 18,
      score: 72,
      status: "completed",
    },
    {
      id: "REV-007",
      name: "Error Handling",
      date: "2023-05-12",
      issues: 9,
      score: 88,
      status: "completed",
    },
    {
      id: "REV-008",
      name: "Notification System",
      date: "2023-05-10",
      issues: 7,
      score: 90,
      status: "completed",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
          <p className="text-muted-foreground">View and manage your past code reviews.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter your review history by various criteria.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search reviews..." className="h-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (90-100)</SelectItem>
                  <SelectItem value="medium">Medium (70-89)</SelectItem>
                  <SelectItem value="low">Low (0-69)</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="score-high">Highest Score</SelectItem>
                  <SelectItem value="score-low">Lowest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
            <CardDescription>A list of all your past code reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Name
                      <Button variant="ghost" size="icon" className="h-4 w-4">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Date
                      <Button variant="ghost" size="icon" className="h-4 w-4">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Issues</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Score
                      <Button variant="ghost" size="icon" className="h-4 w-4">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.id}</TableCell>
                    <TableCell>{review.name}</TableCell>
                    <TableCell>{review.date}</TableCell>
                    <TableCell className="text-center">{review.issues}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-16 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${
                              review.score >= 90 ? "#10b981" : review.score >= 70 ? "#f59e0b" : "#ef4444"
                            } ${review.score}%, transparent ${review.score}%)`,
                          }}
                        />
                        <span>{review.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          review.status === "completed"
                            ? "default"
                            : review.status === "in-progress"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {review.status === "completed"
                          ? "Completed"
                          : review.status === "in-progress"
                            ? "In Progress"
                            : "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <FileCode className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
