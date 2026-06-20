"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Login from "@/components/shadcn-studio/blocks/login-page-01/login-page-01";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return <Login />;
}


