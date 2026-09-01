"use client";

import { useSyncExternalStore } from "react";
import {
  getListings,
  getEnquiries,
  getSaved,
  subscribeToStore,
} from "@/lib/data/store";

export function useListings() {
  return useSyncExternalStore(subscribeToStore, getListings, getListings);
}

export function useEnquiries() {
  return useSyncExternalStore(subscribeToStore, getEnquiries, getEnquiries);
}

export function useSaved() {
  return useSyncExternalStore(subscribeToStore, getSaved, getSaved);
}
