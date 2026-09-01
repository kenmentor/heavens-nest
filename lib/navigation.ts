import type { Role } from "@/lib/types";

export function getDashboardPath(role: Role): string {
  switch (role) {
    case "owner":
      return "/dashboard/owner";
    case "seeker":
      return "/dashboard/seeker";
    case "admin":
      return "/admin";
  }
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNaira(amount: number): string {
  return `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)}`;
}
