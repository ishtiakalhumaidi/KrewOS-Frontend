/* eslint-disable react/no-unescaped-entities */
import LoginForm from "@/components/modules/Auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    // 👉 FIX 2: Removed bg-slate-50 dark:bg-zinc-950 from this line
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-200">
      <div className="w-full max-w-[520px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {" "}
            {/* Made text white for dark bg */}
            Welcome to KrewOS
          </h1>
          <p className="text-zinc-400 mt-2.5 text-sm sm:text-base font-medium">
            Manage your construction projects with ease.
          </p>
        </div>

        <div className="bg-white/90 dark:bg-zinc-900/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/80 dark:border-zinc-800/50 backdrop-blur-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sign In
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm font-medium ">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-500 hover:text-blue-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1"
          >
            Create a Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
