"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Save, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/use-session";
import { refreshStore } from "@/lib/data/refresh";
import { setSessionUser, logout } from "@/lib/session";
import type { SessionUser } from "@/lib/types";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  const flattened = (error as { fieldErrors?: Record<string, { message?: string }[]> })?.fieldErrors;
  if (flattened) {
    const first = Object.values(flattened).flat().find((item) => item?.message);
    if (first?.message) return first.message;
  }
  return "Something went wrong. Please try again.";
}

export default function SettingsPage() {
  const session = useSession();
  const router = useRouter();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (!session) return;
    profile.reset({
      fullName: session.fullName,
      email: session.email,
      phone: session.phone,
    });
  }, [session, profile]);

  const password = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  if (!session) {
    return null;
  }

  const saveProfile = async (values: ProfileValues) => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": session.id },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(errorMessage(data.error ?? data));

      const updated: SessionUser = {
        ...session,
        fullName: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone,
      };
      setSessionUser(updated);
      await refreshStore();
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (values: PasswordValues) => {
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": session.id },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(errorMessage(data.error ?? data));
      password.reset();
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile details and security.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>
            Your name, email and phone number appear on listings and enquiries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profile.handleSubmit(saveProfile)}
            className="grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="e.g. Ada Obi" {...profile.register("fullName")} />
              {profile.formState.errors.fullName && (
                <p className="text-sm text-destructive">{profile.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...profile.register("email")} />
              {profile.formState.errors.email && (
                <p className="text-sm text-destructive">{profile.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" placeholder="e.g. 0803 123 4567" {...profile.register("phone")} />
              {profile.formState.errors.phone && (
                <p className="text-sm text-destructive">{profile.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={savingProfile || profile.formState.isSubmitting}>
                <Save />
                {savingProfile ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4 text-primary" />
            Change password
          </CardTitle>
          <CardDescription>
            Choose a strong password you don&apos;t use elsewhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={password.handleSubmit(changePassword)}
            className="grid max-w-md gap-4"
            noValidate
          >
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...password.register("currentPassword")}
              />
              {password.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{password.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                {...password.register("newPassword")}
              />
              {password.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{password.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...password.register("confirmPassword")}
              />
              {password.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{password.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div>
              <Button type="submit" variant="outline" disabled={savingPassword || password.formState.isSubmitting}>
                <KeyRound />
                {savingPassword ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{session.email}</span>.{" "}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="font-medium text-primary hover:underline"
        >
          Log out
        </button>
      </p>
    </div>
  );
}
