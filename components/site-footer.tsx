import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-5" />
              </span>
              <span className="text-lg tracking-tight">HavenNest</span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              A web-based Rental and Sales Management System connecting property
              owners directly with tenants and buyers in Nigeria — search by
              location and budget, no agents required.
            </p>
          </div>

          <div className="space-y-3 sm:col-span-2">
            <h4 className="text-sm font-semibold">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Get new listings and market updates in your inbox.
            </p>
            <NewsletterForm />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/listings" className="hover:text-foreground">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Create an Account
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                Calabar, Cross River, Nigeria
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                +234 800 000 0000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                support@havennest.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HavenNest — Rental & Sales Management
          System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
