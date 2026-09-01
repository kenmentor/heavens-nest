import { MongoClient, Db } from "mongodb";
import type { Enquiry, Listing, SavedProperty, User } from "@/lib/types";
import { mockEnquiries } from "@/lib/data/mock-enquiries";
import { mockListings } from "@/lib/data/mock-listings";
import { mockUsers } from "@/lib/data/mock-users";
import { hashPassword } from "@/lib/server/password";
import {
  buildListingSlug,
  listingReference,
  LOCATION_COORDS,
} from "@/lib/listing";

export type ListingDoc = Omit<Listing, "id"> & { _id: string };
export type EnquiryDoc = Omit<Enquiry, "id"> & { _id: string };
export type SavedPropertyDoc = Omit<SavedProperty, "id"> & { _id: string };
export type UserDoc = Omit<User, "id"> & { _id: string; passwordHash?: string };

export const collections = {
  users: "users",
  listings: "listings",
  enquiries: "enquiries",
  saved: "saved",
} as const;

function usersCol(db: Db) {
  return db.collection<UserDoc>(collections.users);
}

function listingsCol(db: Db) {
  return db.collection<ListingDoc>(collections.listings);
}

function enquiriesCol(db: Db) {
  return db.collection<EnquiryDoc>(collections.enquiries);
}

function savedCol(db: Db) {
  return db.collection<SavedPropertyDoc>(collections.saved);
}

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "havennest";

const options = {
  serverSelectionTimeoutMS: 5000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;
let bootstrapPromise: Promise<Db> | undefined;

if (process.env.NODE_ENV === "development") {
  const globalForMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

async function seedIfEmpty(db: Db): Promise<void> {
  const listingCount = await listingsCol(db).countDocuments();
  if (listingCount > 0) {
    return;
  }

  const userDocs = mockUsers.map(({ id, ...user }) => ({ _id: id, ...user }));
  const listingDocs = mockListings.map(({ id, ...listing }) => ({
    _id: id,
    ...listing,
  }));
  const enquiryDocs = mockEnquiries.map(({ id, ...enquiry }) => ({
    _id: id,
    ...enquiry,
  }));

  await usersCol(db).deleteMany({});
  await listingsCol(db).deleteMany({});
  await enquiriesCol(db).deleteMany({});
  await savedCol(db).deleteMany({});

  await usersCol(db).insertMany(userDocs);
  await listingsCol(db).insertMany(listingDocs);
  await enquiriesCol(db).insertMany(enquiryDocs);
}

async function ensureDemoPasswords(db: Db): Promise<void> {
  for (const user of mockUsers) {
    const password =
      user.email === "admin@haven.com" ? "admin123" : "password";
    await usersCol(db).updateOne(
      { _id: user.id },
      { $set: { passwordHash: hashPassword(password) } }
    );
  }
}

async function backfillListings(db: Db): Promise<void> {
  const docs = await listingsCol(db).find().toArray();
  for (const doc of docs) {
    const updates: Record<string, unknown> = {};
    if (!doc.slug) {
      updates.slug = buildListingSlug(doc);
    }
    if (!doc.reference) {
      updates.reference = listingReference(doc._id);
    }
    if (!doc.coordinates) {
      const coords = LOCATION_COORDS[doc.location];
      if (coords) {
        updates.coordinates = coords;
      }
    }
    if (Object.keys(updates).length > 0) {
      await listingsCol(db).updateOne({ _id: doc._id }, { $set: updates });
    }
  }
}

async function bootstrap(db: Db): Promise<Db> {
  if (!bootstrapPromise) {
    bootstrapPromise = seedIfEmpty(db)
      .then(() => ensureDemoPasswords(db))
      .then(() => backfillListings(db))
      .then(() => db)
      .catch((error) => {
        bootstrapPromise = undefined;
        throw error;
      });
  }
  return bootstrapPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db(dbName);
  return bootstrap(db);
}
