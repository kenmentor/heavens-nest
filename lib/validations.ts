import { z } from "zod";

export const listingPurposeSchema = z.enum(["rent", "sale"]);
export const listingStatusSchema = z.enum(["available", "rented", "sold"]);
export const conditionSchema = z.enum([
  "furnished",
  "unfurnished",
  "partly-furnished",
]);

export const listingSchema = z.object({
  ownerId: z.string().min(1, "Owner is required."),
  type: z.string().min(2, "Property type is required."),
  purpose: listingPurposeSchema,
  location: z.string().min(1, "Location is required."),
  price: z.coerce.number().positive("Price must be greater than zero."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters."),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  sizeSqm: z.coerce.number().min(0).optional(),
  condition: conditionSchema,
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  status: listingStatusSchema,
});

export const listingUpdateSchema = listingSchema.partial();

export const enquirySchema = z.object({
  listingId: z.string().min(1, "Listing is required."),
  seekerId: z.string().min(1, "Seeker is required."),
  message: z.string().min(1, "Message is required."),
  viewingDate: z.string().optional(),
});

export const userCreateSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a valid phone number."),
  role: z.enum(["owner", "seeker", "admin"]),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const userUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name is required.").optional(),
  email: z.string().email("Enter a valid email address.").optional(),
  phone: z.string().min(7, "Enter a valid phone number.").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters."),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
