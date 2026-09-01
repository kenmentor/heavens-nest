"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useSaved } from "@/hooks/use-store";
import { refreshStore } from "@/lib/data/refresh";

export function SaveButton({ listingId }: { listingId: string }) {
  const session = useSession();
  const saved = useSaved();
  const [busy, setBusy] = useState(false);

  if (!session) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        <Bookmark className="mx-auto mb-2 size-5" />
        Login to save this property for later.{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login now
        </Link>
      </div>
    );
  }

  if (session.role !== "seeker") {
    return null;
  }

  const isSaved = saved.some(
    (item) => item.seekerId === session.id && item.listingId === listingId
  );

  const handleToggle = async () => {
    setBusy(true);
    try {
      if (isSaved) {
        const res = await fetch(
          `/api/saved?seekerId=${encodeURIComponent(session.id)}&listingId=${encodeURIComponent(listingId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          throw new Error("Unable to remove saved property.");
        }
        await refreshStore();
        toast.success("Property removed from your saved list.");
      } else {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seekerId: session.id, listingId }),
        });
        if (!res.ok) {
          throw new Error("Unable to save property.");
        }
        await refreshStore();
        toast.success("Property saved for later.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant={isSaved ? "default" : "outline"}
      className="w-full"
      onClick={handleToggle}
      disabled={busy}
    >
      {isSaved ? <BookmarkCheck /> : <Bookmark />}
      {isSaved ? "Saved" : "Save this property"}
    </Button>
  );
}
