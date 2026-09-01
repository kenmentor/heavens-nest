import Link from "next/link";
import { ArrowLeft, Home, Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-24 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <SearchX className="size-7" />
        </span>
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <h2 className="mt-2 text-lg font-semibold">Page not found</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Check the address or head back to browse available properties.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          <Button nativeButton={false} render={<Link href="/listings" />}>
            <Search />
            Browse Properties
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            <Home />
            Back to Home
          </Button>
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            <ArrowLeft />
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
