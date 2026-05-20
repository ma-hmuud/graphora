"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Signout() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        try {
          await authClient.signOut();
        } finally {
          router.push("/login");
        }
      }}
    >
      sign out
    </button>
  );
}
