"use client";
import { authClient } from "@/lib/auth-client";
import Signout from "./signout";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) {
    return null; // Or a loader component
  }

  if (error || !session?.user) {
    return redirect("/login");
  }

  if (!session.user.emailVerified) {
    return redirect("/verify-email");
  }

  console.log("DASHBOARD");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <Signout />
    </div>
  );
}
