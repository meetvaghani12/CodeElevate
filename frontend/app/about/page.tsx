"use client"

import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Twitter, Github } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
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
              <span>AnveshaCode</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About Us</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              At AnveshaCode, we're passionate about building innovative solutions that help businesses thrive in the digital landscape.
            </p>
          </div>
                    
          <Separator className="my-16" />
          
          <div className="flex justify-center mb-16">
            <Card className="w-full max-w-3xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="relative h-80 md:h-auto">
                  <Image 
                    src="/images/meet.jpeg" 
                    alt="John Smith, CEO" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-xl font-bold">Meet Vaghani</h3>
                  <p className="text-primary font-medium">Founder & CEO</p>
                  
                  <p className="mt-4 text-muted-foreground">
                  Meet has been instrumental in elevating AnveshaCode from its humble beginnings to a position of industry prominence. 
                  His strategic foresight, relentless pursuit of excellence, and visionary leadership remain the cornerstone of our continued success.
                  </p>
                  <div className="mt-6 flex gap-3">
  <Link href="https://www.linkedin.com/in/meet-vaghani-422a78224" target="_blank" rel="noopener noreferrer">
    <Button variant="outline" size="icon">
      <Linkedin className="h-4 w-4" />
    </Button>
  </Link>
  <Link href="https://twitter.com/Meetvag78485818" target="_blank" rel="noopener noreferrer">
    <Button variant="outline" size="icon">
      <Twitter className="h-4 w-4" />
    </Button>
  </Link>
  <Link href="https://github.com/meetvaghani12" target="_blank" rel="noopener noreferrer">
    <Button variant="outline" size="icon">
      <Github className="h-4 w-4" />
    </Button>
  </Link>
</div>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">meetvaghani1239@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">+91 95108 80097</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Our Company Culture</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              At AnveshaCode, we believe that a positive and inclusive culture is essential for innovation and success. 
              We foster an environment where creativity thrives, collaboration is encouraged, and every team member feels valued and respected.
            </p>
            
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="m8 14 2 2 6-6"/></svg>
                  </div>
                  <h3 className="font-medium text-lg">Innovation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We encourage creative thinking and embrace new technologies to stay ahead of the curve.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="font-medium text-lg">Collaboration</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We believe that the best results come from teamwork and diverse perspectives.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </div>
                  <h3 className="font-medium text-lg">Excellence</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We are committed to delivering high-quality solutions that exceed expectations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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
            <span>AnveshaCode</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 AnveshaCode. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}