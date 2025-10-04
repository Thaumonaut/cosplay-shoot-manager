'use client'

import { Camera, Calendar, Users, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LandingPage() {
  const features = [
    {
      icon: Camera,
      title: "Photo Shoot Planning",
      description: "Organize your cosplay shoots with detailed planning tools, location scouting, and equipment management."
    },
    {
      icon: Calendar,
      title: "Schedule Management", 
      description: "Keep track of shoot dates, photographer availability, and venue bookings in one unified calendar."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite team members, assign roles, and coordinate with photographers, models, and crew members."
    },
    {
      icon: CheckCircle,
      title: "Project Tracking",
      description: "Track your shoots from initial concept to final photos with customizable status workflows."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Cosplay Photographer",
      content: "CosPlans has streamlined my entire workflow. I can now manage multiple shoots without losing track of details.",
      avatar: "SC"
    },
    {
      name: "Alex Rivera",
      role: "Professional Cosplayer",
      content: "The team collaboration features are incredible. Everyone stays on the same page throughout the project.",
      avatar: "AR"
    },
    {
      name: "Maya Patel",
      role: "Convention Organizer", 
      content: "Perfect for managing large-scale shoots at conventions. The planning tools are comprehensive yet easy to use.",
      avatar: "MP"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold">CosPlans</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Plan Perfect{" "}
                <span className="text-primary">Cosplay Shoots</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The ultimate platform for cosplay photographers and creators to organize, 
                collaborate, and execute stunning photo shoots with professional-grade planning tools.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Start Planning <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>

            <div className="pt-8">
              <div className="relative rounded-lg border bg-muted/50 p-2">
                <div className="aspect-video rounded bg-background/80 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Sparkles className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-muted-foreground">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything You Need for Professional Shoots
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for the cosplay photography community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover-elevate">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Trusted by Creators Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what the cosplay community is saying about CosPlans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-muted-foreground italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Elevate Your Cosplay Photography?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of creators who trust CosPlans to bring their cosplay visions to life
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Your First Shoot <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <Camera className="h-3 w-3" />
              </div>
              <span className="font-semibold">CosPlans</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 CosPlans. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}