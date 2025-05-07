"use client"

import { useState, useRef, useMemo } from "react"
import { ArrowLeft, ArrowRight, Code, FileCode, Upload, X, Folder, ChevronRight, ChevronDown, Sparkles } from "lucide-react"
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
// @ts-ignore - ReactMarkdown doesn't have TypeScript declarations
import ReactMarkdown from "react-markdown"

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

export default function NewReviewPage() {
  const { toast } = useToast()
  const [files, setFiles] = useState<CodeFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pastedCode, setPastedCode] = useState("")
  const [reviewModel, setReviewModel] = useState<ReviewModel>("llm")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Add state for expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

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

  // Function to call the review API
  const callReviewAPI = async (code: string, fileName?: string) => {
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  // Component for model selection
  const ModelSelection = () => (
    <div className="rounded-lg border p-4 mb-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-medium">Powered by Gemini 1.5 Flash</span>
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
                  />
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFolderChange}
                    className="hidden"
                    // @ts-ignore - These attributes aren't in the standard HTML attributes
                    webkitdirectory=""
                    directory=""
                  />
                  <div className="grid grid-cols-2 gap-2 w-full">
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

                      <div className="rounded-lg border p-4">
                        <ScrollArea className="h-[400px]">
                          {reviewResult ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{reviewResult}</ReactMarkdown>
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
                <div className="rounded-lg border p-4">
                  <ScrollArea className="h-[400px]">
                    {reviewResult ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{reviewResult}</ReactMarkdown>
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