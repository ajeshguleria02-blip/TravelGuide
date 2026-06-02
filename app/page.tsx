"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Profile from "@/components/Profile";
import Itinerary from "@/components/Itinerary";
import ItineraryList from "@/components/ItineraryList";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!Cookies.get("token"));
    };

    checkAuth();
    // Listen for the custom event fired by the Navbar on logout
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center sm:px-20 py-12">
        <div className="max-w-4xl w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-foreground">
              Discover Your Next <span className="text-primary">Adventure</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
              Experience the world in ultimate comfort and style. Plan, book, and enjoy seamless travel experiences crafted just for you.
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto text-lg rounded-full px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300" })}
              >
                Get Started
              </Link>
              <Link
                href="/log-in"
                className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto text-lg rounded-full px-8 py-6 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300" })}
              >
                Log In
              </Link>
            </div>
          ) : (
            <div className="space-y-6 pt-8 w-full text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Profile />
                <Itinerary onCreated={() => setRefreshKey((k) => k + 1)} />
              </div>
              <ItineraryList refreshKey={refreshKey} />
            </div>
          )}
        </div>
      </main>

      <footer className="w-full py-6 text-center text-sm text-muted-foreground mt-auto">
        © {new Date().getFullYear()} Travel. All rights reserved.
      </footer>
    </div>
  );
}
