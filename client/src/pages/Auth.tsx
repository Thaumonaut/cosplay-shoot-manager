import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle, SiApple } from "react-icons/si";
import { Mail } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithProvider, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      // Redirect will happen via useEffect when user state updates
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields with trimming
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    if (!trimmedFirstName || !trimmedLastName) {
      toast({
        title: "Missing information",
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, create the auth user
      const { error: authError } = await signUp(email, password);
      
      if (authError) {
        toast({
          title: "Error signing up",
          description: authError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Then, create the user profile with additional data
      const formData = new FormData();
      formData.append("firstName", trimmedFirstName);
      formData.append("lastName", trimmedLastName);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const trimmedInviteCode = inviteCode.trim();
      if (trimmedInviteCode) {
        formData.append("inviteCode", trimmedInviteCode);
      }

      const profileRes = await fetch("/api/user/profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!profileRes.ok) {
        const errorData = await profileRes.json();
        
        // If email confirmation is required, show appropriate message
        if (profileRes.status === 401) {
          toast({
            title: "Email Confirmation Required",
            description: "Please check your email to confirm your account before continuing.",
          });
        } else {
          throw new Error(errorData.error || "Failed to create profile");
        }
        setLoading(false);
        return;
      }

      toast({
        title: "Success!",
        description: "Your account has been created.",
      });
      
      // The user will be redirected via useEffect when user state updates
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure') => {
    const { error } = await signInWithProvider(provider);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">CosPlay Tracker</CardTitle>
          <CardDescription>
            Track and manage your cosplay photo shoots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-signin-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-signin-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-signin"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    data-testid="button-google-signin"
                  >
                    <SiGoogle className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={loading}
                    data-testid="button-apple-signin"
                  >
                    <SiApple className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('azure')}
                    disabled={loading}
                    data-testid="button-microsoft-signin"
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">MS</span>
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview} />
                      <AvatarFallback className="bg-muted">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover-elevate cursor-pointer flex items-center justify-center"
                      data-testid="label-avatar-upload"
                    >
                      <Upload className="h-4 w-4 text-primary-foreground" />
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        data-testid="input-avatar"
                      />
                    </Label>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-signup-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    data-testid="input-signup-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>

                {/* Team Invite Code */}
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Team Invite Code (Optional)</Label>
                  <Input
                    id="invite-code"
                    type="text"
                    placeholder="Enter code to join a team"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    data-testid="input-invite-code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to create your own team
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-signup"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    data-testid="button-google-signup"
                  >
                    <SiGoogle className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={loading}
                    data-testid="button-apple-signup"
                  >
                    <SiApple className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('azure')}
                    disabled={loading}
                    data-testid="button-microsoft-signup"
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">MS</span>
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
