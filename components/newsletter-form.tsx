"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const KEY = "havennest.newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const list = JSON.parse(window.localStorage.getItem(KEY) || "[]");
      return Array.isArray(list);
    } catch {
      return false;
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const list = JSON.parse(window.localStorage.getItem(KEY) || "[]");
      if (Array.isArray(list) && !list.includes(trimmed)) {
        list.push(trimmed);
        window.localStorage.setItem(KEY, JSON.stringify(list));
      }
    } catch {
      // ignore storage failures
    }
    setSubscribed(true);
    setEmail("");
    toast.success("You have subscribed to HavenNest updates!");
  };

  if (subscribed) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-primary">
        <Check className="size-4" />
        You are subscribed to our updates.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="h-9"
      />
      <Button type="submit" size="sm">
        <Send />
        Subscribe
      </Button>
    </form>
  );
}
