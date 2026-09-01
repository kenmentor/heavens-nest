"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/hooks/use-session";
import { useSaved } from "@/hooks/use-store";
import { refreshStore } from "@/lib/data/refresh";

export function CardSaveButton({ listingId }: { listingId: string }) {
  const session = useSession();
  const saved = useSaved();
  const [busy, setBusy] = useState(false);

  if (!session) {
    return (
      <Link
        href="/login"
        aria-label="Login to save this property"
        className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/80"
      >
        <Heart className="size-4" />
      </Link>
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
    <button
      type="button"
      aria-label={isSaved ? "Remove from saved" : "Save this property"}
      aria-pressed={isSaved}
      disabled={busy}
      onClick={handleToggle}
      className={`absolute top-3 right-3 z-10 rounded-full p-2 backdrop-blur transition-colors ${
        isSaved
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-black/60 text-white hover:bg-black/80"
      }`}
    >
      <Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}
