/* eslint-disable react/no-unescaped-entities */
import RegisterForm from "@/components/modules/Auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen sm:mt-6 mt-10 flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-200">
      <div className="w-full max-w-130 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Create your Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2.5 text-sm sm:text-base font-medium">
            Enter your company details below to get started.
          </p>
        </div>

        {/* The Soft, Floating Card */}
        <div className="bg-white dark:bg-zinc-900/80 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/80 dark:border-zinc-800 backdrop-blur-xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sign Up
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Set up your administrator account.
            </p>
          </div>

          {/* Renders the internal form component */}
          <RegisterForm />
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pb-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
