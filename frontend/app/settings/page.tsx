"use client"

import { useState } from "react"
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

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const handleSave = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
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
                      <AvatarFallback>JD</AvatarFallback>
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
                      <Input id="first-name" defaultValue="John" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" defaultValue="Doe" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" defaultValue="Acme Inc." />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSave} disabled={isLoading}>
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
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Update password</Button>
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
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup defaultValue="dark" className="grid grid-cols-3 gap-4">
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

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">Animations</Label>
                    <Switch id="animations" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-effects">Sound Effects</Label>
                    <Switch id="sound-effects" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="code-highlighting">Code Syntax Highlighting</Label>
                    <Switch id="code-highlighting" defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to defaults</Button>
                <Button onClick={handleSave} disabled={isLoading}>
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
                <Button onClick={handleSave} disabled={isLoading}>
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
