import type { Db, Filter, UpdateFilter, WithId } from "mongodb";
import type { Enquiry, Listing, ListingFeatures, ListingPurpose, ListingStatus, SavedProperty, User } from "@/lib/types";
import {
  getDb,
  collections,
  type ListingDoc,
  type EnquiryDoc,
  type SavedPropertyDoc,
  type UserDoc,
} from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import {
  buildListingSlug,
  listingReference,
  LOCATION_COORDS,
} from "@/lib/listing";

export interface ListingFilters {
  purpose?: "rent" | "sale";
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ListingMutation {
  ownerId?: string;
  slug?: string;
  reference?: string;
  coordinates?: { lat: number; lng: number };
  type?: string;
  purpose?: ListingPurpose;
  location?: string;
  price?: number;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  condition?: ListingFeatures["condition"];
  amenities?: string[];
  images?: string[];
  status?: ListingStatus;
  createdAt?: string;
}

type DbModel<T> = Omit<T, "id"> & { _id: string };

function toModel<T>(doc: DbModel<T>): WithId<T> {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest } as unknown as WithId<T>;
}

function toListingDocument(
  mutation: ListingMutation
): Omit<Listing, "id"> {
  const {
    bedrooms,
    bathrooms,
    sizeSqm,
    condition,
    amenities,
    ...rest
  } = mutation;
  return {
    ...rest,
    features: {
      bedrooms: bedrooms ?? 0,
      bathrooms: bathrooms ?? 0,
      sizeSqm,
      condition: condition ?? "unfurnished",
      amenities: amenities ?? [],
    },
  } as Omit<Listing, "id">;
}

function toUserModel(doc: UserDoc): User {
  return {
    id: doc._id,
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    createdAt: doc.createdAt,
  };
}

function listingsCol(db: Db) {
  return db.collection<ListingDoc>(collections.listings);
}

function enquiriesCol(db: Db) {
  return db.collection<EnquiryDoc>(collections.enquiries);
}

function usersCol(db: Db) {
  return db.collection<UserDoc>(collections.users);
}

function savedCol(db: Db) {
  return db.collection<SavedPropertyDoc>(collections.saved);
}

export async function getListings(
  filters: ListingFilters = {}
): Promise<Listing[]> {
  const db = await getDb();
  const query: Filter<ListingDoc> = {};

  if (filters.purpose) {
    query.purpose = filters.purpose;
  }
  if (filters.location) {
    query.location = filters.location;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const price: Filter<ListingDoc>["price"] = {};
    if (filters.minPrice !== undefined) {
      price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      price.$lte = filters.maxPrice;
    }
    query.price = price;
  }

  const docs = await listingsCol(db)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => toModel<Listing>(doc));
}

export async function getListingById(id: string): Promise<Listing | null> {
  const db = await getDb();
  const doc = await listingsCol(db).findOne({
    $or: [{ _id: id }, { slug: id }],
  });
  return doc ? toModel<Listing>(doc) : null;
}

export async function getListingsByOwner(ownerId: string): Promise<Listing[]> {
  const db = await getDb();
  const docs = await listingsCol(db)
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((doc) => toModel<Listing>(doc));
}

