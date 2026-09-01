"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ListPlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSession } from "@/hooks/use-session";
import { useListings } from "@/hooks/use-store";
import { getListingsByOwner } from "@/lib/data/store";
import { refreshStore } from "@/lib/data/refresh";
import { formatNaira } from "@/lib/navigation";
import { listingUrl } from "@/lib/listing";

export default function OwnerListingsPage() {
  const session = useSession();
  const listings = useListings();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const myListings = session ? getListingsByOwner(session.id) : [];

  const confirmDelete = async () => {
    if (!deleteTarget || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${deleteTarget}`, {
        method: "DELETE",
        headers: { "x-user-id": session?.id ?? "" },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string" ? data.error : "Unable to delete listing."
        );
      }
      await refreshStore();
      toast.success("Listing deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete listing.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const listing = listings.find((item) => item.id === id);
    if (!listing || busy) return;
    const next: "rented" | "sold" | "available" =
      listing.status === "available" ? (listing.purpose === "rent" ? "rented" : "sold") : "available";

    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": session?.id ?? "" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string" ? data.error : "Unable to update listing."
        );
      }
      await refreshStore();
      toast.success(`Listing marked as ${next}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update listing.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-sm text-muted-foreground">Manage your properties and their availability.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/owner/listings/new" />}>
          <ListPlus />
          New Listing
        </Button>
      </div>

      {myListings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No listings yet. Create your first listing to start receiving enquiries.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{myListings.length} property listing{myListings.length > 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <Link href={listingUrl(listing)} className="font-medium hover:underline">
                        {listing.type}
                      </Link>
                      <p className="text-xs text-muted-foreground">{listing.location}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={listing.purpose === "rent" ? "secondary" : "default"}>
                        {listing.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatNaira(listing.price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          listing.status === "available"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" aria-label="Listing actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/dashboard/owner/listings/${listing.id}/edit`} />}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(listing.id)}>
                            Mark as {listing.status === "available" ? (listing.purpose === "rent" ? "rented" : "sold") : "available"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(listing.id)} className="text-destructive">
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The listing and its enquiries will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
