import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ChevronDown,
  Home,
  KeyRound,
  MessageSquareText,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCard } from "@/components/property-card";
import { getListings, getStats } from "@/lib/server/dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HavenNest — Rent & Buy Homes in Nigeria, No Agents",
  description:
    "Search apartments, flats, duplexes and land across Nigeria. Connect directly with property owners, compare prices by location, and skip the agent commission.",
};

const features = [
  {
    icon: Search,
    title: "Search by Location & Budget",
    description:
      "Filter thousands of listings by your preferred area and price range to find exactly what you need — without visiting property to property.",
  },
  {
    icon: Home,
    title: "Direct Landlord Connection",
    description:
      "Contact property owners directly through the platform. No middlemen, no commission fees that cut deep into your yearly rent.",
  },
  {
    icon: Wallet,
    title: "For Rent & For Sale",
    description:
      "Whether you want to rent a flat or buy a duplex, browse both markets from one simple interface.",
  },
  {
    icon: ShieldCheck,
    title: "Owner Dashboard",
    description:
      "Landlords manage listings, track enquiries and update property information from a single, secure dashboard.",
  },
];

export default async function HomePage() {
  const listings = await getListings();
  const featured = listings.filter((listing) => listing.status === "available").slice(0, 6);
  const stats = await getStats();

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
            alt="Modern residential buildings"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              No agents. No commission. Direct to landlord.
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find your next home{" "}
              <span className="text-primary">without the agent</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              HavenNest connects property owners directly with tenants and
              buyers across Nigeria. Search by location and budget, view real
              details, and reach landlords in a few clicks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/listings" />}>
                Browse Properties
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} className="bg-background" render={<Link href="/register" />}>
                List Your Property
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active Listings", value: stats.activeListings },
            { label: "Registered Users", value: stats.totalUsers },
            { label: "Enquiries Sent", value: stats.totalEnquiries },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  {stat.value}+
                </CardTitle>
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Featured Properties</h2>
              <p className="mt-1 text-muted-foreground">
                A handpicked selection of available homes and lands.
              </p>
            </div>
            <Button variant="outline" nativeButton={false} className="shrink-0" render={<Link href="/listings" />}>
              View all
              <ArrowRight />
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Why HavenNest</h2>
          <p className="mt-2 text-muted-foreground">
            Built to solve the struggles of house hunting in Nigeria.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            From searching to moving in — in three simple steps.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              icon: Search,
              title: "Search & filter",
              description:
                "Search by keyword, area and budget, then use the map and photos to shortlist homes you love.",
            },
            {
              step: "2",
              icon: MessageSquareText,
              title: "Enquire directly",
              description:
                "Message the owner straight from the listing — or call or WhatsApp them. No agents, no middlemen.",
            },
            {
              step: "3",
              icon: KeyRound,
              title: "View & move in",
              description:
                "Arrange a viewing, agree terms with the owner, and move into your new home.",
            },
          ].map((item) => (
            <Card key={item.step}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <span className="flex size-7 items-center justify-center rounded-full border text-sm font-semibold">
                    {item.step}
                  </span>
                </div>
                <CardTitle className="mt-4 text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">What people say</h2>
            <p className="mt-2 text-muted-foreground">
              Owners and seekers who found their match on HavenNest.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                quote:
                  "I listed my two-bedroom flat and had serious enquiries within days — with zero agency commission.",
                name: "Chidinma O.",
                role: "Landlord, Lekki",
              },
              {
                quote:
                  "We found our family home in Ikeja in under two weeks. The photos and location map made shortlisting so easy.",
                name: "Tunde A.",
                role: "Tenant, Ikeja",
              },
              {
                quote:
                  "Filtering by budget across cities saved me weeks of back-and-forth when looking for an investment property.",
                name: "Damilola S.",
                role: "Investor, Abuja",
              },
            ].map((item) => (
              <Card key={item.name} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col gap-4 p-6">
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to know before you start.
          </p>
        </div>
        <div className="grid gap-3">
          {[
            {
              question: "Is HavenNest free to use?",
              answer:
                "Yes. Searching, listing and enquiring are all free. Owners pay no commission when they connect with a tenant or buyer.",
            },
            {
              question: "How do I contact an owner?",
              answer:
                "Every listing has an enquiry form, and the owner's phone and WhatsApp details are shown on the property page.",
            },
            {
              question: "Are the properties verified?",
              answer:
                "We review every listing before it goes live and encourage owners to keep photos and details up to date.",
            },
            {
              question: "How do I know a property is still available?",
              answer:
                "Listings carry a live status badge. When an owner marks a property as rented or sold, it is removed from search results.",
            },
            {
              question: "Can I list more than one property?",
              answer:
                "Absolutely. Property owners can publish unlimited listings and manage them all from their dashboard.",
            },
          ].map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border bg-background p-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                {item.question}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to find your home — or list your property?
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            Join owners and seekers already using HavenNest to skip the agents
            and get straight to the house.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" nativeButton={false} render={<Link href="/register" />}>
              Create a Free Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/login" />}
            >
              Login
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
