"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { authApi } from "@/lib/auth"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { user, checkAuth } = useAuth()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      })
    }
  }, [user])
  
  // Make sure we're mounted to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleProfileSave = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        })
        return
      }
      
      // Determine what fields to update
      const updateData = {
        firstName: profileForm.firstName !== user?.firstName ? profileForm.firstName : undefined,
        lastName: profileForm.lastName !== user?.lastName ? profileForm.lastName : undefined,
        email: profileForm.email !== user?.email ? profileForm.email : undefined,
      }
      
      // Only make API call if there are changes
      if (Object.values(updateData).some(val => val !== undefined)) {
        const response = await authApi.updateProfile(token, updateData)
        
        if (response.message === "Profile updated successfully") {
          // Update the user context with new data
          await checkAuth()
          
          toast({
            title: "Success",
            description: "Your profile has been updated",
          })
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update profile",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "No changes",
          description: "No changes were made to your profile",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePasswordSave = async () => {
    setIsLoading(true)
    
    try {
      // Validate password match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "New password and confirmation must match",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to update your password",
          variant: "destructive",
        })
        return
      }
      
      const response = await authApi.updatePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      
      if (response.message === "Password updated successfully") {
        toast({
          title: "Success",
          description: "Your password has been updated",
        })
        
        // Reset password form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password update error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating your password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeSave = () => {
    // Theme is already saved by setTheme, just show toast
    toast({
      title: "Success",
      description: "Theme settings saved successfully",
    })
  }

  const toggleBillingCycle = (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle)
  }
  
  // Calculate price based on billing cycle
  const getBillingInfo = () => {
    if (billingCycle === "monthly") {
      return {
        price: "₹2,499",
        period: "/month",
        nextBillingDate: "June 1, 2023"
      }
    } else {
      return {
        price: "₹25,489",
        period: "/year",
        nextBillingDate: "May 1, 2024",
        savings: "Save 15%"
      }
    }
  }

  const billingInfo = getBillingInfo()

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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Change avatar
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                        Remove
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input 
                        id="first-name" 
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input 
                        id="last-name" 
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (user) {
                        setProfileForm({
                          firstName: user.firstName || "",
                          lastName: user.lastName || "",
                          email: user.email || "",
                        })
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleProfileSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordSave} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update password"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the appearance of the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mounted && (
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <RadioGroup 
                      value={theme} 
                      onValueChange={setTheme} 
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <Label className="flex flex-col items-center gap-2 rounded-md border border-primary p-4 [&:has([data-state=checked])]:bg-primary/5">
                          <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                          <div className="rounded-md bg-zinc-900 p-2">
                            <div className="space-y-2 rounded-sm bg-zinc-800 p-2 shadow-sm">
                              <div className="h-2 w-10 rounded-lg bg-zinc-700" />
                              <div className="h-2 w-8 rounded-lg bg-zinc-700" />
                            </div>
                          </div>
                          <span>Dark</span>
                        </Label>
                      </div>
                      <div>
                        <Label className="flex flex-col items-center gap-2 rounded-md border p-4 [&:has([data-state=checked])]:bg-primary/5">
                          <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                          <div className="rounded-md bg-white p-2">
                            <div className="space-y-2 rounded-sm bg-gray-100 p-2 shadow-sm">
                              <div className="h-2 w-10 rounded-lg bg-gray-200" />
                              <div className="h-2 w-8 rounded-lg bg-gray-200" />
                            </div>
                          </div>
                          <span>Light</span>
                        </Label>
                      </div>
                      <div>
                        <Label className="flex flex-col items-center gap-2 rounded-md border p-4 [&:has([data-state=checked])]:bg-primary/5">
                          <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                          <div className="rounded-md bg-zinc-900 p-2">
                            <div className="space-y-2 rounded-sm bg-zinc-800 p-2 shadow-sm">
                              <div className="h-2 w-10 rounded-lg bg-zinc-700" />
                              <div className="h-2 w-8 rounded-lg bg-zinc-700" />
                            </div>
                          </div>
                          <span>System</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <Separator />

                <Separator />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setTheme("dark")}
                >
                  Reset to defaults
                </Button>
                <Button onClick={handleThemeSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Professional Plan</div>
                      <div className="text-sm text-muted-foreground">{billingInfo.price}{billingInfo.period}</div>
                      {billingInfo.savings && <div className="text-sm text-primary">{billingInfo.savings}</div>}
                    </div>
                    <Button variant="outline" size="sm">
                      Change plan
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="mb-4">
                    <Label className="mb-2 block">Billing cycle</Label>
                    <div className="inline-flex rounded-md" role="group">
                      <Button 
                        variant={billingCycle === "monthly" ? "default" : "outline"} 
                        size="sm" 
                        className="rounded-r-none"
                        onClick={() => toggleBillingCycle("monthly")}
                      >
                        Monthly
                      </Button>
                      <Button 
                        variant={billingCycle === "yearly" ? "default" : "outline"} 
                        size="sm" 
                        className="rounded-l-none"
                        onClick={() => toggleBillingCycle("yearly")}
                      >
                        Yearly
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Next billing date</span>
                      <span className="font-medium">{billingInfo.nextBillingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment method</span>
                      <span className="font-medium">Visa ending in 4242</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Billing Information</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="billing-name">Name</Label>
                      <Input id="billing-name" defaultValue="John Doe" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing-email">Email</Label>
                      <Input id="billing-email" type="email" defaultValue="john.doe@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing-address">Address</Label>
                      <Input id="billing-address" defaultValue="123 Main St" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing-city">City</Label>
                      <Input id="billing-city" defaultValue="Mumbai" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing-state">State</Label>
                      <Input id="billing-state" defaultValue="Maharashtra" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing-zip">ZIP / Postal Code</Label>
                      <Input id="billing-zip" defaultValue="400001" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel subscription</Button>
                <Button disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
