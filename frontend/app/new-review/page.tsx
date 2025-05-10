"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { ArrowLeft, ArrowRight, Code, FileCode, Upload, X, Folder, ChevronRight, ChevronDown, Sparkles, Maximize2, Minimize2, Download, AlertCircle, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
// @ts-ignore - ReactMarkdown doesn't have TypeScript declarations
import ReactMarkdown from "react-markdown" 
import { ComponentPropsWithoutRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

// File type definition
interface CodeFile {
  name: string
  content: string
}

// Add a type for the folder structure
interface FolderStructure {
  name: string
  path: string
  isExpanded: boolean
  files: CodeFile[]
  folders: FolderStructure[]
}

// Review model type
type ReviewModel = "llm" | "agent"

interface SubscriptionStatus {
  plan: string;
  currentReviews: number;
  reviewLimit: number;
  remainingReviews: number;
}

export default function NewReviewPage() {
  const { toast } = useToast()
  const [files, setFiles] = useState<CodeFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [reviewScore, setReviewScore] = useState<number | null>(null)
  const [issuesCount, setIssuesCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pastedCode, setPastedCode] = useState("")
  const [reviewModel, setReviewModel] = useState<ReviewModel>("llm")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Add state for expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Add useEffect to fetch subscription status
  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for subscription status');
        return;
      }

      const response = await fetch('/api/code-reviews/subscription-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription status');
      }

      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load subscription status",
        variant: "destructive"
      });
    }
  }

  // Handle review model change
  const handleReviewModelChange = (value: string) => {
    const newModel = value as ReviewModel
    setReviewModel(newModel)
    
    // Show toast notification when AI Agent is selected
    if (newModel === "agent") {
      toast({
        title: "Coming Soon",
        description: "The AI Agent review feature will be available soon. Currently using LLM model for all reviews.",
      })
    }
  }

  // Organize files into a folder structure
  const folderStructure = useMemo(() => {
    const root: FolderStructure = {
      name: 'Root',
      path: '',
      isExpanded: true,
      files: [],
      folders: []
    }

    // Helper function to get or create a folder at a path
    const getOrCreateFolder = (path: string): FolderStructure => {
      if (!path) return root

      const pathParts = path.split('/')
      let currentFolder = root

      // Navigate through the path, creating folders as needed
      for (let i = 0; i < pathParts.length; i++) {
        const folderName = pathParts[i]
        const folderPath = pathParts.slice(0, i + 1).join('/')
        
        // Find the folder or create it
        let folder = currentFolder.folders.find(f => f.name === folderName)
        
        if (!folder) {
          folder = {
            name: folderName,
            path: folderPath,
            isExpanded: expandedFolders.has(folderPath),
            files: [],
            folders: []
          }
          currentFolder.folders.push(folder)
        }
        
        currentFolder = folder
      }
      
      return currentFolder
    }

    // Place each file in its corresponding folder
    files.forEach(file => {
      const pathParts = file.name.split('/')
      
      if (pathParts.length === 1) {
        // File is in the root
        root.files.push(file)
      } else {
        // File is in a subfolder
        const fileName = pathParts.pop() as string
        const folderPath = pathParts.join('/')
        const folder = getOrCreateFolder(folderPath)
        
        // Create a simplified version of the file with just the filename
        const fileInFolder: CodeFile = {
          name: file.name,
          content: file.content
        }
        
        folder.files.push(fileInFolder)
      }
    })

    return root
  }, [files, expandedFolders])

  // Toggle folder expansion
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  // When uploading a folder, automatically expand the parent folders
  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    // Track unique folder paths to auto-expand them
    const foldersToExpand = new Set<string>()
    
    // Process all files, preserving folder structure
    Array.from(fileList).forEach((file) => {
      // Get relative path from webkitRelativePath
      const relativePath = file.webkitRelativePath || ""
      
      // Extract folder structure (excluding file name)
      const pathParts = relativePath.split('/')
      const folderStructure = pathParts.slice(0, -1).join('/')
      
      // Add each parent folder path to the set
      const parts = folderStructure.split('/')
      let currentPath = ''
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        foldersToExpand.add(currentPath)
      }
      
      processFile(file, folderStructure)
    })

    // Auto-expand the folders containing the new files
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      foldersToExpand.forEach(path => newSet.add(path))
      return newSet
    })

    // Reset folder input
    if (folderInputRef.current) {
      folderInputRef.current.value = ""
    }
  }

  // Count total files in a folder including subfolders
  const countFiles = (folder: FolderStructure): number => {
    let count = folder.files.length
    folder.folders.forEach(subFolder => {
      count += countFiles(subFolder)
    })
    return count
  }

  // Render a folder and its contents recursively
  const renderFolder = (folder: FolderStructure, level = 0) => {
    const isExpanded = folder.path === '' || expandedFolders.has(folder.path)
    const fileCount = countFiles(folder)
    
    return (
      <div key={folder.path} className="space-y-1">
        {folder.path && (
          <div 
            className="flex items-center px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
            onClick={() => toggleFolder(folder.path)}
            style={{ paddingLeft: `${(level * 12) + 8}px` }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <Folder className="h-4 w-4 mr-2 text-blue-400" />
            <span className="text-sm font-medium truncate">{folder.name}</span>
            {fileCount > 0 && (
              <span className="ml-auto bg-muted rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                {fileCount}
              </span>
            )}
          </div>
        )}
        
        {isExpanded && (
          <div className="space-y-1">
            {folder.folders.map(subFolder => renderFolder(subFolder, level + 1))}
            
            {folder.files.map(file => {
              // Extract just the filename from the full path
              const fileName = file.name.split('/').pop() || file.name
              
              return (
                <div key={file.name} className="flex items-center gap-2 pl-2" style={{ paddingLeft: `${(level * 12) + (folder.path ? 32 : 8)}px` }}>
                  <Button
                    variant={selectedFile === file.name ? "default" : "ghost"}
                    className="justify-start gap-2 flex-grow h-8 px-2"
                    onClick={() => handleFileSelect(file.name)}
                  >
                    <FileCode className="h-4 w-4" />
                    <span className="truncate text-sm">{fileName}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleRemoveFile(file.name)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    setReviewResult(null)
  }

  const processFile = (file: File, folderStructure = "") => {
    // Skip hidden files and non-text files
    if (file.name.startsWith('.') || 
        (!file.type.includes('text') && !file.name.match(/\.(js|jsx|ts|tsx|py|java|c|cpp|html|css|json|md|txt)$/i))) {
      return;
    }

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setFiles((prevFiles) => {
        // Create a file path that includes folder structure
        const filePath = folderStructure ? `${folderStructure}/${file.name}` : file.name
        
        // Check if file already exists
        const exists = prevFiles.some(f => f.name === filePath)
        if (exists) {
          toast({
            title: "File already added",
            description: `${filePath} is already in the list.`,
            variant: "destructive"
          })
          return prevFiles
        }

        const newFiles = [...prevFiles, { name: filePath, content }]
        
        // Select the file if it's the first one
        if (newFiles.length === 1 || !selectedFile) {
          setSelectedFile(filePath)
        }
        
        return newFiles
      })
    }
    reader.readAsText(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    // Process each file
    Array.from(fileList).forEach((file) => {
      processFile(file)
    })

    // Reset file input
    if (event.target === fileInputRef.current) {
      fileInputRef.current.value = ""
    } else if (event.target === folderInputRef.current) {
      folderInputRef.current.value = ""
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

  // Function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Function to get score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  // Function to call the review API
  const callReviewAPI = async (code: string, fileName?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save your review",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          fileName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get code review');
      }

      // Save the review to the database
      const saveResponse = await fetch('/api/code-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName,
          code,
          review: data.review,
          score: data.score,
          issuesCount: data.issuesCount,
          language: data.language
        }),
      });

      if (!saveResponse.ok) {
        console.error('Failed to save review to database');
        throw new Error('Failed to save review to database');
      }

      setReviewScore(data.score);
      setIssuesCount(data.issuesCount);
      return data.review;
    } catch (error) {
      console.error('Error getting code review:', error);
      throw error;
    }
  };

  const handleReview = async () => {
    if (!selectedFile) return;
    
    const fileToReview = files.find(f => f.name === selectedFile);
    if (!fileToReview) return;
    
    setIsLoading(true);
    
    try {
      const review = await callReviewAPI(fileToReview.content, fileToReview.name);
      setReviewResult(review);
      
      toast({
        title: "Code Review Complete",
        description: "Your code has been analyzed successfully with Gemini 1.5 Flash",
      });
    } catch (error) {
      toast({
        title: "Review Failed",
        description: error instanceof Error ? error.message : "Failed to get code review",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteReview = async () => {
    if (!pastedCode.trim()) {
      toast({
        title: "No code to review",
        description: "Please paste some code before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const review = await callReviewAPI(pastedCode);
      setReviewResult(review);
      
      toast({
        title: "Code Review Complete",
        description: "Your pasted code has been analyzed successfully with Gemini 1.5 Flash",
      });
    } catch (error) {
      toast({
        title: "Review Failed",
        description: error instanceof Error ? error.message : "Failed to get code review",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to download review as markdown file
  const downloadReview = () => {
    if (!reviewResult) return;

    const fileName = selectedFile 
      ? `${selectedFile.split('/').pop()?.replace(/\.[^/.]+$/, '')}_review.md`
      : 'code_review.md';

    const blob = new Blob([reviewResult], { type: 'text/markdown' });
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

  // Component for model selection
  const ModelSelection = () => (
    <div className="rounded-lg border p-4 mb-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-medium">Powered by Vaghani Gpt</span>
      </div>
      <Separator className="my-3" />
      <div className="mb-2 font-medium">Select Review Model</div>
      <RadioGroup 
        value={reviewModel} 
        onValueChange={(value) => handleReviewModelChange(value)}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="llm" id="llm" />
          <Label htmlFor="llm" className="cursor-pointer">
            <div className="font-medium">LLM Model</div>
            <p className="text-sm text-muted-foreground">
              Faster reviews with general code suggestions
            </p>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="agent" id="agent" />
          <Label htmlFor="agent" className="cursor-pointer flex items-center">
            <div className="font-medium flex items-center gap-2">
              AI Agent
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs rounded px-2 py-0.5">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Deeper analysis with context-aware recommendations
            </p>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )

  // Typing animation component
  const TypingAnimation = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
      </div>
      <p className="text-muted-foreground text-center">
        Analyzing your code with Vaghani GPT...
      </p>
    </div>
  )

  // Full screen review dialog
  const FullScreenReview = () => (
    <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>Code Review Results</span>
              <div className="flex items-center gap-4">
                {reviewScore !== null && (
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(reviewScore)}`}>
                      {reviewScore}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /100 - {getScoreLabel(reviewScore)}
                    </span>
                  </div>
                )}
                {issuesCount !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">
                      {issuesCount} {issuesCount === 1 ? 'Issue' : 'Issues'} Found
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadReview}
                title="Download Review"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(false)}
                title="Exit Full Screen"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
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
              {reviewResult}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )

  // Update the review result display in both tabs
  const ReviewResult = () => (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h3 className="font-medium">Review Results</h3>
          <div className="flex items-center gap-4">
            {reviewScore !== null && (
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(reviewScore)}`}>
                  {reviewScore}
                </span>
                <span className="text-sm text-muted-foreground">
                  /100 - {getScoreLabel(reviewScore)}
                </span>
              </div>
            )}
            {/* {issuesCount !== null && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">
                  {issuesCount} {issuesCount === 1 ? 'Issue' : 'Issues'} Found
                </span>
              </div>
            )} */}
          </div>
        </div>
        <div className="flex gap-2">
          {reviewResult && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadReview}
                title="Download Review"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(true)}
                title="View Full Screen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <TypingAnimation />
        ) : reviewResult ? (
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
              {reviewResult}
            </ReactMarkdown>
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
  )

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">New Code Review</h1>
            <p className="text-gray-500">Upload or paste your code for review</p>
          </div>
        </div>

        {subscriptionStatus && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-md border border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">Remaining Reviews:</span>
              <span className="font-bold text-primary">
                {subscriptionStatus.remainingReviews === Infinity ? '∞' : subscriptionStatus.remainingReviews}
              </span>
            </div>
          </div>
        )}

        <Tabs defaultValue="upload" className="space-y-4">
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
            <ModelSelection />
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>Select a file to review</CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto" style={{ maxHeight: '300px' }}>
                  {files.length === 0 ? (
                    <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">
                        No files uploaded yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {renderFolder(folderStructure)}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.json,.md,.txt"
                    disabled={subscriptionStatus?.remainingReviews === 0}
                  />
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFolderChange}
                    className="hidden"
                    // @ts-ignore - These attributes aren't in the standard HTML attributes
                    webkitdirectory=""
                    directory=""
                    disabled={subscriptionStatus?.remainingReviews === 0}
                  />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {subscriptionStatus?.remainingReviews === 0 ? (
                      <Button 
                        className="col-span-2 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        onClick={() => router.push('/pricing')}
                      >
                        <Crown className="h-4 w-4" />
                        Subscribe to Plan
                      </Button>
                    ) : (
                      <>
                        <Button 
                          className="gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          Upload Files
                        </Button>
                        <Button
                          className="gap-2"
                          variant="outline"
                          onClick={() => folderInputRef.current?.click()}
                        >
                          <FileCode className="h-4 w-4" />
                          Upload Folder
                        </Button>
                      </>
                    )}
                  </div>
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

                      <ReviewResult />
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
            <ModelSelection />
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
                <ReviewResult />
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

        <FullScreenReview />
      </div>
    </ProtectedRoute>
  )
} 