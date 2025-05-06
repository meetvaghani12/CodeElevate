"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"

export default function Home() {
  const { user, logout } = useAuth()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Add effect to log auth state
  useEffect(() => {
    console.log('Home Page: Current auth state:', { user })
  }, [user])

  // Make sure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    console.log('Home Page: Logout clicked')
    await logout()
  }

  const toggleBillingCycle = (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
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
            <span>CodeReview</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Professional Code Reviews at Your Fingertips
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Upload your code, get expert reviews, and improve your codebase with our AI-powered platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg" className="gap-1.5">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/new-review">
                      <Button size="lg" variant="outline" className="gap-1.5">
                        New Review
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="gap-1.5">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="#pricing">
                      <Button size="lg" variant="outline">
                        View Pricing
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Everything you need to improve your code quality and development workflow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="m10 13-2 2 2 2" />
                    <path d="m14 17 2-2-2-2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Code Upload</h3>
                <p className="text-center text-muted-foreground">
                  Upload your entire codebase or specific files for review.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z" />
                    <path d="M6 11v-4h12v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI-Powered Reviews</h3>
                <p className="text-center text-muted-foreground">
                  Get instant feedback and suggestions to improve your code.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Analytics Dashboard</h3>
                <p className="text-center text-muted-foreground">
                  Track your code quality metrics and improvement over time.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Choose the plan that's right for you and your team.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border shadow-sm">
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <div className="mt-4 text-center">
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
                    <div className="mt-2">
                      {billingCycle === "monthly" ? (
                        <>
                          <span className="text-4xl font-bold">₹999</span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">₹10,189</span>
                          <span className="text-muted-foreground">/year</span>
                          <div className="text-sm text-primary">Save 15%</div>
                        </>
                      )}
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Up to 5 projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>50 file reviews per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Basic analytics</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col p-6 pt-0">
                  <Button>Get Started</Button>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border shadow-sm bg-primary/5 border-primary/20">
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Professional</h3>
                  <div className="mt-4 text-center">
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
                    <div className="mt-2">
                      {billingCycle === "monthly" ? (
                        <>
                          <span className="text-4xl font-bold">₹2,499</span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">₹25,489</span>
                          <span className="text-muted-foreground">/year</span>
                          <div className="text-sm text-primary">Save 15%</div>
                        </>
                      )}
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Up to 15 projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>200 file reviews per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Team collaboration</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col p-6 pt-0">
                  <Button>Get Started</Button>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border shadow-sm">
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <div className="mt-4 text-center">
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
                    <div className="mt-2">
                      {billingCycle === "monthly" ? (
                        <>
                          <span className="text-4xl font-bold">₹7,999</span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">₹81,589</span>
                          <span className="text-muted-foreground">/year</span>
                          <div className="text-sm text-primary">Save 15%</div>
                        </>
                      )}
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Unlimited projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Unlimited file reviews</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Custom analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Custom integrations</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col p-6 pt-0">
                  <Button>Contact Sales</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
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
            <span>CodeReview</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 CodeReview. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
