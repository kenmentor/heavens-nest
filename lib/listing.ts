import type { Listing } from "@/lib/types";

export const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  "Ikeja, Lagos": { lat: 6.6018, lng: 3.3515 },
  "Lekki Phase 1, Lagos": { lat: 6.4478, lng: 3.4723 },
  "Surulere, Lagos": { lat: 6.5016, lng: 3.3584 },
  "Epe, Lagos": { lat: 6.5847, lng: 3.9748 },
  "Gwarinpa, Abuja": { lat: 9.0899, lng: 7.418 },
  "Wuse 2, Abuja": { lat: 9.0808, lng: 7.4892 },
  "Bodija, Ibadan": { lat: 7.4422, lng: 3.8993 },
  "D-Line, Port Harcourt": { lat: 4.8238, lng: 7.0176 },
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildListingSlug(
  listing: Pick<Listing, "type" | "purpose" | "location">
): string {
  return slugify(`${listing.type} ${listing.purpose} ${listing.location}`);
}

export function listingReference(id: string): string {
  const numeric = id.match(/(\d+)$/);
  if (numeric) {
    return `HN-${numeric[1].padStart(4, "0")}`;
  }
  return `HN-${id.slice(-4).toUpperCase()}`;
}

export function listingUrl(
  listing: Pick<Listing, "id" | "slug">
): string {
  return `/listings/${listing.slug ?? listing.id}`;
}

export function osmEmbedUrl(
  coords: { lat: number; lng: number }
): string {
  const { lat, lng } = coords;
  const d = 0.02;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${
    lat - d
  }%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function osmExternalUrl(coords: { lat: number; lng: number }): string {
  const { lat, lng } = coords;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}
