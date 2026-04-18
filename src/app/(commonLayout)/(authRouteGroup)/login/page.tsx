/* eslint-disable react/no-unescaped-entities */
import LoginForm from "@/components/modules/Auth/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Branding Placeholder */}
        <div className="flex flex-col items-center text-center">
          {/* <div className="h-12 w-12 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
            <span className="text-zinc-50 dark:text-zinc-900 font-bold text-xl">K</span>
          </div> */}
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to KrewOS
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your construction projects with ease.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create a Workspace
            </Link>
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
