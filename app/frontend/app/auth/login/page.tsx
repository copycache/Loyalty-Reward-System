"use client";

// Icon
import { Eye, EyeOff, User, Lock } from "lucide-react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

export default function MemberLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email/username and password.");
      return;
    }

    if (email === password) {
      toast.error("Email/Username and password cannot be the same.");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.type === "admin") {
        router.push("/admin/dashboard");
      } else if (user.type === "cashier") {
        if (user.status === "Active") {
          router.push("/cashier/dashboard");
        } else {
          useAuthStore.getState().clear();
          toast.error("Your account is either Pending or Blocked.");
        }
      } else if (user.type === "stockist") {
        router.push("/cashier/dashboard");
      } else {
        router.push("/member/dashboard");
      }
    } catch (err: any) {
      console.log("login error:", err);
      toast.error(err?.message || "Invalid email or password.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[url(/Landing-Page/client-resources/bgh-001.png)]">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            <div className="mb-2 flex flex-col items-center gap-3">
              <Link href="/">
                <img
                  src="/Landing-Page/client-resources/logo/client-logo.png"
                  alt="iQON ELITE"
                  className="max-w-[250px] h-auto mx-auto"
                />
              </Link>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-zinc-900">
                Log in to your Account
              </span>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email / Username</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <User />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Lock />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </Field>
            </FieldGroup>

            <Button
              variant="default"
              type="submit"
              disabled={loading}
              className="w-full mt-5"
            >
              {!loading ? (
                <>Log In</>
              ) : (
                <>
                  <Spinner data-icon="inline-start" /> Please wait
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div className="w-full flex flex-col items-center space-y-4">
            <p className="text-center text-zinc-500">
              Don&apos;t have an account?{" "}
              <Button variant="link" className="p-0">
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </p>

            <p className="max-w-md text-center text-xs text-zinc-400">
              By logging in, you agree to our{" "}
              <Link href="/terms" className="underline text-primary hover:text-primary/90">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline text-primary hover:text-primary/90">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
