"use client"

import { useState, useRef } from "react"
import { ArrowLeft, ArrowRight, Code, FileCode, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

// File type definition
interface CodeFile {
  name: string
  content: string
}

export default function NewReviewPage() {
  const { toast } = useToast()
  const [files, setFiles] = useState<CodeFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pastedCode, setPastedCode] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    setReviewResult(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    // Process each file
    Array.from(fileList).forEach((file) => {
      // Only accept text files
      if (!file.type.includes('text') && !file.name.match(/\.(js|jsx|ts|tsx|py|java|c|cpp|html|css|json|md|txt)$/i)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported code file.`,
          variant: "destructive"
        })
        return
      }

      // Read file content
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFiles((prevFiles) => {
          // Check if file already exists
          const exists = prevFiles.some(f => f.name === file.name)
          if (exists) {
            toast({
              title: "File already added",
              description: `${file.name} is already in the list.`,
              variant: "destructive"
            })
            return prevFiles
          }

          const newFiles = [...prevFiles, { name: file.name, content }]
          
          // Select the file if it's the first one
          if (newFiles.length === 1 || !selectedFile) {
            setSelectedFile(file.name)
          }
          
          return newFiles
        })
      }
      reader.readAsText(file)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName))
    
    // If the removed file was selected, select another file or set to null
    if (selectedFile === fileName) {
      const remainingFiles = files.filter(file => file.name !== fileName)
      setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0].name : null)
      setReviewResult(null)
    }
  }

  const handleReview = () => {
    setIsLoading(true)
    
    const codeToReview = selectedFile
      ? files.find(f => f.name === selectedFile)?.content
      : pastedCode

    // In a real implementation, this would be an API call to your backend
    setTimeout(() => {
      setReviewResult(
        "# Code Review Results\n\n" +
        "## Security Issues\n" +
        "- Check for potential security vulnerabilities\n" +
        "- Validate all user inputs\n\n" +
        "## Performance Improvements\n" +
        "- Optimize algorithm efficiency\n" +
        "- Consider caching results\n\n" +
        "## Best Practices\n" +
        "- Follow code style guidelines\n" +
        "- Add proper documentation\n" +
        "- Use meaningful variable names"
      )
      setIsLoading(false)
      
      toast({
        title: "Code Review Complete",
        description: "Your code has been analyzed successfully."
      })
    }, 2000)
  }

  const handlePasteReview = () => {
    if (!pastedCode.trim()) {
      toast({
        title: "No code to review",
        description: "Please paste some code before submitting.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    // In a real implementation, this would be an API call to your backend
    setTimeout(() => {
      setReviewResult(
        "# Code Review Results\n\n" +
        "## Security Issues\n" +
        "- Check for potential security vulnerabilities\n" +
        "- Validate all user inputs\n\n" +
        "## Performance Improvements\n" +
        "- Optimize algorithm efficiency\n" +
        "- Consider caching results\n\n" +
        "## Best Practices\n" +
        "- Follow code style guidelines\n" +
        "- Add proper documentation\n" +
        "- Use meaningful variable names"
      )
      setIsLoading(false)
      
      toast({
        title: "Code Review Complete",
        description: "Your pasted code has been analyzed successfully."
      })
    }, 2000)
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
                  {files.length === 0 ? (
                    <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">
                        No files uploaded yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {files.map((file) => (
                        <div key={file.name} className="flex items-center gap-2">
                          <Button
                            variant={selectedFile === file.name ? "default" : "outline"}
                            className="justify-start gap-2 flex-grow"
                            onClick={() => handleFileSelect(file.name)}
                          >
                            <FileCode className="h-4 w-4" />
                            <span className="truncate">{file.name}</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleRemoveFile(file.name)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.json,.md,.txt"
                  />
                  <Button 
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Files
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
                            <code>{files.find((f) => f.name === selectedFile)?.content}</code>
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
                      <p className="text-center text-muted-foreground">
                        {files.length > 0 
                          ? "Select a file from the list to view its content" 
                          : "Upload files using the button below"}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setFiles([])
                    setSelectedFile(null)
                    setReviewResult(null)
                  }}>
                    Clear All
                  </Button>
                  <Button 
                    onClick={handleReview} 
                    disabled={!selectedFile || isLoading} 
                    className="gap-2"
                  >
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
              <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <Textarea 
                    placeholder="Paste your code here..." 
                    className="min-h-[400px] font-mono" 
                    value={pastedCode}
                    onChange={(e) => setPastedCode(e.target.value)}
                  />
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
                          Paste your code and click "Review Code" to analyze
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPastedCode("")
                    setReviewResult(null)
                  }}
                >
                  Clear
                </Button>
                <Button 
                  className="gap-2" 
                  onClick={handlePasteReview}
                  disabled={!pastedCode.trim() || isLoading}
                >
                  {isLoading ? "Analyzing..." : "Review Code"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
} 