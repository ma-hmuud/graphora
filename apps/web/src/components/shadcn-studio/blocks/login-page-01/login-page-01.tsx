"use client";

import { Button } from "@graphora/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@graphora/ui/components/card";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";

import Logo from "@/components/shadcn-studio/logo";
import AuthBackgroundShape from "@/assets/svg/auth-background-shape";
import { authClient } from "@/lib/auth-client";
import { tryCatch } from "@/lib/try-catch";
import Loader from "@/components/loader";

const Login = () => {
  const { isPending } = authClient.useSession();
  const getCallbackURL = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/dashboard`;
    }
    return "/dashboard";
  };

  const googleMutation = useMutation({
    mutationFn: async () => {
      const { data: result, error: signInError } = await tryCatch(
        authClient.signIn.social({
          provider: "google",
          callbackURL: getCallbackURL(),
        }),
      );

      if (signInError) {
        throw signInError;
      }

      return result.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      toast.success("Google sign in started");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Sign in failed.");
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100">
      <div className="absolute select-none pointer-events-none opacity-40 dark:opacity-60">
        <AuthBackgroundShape />
      </div>

      <Card className="z-10 w-full gap-6 py-8 px-2 sm:max-w-md border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 shadow-sm dark:shadow-[0_0_50px_-12px_rgba(192,193,255,0.35)] backdrop-blur-xl rounded-2xl">
        <CardHeader className="gap-4 px-6 text-center flex flex-col items-center justify-center">
          <Logo className="gap-3" />

          <div className="space-y-1.5 mt-2">
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary-container to-[#6366F1] dark:from-[#c0c1ff] dark:via-primary-fixed dark:to-white bg-clip-text text-transparent">
              Access your knowledge maps
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-muted-foreground/80">
              Connect with Google to securely view and build your workspace
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-4 flex flex-col gap-4">
          <Button
            className="w-full justify-center gap-3 overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 py-6 text-sm font-medium text-slate-800 dark:text-white transition-all duration-300 hover:border-primary-container/40 dark:hover:border-[#c0c1ff]/40 hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(192,193,255,0.15)] active:scale-[0.98] cursor-pointer"
            disabled={googleMutation.isPending}
            onClick={() => googleMutation.mutate()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24"
              height="24"
              style={{ opacity: 1 }}
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
              />
              <path
                fill="#FF3D00"
                d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
              />
            </svg>
            {googleMutation.isPending
              ? "Connecting..."
              : "Continue with Google"}
          </Button>
          <Link
            href="/"
            className="text-sm text-center text-slate-500 dark:text-muted-foreground/80 hover:text-primary"
          >
            Go back to homepage
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
