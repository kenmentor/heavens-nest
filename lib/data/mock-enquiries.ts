import type { Enquiry } from "@/lib/types";

export const mockEnquiries: Enquiry[] = [
  {
    id: "enq-1",
    listingId: "lst-1",
    seekerId: "seeker-1",
    message:
      "Good day. I am interested in this bungalow in Ikeja. Is it still available for rent? Could we schedule a viewing this weekend?",
    viewingDate: "2026-03-28",
    date: "2026-03-22",
  },
  {
    id: "enq-2",
    listingId: "lst-2",
    seekerId: "seeker-2",
    message:
      "Please, is the Lekki duplex negotiable on the yearly rent? Also, are pets allowed in the estate?",
    date: "2026-03-23",
  },
  {
    id: "enq-3",
    listingId: "lst-4",
    seekerId: "seeker-1",
    message:
      "Hello, I would like to know if the C of O for the Gwarinpa duplex is complete and if the asking price includes the boys' quarters.",
    date: "2026-03-24",
  },
];
