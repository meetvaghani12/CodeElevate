"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, FileCode, Clock, AlertCircle, CheckCircle2, Search, Filter } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from '@/components/ProtectedRoute'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

export default function ReviewHistoryPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<CodeReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<CodeReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    filterReviews()
  }, [reviews, searchQuery, statusFilter])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/code-reviews')
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const data = await response.json()
      setReviews(data)
      setFilteredReviews(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load review history",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterReviews = () => {
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

    setFilteredReviews(filtered)
  }

  const getStatusIcon = (status: CodeReview['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Review History</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Code Reviews</CardTitle>
            <CardDescription>View your past code reviews and their results</CardDescription>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file name or code..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No reviews found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <FileCode className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-medium">
                                {review.fileName || 'Pasted Code'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getScoreColor(review.score)}`}>
                                {review.score}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                /100
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {review.issuesCount} {review.issuesCount === 1 ? 'Issue' : 'Issues'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(review.status)}
                              <span className="text-sm capitalize">
                                {review.status.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
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
                        <span className={`text-2xl font-bold ${getScoreColor(selectedReview.score)}`}>
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