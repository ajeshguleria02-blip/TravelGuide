"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = Cookies.get("token");
        setIsLoggedIn(!!token);
    }, [pathname]);

    const handleLogout = () => {
        Cookies.remove("token");
        setIsLoggedIn(false);
        // Dispatch a custom event so other components (like Home page) can react immediately
        window.dispatchEvent(new Event("auth-change"));
        router.push("/log-in");
    };

    return (
        <div className="absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 z-50 flex justify-between items-start pointer-events-none">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group hover:scale-105 transition-all duration-300 pointer-events-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 22l10-5 10 5L12 2z" />
                        <path d="M12 2v15" />
                    </svg>
                </div>
                <span className="text-2xl font-black tracking-tighter text-foreground drop-shadow-sm">
                    Travel<span className="text-primary">.</span>
                </span>
            </Link>

            {/* Logout Button (Only on Home Page) */}
            <div className="pointer-events-auto">
                {pathname === "/" && isLoggedIn && (
                    <Button 
                      onClick={handleLogout} 
                      variant="outline" 
                      className="shadow-md bg-background/50 backdrop-blur-md hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                    >
                        Log Out
                    </Button>
                )}
            </div>
        </div>
    )
}

export default Navbar