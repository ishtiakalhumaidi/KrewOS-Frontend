import Link from "next/link";
import { HardHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center">
                <HardHat className="text-zinc-50 dark:text-zinc-900 h-5 w-5" />
              </div>
              <span className="text-xl font-bold">KrewOS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The ultimate operating system for modern construction teams. Manage projects, safety, and payroll in one place.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-blue-600">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} KrewOS Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}