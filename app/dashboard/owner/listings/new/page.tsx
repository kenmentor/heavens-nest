"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingForm } from "@/components/listing-form";

export default function NewListingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add a New Listing</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to publish your property to seekers.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property details</CardTitle>
          <CardDescription>All fields marked with an asterisk are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm />
        </CardContent>
      </Card>
    </div>
  );
}
