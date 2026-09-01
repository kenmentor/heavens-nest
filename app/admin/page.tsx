"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, House, MessageSquareText, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useListings, useEnquiries } from "@/hooks/use-store";
import { useSession } from "@/hooks/use-session";
import { refreshStore } from "@/lib/data/refresh";
import { getStats, getUsers } from "@/lib/data/store";
import { formatNaira } from "@/lib/navigation";
import { listingUrl } from "@/lib/listing";
import type { ListingStatus } from "@/lib/types";

const TABS = ["users", "listings", "enquiries"] as const;
type AdminTab = (typeof TABS)[number];

function AdminTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const listings = useListings();
  const enquiries = useEnquiries();
  const users = getUsers();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requested = searchParams?.get("tab") as AdminTab | null;
  const activeTab: AdminTab = requested && TABS.includes(requested) ? requested : "users";

  const selectTab = (tab: string) => {
    router.replace(tab === "users" ? "/admin" : `/admin?tab=${tab}`, { scroll: false });
  };

  const changeStatus = async (id: string, status: ListingStatus) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.id ?? "",
          "x-user-role": session?.role ?? "",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string" ? data.error : "Unable to update listing."
        );
      }
      await refreshStore();
      toast.success(`Listing marked as ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update listing.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${deleteTarget}`, {
        method: "DELETE",
        headers: {
          "x-user-id": session?.id ?? "",
          "x-user-role": session?.role ?? "",
        },
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

  return (
    <>
      <Tabs value={activeTab} onValueChange={selectTab}>
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="listings">Listings</TabsTrigger>
        <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
      </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registered Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : user.role === "owner" ? "secondary" : "outline"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Listings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <Button variant="link" nativeButton={false} className="h-auto p-0 font-medium" render={<Link href={listingUrl(listing)} />}>
                          {listing.type}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={listing.purpose === "rent" ? "secondary" : "default"}>
                          {listing.purpose}
                        </Badge>
                      </TableCell>
                      <TableCell>{listing.location}</TableCell>
                      <TableCell>{formatNaira(listing.price)}</TableCell>
                      <TableCell>
                        <Select
                          value={listing.status}
                          onValueChange={(value) =>
                            changeStatus(listing.id, value as ListingStatus)
                          }
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">available</SelectItem>
                            <SelectItem value="rented">rented</SelectItem>
                            <SelectItem value="sold">sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${listing.type}`}
                          disabled={busy}
                          onClick={() => setDeleteTarget(listing.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enquiries">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Enquiries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Listing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enquiry) => {
                    const listing = listings.find((item) => item.id === enquiry.listingId);
                    return (
                      <TableRow key={enquiry.id}>
                        <TableCell className="whitespace-nowrap text-sm">{enquiry.date}</TableCell>
                        <TableCell className="max-w-md truncate text-muted-foreground">
                          {enquiry.message}
                        </TableCell>
                        <TableCell>{listing ? listing.type : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The listing and its enquiries will
              be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
  }

export default function AdminPage() {
  const stats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide statistics and management.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <House className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <MessageSquareText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalEnquiries}</p>
          </CardContent>
        </Card>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Loading…
            </CardContent>
          </Card>
        }
      >
        <AdminTabs />
      </Suspense>
    </div>
  );
}
