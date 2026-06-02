"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("https://travel-ozju.vercel.app/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.data.user);
        } else {
          setError(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 animate-pulse border-border/50 bg-muted/20">
        <CardHeader className="flex flex-col items-center">
          <div className="w-24 h-24 bg-muted rounded-full mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 border-destructive">
        <CardContent className="pt-6 text-destructive text-center">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <Card className="w-full max-w-md mx-auto mt-8 bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="text-center pb-6">
        <div className="w-24 h-24 bg-linear-to-tr from-primary/20 to-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center text-primary text-4xl font-extrabold uppercase shadow-inner border border-primary/10">
          {profile.name?.[0] || "?"}
        </div>
        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
          {profile.name}
        </CardTitle>
        <p className="text-muted-foreground mt-1 font-medium">{profile.email}</p>
        <div className="mt-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          Traveler Profile Active
        </div>
      </CardHeader>
    </Card>
  );
}
