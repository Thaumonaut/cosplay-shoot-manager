import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Camera, Users, Calendar, MapPin, Palette, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import HeroImage from "@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png";
import CyberpunkImage from "@assets/generated_images/Cyberpunk_cosplay_shoot_reference_34e2553e.png";
import ForestImage from "@assets/generated_images/Forest_cosplay_shoot_reference_c64c29f5.png";
import StudioImage from "@assets/generated_images/Studio_cosplay_shoot_reference_a9b46c37.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <Camera className="h-8 w-8 text-blue-500" />,
      title: "Photo Shoot Management",
      description: "Plan and organize your cosplay photo shoots with detailed scheduling and resource tracking."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "Team Collaboration",
      description: "Invite photographers, cosplayers, and crew members to collaborate on shoots together."
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Schedule Coordination",
      description: "Keep everyone on the same page with integrated calendar management and Google Calendar sync."
    },
    {
      icon: <MapPin className="h-8 w-8 text-red-500" />,
      title: "Location Scouting",
      description: "Track shooting locations with Google Maps integration and location notes."
    },
    {
      icon: <Palette className="h-8 w-8 text-orange-500" />,
      title: "Costume & Props Tracking",
      description: "Manage costume progress, props inventory, and equipment checklists."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-teal-500" />,
      title: "Progress Monitoring",
      description: "Track shoot status from planning to completion with detailed progress indicators."
    }
  ];

  const benefits = [
    "Streamline your cosplay photo shoot workflow",
    "Never forget essential props or equipment again",
    "Coordinate complex multi-person shoots effortlessly",
    "Keep all your shoot information in one place",
    "Export professional shoot plans to Google Docs",
    "Integrate with Google Calendar for seamless scheduling"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Cosplay Shoot Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={() => setLocation("/auth?tab=signin")} variant="ghost">
            Sign In
          </Button>
          <Button onClick={() => setLocation("/auth?tab=signup")} variant="default">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Organize Your
                  <span className="text-primary block">Cosplay Shoots</span>
                  Like a Pro
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  The complete platform for planning, managing, and executing amazing cosplay photo shoots with your team.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/auth?tab=signup")}
                  className="text-lg px-8 py-6"
                >
                  Create Free Account
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setLocation("/auth?tab=signin")}
                  className="text-lg px-8 py-6"
                >
                  Sign In
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={HeroImage} 
                  alt="Cosplay photo shoot planning" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need for Perfect Shoots</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From initial planning to final execution, our platform covers every aspect of cosplay photography management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Why Cosplayers Love Our Platform</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of cosplayers who have streamlined their photo shoot process
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-lg text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Perfect for Every Type of Shoot</h2>
            <p className="text-xl text-muted-foreground">
              From studio sessions to outdoor adventures, organize any cosplay photography project
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={StudioImage} 
                  alt="Studio cosplay shoot" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Studio Sessions</h3>
                <p className="text-muted-foreground">Professional indoor shoots with controlled lighting and equipment</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={ForestImage} 
                  alt="Outdoor cosplay shoot" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Outdoor Adventures</h3>
                <p className="text-muted-foreground">Natural locations and scenic backdrops for fantasy and adventure cosplays</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={CyberpunkImage} 
                  alt="Urban cosplay shoot" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Urban Environments</h3>
                <p className="text-muted-foreground">City settings perfect for modern, cyberpunk, and contemporary characters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Level Up Your Cosplay Photography?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our community and start organizing professional-quality cosplay photo shoots today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/auth?tab=signup")}
              className="text-lg px-8 py-6"
            >
              Create Your Account
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation("/auth?tab=signup&invite=true")}
              className="text-lg px-8 py-6"
            >
              Join with Invite Code
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Cosplay Shoot Manager</span>
          </div>
          <p className="text-muted-foreground">
            Professional cosplay photo shoot management made simple.
          </p>
        </div>
      </footer>
    </div>
  );
}