"use client";

import { useSyncExternalStore } from "react";
import { getCurrentUser, subscribeToSession } from "@/lib/session";

export function useSession() {
  return useSyncExternalStore(subscribeToSession, getCurrentUser, () => null);
}
