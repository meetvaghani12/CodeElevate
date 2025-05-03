"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Code2, History, Home, Menu, Moon, Settings, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
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
            <div className="mt-8">
              <SidebarNav
                items={[
                  {
                    title: "Dashboard",
                    href: "/dashboard",
                    icon: Home,
                  },
                  {
                    title: "New Review",
                    href: "/dashboard/new-review",
                    icon: Code2,
                  },
                  {
                    title: "Review History",
                    href: "/dashboard/history",
                    icon: History,
                  },
                  {
                    title: "Analytics",
                    href: "/dashboard/analytics",
                    icon: BarChart3,
                  },
                  {
                    title: "Settings",
                    href: "/dashboard/settings",
                    icon: Settings,
                  },
                ]}
                className="px-1"
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-bold md:hidden">
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
        <div className="flex-1 md:grow-0"></div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <div className="flex h-full flex-col gap-2 p-4">
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
            <div className="mt-8">
              <SidebarNav
                items={[
                  {
                    title: "Dashboard",
                    href: "/dashboard",
                    icon: Home,
                  },
                  {
                    title: "New Review",
                    href: "/dashboard/new-review",
                    icon: Code2,
                  },
                  {
                    title: "Review History",
                    href: "/dashboard/history",
                    icon: History,
                  },
                  {
                    title: "Analytics",
                    href: "/dashboard/analytics",
                    icon: BarChart3,
                  },
                  {
                    title: "Settings",
                    href: "/dashboard/settings",
                    icon: Settings,
                  },
                ]}
                className="px-1"
              />
            </div>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

function SidebarNav({ items, className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-2", className)} {...props}>
      {items.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/placeholder-user.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  )
}
