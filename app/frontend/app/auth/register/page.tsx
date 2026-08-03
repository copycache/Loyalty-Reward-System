"use client";

// Icons
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Hash,
} from "lucide-react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

export default function MemberRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sponsor, setSponsor] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    if (refFromUrl) {
      setSponsor(refFromUrl);
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("slot_referral");
      if (saved) {
        setSponsor(saved);
      }
    }
  }, [searchParams]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const formData = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      username: username,
      email: email,
      contact: contact,
      password: password,
      password_confirmation: confirmPassword,
      code: code,
      pin: pin,
      slot_referral: sponsor,
    };

    try {
      await apiPost("/api/new_register", formData);
      toast.success(
        "Registration successful! Please check your email for verification.",
      );
      router.push("/auth/login");
    } catch (err: any) {
      console.log("register error:", err);

      if (err && err.errors) {
        for (const field in err.errors) {
          const messages = err.errors[field];
          for (let i = 0; i < messages.length; i++) {
            toast.error(messages[i]);
          }
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[url(/Landing-Page/client-resources/bgh-001.png)] bg-cover px-4 py-10">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <CardTitle>
            <div className="mb-2 flex flex-col items-center gap-3">
              <Link href="/">
                <img
                  src="/Landing-Page/client-resources/logo/client-logo.png"
                  alt="iQON ELITE"
                  className="max-w-[150px] h-auto mx-auto"
                />
              </Link>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="text-center">
              <span className="block text-2xl font-bold text-zinc-900">
                Registration Form
              </span>
              <span className="text-sm text-muted-foreground">
                Fill up the form carefully for registration
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left */}
              <div className="space-y-6">
                {/* Referral */}
                <FieldGroup>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Referral
                  </p>
                  <Field>
                    <FieldLabel htmlFor="sponsor">
                      Sponsor Username{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <User />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="sponsor"
                        placeholder="e.g. john123"
                        value={sponsor}
                        onChange={(e) => setSponsor(e.target.value)}
                        disabled={loading}
                      />
                    </InputGroup>
                  </Field>
                </FieldGroup>

                {/* Account information */}
                <FieldGroup>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Account Information
                  </p>

                  <Field>
                    <FieldLabel htmlFor="username">Username <span className="text-destructive">*</span></FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <User />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="username"
                        placeholder="Choose a username"
                        maxLength={15}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email <span className="text-destructive">*</span></FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Mail />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </InputGroup>
                  </Field>
                </FieldGroup>
              </div>

              {/* Right */}
              <div className="space-y-6">
                {/* Personal information */}
                <FieldGroup>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Personal Information
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="first_name">
                        First Name <span className="text-destructive">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="first_name"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </InputGroup>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="last_name">Last Name <span className="text-destructive">*</span></FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="last_name"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </InputGroup>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="middle_name">
                        Middle Name
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="middle_name"
                          placeholder="Middle name"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="contact">
                        Contact Number
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Phone />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="contact"
                          placeholder="e.g. 09171234567"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Field>
                  </div>
                </FieldGroup>

                {/* Security */}
                <FieldGroup>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Security
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password">Password <span className="text-destructive">*</span></FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Lock />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                        {password && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={
                                showPassword
                                  ? "Hide password"
                                  : "Show password"
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

                    <Field>
                      <FieldLabel htmlFor="password_confirmation">
                        Confirm Password <span className="text-destructive">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Lock />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="password_confirmation"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                        {confirmPassword && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="code">Code</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <KeyRound />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="code"
                          type="text"
                          placeholder="Activation code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="pin">Pin</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Hash />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="pin"
                          type="password"
                          placeholder="PIN number"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Field>
                  </div>
                </FieldGroup>
              </div>
            </div>

            <Button
              variant="default"
              type="submit"
              disabled={loading}
              className="w-full mt-5"
            >
              {!loading ? (
                <>Create Account </>
              ) : (
                <>
                  <Spinner data-icon="inline-start" /> Creating Account...
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div className="w-full flex flex-col items-center space-y-4">
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/90 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="max-w-md text-center text-xs text-zinc-400">
              By logging in, you agree to our{" "}
              <Link
                href="/terms"
                className="underline text-primary hover:text-primary/90"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline text-primary hover:text-primary/90"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}