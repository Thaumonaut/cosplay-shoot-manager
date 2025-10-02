import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsProcessing(true);
        
        try {
          // Send session to backend to set cookies
          const res = await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            }),
            credentials: "include",
          });

          if (res.ok) {
            // Refresh the auth context to update user state
            await refreshUser();
            
            // Check if user has a profile
            const profileRes = await fetch("/api/user/profile", {
              credentials: "include",
            });

            if (profileRes.ok) {
              // Profile exists, go to dashboard
              setLocation("/");
            } else if (profileRes.status === 404) {
              // No profile, create one from auth metadata
              const user = session.user;
              const formData = new FormData();
              
              // Try to extract name from user metadata
              const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
              const nameParts = fullName.split(" ");
              const firstName = nameParts[0] || user.email?.split("@")[0] || "User";
              const lastName = nameParts.slice(1).join(" ") || "";

              formData.append("firstName", firstName);
              formData.append("lastName", lastName || "User");

              await fetch("/api/user/profile", {
                method: "POST",
                body: formData,
                credentials: "include",
              });

              // Navigate to dashboard
              setLocation("/");
            } else {
              setLocation("/auth");
            }
          } else {
            setLocation("/auth");
          }
        } catch (error) {
          console.error("Error processing session:", error);
          setLocation("/auth");
        }
      } else if (event === 'SIGNED_OUT') {
        setLocation("/auth");
      }
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [setLocation, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
