import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "Stornway Group | Exterior Service Experts",
  description:
    "Stornway Group provides roofing, siding, gutters, exterior repairs, inspections, and seasonal maintenance for homeowners and commercial properties.",
  icons: {
    icon: [{ url: "/stornwaylogo2.svg", type: "image/svg+xml" }],
    shortcut: "/stornwaylogo2.svg",
    apple: "/stornwaylogo2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakarta.variable}>{children}</body>
    </html>
  );
}
