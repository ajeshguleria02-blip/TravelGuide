"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, password });
      
      // Since it's a register call, check if the token is provided or we just redirect to login
      // Usually register might also return a token to auto-login
      if (response.data.success && response.data.token) {
        Cookies.set("token", response.data.token, { expires: 7 });
        router.push("/");
      } else if (response.data.success) {
        // If no token but success, redirect to login
        router.push("/log-in");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border/50 shadow-xl shadow-primary/5">
        <form onSubmit={handleSignUp}>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create an account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details below to create your account and start planning your next trip.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-sm font-medium text-destructive text-center">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                required 
                className="transition-all duration-300 focus:ring-primary" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                className="transition-all duration-300 focus:ring-primary" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="transition-all duration-300 focus:ring-primary" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading} className="w-full text-md py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/log-in" className="font-semibold text-primary hover:underline transition-all">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
