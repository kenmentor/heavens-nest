import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSaveButton } from "@/components/card-save-button";
import type { Listing } from "@/lib/types";
import { formatNaira } from "@/lib/navigation";
import { listingUrl } from "@/lib/listing";

export function PropertyCard({ listing }: { listing: Listing }) {
  const cover = listing.images[0];
  const isRent = listing.purpose === "rent";

  return (
    <Link href={listingUrl(listing)} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={listing.type}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant={isRent ? "secondary" : "default"}
              className="uppercase tracking-wide"
            >
              {isRent ? "For Rent" : "For Sale"}
            </Badge>
          </div>
          <CardSaveButton listingId={listing.id} />
          <div className="absolute right-3 bottom-3 rounded-lg bg-black/60 px-2 py-1 text-sm font-semibold text-white backdrop-blur">
            {formatNaira(listing.price)}
            {isRent && <span className="text-xs font-normal">/yr</span>}
          </div>
        </div>
        <CardHeader className="gap-1 p-4 pb-2">
          <CardTitle className="text-base group-hover:text-primary">
            {listing.type}
          </CardTitle>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {listing.location}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {listing.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {listing.features.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-4" />
                {listing.features.bedrooms} bed
              </span>
            )}
            {listing.features.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="size-4" />
                {listing.features.bathrooms} bath
              </span>
            )}
            {listing.features.sizeSqm ? (
              <span className="flex items-center gap-1">
                <Ruler className="size-4" />
                {listing.features.sizeSqm} m²
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
