"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard } from "@/components/property-card";
import { RecentlyViewed } from "@/components/recently-viewed";
import { useListings } from "@/hooks/use-store";
import type { ListingPurpose } from "@/lib/types";

type PurposeFilter = "all" | ListingPurpose;
type SortOption = "newest" | "price-asc" | "price-desc";

const PAGE_SIZE = 6;

export default function BrowsePage() {
  const listings = useListings();
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [location, setLocation] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const locations = useMemo(
    () => Array.from(new Set(listings.map((listing) => listing.location))).sort(),
    [listings]
  );

  const filtered = useMemo(() => {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Number.POSITIVE_INFINITY;
    const q = query.trim().toLowerCase();

    const list = listings.filter((listing) => {
      if (listing.status !== "available") return false;
      if (purpose !== "all" && listing.purpose !== purpose) return false;
      if (location !== "all" && listing.location !== location) return false;
      if (listing.price < min) return false;
      if (listing.price > max) return false;
      if (q) {
        const haystack = [
          listing.type,
          listing.location,
          listing.description,
          ...(listing.features.amenities ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, purpose, location, minPrice, maxPrice, query, sort]);

  const hasActiveFilters =
    purpose !== "all" ||
    location !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    query.trim() !== "";

  const clearFilters = () => {
    setPurpose("all");
    setLocation("all");
    setMinPrice("");
    setMaxPrice("");
    setQuery("");
    setSort("newest");
    setVisible(PAGE_SIZE);
  };

  const shown = filtered.slice(0, Math.min(visible, filtered.length));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Properties</h1>
        <p className="mt-1 text-muted-foreground">
          Search available properties across Nigeria by keyword, location and
          budget.
        </p>
      </div>

      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by keyword, area or amenity — e.g. 3 bedroom, Lekki, balcony"
              className="pl-9"
              aria-label="Search properties"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="grid gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Purpose
              </Label>
              <Tabs
                value={purpose}
                onValueChange={(value) => setPurpose(value as PurposeFilter)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="rent">Rent</TabsTrigger>
                  <TabsTrigger value="sale">Sale</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-xs font-medium text-muted-foreground">
                Location
              </Label>
              <Select
                value={location}
                onValueChange={(value) => setLocation(value ?? "all")}
              >
                <SelectTrigger id="location" className="w-full">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minPrice" className="text-xs font-medium text-muted-foreground">
                Min price (₦)
              </Label>
              <Input
                id="minPrice"
                type="number"
                min={0}
                placeholder="e.g. 100000"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxPrice" className="text-xs font-medium text-muted-foreground">
                Max price (₦)
              </Label>
              <Input
                id="maxPrice"
                type="number"
                min={0}
                placeholder="e.g. 5000000"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {shown.length}
              </span>{" "}
              of {filtered.length} {filtered.length === 1 ? "property" : "properties"}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RotateCcw />
                Clear filters
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Filters apply instantly as you type.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-end">
        <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
          <SelectTrigger className="w-48" aria-label="Sort properties">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {shown.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <SearchX className="size-6 text-muted-foreground" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">No properties match your search</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try a different keyword, widening your budget range, or clearing
                the filters to see all available properties.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              <RotateCcw />
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {shown.length < filtered.length && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
          >
            Load more
          </Button>
        </div>
      )}

      <RecentlyViewed />
    </div>
  );
}
