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

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";
import { tryCatch } from "@/lib/try-catch";

export default function SignInForm() {
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
      toast.error(getAuthErrorMessage(error));
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden border border-white/10 bg-black/40 p-2 shadow-[0_0_50px_-12px_rgba(56,189,248,0.3)] backdrop-blur-xl">
      <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl" />
      <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
      
      <CardHeader className="relative z-10 space-y-2 text-center pb-8 pt-6">
        <CardTitle className="bg-gradient-to-r from-sky-400 via-indigo-200 to-white bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Sign in to your account using Google to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 pb-6">
        <Button
          type="button"
          className="relative w-full justify-center gap-3 overflow-hidden border border-white/15 bg-white/5 py-6 text-base font-medium text-white transition-all duration-300 hover:border-sky-500/40 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] active:scale-[0.98]"
          onClick={() => googleMutation.mutate()}
          disabled={googleMutation.isPending}
        >
          <GoogleIcon />
          {googleMutation.isPending ? "Connecting..." : "Continue with Google"}
        </Button>
      </CardContent>
    </Card>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (!error) {
    return "Something went wrong.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  const possible = error as {
    error?: { message?: string; statusText?: string };
  };
  return (
    possible.error?.message || possible.error?.statusText || "Sign in failed."
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M22.5 12.3c0-.8-.07-1.37-.23-1.98H12v3.76h6.03c-.12.96-.77 2.4-2.22 3.37l-.02.13 3.24 2.46.22.02c2.02-1.83 3.25-4.52 3.25-7.76z"
        fill="#F4B400"
      />
      <path
        d="M12 23c2.93 0 5.39-.93 7.19-2.52l-3.44-2.61c-.92.63-2.15 1.08-3.75 1.08-2.87 0-5.31-1.83-6.18-4.36l-.13.01-3.37 2.56-.04.12C3.99 20.63 7.74 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.82 14.6A6.63 6.63 0 0 1 5.45 12c0-.9.16-1.77.36-2.6l-.01-.17-3.41-2.6-.11.05A11.06 11.06 0 0 0 1 12c0 1.75.42 3.4 1.18 4.86l3.64-2.26z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.05c1.98 0 3.32.84 4.08 1.53l2.98-2.86C17.38 2.2 14.92 1 12 1 7.74 1 3.99 3.37 2.28 6.74l3.52 2.68C6.69 6.88 9.13 5.05 12 5.05z"
        fill="#EA4335"
      />
    </svg>
  );
}

