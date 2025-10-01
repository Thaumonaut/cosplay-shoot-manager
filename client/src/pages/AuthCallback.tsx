import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase will automatically detect and handle the session from the URL
        // since we have detectSessionInUrl: true in the config
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setLocation("/auth");
          return;
        }

        if (session) {
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

              setLocation("/");
            } else {
              setLocation("/auth");
            }
          } else {
            setLocation("/auth");
          }
        } else {
          setLocation("/auth");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        setLocation("/auth");
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
