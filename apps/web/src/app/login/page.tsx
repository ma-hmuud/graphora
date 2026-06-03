"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    } else if (session && !session.user.emailVerified) {
      router.push("/verify-email");
    }
  }, [session, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#13131b] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(19, 19, 27,0.25),transparent_62%)] blur-3xl" />
        <div className="absolute -bottom-48 right-10 h-120 w-120 rounded-full bg-[radial-gradient(circle_at_center,rgba(19, 19, 27,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_40%,rgba(255,255,255,0.04)_70%,rgba(255,255,255,0)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16 lg:px-10">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 border border-foreground/15 bg-background/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Graphora Access
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Sign in to build living knowledge maps.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Switch between email + password and Google OAuth with a single
              click. Your graphs, collaborators, and workspace stay in sync.
            </p>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            {showSignIn ? (
              <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
