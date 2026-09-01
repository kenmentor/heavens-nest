export type Role = "owner" | "seeker" | "admin";

export type ListingPurpose = "rent" | "sale";

export type ListingStatus = "available" | "rented" | "sold";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface PropertyOwner extends User {
  role: "owner";
}

export interface PropertySeeker extends User {
  role: "seeker";
}

export interface AdminUser extends User {
  role: "admin";
}

export interface Listing {
  id: string;
  slug?: string;
  reference?: string;
  coordinates?: { lat: number; lng: number };
  ownerId: string;
  type: string;
  purpose: ListingPurpose;
  location: string;
  price: number;
  description: string;
  features: ListingFeatures;
  images: string[];
  status: ListingStatus;
  createdAt: string;
}

export interface ListingFeatures {
  bedrooms: number;
  bathrooms: number;
  sizeSqm?: number;
  amenities: string[];
  condition: "furnished" | "unfurnished" | "partly-furnished";
}

export interface Enquiry {
  id: string;
  listingId: string;
  seekerId: string;
  message: string;
  viewingDate?: string;
  date: string;
}

export interface SavedProperty {
  id: string;
  seekerId: string;
  listingId: string;
  date: string;
}

export interface SessionUser extends User {
  role: Role;
}
