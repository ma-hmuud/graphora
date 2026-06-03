import { Button } from "@graphora/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@graphora/ui/components/card";
import { Input } from "@graphora/ui/components/input";
import { Label } from "@graphora/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const callbackURL = "/";

  const signUpMutation = useMutation({
    mutationFn: async (value: {
      email: string;
      password: string;
      name: string;
    }) => {
      const result = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.name,
        callbackURL,
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Sign up successful");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });

  const googleMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        requestSignUp: true,
        disableRedirect: true,
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      toast.success("Google sign up started");
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await signUpMutation.mutateAsync({
        email: value.email,
        password: value.password,
        name: value.name,
      });
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card className="w-full max-w-md border border-foreground/10 bg-background/70 shadow-[0_30px_80px_-60px_rgba(249,115,22,0.8)] backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Build your workspace with email or use Google to start faster.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2 border-foreground/20 bg-transparent text-foreground hover:bg-foreground/5"
          onClick={() => googleMutation.mutate()}
          disabled={googleMutation.isPending}
        >
          <GoogleIcon />
          {googleMutation.isPending ? "Connecting..." : "Continue with Google"}
        </Button>

        <div className="relative">
          <div className="h-px w-full bg-foreground/10" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Or
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !canSubmit || isSubmitting || signUpMutation.isPending
                }
              >
                {isSubmitting || signUpMutation.isPending
                  ? "Creating account..."
                  : "Sign Up"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>

      <div className="flex items-center justify-between border-t border-foreground/10 px-4 py-3 text-xs text-muted-foreground">
        <span>Already have an account?</span>
        <Button variant="link" onClick={onSwitchToSignIn} className="p-0">
          Sign in
        </Button>
      </div>
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
    possible.error?.message || possible.error?.statusText || "Sign up failed."
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none">
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
