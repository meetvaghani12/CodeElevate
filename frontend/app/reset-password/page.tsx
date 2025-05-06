"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { authApi } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenError, setTokenError] = useState(false)
  
  // Extract token from URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setTokenError(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      })
      return
    }
    
    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      toast({
        title: "Password too weak",
        description: "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await authApi.resetPassword(token, password)
      
      if (response.message === "Password reset successful") {
        setIsSuccess(true)
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset. You can now log in with your new password.",
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/signin")
        }, 3000)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reset password",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Link href="/signin" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Button>
      </Link>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? "Your password has been reset successfully"
              : tokenError
                ? "Invalid or expired token"
                : "Create a new password for your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully.<br/>
                You will be redirected to the login page shortly.
              </p>
            </div>
          ) : tokenError ? (
            <div className="text-center py-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                The password reset token is invalid or has expired.<br/>
                Please request a new password reset link.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/forgot-password')}
              >
                Request New Reset Link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters and include uppercase, lowercase, number and special character.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/signin" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 