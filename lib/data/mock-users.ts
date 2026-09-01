import type { AdminUser, PropertyOwner, PropertySeeker } from "@/lib/types";

export const mockUsers: (PropertyOwner | PropertySeeker | AdminUser)[] = [
  {
    id: "owner-1",
    fullName: "Chief Adewale Okonjo",
    email: "adewale@example.com",
    phone: "0803 123 4567",
    role: "owner",
    createdAt: "2026-01-12",
  },
  {
    id: "owner-2",
    fullName: "Mrs. Funke Adeyemi",
    email: "funke@example.com",
    phone: "0805 987 6543",
    role: "owner",
    createdAt: "2026-02-03",
  },
  {
    id: "owner-3",
    fullName: "Alhaji Musa Bello",
    email: "musa@example.com",
    phone: "0812 555 7788",
    role: "owner",
    createdAt: "2026-02-20",
  },
  {
    id: "seeker-1",
    fullName: "Chinedu Okafor",
    email: "chinedu@example.com",
    phone: "0701 444 2211",
    role: "seeker",
    createdAt: "2026-02-15",
  },
  {
    id: "seeker-2",
    fullName: "Blessing Ibrahim",
    email: "blessing@example.com",
    phone: "0902 333 8877",
    role: "seeker",
    createdAt: "2026-03-01",
  },
  {
    id: "admin-1",
    fullName: "System Administrator",
    email: "admin@haven.com",
    phone: "0800 000 0000",
    role: "admin",
    createdAt: "2026-01-01",
  },
];

export const mockCredentials: Record<
  string,
  { email: string; password: string }
> = {
  "adewale@example.com": { email: "adewale@example.com", password: "password" },
  "funke@example.com": { email: "funke@example.com", password: "password" },
  "musa@example.com": { email: "musa@example.com", password: "password" },
  "chinedu@example.com": { email: "chinedu@example.com", password: "password" },
  "blessing@example.com": { email: "blessing@example.com", password: "password" },
  "admin@haven.com": { email: "admin@haven.com", password: "admin123" },
};
