"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Home, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerUser } from "@/lib/session";
import { refreshStore } from "@/lib/data/refresh";
import { getDashboardPath } from "@/lib/navigation";
import type { Role } from "@/lib/types";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a valid phone number"),
    role: z.enum(["owner", "seeker"], {
      message: "Please choose a role",
    }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const roleOptions: { value: Extract<Role, "owner" | "seeker">; label: string; description: string }[] = [
  {
    value: "owner",
    label: "Property Owner",
    description: "I want to advertise properties for rent or sale.",
  },
  {
    value: "seeker",
    label: "Property Seeker",
    description: "I am looking for a property to rent or buy.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "seeker" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    const result = await registerUser({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      role: values.role,
      password: values.password,
    });
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    await refreshStore();
    toast.success("Account created successfully. Welcome to HavenNest!");
    router.push(getDashboardPath(result.user.role));
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2 className="size-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join as a Property Owner or a Property Seeker.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Fill in your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <div className="grid gap-2">
              <Label>I am a...</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => {
                  if (value === "owner" || value === "seeker") setValue("role", value);
                }}
                className="grid gap-2"
              >
                {roleOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`role-${option.value}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-data-checked:border-primary/40 has-data-checked:bg-primary/5"
                  >
                    <RadioGroupItem value={option.value} id={`role-${option.value}`} className="mt-0.5" />
                    <span className="flex items-start gap-2">
                      {option.value === "owner" ? (
                        <Home className="mt-0.5 size-4 shrink-0 text-primary" />
                      ) : (
                        <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      )}
                      <span>
                        <span className="block font-medium">{option.label}</span>
                        <span className="block text-sm text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder="e.g. Ada Obi"
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 0803 123 4567"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <UserPlus />
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login instead
        </Link>
      </p>
    </div>
  );
}
