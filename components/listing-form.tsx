"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "@/hooks/use-session";
import { refreshStore } from "@/lib/data/refresh";
import type { Listing, ListingPurpose } from "@/lib/types";

const locations = [
  "Ikeja, Lagos",
  "Lekki Phase 1, Lagos",
  "Surulere, Lagos",
  "Epe, Lagos",
  "Gwarinpa, Abuja",
  "Wuse 2, Abuja",
  "Bodija, Ibadan",
  "D-Line, Port Harcourt",
  "Calabar Municipality",
  "Calabar South",
  "State Housing, Calabar",
  "Ekot, Calabar",
  "Mary Slessor Avenue, Calabar",
];

const conditions = ["furnished", "unfurnished", "partly-furnished"] as const;

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const schema = z.object({
  type: z.string().min(2, "Property type is required (e.g. 2-bedroom flat)."),
  purpose: z.enum(["rent", "sale"]),
  location: z.string().min(1, "Location is required."),
  price: z.coerce.number().positive("Price must be greater than zero."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  bedrooms: z.coerce.number().min(0).default(0),
  bathrooms: z.coerce.number().min(0).default(0),
  sizeSqm: z.coerce.number().optional(),
  condition: z.enum(conditions),
  amenities: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(listing: Listing): FormValues {
  return {
    type: listing.type,
    purpose: listing.purpose,
    location: listing.location,
    price: listing.price,
    description: listing.description,
    bedrooms: listing.features.bedrooms,
    bathrooms: listing.features.bathrooms,
    sizeSqm: listing.features.sizeSqm,
    condition: listing.features.condition,
    amenities: listing.features.amenities.join(", "),
  };
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  const flattened = (error as { fieldErrors?: Record<string, { message?: string }[]> })?.fieldErrors;
  if (flattened) {
    const first = Object.values(flattened).flat().find((item) => item?.message);
    if (first?.message) return first.message;
  }
  return "Something went wrong. Please try again.";
}

async function uploadFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(errorMessage(data.error ?? data));
  }
  return data.urls;
}

export function ListingForm({ listing }: { listing?: Listing }) {
  const session = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(
    listing?.images ?? []
  );
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues, undefined, FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues, undefined, FormValues>,
    defaultValues: listing ? toFormValues(listing) : {
      type: "",
      purpose: "rent",
      location: "",
      price: undefined,
      description: "",
      bedrooms: 0,
      bathrooms: 0,
      condition: "unfurnished",
      amenities: "",
    },
  });

  const purpose = watch("purpose");
  const condition = watch("condition");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    const invalidType = selected.find((file) => !ALLOWED_TYPES.includes(file.type));
    if (invalidType) {
      toast.error(`"${invalidType.name}" is not supported. Use JPEG, PNG, WEBP or GIF.`);
      return;
    }
    const tooLarge = selected.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      toast.error(`"${tooLarge.name}" exceeds the 8MB limit.`);
      return;
    }
    if (existingImages.length + files.length + selected.length > MAX_PHOTOS) {
      toast.error(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    event.target.value = "";
  };

  const removeExisting = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    if (!session || session.role !== "owner") {
      toast.error("Only owners can create listings.");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        uploadedUrls = await uploadFiles(files);
      }
      const images = [...existingImages, ...uploadedUrls];

      const payload = {
        type: values.type,
        purpose: values.purpose,
        location: values.location,
        price: values.price,
        description: values.description,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        sizeSqm: values.sizeSqm,
        condition: values.condition,
        amenities: (values.amenities ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        images,
      };

      if (listing) {
        const res = await fetch(`/api/listings/${listing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-user-id": session.id },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(errorMessage(data.error ?? data));
        toast.success("Listing updated");
      } else {
        const res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            ownerId: session.id,
            status: "available",
            createdAt: new Date().toISOString().slice(0, 10),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(errorMessage(data.error ?? data));
        toast.success("Listing published");
      }

      await refreshStore();
      router.push("/dashboard/owner/listings");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const previewCount = existingImages.length + files.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="type">Property type</FieldLabel>
          <FieldContent>
            <Input id="type" placeholder="e.g. 3-bedroom flat" {...register("type")} />
          </FieldContent>
          <FieldError>{errors.type?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Purpose</FieldLabel>
          <FieldContent>
            <RadioGroup
              value={purpose}
              onValueChange={(value) => {
                if (value === "rent" || value === "sale") setValue("purpose", value as ListingPurpose);
              }}
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="rent" id="purpose-rent" />
                  <Label htmlFor="purpose-rent">Rent</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sale" id="purpose-sale" />
                  <Label htmlFor="purpose-sale">Sale</Label>
                </div>
              </div>
            </RadioGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <FieldContent>
            <Select
              value={watch("location")}
              onValueChange={(value) => {
                if (value) setValue("location", value);
              }}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          <FieldError>{errors.location?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="price">Price (₦)</FieldLabel>
          <FieldContent>
            <Input id="price" type="number" min={1} step="1000" placeholder="e.g. 2500000" {...register("price")} />
          </FieldContent>
          <FieldError>{errors.price?.message}</FieldError>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe the property, its surroundings, and anything a tenant or buyer should know..."
              {...register("description")}
            />
          </FieldContent>
          <FieldError>{errors.description?.message}</FieldError>
        </Field>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel>
            <FieldContent>
              <Input id="bedrooms" type="number" min={0} {...register("bedrooms")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="bathrooms">Bathrooms</FieldLabel>
            <FieldContent>
              <Input id="bathrooms" type="number" min={0} {...register("bathrooms")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="sizeSqm">Size (m²)</FieldLabel>
            <FieldContent>
              <Input id="sizeSqm" type="number" min={0} placeholder="Optional" {...register("sizeSqm")} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="condition">Condition</FieldLabel>
          <FieldContent>
            <Select
              value={condition}
              onValueChange={(value) => {
                if (value) setValue("condition", value as FormValues["condition"]);
              }}
            >
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="amenities">Amenities (comma-separated)</FieldLabel>
          <FieldContent>
            <Input id="amenities" placeholder="e.g. air conditioning, parking, balcony" {...register("amenities")} />
          </FieldContent>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="photos">Photos</FieldLabel>
          <FieldContent>
            <Input
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Upload up to {MAX_PHOTOS} photos. JPEG, PNG, WEBP or GIF — max 8MB each. Stored in /public/uploads.
            </p>
            {previewCount > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                    <Image src={url} alt={`Existing photo ${index + 1}`} fill className="object-cover" sizes="120px" />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => removeExisting(index)}
                      className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {files.map((file, index) => (
                  <div key={`file-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {listing ? "Save Changes" : "Publish Listing"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/owner/listings")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
