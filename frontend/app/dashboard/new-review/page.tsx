"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Code, FileCode, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import ProtectedRoute from '@/components/ProtectedRoute'

export default function NewReviewPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mockFiles = [
    {
      name: "auth.js",
      content:
        "function authenticate(user, password) {\n  // TODO: Implement proper validation\n  if (user && password) {\n    return true;\n  }\n  return false;\n}",
    },
    {
      name: "api.js",
      content:
        "async function fetchData() {\n  const response = await fetch('/api/data');\n  const data = await response.json();\n  return data;\n}",
    },
    {
      name: "utils.js",
      content:
        "function formatDate(date) {\n  return new Date(date).toLocaleDateString();\n}\n\nfunction calculateTotal(items) {\n  return items.reduce((total, item) => total + item.price, 0);\n}",
    },
  ]

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    setReviewResult(null)
  }

  const handleReview = () => {
    setIsLoading(true)

    // Simulate API call for code review
    setTimeout(() => {
      setReviewResult(
        "# Code Review Results\n\n" +
          "## Security Issues\n" +
          "- Authentication lacks proper validation\n" +
          "- No input sanitization\n\n" +
          "## Performance Improvements\n" +
          "- Consider caching authentication results\n" +
          "- Add error handling for API requests\n\n" +
          "## Best Practices\n" +
          "- Add proper JSDoc comments\n" +
          "- Use more descriptive variable names\n" +
          "- Consider using TypeScript for better type safety",
      )
      setIsLoading(false)
    }, 2000)
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">New Code Review</h1>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Code
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Paste Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>Select a file to review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {mockFiles.map((file) => (
                      <Button
                        key={file.name}
                        variant={selectedFile === file.name ? "default" : "outline"}
                        className="justify-start gap-2"
                        onClick={() => handleFileSelect(file.name)}
                      >
                        <FileCode className="h-4 w-4" />
                        {file.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    Upload More Files
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{selectedFile || "Code Preview"}</CardTitle>
                  <CardDescription>
                    {selectedFile ? "Review the code before submitting" : "Select a file to view its content"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedFile ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <ScrollArea className="h-[400px]">
                          <pre className="text-sm">
                            <code>{mockFiles.find((f) => f.name === selectedFile)?.content}</code>
                          </pre>
                        </ScrollArea>
                      </div>

                      <div className="rounded-lg border p-4">
                        <ScrollArea className="h-[400px]">
                          {reviewResult ? (
                            <div className="prose prose-sm dark:prose-invert">
                              <pre className="text-sm whitespace-pre-wrap">{reviewResult}</pre>
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <p className="text-center text-muted-foreground">
                                Click "Review Code" to analyze this file
                              </p>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[400px] items-center justify-center rounded-lg border">
                      <p className="text-center text-muted-foreground">Select a file from the list to view its content</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleReview} disabled={!selectedFile || isLoading} className="gap-2">
                    {isLoading ? "Analyzing..." : "Review Code"}
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Paste Your Code</CardTitle>
                <CardDescription>Paste your code directly for review</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Paste your code here..." className="min-h-[400px] font-mono" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button className="gap-2">
                  Review Code
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
