import type {
  Enquiry,
  Listing,
  SavedProperty,
  User,
} from "@/lib/types";
import { mockEnquiries } from "@/lib/data/mock-enquiries";
import { mockListings } from "@/lib/data/mock-listings";
import { mockUsers } from "@/lib/data/mock-users";

let listings: Listing[] = [...mockListings];
let enquiries: Enquiry[] = [...mockEnquiries];
let saved: SavedProperty[] = [];
let users: User[] = [...mockUsers];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeToStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hydrateStore(data: {
  listings: Listing[];
  enquiries: Enquiry[];
  saved: SavedProperty[];
  users: User[];
}) {
  listings = [...data.listings];
  enquiries = [...data.enquiries];
  saved = [...data.saved];
  users = [...data.users];
  emit();
}

export function getListings(): Listing[] {
  return listings;
}

export function getListingById(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id);
}

export function getListingsByOwner(ownerId: string): Listing[] {
  return listings.filter((listing) => listing.ownerId === ownerId);
}

export function getEnquiries(): Enquiry[] {
  return enquiries;
}

export function getEnquiriesByOwner(ownerId: string): Enquiry[] {
  const ownedIds = new Set(
    listings.filter((listing) => listing.ownerId === ownerId).map((l) => l.id)
  );
  return enquiries.filter((enquiry) => ownedIds.has(enquiry.listingId));
}

export function getInquiriesForSeeker(seekerId: string): Enquiry[] {
  return enquiries.filter((enquiry) => enquiry.seekerId === seekerId);
}

export function getSaved(): SavedProperty[] {
  return saved;
}

export function getSavedBySeeker(seekerId: string): SavedProperty[] {
  return saved.filter((item) => item.seekerId === seekerId);
}

export function isPropertySaved(seekerId: string, listingId: string): boolean {
  return saved.some((item) => item.seekerId === seekerId && item.listingId === listingId);
}

export function getUsers(): User[] {
  return [...users];
}

export function getStats() {
  const totalListings = listings.length;
  const activeListings = listings.filter(
    (listing) => listing.status === "available"
  ).length;
  const totalEnquiries = enquiries.length;
  const totalUsers = users.length;
  return { totalListings, activeListings, totalEnquiries, totalUsers };
}
