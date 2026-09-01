"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquareText, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";
import { refreshStore } from "@/lib/data/refresh";

export function EnquiryForm({ listingId }: { listingId: string }) {
  const session = useSession();
  const [message, setMessage] = useState("");
  const [viewingDate, setViewingDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!session) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Login as a property seeker to enquire about this property.{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login now
        </Link>
      </div>
    );
  }

  if (session.role !== "seeker") {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Only property seekers can submit an enquiry. This account is registered
        as a {session.role}.
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please write a message before sending.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          seekerId: session.id,
          message: trimmed,
          viewingDate: viewingDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Unable to send enquiry. Please try again."
        );
      }
      await refreshStore();
      setMessage("");
      setViewingDate("");
      setError(null);
      toast.success("Enquiry sent to the property owner!");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send enquiry.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="enquiryMessage">
          Your message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="enquiryMessage"
          rows={5}
          placeholder="e.g. Good day, I am interested in this property. Is it still available? When can I view it?"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (error) setError(null);
          }}
          aria-invalid={!!error}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="enquiryDate">
          Preferred viewing date <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="enquiryDate"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={viewingDate}
          onChange={(event) => setViewingDate(event.target.value)}
          className="sm:max-w-56"
        />
        <p className="text-xs text-muted-foreground">
          Suggest a date so the owner can prepare the property for your visit.
        </p>
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={sending}>
        {sending ? "Sending..." : null}
        <Send />
        Send Enquiry
      </Button>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageSquareText className="size-3.5" />
        Your enquiry goes straight to the owner&apos;s dashboard.
      </p>
    </form>
  );
}
