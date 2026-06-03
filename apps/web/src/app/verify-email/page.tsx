"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@graphora/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@graphora/ui/components/card";
import { toast } from "sonner";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function VerifyEmailPage() {
  const { data: session, isPending } = authClient.useSession();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Initialize countdown from localStorage on mount
  useEffect(() => {
    const storedTimestamp = localStorage.getItem("resend_cooldown_end");
    if (storedTimestamp) {
      const endTime = parseInt(storedTimestamp, 10);
      const now = Date.now();

      if (endTime > now) {
        // Calculate remaining seconds
        setCountdown(Math.ceil((endTime - now) / 1000));
      } else {
        // Clear expired timer
        localStorage.removeItem("resend_cooldown_end");
      }
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      localStorage.removeItem("resend_cooldown_end");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    } else if (!isPending && session?.user && session.user.emailVerified) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            Establishing Session...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  const handleResend = async () => {
    if (!session?.user.email || countdown > 0) return;

    setIsResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: window.location.origin + "/",
      });

      if (error) {
        throw error;
      }

      toast.success("Verification email sent!");

      // Set 2 minutes cooldown and store the target end time in localStorage
      const durationSeconds = 120;
      const endTime = Date.now() + durationSeconds * 1000;
      localStorage.setItem("resend_cooldown_end", endTime.toString());
      setCountdown(durationSeconds);
    } catch (error) {
      toast.error(
        "Failed to resend verification email. Please try again later.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleDifferentEmail = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Decorative Elements */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, gray 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute top-1/2 left-1/2 -z-10 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <Link
        href="/"
        className="absolute left-8 top-8 z-10 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Card className="relative z-10 w-full max-w-lg border-foreground/10 bg-background/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-primary/30">
        <div className="absolute -top-px left-8 right-8 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

        <CardHeader className="pt-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Mail className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Check your inbox
          </CardTitle>
          <CardDescription className="mx-auto mt-4 max-w-panel-width text-base leading-relaxed text-muted-foreground">
            We've sent a verification link to <br />
            <span className="font-semibold text-foreground">
              {session.user.email}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pb-10 pt-4">
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 text-sm text-primary/80">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Click the link in the email to verify your account and gain full
                access to the Graphora Engine.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="h-12 w-full text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleResend}
              disabled={isResending || countdown > 0}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending link...
                </>
              ) : countdown > 0 ? (
                `Resend available in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")}`
              ) : (
                "Resend verification email"
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full border-foreground/10 bg-transparent text-base hover:bg-foreground/5"
              onClick={handleDifferentEmail}
            >
              Use a different email
            </Button>
          </div>

          <div className="flex flex-col items-center gap-6 pt-2">
            <div className="h-px w-24 bg-foreground/10" />

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-mono uppercase tracking-widest text-muted-foreground/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Secure Auth
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Graphora Engine v1.0
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-12 text-center">
        <p className="text-xs text-muted-foreground/40">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </footer>
    </div>
  );
}
