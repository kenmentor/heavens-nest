"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Listing link copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy the link.");
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleCopy}>
      {copied ? <Check /> : <Link2 />}
      {copied ? "Link copied" : "Share listing"}
    </Button>
  );
}