async function ensureUniqueSlug(base: string, db: Db): Promise<string> {
  let slug = base;
  let suffix = 2;
  while (await listingsCol(db).countDocuments({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function createListing(
  data: ListingMutation & { ownerId: string }
): Promise<Listing> {
  const db = await getDb();
  const id = `lst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const slug = await ensureUniqueSlug(
    buildListingSlug({
      type: data.type ?? "Property",
      purpose: data.purpose ?? "rent",
      location: data.location ?? "",
    }),
    db
  );
  const document: Omit<Listing, "id"> = {
    ...toListingDocument(data),
    ownerId: data.ownerId,
    createdAt: data.createdAt ?? new Date().toISOString().slice(0, 10),
    status: data.status ?? "available",
    slug,
    reference: listingReference(id),
    coordinates: data.coordinates ?? LOCATION_COORDS[data.location ?? ""],
  };
  await listingsCol(db).insertOne({ _id: id, ...document });
  return { id, ...document };
}

export async function updateListing(
  id: string,
  updates: ListingMutation
): Promise<Listing | null> {
  const db = await getDb();
  const {
    bedrooms,
    bathrooms,
    sizeSqm,
    condition,
    amenities,
    ...rest
  } = updates;

  const patch: Record<string, unknown> = {};
  if (bedrooms !== undefined) patch["features.bedrooms"] = bedrooms;
  if (bathrooms !== undefined) patch["features.bathrooms"] = bathrooms;
  if (sizeSqm !== undefined) patch["features.sizeSqm"] = sizeSqm;
  if (condition !== undefined) patch["features.condition"] = condition;
  if (amenities !== undefined) patch["features.amenities"] = amenities;
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) patch[key] = value;
  }

  const result = await listingsCol(db).findOneAndUpdate(
    { _id: id },
    { $set: patch as UpdateFilter<ListingDoc>["$set"] },
    { returnDocument: "after" }
  );
  return result ? toModel<Listing>(result) : null;
}

export async function deleteListing(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await listingsCol(db).deleteOne({ _id: id });
  await enquiriesCol(db).deleteMany({ listingId: id });
  await savedCol(db).deleteMany({ listingId: id });
  return result.deletedCount === 1;
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const db = await getDb();
  const docs = await enquiriesCol(db)
    .find()
    .sort({ date: -1 })
    .toArray();
  return docs.map((doc) => toModel<Enquiry>(doc));
}

export async function getEnquiriesByOwner(ownerId: string): Promise<Enquiry[]> {
  const db = await getDb();
  const owned = await listingsCol(db)
    .find({ ownerId }, { projection: { _id: 1 } })
    .toArray();
  const listingIds = owned.map((doc) => doc._id);

  if (listingIds.length === 0) {
    return [];
  }

  const docs = await enquiriesCol(db)
    .find({ listingId: { $in: listingIds } })
    .sort({ date: -1 })
    .toArray();
  return docs.map((doc) => toModel<Enquiry>(doc));
}

export async function getInquiriesForSeeker(seekerId: string): Promise<Enquiry[]> {
  const db = await getDb();
  const docs = await enquiriesCol(db)
    .find({ seekerId })
    .sort({ date: -1 })
    .toArray();
  return docs.map((doc) => toModel<Enquiry>(doc));
}

export async function createEnquiry(
  data: Omit<Enquiry, "id" | "date"> & { date?: string }
): Promise<Enquiry> {
  const db = await getDb();
  const id = `enq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const enquiry: Enquiry = {
    ...data,
    id,
    date: data.date ?? new Date().toISOString().slice(0, 10),
  };
  await enquiriesCol(db).insertOne({
    _id: id,
    listingId: enquiry.listingId,
    seekerId: enquiry.seekerId,
    message: enquiry.message,
    viewingDate: enquiry.viewingDate,
    date: enquiry.date,
  });
  return enquiry;
}

export async function getSaved(): Promise<SavedProperty[]> {
  const db = await getDb();
  const docs = await savedCol(db).find().sort({ date: -1 }).toArray();
  return docs.map((doc) => toModel<SavedProperty>(doc));
}

export async function getSavedBySeeker(seekerId: string): Promise<SavedProperty[]> {
  const db = await getDb();
  const docs = await savedCol(db)
    .find({ seekerId })
    .sort({ date: -1 })
    .toArray();
  return docs.map((doc) => toModel<SavedProperty>(doc));
}

export async function isPropertySaved(
  seekerId: string,
  listingId: string
): Promise<boolean> {
  const db = await getDb();
  const count = await savedCol(db).countDocuments({ seekerId, listingId });
  return count > 0;
}

export async function saveProperty(
  seekerId: string,
  listingId: string
): Promise<SavedProperty> {
  const db = await getDb();
  const existing = await savedCol(db).findOne({ seekerId, listingId });
  if (existing) {
    return toModel<SavedProperty>(existing);
  }
  const id = `sav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const saved: SavedProperty = {
    id,
    seekerId,
    listingId,
    date: new Date().toISOString().slice(0, 10),
  };
  await savedCol(db).insertOne({
    _id: id,
    seekerId,
    listingId,
    date: saved.date,
  });
  return saved;
}

export async function unsaveProperty(
  seekerId: string,
  listingId: string
): Promise<boolean> {
  const db = await getDb();
  const result = await savedCol(db).deleteOne({ seekerId, listingId });
  return result.deletedCount === 1;
}

export async function getUsers(): Promise<User[]> {
  const db = await getDb();
  const docs = await usersCol(db).find().toArray();
  return docs.map((doc) => toUserModel(doc));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const doc = await usersCol(db).findOne({ email: email.toLowerCase().trim() });
  return doc ? toUserModel(doc) : null;
}

export async function createUser(
  data: Omit<User, "id" | "createdAt"> & { password: string }
): Promise<User> {
  const db = await getDb();
  const id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const user: User = {
    ...data,
    email: data.email.toLowerCase().trim(),
    id,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  await usersCol(db).insertOne({
    _id: id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    passwordHash: hashPassword(data.password),
  });
  return user;
}

export async function updateUser(
  id: string,
  updates: { fullName?: string; email?: string; phone?: string }
): Promise<User | null> {
  const db = await getDb();
  const patch: Record<string, unknown> = {};
  if (updates.fullName !== undefined) patch.fullName = updates.fullName;
  if (updates.email !== undefined) patch.email = updates.email.toLowerCase().trim();
  if (updates.phone !== undefined) patch.phone = updates.phone;

  const result = await usersCol(db).findOneAndUpdate(
    { _id: id },
    { $set: patch as UpdateFilter<UserDoc>["$set"] },
    { returnDocument: "after" }
  );
  return result ? toUserModel(result) : null;
}

export async function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDb();
  const doc = await usersCol(db).findOne({ _id: id });
  if (!doc) {
    return { ok: false, error: "Account not found." };
  }
  if (!doc.passwordHash || !verifyPassword(currentPassword, doc.passwordHash)) {
    return { ok: false, error: "Current password is incorrect." };
  }
  await usersCol(db).updateOne(
    { _id: id },
    { $set: { passwordHash: hashPassword(newPassword) } }
  );
  return { ok: true };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const db = await getDb();
  const doc = await usersCol(db).findOne({ email: email.toLowerCase().trim() });
  if (!doc) return null;
  if (!doc.passwordHash || !verifyPassword(password, doc.passwordHash)) {
    return null;
  }
  return toUserModel(doc);
}

export async function getStats(): Promise<{
  totalListings: number;
  activeListings: number;
  totalEnquiries: number;
  totalUsers: number;
}> {
  const db = await getDb();
  const [totalListings, activeListings, totalEnquiries, totalUsers] =
    await Promise.all([
      listingsCol(db).countDocuments(),
      listingsCol(db).countDocuments({ status: "available" }),
      enquiriesCol(db).countDocuments(),
      usersCol(db).countDocuments(),
    ]);
  return { totalListings, activeListings, totalEnquiries, totalUsers };
}
