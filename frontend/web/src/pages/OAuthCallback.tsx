import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { decodeJwtPayload } from "@/lib/jwt";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuth();

  useEffect(() => {
    const run = async () => {
      try {
        const hash = window.location.hash || "";
        const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
        const token = params.get("token");

        if (!token) {
          toast({
            title: "Login failed",
            description: "Missing token from OAuth provider.",
            variant: "destructive",
          });
          navigate("/login", { replace: true });
          return;
        }

        // Store token immediately (no sensitive user data in localStorage).
        // Decode role ONLY for UI decisions.
        const payload = decodeJwtPayload(token);
        const fallbackUser = payload
          ? {
              email: "",
              name: "User",
              role: (payload.role as string) || "client",
              id: (payload.userId as string) || (payload.id as string),
              _id: (payload.userId as string) || (payload.id as string),
            }
          : undefined;

        await auth.setSession(token, fallbackUser);

        // Clean up URL and move into the app right away.
        window.history.replaceState({}, document.title, "/dashboard");
        toast({
          title: "Login successful",
          description: "Signed in with OAuth.",
        });
        navigate("/dashboard", { replace: true });

        // Hydrate full user details in the background.
        try {
          const me = await api.get("/auth/me");
          const nextUser = me.data?.data?.user;
          if (nextUser) {
            await auth.setSession(token, nextUser);
          }
        } catch {
          // Keep the existing session; user can still use the app.
        }
      } catch (err: any) {
        localStorage.removeItem("securityToken");
        localStorage.removeItem("securityAuth");
        localStorage.removeItem("securityUser");

        toast({
          title: "Login failed",
          description: err?.response?.data?.message || err?.message || "OAuth login failed",
          variant: "destructive",
        });

        navigate("/login", { replace: true });
      }
    };

    run();
  }, [auth, navigate, toast]);

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-2">
        <div className="text-lg font-medium">Signing you in…</div>
        <div className="text-sm text-muted-foreground">Completing OAuth login.</div>
      </div>
    </div>
  );
}
