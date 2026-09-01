import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  BadgeCheck,
  Check,
  Clock,
  ExternalLink,
  Headset,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Sofa,
  Tags,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PropertyCarousel } from "@/components/property-carousel";
import { EnquiryForm } from "@/components/enquiry-form";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { PropertyCard } from "@/components/property-card";
import { RecordView } from "@/components/recently-viewed";
import { getListingById, getListings, getUsers } from "@/lib/server/dal";
import { formatNaira } from "@/lib/navigation";
import {
  listingReference,
  osmEmbedUrl,
  osmExternalUrl,
} from "@/lib/listing";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: "Property not found" };
  return {
    title: `${listing.type} in ${listing.location}`,
    description: listing.description.slice(0, 160),
  };
}

function waPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
}

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Verified listings",
    desc: "Every property is reviewed before it goes live.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & transparent",
    desc: "No hidden fees — the price you see is the price you pay.",
  },
  {
    icon: Headset,
    title: "Dedicated support",
    desc: "Our team is available around the clock to help you.",
  },
];

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const [owner, similar] = await Promise.all([
    (await getUsers()).find((user) => user.id === listing.ownerId),
    getListings().then((all) =>
      all
        .filter(
          (item) => item.id !== listing.id && item.purpose === listing.purpose
        )
        .slice(0, 3)
    ),
  ]);
  const isRent = listing.purpose === "rent";
  const reference = listing.reference ?? listingReference(listing.id);
  const available = listing.status === "available";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Button
        variant="ghost"
        nativeButton={false}
        className="-ml-3 mb-6 text-muted-foreground"
        render={<Link href="/listings" />}
      >
        <ArrowLeft />
        Back to properties
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-8">
          <PropertyCarousel images={listing.images} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={isRent ? "secondary" : "default"}
                className="uppercase tracking-wide"
              >
                {isRent ? "For Rent" : "For Sale"}
              </Badge>
              <Badge
                variant={available ? "outline" : "destructive"}
                className={
                  available
                    ? "text-emerald-600 dark:text-emerald-400"
                    : undefined
                }
              >
                {listing.status}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                Ref: {reference}
              </Badge>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {listing.type}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" />
                {listing.location}
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatNaira(listing.price)}
                {isRent && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /year
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {listing.features.bedrooms > 0 && (
              <Card className="min-w-0">
                <CardContent className="flex items-center gap-3 p-4">
                  <BedDouble className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-semibold leading-tight">
                      {listing.features.bedrooms}
                    </p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {listing.features.bathrooms > 0 && (
              <Card className="min-w-0">
                <CardContent className="flex items-center gap-3 p-4">
                  <Bath className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-semibold leading-tight">
                      {listing.features.bathrooms}
                    </p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {listing.features.sizeSqm ? (
              <Card className="min-w-0">
                <CardContent className="flex items-center gap-3 p-4">
                  <Ruler className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-semibold leading-tight">
                      {listing.features.sizeSqm} m²
                    </p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            <Card className="min-w-0">
              <CardContent className="flex items-center gap-3 p-4">
                <Sofa className="size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-lg leading-tight font-semibold capitalize">
                    {listing.features.condition === "partly-furnished"
                      ? "Partly"
                      : listing.features.condition}
                  </p>
                  <p className="text-xs text-muted-foreground">Furnishing</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <section>
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Tags className="size-4 text-primary" />
              Amenities & Features
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {listing.features.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                >
                  <Check className="size-4 shrink-0 text-emerald-500" />
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="size-4 text-primary" />
              Location
            </h2>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[16/9] w-full bg-muted">
                  {listing.coordinates ? (
                    <iframe
                      title={`Map showing ${listing.location}`}
                      src={osmEmbedUrl(listing.coordinates)}
                      className="size-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                      {listing.location}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {listing.location}
                  </p>
                  {listing.coordinates && (
                    <a
                      href={osmExternalUrl(listing.coordinates)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      Open in OpenStreetMap
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {isRent ? "Annual rent" : "Selling price"}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {formatNaira(listing.price)}
                  </p>
                  {isRent && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ≈ {formatNaira(Math.round(listing.price / 12))}/month
                    </p>
                  )}
                </div>
                <Badge
                  variant={available ? "default" : "secondary"}
                  className={
                    available
                      ? "bg-emerald-600 hover:bg-emerald-600"
                      : undefined
                  }
                >
                  {listing.status}
                </Badge>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-2">
                <SaveButton listingId={listing.id} />
                {owner && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      nativeButton={false}
                      render={<a href={`tel:${owner.phone}`} />}
                    >
                      <Phone />
                      Call the owner
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      nativeButton={false}
                      render={
                        <a
                          href={`https://wa.me/${waPhone(owner.phone)}?text=${encodeURIComponent(
                            `Hi, I'm interested in the ${listing.type} in ${listing.location} (${reference}) on HavenNest.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <MessageCircle />
                      Chat on WhatsApp
                    </Button>
                  </>
                )}
                <ShareButton />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                Safe enquiry — we never share your details without consent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Enquire about this property</CardTitle>
            </CardHeader>
            <CardContent>
              <EnquiryForm listingId={listing.id} />
            </CardContent>
          </Card>

          {owner && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  Property owner
                  <BadgeCheck className="size-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>
                      {owner.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{owner.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      Verified owner
                    </p>
                  </div>
                </div>
                <Separator />
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  {owner.email}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  {owner.phone}
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" />
                  Typically responds within 24 hours
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Why HavenNest</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <item.icon className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="grid gap-1 p-4 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Reference:</span>{" "}
                {reference}
              </p>
              <p>
                Posted on:{" "}
                {new Date(listing.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>Location: {listing.location}</p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Similar properties
            </h2>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/listings" />}
            >
              View all
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <PropertyCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      <RecordView listingId={listing.id} />
    </div>
  );
}
