import Link from "next/link";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              <span className="font-bold font-mono text-xl">PixorAI</span>
            </div>

            <p className="mt-4 max-w-sm text-muted-foreground">
              Transform your photos with the best AI Models. Create
              stunning visuals with just a few clicks.
            </p>

            <div className="mt-6 flex gap-4">
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div className="space-y-4">
              <p className="font-medium">Company</p>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/aboutus"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About us
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <p className="font-medium">Help</p>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/refundPolicy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                 	Refund
                </Link>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Shipping and Privacy policy
                </Link>
                <Link
                  href="/termsOfService"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} PhotoAI. All rights reserved.
            </p>

            <div className="flex gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/termsOfService"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
