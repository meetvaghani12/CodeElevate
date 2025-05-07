'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowUpDown, FileCode, Search, ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { ComponentPropsWithoutRef } from "react"

interface CodeReview {
  id: string
  fileName: string | null
  code: string
  review: string
  score: number
  issuesCount: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
}

export default function ReviewHistory() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<CodeReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<CodeReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [scoreFilter, setScoreFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    filterAndSortReviews()
  }, [reviews, searchQuery, statusFilter, scoreFilter, sortBy])

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Debug: Token from localStorage:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.log('Debug: No token found, showing error toast');
        toast({
          title: "Authentication Error",
          description: "Please log in to view your reviews",
          variant: "destructive"
        });
        return;
      }

      console.log('Debug: Making request to /api/code-reviews');
      const response = await fetch('/api/code-reviews', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Debug: Response status:', response.status);
      
      if (response.status === 401) {
        console.log('Debug: Received 401, clearing token and showing error');
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive"
        });
        localStorage.removeItem('token');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Debug: Error response:', errorText);
        throw new Error(`Failed to fetch reviews: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Debug: Successfully fetched reviews:', data);
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error('Debug: Error in fetchReviews:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load review history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filterAndSortReviews = () => {
    let filtered = [...reviews]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(review => 
        review.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(review => review.status === statusFilter)
    }

    // Apply score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter(review => {
        switch (scoreFilter) {
          case "high":
            return review.score >= 90
          case "medium":
            return review.score >= 70 && review.score < 90
          case "low":
            return review.score < 70
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "score-high":
          return b.score - a.score
        case "score-low":
          return a.score - b.score
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10b981"
    if (score >= 70) return "#f59e0b"
    return "#ef4444"
  }

  const downloadReview = (review: CodeReview) => {
    const fileName = review.fileName 
      ? `${review.fileName.split('/').pop()?.replace(/\.[^/.]+$/, '')}_review.md`
      : 'code_review.md';

    const blob = new Blob([review.review], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your code review has been downloaded as a Markdown file.",
    });
  };

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
            <span className="font-bold">AnveshaCode</span>
          </div>
        </div>

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
                <Input 
                  placeholder="Search reviews..." 
                  className="h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
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
              <Select value={sortBy} onValueChange={setSortBy}>
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
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No reviews found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Issues</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.id}</TableCell>
                      <TableCell>{review.fileName || 'Pasted Code'}</TableCell>
                      <TableCell>{formatDate(review.createdAt)}</TableCell>
                      <TableCell className="text-center">{review.issuesCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-16 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${getScoreColor(review.score)} ${review.score}%, transparent ${review.score}%)`,
                            }}
                          />
                          <span>{review.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            review.status === "COMPLETED"
                              ? "default"
                              : review.status === "IN_PROGRESS"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {review.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedReview(review)}
                            title="View Review"
                          >
                            <FileCode className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => downloadReview(review)}
                            title="Download Review"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>Review Details</span>
                  {selectedReview && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold`} style={{ color: getScoreColor(selectedReview.score) }}>
                          {selectedReview.score}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /100
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {selectedReview.issuesCount} {selectedReview.issuesCount === 1 ? 'Issue' : 'Issues'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-full pr-4">
              {selectedReview && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    components={{
                      p: ({...props}: ComponentPropsWithoutRef<'p'>) => <p className="mb-4" {...props} />,
                      ul: ({...props}: ComponentPropsWithoutRef<'ul'>) => <ul className="mb-4 space-y-2" {...props} />,
                      ol: ({...props}: ComponentPropsWithoutRef<'ol'>) => <ol className="mb-4 space-y-2" {...props} />,
                      li: ({...props}: ComponentPropsWithoutRef<'li'>) => <li className="mb-2" {...props} />,
                      h1: ({...props}: ComponentPropsWithoutRef<'h1'>) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
                      h2: ({...props}: ComponentPropsWithoutRef<'h2'>) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
                      h3: ({...props}: ComponentPropsWithoutRef<'h3'>) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                      pre: ({...props}: ComponentPropsWithoutRef<'pre'>) => <pre className="mb-4 p-4 bg-muted rounded-md overflow-x-auto" {...props} />,
                      code: ({...props}: ComponentPropsWithoutRef<'code'>) => <code className="bg-muted px-1 py-0.5 rounded" {...props} />
                    }}
                  >
                    {selectedReview.review}
                  </ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
} 